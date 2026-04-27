import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import * as XLSX from 'xlsx'
import {
  downloadBundleAsJson,
  downloadBundleAsWorkbook,
  downloadBundleAsZip,
  downloadMunicipalTemplateWorkbook,
  importBundleFromJson,
  importBundleFromWorkbook,
  importBundleFromZip,
  importMunicipalTemplateWorkbook,
} from '@/lib/data/workbook'
import {
  downloadBlankIndicatorTemplate,
  importIndicatorFromCsv,
  importIndicatorFromJson,
  importIndicatorFromXlsx,
  createMunicipalityMapFromHeader,
  parseNumericLoose,
  type IndicatorImportResult,
} from '@/lib/data/indicator-import'
import { MUNICIPIOS } from '@/lib/constants/municipios'
import type { PortalDataBundle } from '@/types/admin-data'
import type { StatusMessage } from './useBundleMutations'

export type { IndicatorImportResult }

export interface ParsedIndicatorData {
  years: string[]
  municipalityData: Map<string, Record<string, number | ''>>
}

export function useImportExport(
  bundle: PortalDataBundle | null,
  setBundle: Dispatch<SetStateAction<PortalDataBundle | null>>,
  setStatus: (status: StatusMessage | null) => void,
) {
  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      let importedBundle: PortalDataBundle
      if (file.name.endsWith('.xlsx')) {
        importedBundle = await importBundleFromWorkbook(file)
      } else if (file.name.endsWith('.zip')) {
        importedBundle = await importBundleFromZip(file)
      } else if (file.name.endsWith('.json')) {
        importedBundle = await importBundleFromJson(file)
      } else {
        throw new Error('Formato de arquivo não suportado.')
      }

      setBundle(importedBundle)
      setStatus({ kind: 'success', message: `Arquivo ${file.name} importado.` })
      event.target.value = ''
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao importar arquivo.'
      setStatus({ kind: 'error', message })
      event.target.value = ''
    }
  }

  const handleMunicipalTemplateImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !bundle) return

    try {
      const importedBundle = await importMunicipalTemplateWorkbook(file, bundle)
      setBundle(importedBundle)
      setStatus({ kind: 'success', message: `Planilha municipal ${file.name} importada.` })
      event.target.value = ''
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao importar planilha municipal.'
      setStatus({ kind: 'error', message })
      event.target.value = ''
    }
  }

  const handleIndicatorFileImport = async (
    file: File,
  ): Promise<IndicatorImportResult | null> => {
    if (!bundle) return null

    try {
      let result: IndicatorImportResult

      if (file.name.endsWith('.xlsx')) {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        result = importIndicatorFromXlsx(workbook, bundle)
      } else if (file.name.endsWith('.csv')) {
        const text = await file.text()
        result = importIndicatorFromCsv(text, bundle)
      } else if (file.name.endsWith('.json')) {
        const text = await file.text()
        const parsed = JSON.parse(text)
        result = importIndicatorFromJson(parsed, bundle)
      } else {
        throw new Error('Formato de arquivo nao suportado. Use xlsx, csv ou json.')
      }

      setBundle(result.bundle)
      setStatus({ kind: 'success', message: `Variavel "${result.indicatorLabel}" importada com sucesso.` })
      return result
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao importar arquivo de indicador.'
      setStatus({ kind: 'error', message })
      return null
    }
  }

  const parseIndicatorDataFile = async (file: File): Promise<ParsedIndicatorData | null> => {
    try {
      if (file.name.endsWith('.xlsx')) {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const possibleSheetNames = workbook.SheetNames
        const dataSheetName = possibleSheetNames.find((s) =>
          s.toLowerCase().includes('dados') || s.toLowerCase().includes('municipal') || s === 'dados_municipais',
        )
        if (!dataSheetName) throw new Error('Aba de dados nao encontrada no arquivo XLSX.')
        const dataSheet = workbook.Sheets[dataSheetName]
        const rawRows: unknown[][] = XLSX.utils.sheet_to_json(dataSheet, { header: 1, defval: '' }) as unknown[][]
        const header = rawRows[0]?.map(String) ?? []
        const years = header.slice(1).filter((h) => /^\d{4}$/.test(h.trim()))
        if (years.length === 0) throw new Error('Nenhuma coluna de ano encontrada.')
        const dataRows = rawRows.slice(1).filter((row) => String((row as unknown[])[0] ?? '').trim() !== '')
        return { years, municipalityData: createMunicipalityMapFromHeader(dataRows as unknown[][], header, years) }
      } else if (file.name.endsWith('.csv')) {
        const text = await file.text()
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
        const dataStartIdx = lines.findIndex((line) => {
          const first = line.split(/[,\t;]/)[0]?.trim() ?? ''
          return !first.startsWith('#')
        })
        if (dataStartIdx === -1) throw new Error('CSV invalido: nenhum dado encontrado.')
        const headerLine = lines[dataStartIdx]
        const sep = headerLine.includes('\t') ? '\t' : ','
        const header = headerLine.split(sep).map((s) => s.trim().replace(/^"|"$/g, ''))
        const years = header.slice(1).filter((h) => /^\d{4}$/.test(h.trim()))
        if (years.length === 0) throw new Error('Nenhuma coluna de ano encontrada.')
        const dataRows: unknown[][] = []
        for (let i = dataStartIdx + 1; i < lines.length; i++) {
          const cols = lines[i].split(sep).map((s) => s.trim().replace(/^"|"$/g, ''))
          dataRows.push(cols)
        }
        return { years, municipalityData: createMunicipalityMapFromHeader(dataRows, header, years) }
      } else if (file.name.endsWith('.json')) {
        const text = await file.text()
        const parsed = JSON.parse(text) as Record<string, unknown>
        const data = parsed.data ?? parsed.dados ?? parsed.dadosMunicipais
        if (!Array.isArray(data)) throw new Error('Arquivo JSON nao contem dados municipais.')
        const years: string[] = []
        const municipalityData = new Map<string, Record<string, number | ''>>()
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
          municipalityData.set(municipio.slug, yearValues)
        }
        years.sort()
        return { years, municipalityData }
      } else {
        throw new Error('Formato de arquivo nao suportado. Use xlsx, csv ou json.')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao ler arquivo de dados.'
      setStatus({ kind: 'error', message })
      return null
    }
  }

  const exportWorkbook = () => {
    if (!bundle) return
    void downloadBundleAsWorkbook(bundle)
    setStatus({ kind: 'success', message: 'Planilha exportada.' })
  }

  const exportZip = () => {
    if (!bundle) return
    void downloadBundleAsZip(bundle)
    setStatus({ kind: 'success', message: 'ZIP exportado.' })
  }

  const exportJson = () => {
    if (!bundle) return
    downloadBundleAsJson(bundle)
    setStatus({ kind: 'success', message: 'JSON exportado.' })
  }

  const exportMunicipalTemplate = (variableKey: string, year: number) => {
    if (!bundle) return
    void downloadMunicipalTemplateWorkbook(bundle, variableKey, year)
    setStatus({ kind: 'success', message: 'Modelo municipal exportado.' })
  }

  const exportIndicatorTemplate = () => {
    downloadBlankIndicatorTemplate()
    setStatus({ kind: 'success', message: 'Modelo de indicador exportado.' })
  }

  return {
    handleImport,
    handleMunicipalTemplateImport,
    handleIndicatorFileImport,
    parseIndicatorDataFile,
    exportWorkbook,
    exportZip,
    exportJson,
    exportMunicipalTemplate,
    exportIndicatorTemplate,
  }
}