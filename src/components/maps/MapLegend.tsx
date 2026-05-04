import { formatNumber } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { useMemo } from 'react'

interface MapLegendProps {
  min: number
  max: number
  unit?: string
  label?: string
  colors: string[]
  steps?: number
}

export function MapLegend({
  min,
  max,
  unit = '',
  label = '',
  colors,
  steps = 5,
}: MapLegendProps) {
  const gradient = `linear-gradient(to right, ${colors.join(', ')})`

  const breakPoints = useMemo(() => {
    if (min === max) return [{ value: min, offset: 0 }]
    const range = max - min
    return colors.map((_, i) => {
      const offset = i / (colors.length - 1)
      return { value: min + offset * range, offset }
    })
  }, [min, max, colors])

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-areia-200 min-w-[180px] max-w-[240px] space-y-3">
      {label && (
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold text-verde-900 font-jakarta uppercase tracking-[0.12em] leading-tight">
            {label}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <div
          className="h-2 rounded-full"
          style={{ background: gradient }}
        />

        <div className="flex justify-between">
          {breakPoints.map((point, i) => (
            <span
              key={point.value}
              className={cn(
                'text-[10px] font-jakarta tabular-nums leading-none',
                i === 0 || i === breakPoints.length - 1
                  ? 'text-areia-600 font-semibold'
                  : 'text-areia-400',
              )}
            >
              {formatNumber(point.value)}
            </span>
          ))}
        </div>

        {unit && (
          <p className="text-[10px] text-areia-500 font-jakarta text-center leading-none">
            {unit}
          </p>
        )}
      </div>
    </div>
  )
}
