import React, { useMemo } from 'react'
import { ChartCard } from '@/components/charts/ChartCard'
import {
  InteractiveTimeSeriesChart,
  type TimeSeriesConfig,
} from '@/components/charts/InteractiveTimeSeriesChart'
import { LazyBarChart } from '@/components/charts/LazyBarChart'
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
  const timeSeriesConfigs: TimeSeriesConfig[] = useMemo(() => {
    const series: TimeSeriesConfig[] = []

    const receita = getTimeSeries(data, 'receitas', 'receita_total')
    if (receita.length > 0) {
      series.push({
        id: 'receita_total',
        label: 'Receita Total',
        description: 'Total de receitas arrecadadas pelo estado ao longo dos anos',
        unit: 'R$',
        source: 'SEFAZ/AC · SICONFI',
        timeSeries: receita.map((p) => ({ year: p.year, value: p.value })),
        color: '#d4a017',
        chartType: 'area',
        format: 'currency',
      })
    }

    const despesa = getTimeSeries(data, 'despesas', 'despesa_total')
    if (despesa.length > 0) {
      series.push({
        id: 'despesa_total',
        label: 'Despesa Total',
        description: 'Total de despesas realizadas pelo estado ao longo dos anos',
        unit: 'R$',
        source: 'SEFAZ/AC · SICONFI',
        timeSeries: despesa.map((p) => ({ year: p.year, value: p.value })),
        color: '#0f5b36',
        chartType: 'area',
        format: 'currency',
      })
    }

    return series
  }, [data])

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
      {timeSeriesConfigs.length > 0 && (
        <InteractiveTimeSeriesChart
          series={timeSeriesConfigs}
          defaultSelectedId={timeSeriesConfigs[0]?.id}
        />
      )}

      {funcaoChart.length > 0 && (
        <ChartCard
          title="Despesa por Função"
          subtitle="Distribuição das despesas por área de atuação — último exercício"
          source="SEFAZ/AC"
        >
          <LazyBarChart data={funcaoChart} color="#229157" height={360} horizontal />
        </ChartCard>
      )}
    </div>
  )
}

export const OrcamentoCharts = React.memo(OrcamentoChartsComponent)
