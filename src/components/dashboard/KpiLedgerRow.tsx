import { cn } from '@/lib/utils/cn'
import type { KpiData } from '@/types/dashboard'

interface KpiLedgerRowProps {
  kpi: KpiData
  className?: string
  index?: number
}

const SECTION_BORDER: Record<string, string> = {
  educacao: 'border-verde-500',
  saude: 'border-ouro-500',
  seguranca: 'border-estrela-500',
  orcamento: 'border-verde-700',
  municipios: 'border-areia-500',
  default: 'border-verde-400',
}

const SECTION_LABEL: Record<string, string> = {
  educacao: 'Educacao',
  saude: 'Saude',
  seguranca: 'Seguranca',
  orcamento: 'Orcamento',
  municipios: 'Municipios',
}

export function KpiLedgerRow({ kpi, className, index }: KpiLedgerRowProps) {
  const borderColor = SECTION_BORDER[kpi.section] ?? SECTION_BORDER.default
  const sectionLabel = SECTION_LABEL[kpi.section] ?? 'Indicador'

  return (
    <li
      className={cn(
        'group rounded-lg border border-areia-200/80 bg-white overflow-hidden',
        'transition-all duration-150 ease-out',
        'hover:-translate-y-px hover:shadow-md hover:border-areia-300',
        'dark:bg-[#4a5546] dark:border-white/10 dark:hover:border-white/20',
        className,
      )}
      style={
        index !== undefined
          ? { animationDelay: `${index * 60}ms` }
          : undefined
      }
    >
      <div className={cn('border-l-[3px] pl-3 pr-3 py-2', borderColor)}>
        <div className="flex items-center justify-between gap-3">
          {/* Esquerda: label + metadados */}
          <div className="min-w-0 flex-1">
            <p
              className="text-[11px] font-semibold text-verde-950 font-jakarta truncate leading-tight dark:text-white"
              title={kpi.label}
            >
              {kpi.label}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-areia-400 font-jakarta">
                {sectionLabel}
              </span>
              <span className="text-[9px] text-areia-300">·</span>
              <span className="text-[9px] text-areia-400 font-jakarta tabular-nums">
                {kpi.year}
              </span>
            </div>
          </div>

          {/* Direita: valor hero */}
          <div className="text-right shrink-0">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-[22px] font-bold font-fraunces tabular-nums text-verde-950 leading-none dark:text-white">
                {typeof kpi.value === 'number'
                  ? kpi.value.toLocaleString('pt-BR')
                  : kpi.value}
              </span>
              {kpi.unit && (
                <span className="text-[10px] text-areia-400 font-jakarta">
                  {kpi.unit}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
