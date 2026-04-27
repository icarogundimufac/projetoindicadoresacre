import { cn } from '@/lib/utils/cn'

interface HeaderProps {
  title: string
  subtitle?: string
  className?: string
  children?: React.ReactNode
}

export function Header({ title, subtitle, className, children }: HeaderProps) {
  return (
    <section className={cn('w-full px-8 pt-3', className)}>
      <div className="flex items-start justify-between gap-4 border-b border-areia-200 pb-3 dark:border-ouro-400/20">
        <div className="min-w-0 border-l-2 border-verde-500 pl-3 dark:border-ouro-400">
          <h1 className="mt-1 text-[clamp(1.1rem,1.6vw,1.55rem)] font-semibold tracking-[-0.04em] text-verde-950 font-fraunces leading-[0.98]">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1 max-w-3xl text-[11px] leading-4 text-areia-500 font-jakarta dark:text-areia-300">
              {subtitle}
            </p>
          )}
        </div>

        {children && (
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] font-jakarta text-areia-600 lg:justify-end dark:text-areia-300">
            {children}
          </div>
        )}
      </div>
    </section>
  )
}
