import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionTag } from '@/components/ui/SectionTag'
import { cn } from '@/lib/utils/cn'
import type { MunicipioDashboardKpi, DashboardSection } from '@/types/municipio-dashboard'

interface MunicipioKpiGridProps {
  kpis: MunicipioDashboardKpi[]
  showEstadual?: boolean
  layout?: 'vertical' | 'horizontal'
}

const SECTION_ORDER: DashboardSection[] = ['educacao', 'saude', 'seguranca', 'orcamento']

const SECTION_GRADIENTS: Record<DashboardSection, string> = {
  educacao: 'from-blue-400 via-blue-300 to-blue-400',
  saude: 'from-verde-400 via-verde-300 to-verde-400',
  seguranca: 'from-orange-400 via-orange-300 to-orange-400',
  orcamento: 'from-amber-400 via-amber-300 to-amber-400',
}

export function MunicipioKpiGrid({ kpis, showEstadual = false, layout = 'vertical' }: MunicipioKpiGridProps) {
  // Group KPIs by section
  const groupedKpis = kpis.reduce<Record<DashboardSection, MunicipioDashboardKpi[]>>(
    (acc, kpi) => {
      const section = kpi.section
      if (!acc[section]) {
        acc[section] = []
      }
      acc[section].push(kpi)
      return acc
    },
    { educacao: [], saude: [], seguranca: [], orcamento: [] },
  )

  const renderSectionCard = (section: DashboardSection, sectionKpis: MunicipioDashboardKpi[]) => {
    const gradient = SECTION_GRADIENTS[section]
    return (
      <div
        key={section}
        className="bg-white rounded-xl border border-areia-200 shadow-sm overflow-hidden"
      >
        {/* Header com gradiente */}
        <div className={cn('h-1 bg-gradient-to-r', gradient)} />

        {/* Título da seção */}
        <div className="px-2.5 py-1.5 border-b border-areia-100 flex items-center gap-2">
          <SectionTag section={section} />
          <span className="text-[10px] text-areia-400 font-jakarta">
            {sectionKpis.length} {sectionKpis.length === 1 ? 'indicador' : 'indicadores'}
          </span>
        </div>

        {/* KPIs da seção */}
        <div className="p-1.5 space-y-1.5">
          {sectionKpis.map((kpi) => (
            <div
              key={kpi.id}
              className="p-2 bg-areia-50/50 rounded-lg border border-areia-100"
            >
              {/* Top row: Section tag + year */}
              <div className="flex items-center justify-between mb-1">
                <SectionTag section={section} className="text-[9px] px-2 py-0.5" />
                <span className="text-[9px] rounded border border-areia-200 bg-areia-50 px-1.5 py-0.5 text-areia-500 font-jakarta">
                  {kpi.year}
                </span>
              </div>

              {/* Middle: Value + unit + estadual comparison */}
              <div className="flex items-baseline gap-1 mb-0.5">
                <span className="text-base font-bold text-verde-900 font-fraunces tabular-nums">
                  {kpi.value}
                </span>
                {kpi.unit && (
                  <span className="text-[10px] text-areia-400 font-jakarta">{kpi.unit}</span>
                )}
                {showEstadual && kpi.estadualValue !== undefined && (
                  <span className="text-[10px] text-areia-400 font-jakarta">
                    vs {kpi.estadualValue}
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="text-[11px] text-areia-500 font-jakarta truncate mb-1">
                {kpi.label}
              </div>

              {/* Barra de comparação visual */}
              {showEstadual && kpi.estadualValue !== undefined && (
                <div className="h-1.5 w-full rounded-full bg-areia-100 overflow-hidden relative mb-1">
                  {(() => {
                    const denominator = Math.max(kpi.value, kpi.estadualValue, 0.001)
                    return (
                      <>
                        <div
                          className="h-full rounded-full bg-verde-500 absolute top-0 left-0"
                          style={{
                            width: `${Math.min((kpi.value / denominator) * 100, 100)}%`,
                          }}
                        />
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-areia-400"
                          style={{
                            left: `${Math.min((kpi.estadualValue / denominator) * 100, 100)}%`,
                          }}
                        />
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Delta badge */}
              <div>
                {kpi.delta !== undefined && kpi.deltaDirection !== 'neutral' && (
                  <Badge
                    variant={kpi.deltaDirection === 'up' ? 'green' : 'red'}
                    className="text-[9px] px-1.5 py-0"
                  >
                    {kpi.deltaDirection === 'up' ? '↑' : '↓'} {Math.abs(kpi.delta).toFixed(1)}%
                  </Badge>
                )}
                {kpi.delta !== undefined && kpi.deltaDirection === 'neutral' && (
                  <Badge variant="default" className="text-[9px] px-1.5 py-0">
                    − 0%
                  </Badge>
                )}
                {kpi.delta === undefined && (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 opacity-50">
                    —
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (layout === 'horizontal') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SECTION_ORDER.map((section) => {
          const sectionKpis = groupedKpis[section]
          if (sectionKpis.length === 0) return null
          return renderSectionCard(section, sectionKpis)
        })}
      </div>
    )
  }

  // Layout vertical (padrão)
  return (
    <div className="space-y-4">
      {SECTION_ORDER.map((section) => {
        const sectionKpis = groupedKpis[section]
        if (sectionKpis.length === 0) return null

        return (
          <div key={section}>
            <div className="flex items-center gap-2 mb-2">
              <SectionTag section={section} />
              <span className="text-[10px] text-areia-400 font-jakarta">
                {sectionKpis.length} {sectionKpis.length === 1 ? 'indicador' : 'indicadores'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {sectionKpis.map((kpi) => (
                <Card key={kpi.id} className="p-3">
                  {/* Top row: Section tag + year */}
                  <div className="flex items-center justify-between mb-1.5">
                    <SectionTag section={section} className="text-[9px] px-2 py-0.5" />
                    <span className="text-[9px] rounded border border-areia-200 bg-areia-50 px-1.5 py-0.5 text-areia-500 font-jakarta">
                      {kpi.year}
                    </span>
                  </div>

                  {/* Middle: Value + unit + estadual comparison */}
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-lg font-bold text-verde-900 font-fraunces tabular-nums">
                      {kpi.value}
                    </span>
                    {kpi.unit && (
                      <span className="text-[10px] text-areia-400 font-jakarta">{kpi.unit}</span>
                    )}
                    {showEstadual && kpi.estadualValue !== undefined && (
                      <span className="text-[10px] text-areia-400 font-jakarta">
                        vs {kpi.estadualValue}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="text-[11px] text-areia-500 font-jakarta truncate mb-1.5">
                    {kpi.label}
                  </div>

                  {/* Barra de comparação visual (only when showEstadual and estadualValue exist) */}
                  {showEstadual && kpi.estadualValue !== undefined && (
                    <div className="h-1.5 w-full rounded-full bg-areia-100 overflow-hidden relative mb-1.5">
                      {(() => {
                        const denominator = Math.max(kpi.value, kpi.estadualValue, 0.001)
                        return (
                          <>
                            <div
                              className="h-full rounded-full bg-verde-500 absolute top-0 left-0"
                              style={{
                                width: `${Math.min((kpi.value / denominator) * 100, 100)}%`,
                              }}
                            />
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-areia-400"
                              style={{
                                left: `${Math.min((kpi.estadualValue / denominator) * 100, 100)}%`,
                              }}
                            />
                          </>
                        )
                      })()}
                    </div>
                  )}

                  {/* Delta badge */}
                  <div>
                    {kpi.delta !== undefined && kpi.deltaDirection !== 'neutral' && (
                      <Badge
                        variant={kpi.deltaDirection === 'up' ? 'green' : 'red'}
                        className="text-[9px] px-1.5 py-0"
                      >
                        {kpi.deltaDirection === 'up' ? '↑' : '↓'} {Math.abs(kpi.delta).toFixed(1)}%
                      </Badge>
                    )}
                    {kpi.delta !== undefined && kpi.deltaDirection === 'neutral' && (
                      <Badge variant="default" className="text-[9px] px-1.5 py-0">
                        − 0%
                      </Badge>
                    )}
                    {kpi.delta === undefined && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 opacity-50">
                        —
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
