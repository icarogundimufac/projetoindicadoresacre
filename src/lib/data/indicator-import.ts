import * as XLSX from 'xlsx'
import {
  INDICATOR_SECTION_IDS,
  type IndicatorSectionId,
} from '@/lib/constants/indicator-sections'
import { MUNICIPIOS } from '@/lib/constants/municipios'
import {
  getIndicatorLatestByMunicipio,
  getIndicatorMapSeries,
} from '@/lib/data/workbook'
import type { PortalDataBundle } from '@/types/admin-data'
import type { Indicator } from '@/types/indicators'

const METADATA_SHEET = 'metadados'
const DATA_SHEET = 'dados_municipais'

export interface IndicatorMetadata {
  sectionId: IndicatorSectionId
  groupId: string
  groupLabel: string
  indicatorId: string
  indicatorLabel: string
  description: string
  unit: string
  source: string
}

export interface IndicatorImportResult {
  bundle: PortalDataBundle
  sectionId: IndicatorSectionId
  groupId: string
  indicatorId: string
  indicatorLabel: string
}

function normalizeId(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w]+/g, '_')
    .replace(/^_|_$/g, '')
}

function createDownloadableBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadBlankIndicatorTemplate() {
  const workbook = XLSX.utils.book_new()

  const instructions = [
    { passo: '1', orientacao: 'Preencha a aba "metadados" com as informacoes da variavel.' },
    { passo: '2', orientacao: 'Na aba "dados_municipais", insira os valores para cada municipio e ano.' },
    { passo: '3', orientacao: 'O campo "secao" deve ser um dos seguintes: educacao, saude, seguranca, orcamento.' },
    { passo: '4', orientacao: 'O campo "grupo" pode ser um grupo existente (use o ID exato) ou um novo nome (sera criado automaticamente).' },
    { passo: '5', orientacao: 'Valores deixados em branco serao ignorados na importacao.' },
    { passo: '6', orientacao: 'Os nomes dos municipios devem coincidir com os nomes oficiais listados na planilha.' },
  ]
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(instructions), 'instrucoes')

  const metadataRows = [
    { campo: 'nome', valor: '' },
    { campo: 'descricao', valor: '' },
    { campo: 'unidade', valor: '' },
    { campo: 'fonte', valor: '' },
    { campo: 'secao', valor: 'educacao' },
    { campo: 'grupo', valor: '' },
  ]
  const metadataSheet = XLSX.utils.json_to_sheet(metadataRows)
  metadataSheet['!cols'] = [{ wch: 12 }, { wch: 40 }]
  XLSX.utils.book_append_sheet(workbook, metadataSheet, METADATA_SHEET)

  const currentYear = new Date().getFullYear()
  const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear]
  const dataHeader = ['municipio', ...years.map(String)]
  const dataRows = [
    dataHeader,
    ...MUNICIPIOS.map((m) => [m.nome, ...years.map(() => '')]),
  ]
  const dataSheet = XLSX.utils.aoa_to_sheet(dataRows)
  dataSheet['!cols'] = [{ wch: 26 }, ...years.map(() => ({ wch: 14 }))]
  XLSX.utils.book_append_sheet(workbook, dataSheet, DATA_SHEET)

  const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  createDownloadableBlob(
    new Blob([output], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    'modelo-indicador.xlsx',
  )
}

function parseMetadataFromRows(rows: Record<string, string>[]): IndicatorMetadata {
  const getValue = (campo: string) =>
    rows.find((r) => String(r.campo ?? '').toLowerCase().trim() === campo)?.valor ?? ''

  const rawSection = getValue('secao').toLowerCase().trim()
  const sectionId = INDICATOR_SECTION_IDS.includes(rawSection as IndicatorSectionId)
    ? (rawSection as IndicatorSectionId)
    : 'educacao'

  const rawGroup = getValue('grupo').trim()
  const groupId = rawGroup ? normalizeId(rawGroup) : ''

  const rawLabel = getValue('nome').trim()
  const indicatorId = rawLabel ? normalizeId(rawLabel) : 'nova_variavel'

  return {
    sectionId,
    groupId,
    groupLabel: rawGroup || groupId,
    indicatorId,
    indicatorLabel: rawLabel || indicatorId,
    description: getValue('descricao').trim(),
    unit: getValue('unidade').trim(),
    source: getValue('fonte').trim(),
  }
}

