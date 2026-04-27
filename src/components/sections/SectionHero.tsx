import { cn } from '@/lib/utils/cn'

interface SectionHeroProps {
  title: string
  subtitle?: string
  lastUpdated?: string
  className?: string
}

export function SectionHero({
  title,
  subtitle,
  lastUpdated,
  className,
}: SectionHeroProps) {
  return (
    <section className={cn('w-full', className)}>
      <div className="flex items-start justify-between gap-4 border-b border-areia-200 pb-3 dark:border-ouro-400/20">
        <div className="min-w-0 border-l-2 border-verde-500 pl-3 dark:border-ouro-400">
          <h1 className="mt-1 text-[clamp(1.1rem,1.6vw,1.55rem)] font-semibold tracking-[-0.04em] text-verde-950 font-fraunces leading-[0.98]">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1 max-w-3xl text-[11px] leading-4 text-areia-500 font-jakarta">
              {subtitle}
            </p>
          )}
        </div>

        {lastUpdated && (
          <div className="shrink-0 pt-0.5 text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-areia-400 font-jakarta">
              Última atualização
            </p>
            <p className="mt-0.5 text-[11px] text-areia-600 font-jakarta tabular-nums">
              {lastUpdated}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
