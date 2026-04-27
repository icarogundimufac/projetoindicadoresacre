import { SectionKpiCard } from './SectionKpiCard'
import type { TimeSeriesPoint } from '@/types/indicators'

interface KpiItem {
  id: string
  label: string
  value: number | string
  unit: string
  year: number
  delta?: number
  deltaDirection?: 'up' | 'down' | 'neutral'
  positiveDirection?: 'up' | 'down'
  sparklineData?: TimeSeriesPoint[]
  accentColor?: string
}

interface SectionKpiGridProps {
  kpis: KpiItem[]
}

const ACCENT_COLORS = [
  '#157244',
  '#229157',
  '#44b375',
  '#F2C230',
  '#0f5b36',
  '#7bd09e',
]

export function SectionKpiGrid({ kpis }: SectionKpiGridProps) {
  if (kpis.length === 0) return null

  return (
    <section className="flex flex-nowrap gap-4 overflow-x-auto">
      {kpis.map((kpi, index) => (
        <SectionKpiCard
          key={kpi.id}
          label={kpi.label}
          value={kpi.value}
          unit={kpi.unit}
          year={kpi.year}
          delta={kpi.delta}
          deltaDirection={kpi.deltaDirection}
          positiveDirection={kpi.positiveDirection}
          sparklineData={kpi.sparklineData}
          accentColor={kpi.accentColor ?? ACCENT_COLORS[index % ACCENT_COLORS.length]}
          size="small"
          className="min-w-[280px] flex-1"
        />
      ))}
    </section>
  )
}
