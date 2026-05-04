import React, { useMemo } from 'react'
import {
  InteractiveTimeSeriesChart,
  type TimeSeriesConfig,
} from '@/components/charts/InteractiveTimeSeriesChart'
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

interface SegurancaChartsProps {
  data: IndicatorSection
}

function SegurancaChartsComponent({ data }: SegurancaChartsProps) {
  const timeSeriesConfigs: TimeSeriesConfig[] = useMemo(() => {
    const series: TimeSeriesConfig[] = []

    const homicidios = getTimeSeries(data, 'crimes_violentos', 'taxa_homicidios')
    if (homicidios.length > 0) {
      series.push({
        id: 'taxa_homicidios',
        label: 'Taxa de Homicídios',
        description: 'Número de homicídios dolosos por 100 mil habitantes',
        unit: '/100 mil hab.',
        source: 'SSP/AC · SENASP',
        timeSeries: homicidios.map((p) => ({ year: p.year, value: p.value })),
        color: '#C7392F',
        chartType: 'line',
      })
    }

    const totalHomicidios = getTimeSeries(data, 'crimes_violentos', 'total_homicidios')
    if (totalHomicidios.length > 0) {
      series.push({
        id: 'total_homicidios',
        label: 'Total de Homicídios',
        description: 'Quantidade absoluta de homicídios dolosos registrados no estado',
        unit: 'casos',
        source: 'SSP/AC',
        timeSeries: totalHomicidios.map((p) => ({ year: p.year, value: p.value })),
        color: '#e67e22',
        chartType: 'line',
      })
    }

    const roubos = getTimeSeries(data, 'crimes_patrimonio', 'taxa_roubos')
    if (roubos.length > 0) {
      series.push({
        id: 'taxa_roubos',
        label: 'Taxa de Roubos',
        description: 'Número de roubos por 100 mil habitantes',
        unit: '/100 mil hab.',
        source: 'SSP/AC · SINESP',
        timeSeries: roubos.map((p) => ({ year: p.year, value: p.value })),
        color: '#d4a017',
        chartType: 'line',
      })
    }

    const furtos = getTimeSeries(data, 'crimes_patrimonio', 'taxa_furtos')
    if (furtos.length > 0) {
      series.push({
        id: 'taxa_furtos',
        label: 'Taxa de Furtos',
        description: 'Número de furtos por 100 mil habitantes',
        unit: '/100 mil hab.',
        source: 'SSP/AC · SINESP',
        timeSeries: furtos.map((p) => ({ year: p.year, value: p.value })),
        color: '#157244',
        chartType: 'line',
      })
    }

    return series
  }, [data])

  if (timeSeriesConfigs.length === 0) return null

  return (
    <InteractiveTimeSeriesChart
      series={timeSeriesConfigs}
      defaultSelectedId={timeSeriesConfigs[0]?.id}
    />
  )
}

export const SegurancaCharts = React.memo(SegurancaChartsComponent)
