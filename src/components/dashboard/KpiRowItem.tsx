import { cn } from '@/lib/utils/cn'
import { StatDelta } from '@/components/ui/StatDelta'
import type { KpiData } from '@/types/dashboard'

interface KpiRowItemProps {
  kpi: KpiData
  className?: string
}

export function KpiRowItem({ kpi, className }: KpiRowItemProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 py-3 px-3',
        'rounded-lg hover:bg-areia-50/70 transition-colors duration-150',
        className,
      )}
    >
      {/* Left: label stacked */}
      <div className="flex-1 min-w-0">
        <span
          className="block text-[10px] font-medium uppercase tracking-widest text-verde-700 font-jakarta mb-0.5"
          title={kpi.label}
        >
          {kpi.label}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold font-fraunces text-verde-900 tracking-tight leading-none">
            {typeof kpi.value === 'number'
              ? kpi.value.toLocaleString('pt-BR')
              : kpi.value}
          </span>
          {kpi.unit && (
            <span className="text-[10px] text-areia-400 font-jakarta">{kpi.unit}</span>
          )}
        </div>
      </div>

    </div>
  )
}