function resolveGroupId(bundle: PortalDataBundle, meta: IndicatorMetadata): string {
  const section = bundle.sections[meta.sectionId]
  const existing = section.groups.find((g) => g.id === meta.groupId)
  if (existing) return existing.id

  const existingByLabel = section.groups.find(
    (g) => g.label.toLowerCase().trim() === meta.groupLabel.toLowerCase().trim(),
  )
  if (existingByLabel) return existingByLabel.id

  return meta.groupId
}

export function parseNumericLoose(value: unknown): number | '' {
  if (typeof value === 'number') return Number.isFinite(value) ? value : ''
  if (typeof value === 'string') {
    const sanitized = value.replace(/\./g, '').replace(',', '.').trim()
    if (sanitized === '') return ''
    const parsed = Number(sanitized)
    return Number.isFinite(parsed) ? parsed : ''
  }
  return ''
}

function sortMapYears(mapSeries: Record<string, Record<string, number>>): Record<string, Record<string, number>> {
  return Object.fromEntries(
    Object.entries(mapSeries).sort(([a], [b]) => Number(a) - Number(b)),
  )
}

export function createMunicipalityMap(
  dataRows: unknown[][],
  years: string[],
): Map<string, Record<string, number | ''>> {
  const result = new Map<string, Record<string, number | ''>>()

  for (const row of dataRows) {
    const name = String(row[0] ?? '').trim()
    const municipio = MUNICIPIOS.find(
      (m) =>
        m.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ===
          name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ||
        m.slug === name.toLowerCase().replace(/\s+/g, '-'),
    )
    if (!municipio) continue

    const yearValues: Record<string, number | ''> = {}
    for (let i = 0; i < years.length; i++) {
      const colIdx = i + 1
      if (colIdx < row.length) {
        yearValues[years[i]] = parseNumericLoose(row[colIdx])
      } else {
        yearValues[years[i]] = ''
      }
    }
    result.set(municipio.slug, yearValues)
  }

  return result
}

export function createMunicipalityMapFromHeader(
  dataRows: unknown[][],
  header: string[],
  years: string[],
): Map<string, Record<string, number | ''>> {
  const yearColMap = new Map<string, number>()
  for (const year of years) {
    const idx = header.findIndex((h) => h.trim() === year)
    if (idx !== -1) yearColMap.set(year, idx)
  }

  const result = new Map<string, Record<string, number | ''>>()

  for (const row of dataRows) {
    const name = String(row[0] ?? '').trim()
    const municipio = MUNICIPIOS.find(
      (m) =>
        m.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ===
          name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ||
        m.slug === name.toLowerCase().replace(/\s+/g, '-'),
    )
    if (!municipio) continue

    const yearValues: Record<string, number | ''> = {}
    for (const year of years) {
      const colIdx = yearColMap.get(year)
      if (colIdx !== undefined && colIdx < row.length) {
        yearValues[year] = parseNumericLoose(row[colIdx])
      } else {
        yearValues[year] = ''
      }
    }
    result.set(municipio.slug, yearValues)
  }

  return result
}

export function importIndicatorFromXlsx(
  workbook: XLSX.WorkBook,
  bundle: PortalDataBundle,
): IndicatorImportResult {
  const metadataSheet = workbook.Sheets[METADATA_SHEET]
  if (!metadataSheet) {
    throw new Error(`Aba "${METADATA_SHEET}" nao encontrada. Use o modelo fornecido.`)
  }

  const metadataRows = XLSX.utils.sheet_to_json<Record<string, string>>(metadataSheet, { defval: '' })
  const meta = parseMetadataFromRows(metadataRows)

  if (!meta.indicatorLabel) {
    throw new Error('O campo "nome" e obrigatorio na aba metadados.')
  }

  const dataSheet = workbook.Sheets[DATA_SHEET]
  if (!dataSheet) {
    throw new Error(`Aba "${DATA_SHEET}" nao encontrada. Use o modelo fornecido.`)
  }

  const rawData: unknown[][] = XLSX.utils.sheet_to_json(dataSheet, { header: 1, defval: '' })
  if (rawData.length < 2) {
    throw new Error('A aba de dados esta vazia.')
  }

  const header = rawData[0].map(String)
  const years = header.slice(1).filter((h) => /^\d{4}$/.test(h.trim()))
  if (years.length === 0) {
    throw new Error('Nenhuma coluna de ano encontrada no cabeçalho. Use o formato: municipio, 2023, 2024, ...')
  }

  const dataRows = rawData.slice(1).filter((row) => String(row[0] ?? '').trim() !== '')
  const municipalityMap = createMunicipalityMapFromHeader(dataRows, header, years)

  return applyImportedData(bundle, meta, years, municipalityMap)
}

