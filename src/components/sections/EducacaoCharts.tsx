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

interface EducacaoChartsProps {
  data: IndicatorSection
}

function EducacaoChartsComponent({ data }: EducacaoChartsProps) {
  const timeSeriesConfigs: TimeSeriesConfig[] = useMemo(() => {
    const series: TimeSeriesConfig[] = []

    const matriculasTotal = getTimeSeries(data, 'matriculas', 'matriculas_total')
    if (matriculasTotal.length > 0) {
      series.push({
        id: 'matriculas_total',
        label: 'Total de Matrículas',
        description: 'Evolução do número total de matrículas no ensino fundamental e médio',
        unit: 'alunos',
        source: 'INEP/Censo Escolar',
        timeSeries: matriculasTotal.map((p) => ({ year: p.year, value: p.value })),
        color: '#157244',
        chartType: 'line',
      })
    }

    const matriculasInfantil = getTimeSeries(data, 'matriculas', 'matriculas_educacao_infantil')
    if (matriculasInfantil.length > 0) {
      series.push({
        id: 'matriculas_educacao_infantil',
        label: 'Educação Infantil',
        description: 'Matrículas em creches e pré-escolas no estado',
        unit: 'alunos',
        source: 'INEP/Censo Escolar',
        timeSeries: matriculasInfantil.map((p) => ({ year: p.year, value: p.value })),
        color: '#44b375',
        chartType: 'line',
      })
    }

    const idebIniciais = getTimeSeries(data, 'desempenho', 'ideb_anos_iniciais')
    if (idebIniciais.length > 0) {
      series.push({
        id: 'ideb_anos_iniciais',
        label: 'IDEB — Anos Iniciais',
        description: 'Índice de Desenvolvimento da Educação Básica para o 1º ao 5º ano',
        unit: 'pontos',
        source: 'INEP/MEC',
        timeSeries: idebIniciais.map((p) => ({ year: p.year, value: p.value })),
        color: '#229157',
        chartType: 'line',
      })
    }

    const idebFinais = getTimeSeries(data, 'desempenho', 'ideb_anos_finais')
    if (idebFinais.length > 0) {
      series.push({
        id: 'ideb_anos_finais',
        label: 'IDEB — Anos Finais',
        description: 'Índice de Desenvolvimento da Educação Básica para o 6º ao 9º ano',
        unit: 'pontos',
        source: 'INEP/MEC',
        timeSeries: idebFinais.map((p) => ({ year: p.year, value: p.value })),
        color: '#F2C230',
        chartType: 'line',
      })
    }

    const analfabetismo = getTimeSeries(data, 'alfabetizacao', 'taxa_analfabetismo')
    if (analfabetismo.length > 0) {
      series.push({
        id: 'taxa_analfabetismo',
        label: 'Taxa de Analfabetismo',
        description: 'Percentual da população com 15 anos ou mais que não sabe ler nem escrever',
        unit: '%',
        source: 'IBGE/PNAD',
        timeSeries: analfabetismo.map((p) => ({ year: p.year, value: p.value })),
        color: '#C7392F',
        chartType: 'line',
      })
    }

    return series
  }, [data])

  const municipioChartData = useMemo(() => {
    const municipioIdeb = getByMunicipio(data, 'desempenho', 'ideb_municipios')
    return Object.entries(municipioIdeb)
      .map(([slug, value]) => ({
        label: formatMunicipioLabel(slug, 28),
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

      {municipioChartData.length > 0 && (
        <ChartCard
          title="IDEB por Município — Anos Iniciais (2023)"
          subtitle="10 municípios com maior índice"
          source="INEP/MEC"
        >
          <LazyBarChart data={municipioChartData} color="#229157" unit="pontos" height={360} horizontal />
        </ChartCard>
      )}
    </div>
  )
}

export const EducacaoCharts = React.memo(EducacaoChartsComponent)
