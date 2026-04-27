import { cn } from '@/lib/utils/cn'

interface StatDeltaProps {
  delta: number
  deltaDirection?: 'up' | 'down' | 'neutral'
  positiveDirection?: 'up' | 'down'
  unit?: string
  compact?: boolean
  className?: string
}

export function StatDelta({
  delta,
  deltaDirection,
  positiveDirection = 'up',
  unit = '',
  compact = false,
  className,
}: StatDeltaProps) {
  const direction = deltaDirection ?? (delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral')
  const isPositive = direction === positiveDirection
  const isNeutral = direction === 'neutral'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-semibold font-jakarta',
        compact
          ? 'text-[10px]'
          : 'text-xs',
        isNeutral ? 'text-areia-500' : isPositive ? 'text-verde-600' : 'text-estrela-500',
        className,
      )}
    >
      {!isNeutral && (
        <svg
          viewBox="0 0 16 16"
          className={cn(
            'fill-current',
            compact ? 'w-2.5 h-2.5' : 'w-3 h-3',
            direction === 'down' && 'rotate-180',
          )}
        >
          <path d="M8 3l5 8H3z" />
        </svg>
      )}
      <span className="tabular-nums">
        {delta > 0 ? '+' : ''}{delta.toFixed(1)}{unit}
      </span>
      {!compact && !isNeutral && (
        <span className="font-normal text-areia-500">vs. ano ant.</span>
      )}
    </span>
  )
}
