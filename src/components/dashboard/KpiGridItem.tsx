import { cn } from '@/lib/utils/cn'
import { StatDelta } from '@/components/ui/StatDelta'
import type { KpiData } from '@/types/dashboard'

interface KpiGridItemProps {
  kpi: KpiData
  className?: string
}

const SECTION_COLORS: Record<string, { dot: string; border: string }> = {
  educacao:   { dot: 'bg-blue-500',   border: 'border-l-blue-500'   },
  saude:      { dot: 'bg-emerald-500', border: 'border-l-emerald-500' },
  seguranca:  { dot: 'bg-orange-500',  border: 'border-l-orange-500'  },
  orcamento:  { dot: 'bg-amber-500',   border: 'border-l-amber-500'   },
  municipios: { dot: 'bg-purple-500',  border: 'border-l-purple-500'  },
  default:    { dot: 'bg-verde-500',   border: 'border-l-verde-500'   },
}

function formatValue(value: number | string, unit: string): { value: string; unit: string } {
  if (typeof value === 'string') return { value, unit }
  if (unit === 'R$') {
    if (value >= 1_000_000_000) return { value: (value / 1_000_000_000).toFixed(1), unit: ' bi' }
    if (value >= 1_000_000)     return { value: (value / 1_000_000).toFixed(1),     unit: ' mi' }
    if (value >= 1_000)         return { value: (value / 1_000).toFixed(1),         unit: ' mil' }
    return { value: value.toLocaleString('pt-BR'), unit }
  }
  return { value: value.toLocaleString('pt-BR'), unit }
}

export function KpiGridItem({ kpi, className }: KpiGridItemProps) {
  const colors = SECTION_COLORS[kpi.section] ?? SECTION_COLORS.default
  const { value: formattedValue, unit: displayUnit } = formatValue(kpi.value, kpi.unit)

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-areia-100 border-l-2 p-3 h-[88px] flex flex-col justify-between dark:bg-[#4a5546] dark:border-white/12',
        'transition-shadow duration-150 hover:shadow-sm',
        colors.border,
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', colors.dot)} />
          <span
            className="text-[9px] font-semibold uppercase tracking-wide text-areia-500 font-jakarta truncate"
            title={kpi.label}
          >
            {kpi.label}
          </span>
        </div>
        <span className="text-[9px] text-areia-400 font-jakarta tabular-nums flex-shrink-0 ml-1">
          {kpi.year}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl font-bold font-fraunces tabular-nums text-verde-900 leading-none">
            {formattedValue}
          </span>
          {displayUnit && (
            <span className="text-[9px] text-areia-400 font-jakarta">{displayUnit}</span>
          )}
        </div>

        {kpi.delta !== undefined && (
          <StatDelta
            delta={kpi.delta}
            deltaDirection={kpi.deltaDirection}
            positiveDirection={kpi.positiveDirection}
            compact
          />
        )}
      </div>
    </div>
  )
}
