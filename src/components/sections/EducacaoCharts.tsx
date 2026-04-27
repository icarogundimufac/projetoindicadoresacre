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

interface EducacaoChartsProps {
  data: IndicatorSection
}

function EducacaoChartsComponent({ data }: EducacaoChartsProps) {
  const matriculasSeries = useMemo(
    () => getTimeSeries(data, 'matriculas', 'matriculas_total').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )
  const infantilSeries = useMemo(
    () => getTimeSeries(data, 'matriculas', 'matriculas_educacao_infantil').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )
  const idebIniciais = useMemo(
    () => getTimeSeries(data, 'desempenho', 'ideb_anos_iniciais').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )
  const idebFinais = useMemo(
    () => getTimeSeries(data, 'desempenho', 'ideb_anos_finais').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )
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
  const dualIdebData = useMemo(() => {
    return idebIniciais.map((p) => {
      const finaisPoint = idebFinais.find((f) => f.year === p.year)
      return {
        year: p.year,
        value1: p.value,
        value2: finaisPoint?.value ?? 0,
      }
    })
  }, [idebIniciais, idebFinais])
  const analfabetismo = useMemo(
    () => getTimeSeries(data, 'alfabetizacao', 'taxa_analfabetismo').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {matriculasSeries.length > 0 && (
        <ChartCard
          title="Total de Matrículas"
          subtitle="Educação básica pública — rede estadual e municipal"
          source="INEP/Censo Escolar"
        >
          <LazyLineChart data={matriculasSeries} color="#157244" unit="alunos" height={260} />
        </ChartCard>
      )}
      {infantilSeries.length > 0 && (
        <ChartCard
          title="Matrículas — Educação Infantil"
          subtitle="Creche e pré-escola"
          source="INEP/Censo Escolar"
        >
          <LazyLineChart data={infantilSeries} color="#44b375" unit="alunos" height={260} />
        </ChartCard>
      )}
      {idebIniciais.length > 0 && (
        <ChartCard
          title="Evolução do IDEB — Anos Iniciais"
          subtitle="Média estadual do Índice de Desenvolvimento da Educação Básica"
          source="INEP/MEC"
        >
          <LazyLineChart
            data={idebIniciais}
            color="#157244"
            unit="pontos"
            height={260}
            referenceValue={6}
            referenceLabel="Meta 6.0"
          />
        </ChartCard>
      )}
      {dualIdebData.length > 0 && (
        <ChartCard
          title="Comparação IDEB"
          subtitle="Anos Iniciais vs Anos Finais do ensino fundamental"
          source="INEP/MEC"
        >
          <DualLineChart
            data={dualIdebData}
            label1="Anos Iniciais"
            label2="Anos Finais"
            color1="#157244"
            color2="#44b375"
            unit="pts"
            height={260}
          />
        </ChartCard>
      )}
      {analfabetismo.length > 0 && (
        <ChartCard
          title="Taxa de Analfabetismo"
          subtitle="População de 15 anos ou mais que não sabe ler nem escrever"
          source="IBGE/PNAD"
        >
          <LazyLineChart data={analfabetismo} color="#C7392F" unit="%" height={260} />
        </ChartCard>
      )}
      {municipioChartData.length > 0 && (
        <div className="lg:col-span-3">
          <ChartCard
            title="IDEB por Município — Anos Iniciais (2023)"
            subtitle="10 municípios com maior índice"
            source="INEP/MEC"
          >
            <LazyBarChart data={municipioChartData} color="#229157" unit="pontos" height={340} horizontal />
          </ChartCard>
        </div>
      )}
    </div>
  )
}

export const EducacaoCharts = React.memo(EducacaoChartsComponent)
