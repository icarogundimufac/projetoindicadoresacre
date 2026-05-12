import { cn } from '@/lib/utils/cn'
import { formatNumber } from '@/lib/utils/format'
import type { MunicipioDashboardKpi, DashboardSection } from '@/types/municipio-dashboard'

interface MunicipioKpiCardsProps {
  kpis: MunicipioDashboardKpi[]
  showEstadual?: boolean
}

const SECTION_CONFIG: Record<DashboardSection, { label: string; color: string; bg: string; border: string }> = {
  educacao: {
    label: 'Educação',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  saude: {
    label: 'Saúde',
    color: 'text-verde-700',
    bg: 'bg-verde-50',
    border: 'border-verde-200',
  },
  seguranca: {
    label: 'Segurança',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  orcamento: {
    label: 'Orçamento',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
}

const SECTION_ORDER: DashboardSection[] = ['educacao', 'saude', 'seguranca', 'orcamento']

function ProgressBar({
  value,
  max,
  colorClass,
}: {
  value: number
  max: number
  colorClass: string
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div className="h-1.5 w-full rounded-full bg-areia-100 overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-700', colorClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function KpiCard({
  kpi,
  showEstadual,
  sectionConfig,
}: {
  kpi: MunicipioDashboardKpi
  showEstadual: boolean
  sectionConfig: (typeof SECTION_CONFIG)[DashboardSection]
}) {
  // Bar reference: use estadual value as 100% reference, or just show relative intensity
  const maxBar =
    kpi.estadualValue && kpi.estadualValue > 0
      ? Math.max(kpi.value, kpi.estadualValue) * 1.15
      : kpi.value * 1.2

  const delta = kpi.delta ?? 0
  const isPositive = (kpi.deltaDirection === 'up' && delta > 0) || delta > 0
  const isNegative = (kpi.deltaDirection === 'down' && delta < 0) || delta < 0

  return (
    <div className="group bg-white rounded-xl border border-areia-200 shadow-sm p-4 hover:shadow-md hover:border-areia-300 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-areia-400 font-jakarta leading-none">
            {kpi.label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-fraunces text-verde-900 tabular-nums leading-none">
              {formatNumber(kpi.value)}
            </span>
            <span className="text-[10px] text-areia-400 font-jakarta">{kpi.unit}</span>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold font-jakarta tabular-nums flex-shrink-0 mt-0.5',
            sectionConfig.bg,
            sectionConfig.color,
          )}
        >
          {kpi.year}
        </span>
      </div>

      <div className="mt-3">
        <ProgressBar
          value={kpi.value}
          max={maxBar}
          colorClass={sectionConfig.color.replace('text-', 'bg-').replace('700', '500')}
        />
      </div>

      {showEstadual && kpi.estadualValue !== undefined && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-areia-400 font-jakarta">
            Média AC:{" "}
            <span className="font-semibold text-areia-600 tabular-nums">
              {formatNumber(kpi.estadualValue)}
            </span>
          </span>
          {kpi.delta !== undefined && (
            <span
              className={cn(
                'text-[10px] font-semibold font-jakarta tabular-nums',
                isPositive ? 'text-verde-600' : isNegative ? 'text-red-500' : 'text-areia-400',
              )}
            >
              {isPositive ? '↑' : isNegative ? '↓' : '−'} {Math.abs(kpi.delta).toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function MunicipioKpiCards({ kpis, showEstadual = false }: MunicipioKpiCardsProps) {
  // Group KPIs by section preserving order
  const grouped = kpis.reduce<Record<DashboardSection, MunicipioDashboardKpi[]>>(
    (acc, kpi) => {
      if (!acc[kpi.section]) acc[kpi.section] = []
      acc[kpi.section].push(kpi)
      return acc
    },
    { educacao: [], saude: [], seguranca: [], orcamento: [] },
  )

  const hasAnyKpis = SECTION_ORDER.some((s) => grouped[s].length > 0)

  if (!hasAnyKpis) {
    return (
      <div className="text-center py-12 text-sm text-areia-400 font-jakarta">
        Nenhum indicador disponível.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {SECTION_ORDER.map((section) => {
        const sectionKpis = grouped[section]
        const config = SECTION_CONFIG[section]

        if (sectionKpis.length === 0) return null

        return (
          <div key={section}>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn('h-4 w-1 rounded-full', config.bg.replace('bg-', 'bg-').replace('50', '500'))} />
              <h3 className={cn('text-sm font-bold font-fraunces', config.color)}>
                {config.label}
              </h3>
              <span className="text-[10px] text-areia-400 font-jakarta">
                {sectionKpis.length} {sectionKpis.length === 1 ? 'indicador' : 'indicadores'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {sectionKpis.map((kpi) => (
                <KpiCard
                  key={kpi.id}
                  kpi={kpi}
                  showEstadual={showEstadual}
                  sectionConfig={config}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
