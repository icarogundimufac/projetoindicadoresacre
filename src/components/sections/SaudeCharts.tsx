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

function formatMunicipioLabel(slug: string, maxLength: number) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .slice(0, maxLength)
}

interface SaudeChartsProps {
  data: IndicatorSection
}

function SaudeChartsComponent({ data }: SaudeChartsProps) {
  const timeSeriesConfigs: TimeSeriesConfig[] = useMemo(() => {
    const series: TimeSeriesConfig[] = []

    const mortalidadeInfantil = getTimeSeries(data, 'mortalidade', 'mortalidade_infantil')
    if (mortalidadeInfantil.length > 0) {
      series.push({
        id: 'mortalidade_infantil',
        label: 'Mortalidade Infantil',
        description: 'Óbitos de crianças menores de 1 ano por mil nascidos vivos',
        unit: '/1.000 NV',
        source: 'SIM/DATASUS',
        timeSeries: mortalidadeInfantil.map((p) => ({ year: p.year, value: p.value })),
        color: '#C7392F',
        chartType: 'line',
      })
    }

    const mortalidadeMaterna = getTimeSeries(data, 'mortalidade', 'mortalidade_materna')
    if (mortalidadeMaterna.length > 0) {
      series.push({
        id: 'mortalidade_materna',
        label: 'Mortalidade Materna',
        description: 'Óbitos de mulheres por causas relacionadas à gestação por 100 mil habitantes',
        unit: '/100 mil hab.',
        source: 'SIM/DATASUS',
        timeSeries: mortalidadeMaterna.map((p) => ({ year: p.year, value: p.value })),
        color: '#e67e22',
        chartType: 'line',
      })
    }

    const vacinacao = getTimeSeries(data, 'prevencao', 'cobertura_vacinacao')
    if (vacinacao.length > 0) {
      series.push({
        id: 'cobertura_vacinacao',
        label: 'Cobertura Vacinal',
        description: 'Percentual da população-alvo vacinada conforme calendário nacional',
        unit: '%',
        source: 'PNI/DATASUS',
        timeSeries: vacinacao.map((p) => ({ year: p.year, value: p.value })),
        color: '#229157',
        chartType: 'line',
      })
    }

    const leitos = getTimeSeries(data, 'atencao_basica', 'leitos_sus')
    if (leitos.length > 0) {
      series.push({
        id: 'leitos_sus',
        label: 'Leitos SUS',
        description: 'Quantidade de leitos disponíveis pelo SUS por mil habitantes',
        unit: '/1.000 hab.',
        source: 'CNES/DATASUS',
        timeSeries: leitos.map((p) => ({ year: p.year, value: p.value })),
        color: '#157244',
        chartType: 'line',
      })
    }

    return series
  }, [data])

  const coberturaChart = useMemo(() => {
    const coberturaData = getByMunicipio(data, 'atencao_basica', 'cobertura_ab')
    return Object.entries(coberturaData)
      .map(([slug, value]) => ({
        label: formatMunicipioLabel(slug, 14),
        value: value as number,
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 10)
  }, [data])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
      {timeSeriesConfigs.length > 0 && (
        <InteractiveTimeSeriesChart
          series={timeSeriesConfigs}
          defaultSelectedId={timeSeriesConfigs[0]?.id}
        />
      )}

      {coberturaChart.length > 0 && (
        <ChartCard
          title="Cobertura de Atenção Básica por Município (%)"
          subtitle="Percentual de cobertura pelas equipes de saúde da família"
          source="CNES/DATASUS"
        >
          <LazyBarChart data={coberturaChart} color="#229157" unit="%" height={360} />
        </ChartCard>
      )}
    </div>
  )
}

export const SaudeCharts = React.memo(SaudeChartsComponent)
