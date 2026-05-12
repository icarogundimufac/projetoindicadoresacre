import { cn } from '@/lib/utils/cn'
import { formatNumber } from '@/lib/utils/format'
import type { MunicipioDashboardKpi, DashboardSection } from '@/types/municipio-dashboard'

interface MunicipioKpiTableProps {
  kpis: MunicipioDashboardKpi[]
  showEstadual?: boolean
}

const SECTION_LABELS: Record<DashboardSection, string> = {
  educacao: 'Educação',
  saude: 'Saúde',
  seguranca: 'Segurança',
  orcamento: 'Orçamento',
}

const SECTION_ORDER: DashboardSection[] = ['educacao', 'saude', 'seguranca', 'orcamento']

export function MunicipioKpiTable({ kpis, showEstadual = false }: MunicipioKpiTableProps) {
  // Group KPIs by section preserving order
  const grouped = kpis.reduce<Record<DashboardSection, MunicipioDashboardKpi[]>>(
    (acc, kpi) => {
      if (!acc[kpi.section]) acc[kpi.section] = []
      acc[kpi.section].push(kpi)
      return acc
    },
    { educacao: [], saude: [], seguranca: [], orcamento: [] },
  )

  // Flatten in section order
  const rows: MunicipioDashboardKpi[] = []
  SECTION_ORDER.forEach((section) => {
    const sectionKpis = grouped[section]
    if (sectionKpis.length > 0) {
      rows.push(...sectionKpis)
    }
  })

  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-areia-400 font-jakarta">
        Nenhum indicador disponível.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-areia-200">
            <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-areia-400 font-jakarta whitespace-nowrap">
              Área
            </th>
            <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-areia-400 font-jakarta whitespace-nowrap">
              Indicador
            </th>
            <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-areia-400 font-jakarta whitespace-nowrap text-right">
              Valor
            </th>
            <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-areia-400 font-jakarta whitespace-nowrap">
              Unidade
            </th>
            <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-areia-400 font-jakarta whitespace-nowrap text-center">
              Ano
            </th>
            {showEstadual && (
              <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-areia-400 font-jakarta whitespace-nowrap text-right">
                Δ vs Estado
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((kpi, index) => {
            const prevSection = index > 0 ? rows[index - 1].section : null
            const isNewSection = prevSection !== kpi.section

            return (
              <tr
                key={kpi.id}
                className={cn(
                  'border-b border-areia-100 transition-colors hover:bg-areia-50/40',
                  isNewSection && 'border-t border-areia-200',
                )}
              >
                <td className="py-2 px-3 whitespace-nowrap">
                  {isNewSection ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-areia-500 font-jakarta">
                      {SECTION_LABELS[kpi.section]}
                    </span>
                  ) : (
                    <span className="text-[10px] text-areia-300 font-jakarta">—</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <span className="text-[11px] text-areia-700 font-jakarta leading-tight">
                    {kpi.label}
                  </span>
                </td>
                <td className="py-2 px-3 text-right">
                  <span className="text-[12px] font-semibold font-fraunces tabular-nums text-verde-900">
                    {formatNumber(kpi.value)}
                  </span>
                </td>
                <td className="py-2 px-3 whitespace-nowrap">
                  <span className="text-[10px] text-areia-400 font-jakarta">
                    {kpi.unit || '—'}
                  </span>
                </td>
                <td className="py-2 px-3 text-center whitespace-nowrap">
                  <span className="text-[10px] text-areia-400 font-jakarta tabular-nums">
                    {kpi.year}
                  </span>
                </td>
                {showEstadual && (
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    {kpi.estadualValue !== undefined ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[11px] font-semibold font-fraunces tabular-nums text-areia-600">
                          {formatNumber(kpi.estadualValue)}
                        </span>
                        {kpi.delta !== undefined && (
                          <span
                            className={cn(
                              'text-[9px] font-jakarta',
                              kpi.deltaDirection === 'up' && 'text-verde-600',
                              kpi.deltaDirection === 'down' && 'text-red-500',
                              kpi.deltaDirection === 'neutral' && 'text-areia-400',
                            )}
                          >
                            {kpi.deltaDirection === 'up' ? '↑' : kpi.deltaDirection === 'down' ? '↓' : '−'}
                            {' '}
                            {Math.abs(kpi.delta).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-areia-300 font-jakarta">—</span>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
