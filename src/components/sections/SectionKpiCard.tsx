import { cn } from '@/lib/utils/cn'
import { StatDelta } from '@/components/ui/StatDelta'
import { MiniSparkline } from '@/components/charts/MiniSparkline'
import type { TimeSeriesPoint } from '@/types/indicators'

interface SectionKpiCardProps {
  label: string
  value: number | string
  unit: string
  year: number
  delta?: number
  deltaDirection?: 'up' | 'down' | 'neutral'
  positiveDirection?: 'up' | 'down'
  sparklineData?: TimeSeriesPoint[]
  accentColor?: string
  size?: 'large' | 'small'
  className?: string
}

export function SectionKpiCard({
  label,
  value,
  unit,
  year,
  delta,
  deltaDirection,
  positiveDirection,
  sparklineData,
  accentColor = '#229157',
  size = 'large',
  className,
}: SectionKpiCardProps) {
  const isLarge = size === 'large'

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-areia-200 bg-white shadow-sm dark:bg-[#4a5546] dark:border-white/12',
        'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        className,
      )}
    >
      {/* Accent left border */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex h-full flex-col justify-between p-5 pl-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <p
              className={cn(
                'font-medium text-areia-500 font-jakarta leading-tight',
                isLarge ? 'text-sm' : 'text-xs',
              )}
            >
              {label}
            </p>
            <span className="shrink-0 text-[10px] font-semibold text-areia-400 font-jakarta tabular-nums">
              {year}
            </span>
          </div>

          <div className={cn('mt-3 flex items-baseline gap-1.5', isLarge && 'mt-4')}>
            <span
              className={cn(
                'font-bold text-verde-950 font-fraunces tabular-nums tracking-tight',
                isLarge ? 'text-4xl' : 'text-2xl',
              )}
            >
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </span>
            {unit && (
              <span className="text-sm text-areia-500 font-jakarta">{unit}</span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          {delta !== undefined && (
            <StatDelta
              delta={delta}
              deltaDirection={deltaDirection}
              positiveDirection={positiveDirection}
            />
          )}

          {sparklineData && sparklineData.length > 1 && (
            <div className="w-28 shrink-0 opacity-60 transition-opacity duration-200 group-hover:opacity-100">
              <MiniSparkline
                data={sparklineData.map((p) => ({ year: p.year, value: p.value }))}
                color={accentColor}
                height={32}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
