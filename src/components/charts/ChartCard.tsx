import { cn } from '@/lib/utils/cn'

interface ChartCardProps {
  title: string
  subtitle?: string
  source?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
  compact?: boolean
}

export function ChartCard({
  title,
  subtitle,
  source,
  children,
  className,
  action,
  compact = false,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-areia-200 bg-white shadow-sm animate-fade-in dark:bg-[#4a5546] dark:border-white/12',
        className,
      )}
    >
      <div className={cn(
        'flex items-start justify-between gap-4 border-b border-areia-100',
        compact ? 'px-4 pt-4 pb-3' : 'px-6 pt-5 pb-4',
      )}>
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-base font-bold text-verde-900 font-fraunces">
            <span className="h-5 w-1 rounded-full bg-verde-700" />
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs leading-relaxed text-areia-400 font-jakarta">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      <div className={cn('overflow-hidden', compact ? 'p-4' : 'p-6')}>
        {children}
      </div>

      {source && (
        <div className={cn(
          'border-t border-areia-100 bg-areia-50/40 dark:bg-white/5',
          compact ? 'px-4 py-2' : 'px-6 py-3',
        )}>
          <p className="text-[10px] text-areia-400 font-jakarta">
            Fonte: {source}
          </p>
        </div>
      )}
    </div>
  )
}
