import React, { useMemo } from 'react'
import { ChartCard } from '@/components/charts/ChartCard'
import { LazyAreaChart } from '@/components/charts/LazyAreaChart'
import { LazyBarChart } from '@/components/charts/LazyBarChart'
import { DualAreaChart } from '@/components/charts/DualAreaChart'
import type { IndicatorSection } from '@/types/indicators'

function getTimeSeries(
  data: IndicatorSection,
  groupId: string,
  indicatorId: string,
) {
  const indicator = data.groups
    .find((group) => group.id === groupId)
    ?.indicators.find((ind) => ind.id === indicatorId)
  return indicator?.timeSeries ?? []
}

function getByMunicipio(data: IndicatorSection, groupId: string, indicatorId: string) {
  return (
    data.groups
      .find((group) => group.id === groupId)
      ?.indicators.find((ind) => ind.id === indicatorId)?.byMunicipio ?? {}
  )
}

interface OrcamentoChartsProps {
  data: IndicatorSection
}

function OrcamentoChartsComponent({ data }: OrcamentoChartsProps) {
  const receitaSeries = useMemo(
    () => getTimeSeries(data, 'receitas', 'receita_total').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )
  const despesaSeries = useMemo(
    () => getTimeSeries(data, 'despesas', 'despesa_total').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )
  const dualData = useMemo(() => {
    return receitaSeries.map((p) => {
      const despesaPoint = despesaSeries.find((d) => d.year === p.year)
      return {
        year: p.year,
        value1: p.value,
        value2: despesaPoint?.value ?? 0,
      }
    })
  }, [receitaSeries, despesaSeries])
  const funcaoChart = useMemo(() => {
    const funcaoData = getByMunicipio(data, 'despesas', 'despesa_funcao')
    return Object.entries(funcaoData)
      .map(([key, value]) => ({
        label: key.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
        value: value as number,
      }))
      .sort((left, right) => right.value - left.value)
  }, [data])

  return (
    <>
      {/* Receitas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {receitaSeries.length > 0 && (
          <ChartCard
            title="Evolução da Receita Total"
            subtitle="Receita total arrecadada pelo Estado do Acre"
            source="SEFAZ/AC · SICONFI"
          >
            <LazyAreaChart data={receitaSeries} color="#0f5b36" height={260} format="currency" />
          </ChartCard>
        )}
        {dualData.length > 0 && (
          <ChartCard
            title="Receita vs Despesa"
            subtitle="Comparativo de evolução orçamentária"
            source="SEFAZ/AC · SICONFI"
          >
            <DualAreaChart
              data={dualData}
              label1="Receita Total"
              label2="Despesa Total"
              color1="#d4a017"
              color2="#0f5b36"
              height={260}
              format="currency"
            />
          </ChartCard>
        )}
      </div>

      {/* Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {despesaSeries.length > 0 && (
          <ChartCard
            title="Evolução da Despesa Total"
            subtitle="Despesa total empenhada pelo Estado do Acre"
            source="SEFAZ/AC · SICONFI"
          >
            <LazyAreaChart data={despesaSeries} color="#229157" height={260} format="currency" />
          </ChartCard>
        )}
      </div>
      {funcaoChart.length > 0 && (
        <ChartCard
          title="Despesa por Função"
          subtitle="Distribuição das despesas por área de atuação — último exercício"
          source="SEFAZ/AC"
        >
          <LazyBarChart data={funcaoChart} color="#229157" height={340} horizontal />
        </ChartCard>
      )}
    </>
  )
}

export const OrcamentoCharts = React.memo(OrcamentoChartsComponent)
