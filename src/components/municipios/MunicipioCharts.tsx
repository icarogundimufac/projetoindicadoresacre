'use client'

import { BarChartWrapper } from '@/components/charts/BarChartWrapper'
import { ChartCard } from '@/components/charts/ChartCard'
import type { MunicipioDashboardKpi, DashboardSection } from '@/types/municipio-dashboard'

interface MunicipioChartsProps {
  kpis: MunicipioDashboardKpi[]
  nome: string
}

const SECTION_ORDER: DashboardSection[] = ['educacao', 'saude', 'seguranca', 'orcamento']

const SECTION_CONFIG: Record<DashboardSection, { label: string; color: string }> = {
  educacao: { label: 'Educação', color: '#2563eb' },
  saude: { label: 'Saúde', color: '#229157' },
  seguranca: { label: 'Segurança', color: '#f97316' },
  orcamento: { label: 'Orçamento', color: '#d97706' },
}

function shortLabel(label: string): string {
  if (label.length <= 18) return label
  return `${label.slice(0, 17).trimEnd()}…`
}

export function MunicipioCharts({ kpis, nome }: MunicipioChartsProps) {
  // Group KPIs by section
  const groupedKpis = kpis.reduce<Record<DashboardSection, MunicipioDashboardKpi[]>>(
    (acc, kpi) => {
      if (!acc[kpi.section]) acc[kpi.section] = []
      acc[kpi.section].push(kpi)
      return acc
    },
    { educacao: [], saude: [], seguranca: [], orcamento: [] },
  )

  // Chart 2: All KPIs (horizontal bars) — Desempenho Municipal
  const chartAllData = kpis.map((kpi) => ({
    label: shortLabel(kpi.label),
    value: kpi.value,
  }))

  return (
    <div className="space-y-3">
      {/* 4 Mini-charts por seção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECTION_ORDER.map((section) => {
          const sectionKpis = groupedKpis[section]
          const config = SECTION_CONFIG[section]

          if (!sectionKpis || sectionKpis.length === 0) {
            return (
              <ChartCard
                key={section}
                title={config.label}
                subtitle="Sem dados disponíveis"
                compact
              >
                <div className="h-[140px] flex items-center justify-center">
                  <span className="text-[11px] text-areia-400 font-jakarta">
                    Nenhum indicador para esta área
                  </span>
                </div>
              </ChartCard>
            )
          }

          const chartData = sectionKpis.map((kpi) => ({
            label: shortLabel(kpi.label),
            value: kpi.value,
          }))

          return (
            <ChartCard
              key={section}
              title={config.label}
              subtitle={`${sectionKpis.length} ${sectionKpis.length === 1 ? 'indicador' : 'indicadores'}`}
              compact
            >
              <BarChartWrapper
                data={chartData}
                color={config.color}
                horizontal={false}
                height={160}
              />
            </ChartCard>
          )
        })}
      </div>

      {/* Desempenho Municipal — todos os KPIs */}
      {chartAllData.length > 0 && (
        <ChartCard
          title="Desempenho Municipal"
          subtitle={`Todos os indicadores de ${nome}`}
          source="Dados temporários"
        >
          <BarChartWrapper
            data={chartAllData}
            color="#229157"
            horizontal={true}
            height={260}
          />
        </ChartCard>
      )}
    </div>
  )
}