export function importIndicatorFromCsv(
  text: string,
  bundle: PortalDataBundle,
): IndicatorImportResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')

  let nome = ''
  let descricao = ''
  let unidade = ''
  let fonte = ''
  let secao = 'educacao'
  let grupo = ''

  const dataStartIdx = lines.findIndex((line) => {
    const first = line.split(/[,\t;]/)[0]?.trim() ?? ''
    return !first.startsWith('#')
  })

  if (dataStartIdx === -1) {
    throw new Error('CSV invalido: nenhum dado encontrado apos os metadados.')
  }

  for (let i = 0; i < dataStartIdx; i++) {
    const line = lines[i].replace(/^#/, '').trim()
    const sepIdx = line.indexOf(',')
    if (sepIdx === -1) continue
    const campo = line.slice(0, sepIdx).trim().toLowerCase()
    const valor = line.slice(sepIdx + 1).trim()
    switch (campo) {
      case 'nome': nome = valor; break
      case 'descricao': descricao = valor; break
      case 'unidade': unidade = valor; break
      case 'fonte': fonte = valor; break
      case 'secao': secao = valor; break
      case 'grupo': grupo = valor; break
    }
  }

  const rawSection = secao.toLowerCase().trim()
  const sectionId = INDICATOR_SECTION_IDS.includes(rawSection as IndicatorSectionId)
    ? (rawSection as IndicatorSectionId)
    : 'educacao'
  const groupId = grupo ? normalizeId(grupo) : ''
  const indicatorId = nome ? normalizeId(nome) : 'nova_variavel'

  const meta: IndicatorMetadata = {
    sectionId,
    groupId,
    groupLabel: grupo || groupId,
    indicatorId,
    indicatorLabel: nome || indicatorId,
    description: descricao,
    unit: unidade,
    source: fonte,
  }

  const headerLine = lines[dataStartIdx]
  const sep = headerLine.includes('\t') ? '\t' : ','
  const header = headerLine.split(sep).map((s) => s.trim().replace(/^"|"$/g, ''))
  const years = header.slice(1).filter((h) => /^\d{4}$/.test(h.trim()))

  const dataRows: unknown[][] = []
  for (let i = dataStartIdx + 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map((s) => s.trim().replace(/^"|"$/g, ''))
    dataRows.push(cols)
  }

  const municipalityMap = createMunicipalityMapFromHeader(dataRows, header, years)
  return applyImportedData(bundle, meta, years, municipalityMap)
}

export function importIndicatorFromJson(
  parsed: Record<string, unknown>,
  bundle: PortalDataBundle,
): IndicatorImportResult {
  const rawSection = String(parsed.sectionId ?? parsed.section ?? 'educacao').toLowerCase().trim()
  const sectionId = INDICATOR_SECTION_IDS.includes(rawSection as IndicatorSectionId)
    ? (rawSection as IndicatorSectionId)
    : 'educacao'

  const rawGroup = String(parsed.groupId ?? parsed.group ?? '').trim()
  const groupId = rawGroup || normalizeId(String(parsed.groupLabel ?? parsed.group ?? 'novo_grupo'))
  const groupLabel = String(parsed.groupLabel ?? (rawGroup || groupId))

  const rawLabel = String(parsed.label ?? parsed.indicatorLabel ?? parsed.nome ?? '').trim()
  const indicatorId = rawLabel ? normalizeId(rawLabel) : 'nova_variavel'

  const meta: IndicatorMetadata = {
    sectionId,
    groupId,
    groupLabel,
    indicatorId,
    indicatorLabel: rawLabel || indicatorId,
    description: String(parsed.description ?? parsed.descricao ?? '').trim(),
    unit: String(parsed.unit ?? parsed.unidade ?? '').trim(),
    source: String(parsed.source ?? parsed.fonte ?? '').trim(),
  }

  const years: string[] = []
  const municipalityMap = new Map<string, Record<string, number | ''>>()

  const data = parsed.data ?? parsed.dados ?? parsed.dadosMunicipais
  if (Array.isArray(data)) {
    for (const entry of data) {
      const row = entry as Record<string, unknown>
      const name = String(row.municipio ?? row.municipioNome ?? row.nome ?? '').trim()
      const municipio = MUNICIPIOS.find(
        (m) =>
          m.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ===
            name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ||
          m.slug === name.toLowerCase().replace(/\s+/g, '-'),
      )
      if (!municipio) continue

      const yearValues: Record<string, number | ''> = {}
      for (const [key, val] of Object.entries(row)) {
        if (/^\d{4}$/.test(key)) {
          if (!years.includes(key)) years.push(key)
          yearValues[key] = parseNumericLoose(val)
        }
      }
      municipalityMap.set(municipio.slug, yearValues)
    }
  }

  years.sort()

  return applyImportedData(bundle, meta, years, municipalityMap)
}

