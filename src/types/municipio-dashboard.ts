export type DashboardSection = 'educacao' | 'saude' | 'seguranca' | 'orcamento'

export interface MunicipioDashboardKpi {
  id: string
  section: DashboardSection
  label: string
  value: number
  unit: string
  year: number
  delta?: number
  deltaDirection?: 'up' | 'down' | 'neutral'
  estadualValue?: number
}

export interface MunicipioDashboardData {
  slug: string
  nome: string
  populacao: number
  area: number
  regiaoJudiciaria: string
  distanciaCapital: number
  idhm: number
  lat: number
  lng: number
  kpis: MunicipioDashboardKpi[]
}

export interface MunicipioOption {
  slug: string
  nome: string
}