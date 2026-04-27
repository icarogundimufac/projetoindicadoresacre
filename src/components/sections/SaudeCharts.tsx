import React, { useMemo } from 'react'
import { ChartCard } from '@/components/charts/ChartCard'
import { LazyLineChart } from '@/components/charts/LazyLineChart'
import { LazyBarChart } from '@/components/charts/LazyBarChart'
import { DualLineChart } from '@/components/charts/DualLineChart'
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
  const mortalidadeInfantil = useMemo(
    () => getTimeSeries(data, 'mortalidade', 'mortalidade_infantil').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )
  const mortalidadeMaterna = useMemo(
    () => getTimeSeries(data, 'mortalidade', 'mortalidade_materna').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )
  const dualData = useMemo(() => {
    return mortalidadeInfantil.map((p) => {
      const maternaPoint = mortalidadeMaterna.find((m) => m.year === p.year)
      return {
        year: p.year,
        value1: p.value,
        value2: maternaPoint?.value ?? 0,
      }
    })
  }, [mortalidadeInfantil, mortalidadeMaterna])
  const vacinacao = useMemo(
    () => getTimeSeries(data, 'prevencao', 'cobertura_vacinacao').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )
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
  const leitos = useMemo(
    () => getTimeSeries(data, 'atencao_basica', 'leitos_sus').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )

  return (
    <>
      {/* Mortalidade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {mortalidadeInfantil.length > 0 && (
          <ChartCard
            title="Taxa de Mortalidade Infantil"
            subtitle="Óbitos por 1.000 nascidos vivos"
            source="SIM/DATASUS"
          >
            <LazyLineChart data={mortalidadeInfantil} color="#C7392F" unit="/1.000 NV" height={260} />
          </ChartCard>
        )}
        {dualData.length > 0 && (
          <ChartCard
            title="Comparação de Mortalidade"
            subtitle="Infantil vs Materna — tendência estadual"
            source="SIM/DATASUS"
          >
            <DualLineChart
              data={dualData}
              label1="Mortalidade Infantil"
              label2="Mortalidade Materna"
              color1="#C7392F"
              color2="#e67e22"
              unit=""
              height={260}
            />
          </ChartCard>
        )}
      </div>

      {/* Prevenção */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {vacinacao.length > 0 && (
          <ChartCard
            title="Cobertura Vacinal"
            subtitle="Cobertura vacinal média do calendário básico (%)"
            source="PNI/DATASUS"
          >
            <LazyLineChart
              data={vacinacao}
              color="#229157"
              unit="%"
              height={260}
              referenceValue={95}
              referenceLabel="Meta 95%"
            />
          </ChartCard>
        )}
      </div>

      {/* Atenção Básica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {coberturaChart.length > 0 && (
          <ChartCard
            title="Cobertura de Atenção Básica por Município (%)"
            subtitle="Percentual de cobertura pelas equipes de saúde da família"
            source="CNES/DATASUS"
          >
            <LazyBarChart data={coberturaChart} color="#229157" unit="%" height={300} />
          </ChartCard>
        )}
        {leitos.length > 0 && (
          <ChartCard
            title="Leitos SUS"
            subtitle="Número de leitos hospitalares do SUS por 1.000 habitantes"
            source="CNES/DATASUS"
          >
            <LazyLineChart data={leitos} color="#157244" unit="/1.000 hab." height={260} />
          </ChartCard>
        )}
      </div>
    </>
  )
}

export const SaudeCharts = React.memo(SaudeChartsComponent)