function applyImportedData(
  bundle: PortalDataBundle,
  meta: IndicatorMetadata,
  years: string[],
  municipalityMap: Map<string, Record<string, number | ''>>,
): IndicatorImportResult {
  const nextBundle = structuredClone(bundle) as PortalDataBundle
  const resolvedGroupId = resolveGroupId(nextBundle, meta)
  const section = nextBundle.sections[meta.sectionId]

  let group = section.groups.find((g) => g.id === resolvedGroupId)
  if (!group) {
    group = {
      id: resolvedGroupId,
      label: meta.groupLabel || resolvedGroupId,
      indicators: [],
    }
    section.groups.push(group)
  }

  const finalIndicatorId = generateUniqueIndicatorId(group, meta.indicatorId)

  const mapSeries: Record<string, Record<string, number>> = {}
  const timeSeriesMap = new Map<string, number[]>()

  for (const yearStr of years) {
    const yearValues: Record<string, number> = {}
    const stateValues: number[] = []

    for (const [slug, yearData] of municipalityMap) {
      const val = yearData[yearStr]
      if (val !== '' && val !== undefined) {
        yearValues[slug] = val
        stateValues.push(val)
      }
    }

    if (Object.keys(yearValues).length > 0) {
      mapSeries[yearStr] = yearValues
    }

    if (stateValues.length > 0) {
      timeSeriesMap.set(yearStr, stateValues)
    }
  }

  const timeSeries = Array.from(timeSeriesMap.entries()).map(([yearStr, values]) => ({
    year: Number(yearStr),
    value: values.reduce((a, b) => a + b, 0) / values.length,
  })).sort((a, b) => a.year - b.year)

  if (timeSeries.length === 0) {
    timeSeries.push({ year: new Date().getFullYear(), value: 0 })
  }

  const newIndicator: Indicator = {
    id: finalIndicatorId,
    label: meta.indicatorLabel,
    description: meta.description,
    unit: meta.unit,
    source: meta.source,
    timeSeries,
    mapSeries: Object.keys(mapSeries).length > 0 ? sortMapYears(mapSeries) : undefined,
    byMunicipio: {},
    latestValue: timeSeries.length > 0 ? timeSeries[timeSeries.length - 1].value : 0,
  }

  const fallbackYear =
    Number(section.lastUpdated.slice(0, 4)) || new Date().getFullYear()
  if (newIndicator.mapSeries) {
    newIndicator.byMunicipio = getIndicatorLatestByMunicipio(newIndicator, fallbackYear)
  }

  group.indicators.push(newIndicator)

  return {
    bundle: nextBundle,
    sectionId: meta.sectionId,
    groupId: resolvedGroupId,
    indicatorId: finalIndicatorId,
    indicatorLabel: meta.indicatorLabel,
  }
}

function generateUniqueIndicatorId(group: { indicators: Array<{ id: string }> }, baseId: string): string {
  let candidate = baseId
  let counter = 1
  while (group.indicators.some((i) => i.id === candidate)) {
    candidate = `${baseId}_${counter}`
    counter++
  }
  return candidate
}

export { createDownloadableBlob }