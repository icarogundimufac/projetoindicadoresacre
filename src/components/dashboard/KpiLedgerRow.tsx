import { cn } from '@/lib/utils/cn'
import type { KpiData } from '@/types/dashboard'

interface KpiLedgerRowProps {
  kpi: KpiData
  className?: string
}

const SECTION_DOT: Record<string, string> = {
  educacao: 'bg-blue-500',
  saude: 'bg-emerald-500',
  seguranca: 'bg-orange-500',
  orcamento: 'bg-amber-500',
  municipios: 'bg-purple-500',
  default: 'bg-verde-500',
}

const SECTION_LABEL: Record<string, string> = {
  educacao: 'Educacao',
  saude: 'Saude',
  seguranca: 'Seguranca',
  orcamento: 'Orcamento',
  municipios: 'Municipios',
}

export function KpiLedgerRow({ kpi, className }: KpiLedgerRowProps) {
  const dotColor = SECTION_DOT[kpi.section] ?? SECTION_DOT.default
  const sectionLabel = SECTION_LABEL[kpi.section] ?? 'Indicador'

  return (
    <li
      className={cn(
        'group rounded-xl border border-areia-200/70 bg-white px-3 py-2 dark:bg-[#4a5546] dark:border-white/12',
        'transition-all duration-150 hover:-translate-y-0.5 hover:border-areia-300 hover:shadow-sm',
        className,
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className={cn('h-2 w-2 rounded-full flex-shrink-0', dotColor)} />
            <span
              className="min-w-0 shrink max-w-[14rem] text-[11px] font-semibold text-verde-800 font-jakarta truncate"
              title={kpi.label}
            >
              {kpi.label}
            </span>
            <span className="rounded-md border border-areia-200 bg-areia-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-areia-500 font-jakarta shrink-0">
              {sectionLabel}
            </span>
            <span className="text-[10px] text-areia-400 font-jakarta tabular-nums shrink-0">
              {kpi.year}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-lg font-bold font-roboto tabular-nums text-verde-900 leading-none">
              {typeof kpi.value === 'number'
                ? kpi.value.toLocaleString('pt-BR')
                : kpi.value}
            </span>
            {kpi.unit && (
              <span className="text-[11px] text-areia-400 font-jakarta">{kpi.unit}</span>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
