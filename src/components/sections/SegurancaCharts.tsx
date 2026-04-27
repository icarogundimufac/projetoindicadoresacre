import React, { useMemo } from 'react'
import { ChartCard } from '@/components/charts/ChartCard'
import { LazyLineChart } from '@/components/charts/LazyLineChart'
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
  const homicidiosSeries = useMemo(
    () => getTimeSeries(data, 'crimes_violentos', 'taxa_homicidios').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )
  const totalHomicidios = useMemo(
    () => getTimeSeries(data, 'crimes_violentos', 'total_homicidios').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )
  const roubosSeries = useMemo(
    () => getTimeSeries(data, 'crimes_patrimonio', 'taxa_roubos').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )
  const furtosSeries = useMemo(
    () => getTimeSeries(data, 'crimes_patrimonio', 'taxa_furtos').map((p) => ({ year: p.year, value: p.value })),
    [data],
  )

  return (
    <>
      {/* Crimes Violentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {homicidiosSeries.length > 0 && (
          <ChartCard
            title="Taxa de Homicídios"
            subtitle="Óbitos por causas externas por 100 mil hab."
            source="SSP/AC · SENASP"
          >
            <LazyLineChart data={homicidiosSeries} color="#C7392F" unit="/100 mil hab." height={280} />
          </ChartCard>
        )}
        {totalHomicidios.length > 0 && (
          <ChartCard
            title="Total de Homicídios"
            subtitle="Número absoluto de homicídios dolosos registrados"
            source="SSP/AC"
          >
            <LazyLineChart data={totalHomicidios} color="#e67e22" unit="casos" height={280} />
          </ChartCard>
        )}
      </div>

      {/* Crimes contra o Patrimônio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {roubosSeries.length > 0 && (
          <ChartCard
            title="Taxa de Roubos"
            subtitle="Registros de roubo por 100 mil habitantes"
            source="SSP/AC · SINESP"
          >
            <LazyLineChart data={roubosSeries} color="#e67e22" unit="/100 mil hab." height={280} />
          </ChartCard>
        )}
        {furtosSeries.length > 0 && (
          <ChartCard
            title="Taxa de Furtos"
            subtitle="Registros de furto por 100 mil habitantes"
            source="SSP/AC · SINESP"
          >
            <LazyLineChart data={furtosSeries} color="#d4a017" unit="/100 mil hab." height={280} />
          </ChartCard>
        )}
      </div>
    </>
  )
}

export const SegurancaCharts = React.memo(SegurancaChartsComponent)
