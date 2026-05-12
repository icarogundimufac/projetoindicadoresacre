import { portalDataClient } from './client'
import type {
  MunicipioDashboardData,
  MunicipioDashboardKpi,
  MunicipioOption,
  DashboardSection,
} from '@/types/municipio-dashboard'
import type { MunicipioDetail, MunicipioIndicador } from '@/types/municipio'

/**
 * Simple seeded random number generator for deterministic mock data.
 * Uses the slug to seed so the same municipality always gets the same values.
 */
function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return function () {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff
    return hash / 0x7fffffff
  }
}

/**
 * Generate a random delta between -5 and +5 for visual variety.
 */
function generateDelta(random: () => number): number {
  const value = (random() * 10 - 5).toFixed(1)
  return parseFloat(value)
}

/**
 * Determine delta direction based on delta value.
 */
function getDeltaDirection(delta: number): 'up' | 'down' | 'neutral' {
  if (delta > 0.5) return 'up'
  if (delta < -0.5) return 'down'
  return 'neutral'
}

/**
 * Generate a statewide comparison value with ±15% variation.
 */
function generateEstadualValue(value: number, random: () => number): number {
  const variation = 0.85 + random() * 0.3 // ±15%
  const result = value * variation
  return Number.isInteger(value) ? Math.round(result) : parseFloat(result.toFixed(1))
}

/**
 * Convert MunicipioIndicador to MunicipioDashboardKpi with random delta.
 */
function convertIndicadorToKpi(
  indicador: MunicipioIndicador,
  random: () => number,
): MunicipioDashboardKpi {
  const delta = generateDelta(random)
  const value = indicador.value
  return {
    id: indicador.id,
    section: indicador.section as DashboardSection,
    label: indicador.label,
    value: indicador.value,
    unit: indicador.unit,
    year: indicador.year,
    delta,
    deltaDirection: getDeltaDirection(delta),
    estadualValue: generateEstadualValue(value, random),
  }
}

/**
 * Generate mock KPIs for a municipality that doesn't have detailed data.
 */
function generateMockKpis(slug: string): MunicipioDashboardKpi[] {
  const random = seededRandom(slug)

  const mockKpis: Array<{
    section: DashboardSection
    id: string
    label: string
    min: number
    max: number
    unit: string
  }> = [
    // Educação
    { section: 'educacao', id: 'ideb-anos-iniciais', label: 'IDEB Anos Iniciais', min: 3.8, max: 6.2, unit: 'nota' },
    { section: 'educacao', id: 'taxa-analfabetismo', label: 'Taxa de Analfabetismo', min: 5, max: 18, unit: '%' },
    // Saúde
    { section: 'saude', id: 'mortalidade-infantil', label: 'Mortalidade Infantil', min: 8, max: 25, unit: 'por mil nascidos' },
    { section: 'saude', id: 'cobertura-ab', label: 'Cobertura AB', min: 55, max: 92, unit: '%' },
    // Segurança
    { section: 'seguranca', id: 'taxa-homicidios', label: 'Taxa de Homicídios', min: 10, max: 45, unit: 'por 100 mil' },
    { section: 'seguranca', id: 'taxa-roubos', label: 'Taxa de Roubos', min: 200, max: 800, unit: 'por 100 mil' },
    // Orçamento
    { section: 'orcamento', id: 'despesa-per-capita', label: 'Despesa per capita', min: 1200, max: 4500, unit: 'R$' },
    { section: 'orcamento', id: 'receita-per-capita', label: 'Receita per capita', min: 1400, max: 5200, unit: 'R$' },
  ]

  return mockKpis.map((kpi) => {
    const rawValue = kpi.min + random() * (kpi.max - kpi.min)
    const value = kpi.unit === 'nota' ? parseFloat(rawValue.toFixed(1)) : Math.round(rawValue)
    const delta = generateDelta(random)

    return {
      id: kpi.id,
      section: kpi.section,
      label: kpi.label,
      value,
      unit: kpi.unit,
      year: 2023,
      delta,
      deltaDirection: getDeltaDirection(delta),
      estadualValue: generateEstadualValue(value, random),
    }
  })
}

/**
 * Fetch dashboard data for a specific municipality.
 * If detailed data exists, use it. Otherwise, generate mock data.
 */
export async function getMunicipioDashboardData(slug: string): Promise<MunicipioDashboardData> {
  const municipioDetail = await portalDataClient.getMunicipio(slug)

  if (municipioDetail) {
    const random = seededRandom(slug)
    return convertDetailToDashboardData(municipioDetail, random)
  }

  // Generate mock data for municipalities without detailed files
  const municipios = await portalDataClient.getMunicipios()
  const municipioSummary = municipios.find((m) => m.slug === slug)

  if (!municipioSummary) {
    throw new Error(`Município não encontrado: ${slug}`)
  }

  return {
    slug: municipioSummary.slug,
    nome: municipioSummary.nome,
    populacao: municipioSummary.populacao,
    area: municipioSummary.area,
    regiaoJudiciaria: municipioSummary.regiaoJudiciaria,
    distanciaCapital: municipioSummary.distanciaCapital,
    idhm: municipioSummary.idhm,
    lat: municipioSummary.lat,
    lng: municipioSummary.lng,
    kpis: generateMockKpis(slug),
  }
}

/**
 * Convert MunicipioDetail to MunicipioDashboardData with random deltas.
 */
function convertDetailToDashboardData(
  detail: MunicipioDetail,
  random: () => number,
): MunicipioDashboardData {
  return {
    slug: detail.slug,
    nome: detail.nome,
    populacao: detail.populacao,
    area: detail.area,
    regiaoJudiciaria: detail.regiaoJudiciaria,
    distanciaCapital: detail.distanciaCapital,
    idhm: detail.idhm,
    lat: detail.lat,
    lng: detail.lng,
    kpis: detail.indicadores.map((ind) => convertIndicadorToKpi(ind, random)),
  }
}

/**
 * Get all municipality options sorted by name.
 */
export async function getAllMunicipioOptions(): Promise<MunicipioOption[]> {
  const municipios = await portalDataClient.getMunicipios()
  return municipios
    .map((m) => ({ slug: m.slug, nome: m.nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}