import { useEffect, useMemo, useState } from 'react'
import { Map, Layers, CalendarDays, Palette } from 'lucide-react'
import { AnimatedSelect } from '@/components/ui/AnimatedSelect'
import {
  AcreMap,
  MAP_COLOR_PALETTES,
  MAP_COLOR_SCALE_LABELS,
  type MapColorScale,
} from '@/components/maps/AcreMap'
import { getIndicatorMapSeries, getSectionFallbackMapYear } from '@/lib/data/portal-data'
import type { IndicatorSectionId } from '@/lib/constants/indicator-sections'
import type { IndicatorSection, Indicator } from '@/types/indicators'


interface IndicadoresMapaProps {
  activeSectionId: IndicatorSectionId
  data: Record<IndicatorSectionId, IndicatorSection | null>
  isLoading: boolean
}

interface MapEnabledIndicator {
  indicator: Indicator
  groupId: string
  groupLabel: string
  availableYears: number[]
}

const MAP_COLOR_SCALES = Object.keys(MAP_COLOR_PALETTES) as MapColorScale[]

function isMapEnabled(indicator: Indicator): boolean {
  if (indicator.mapSeries && Object.keys(indicator.mapSeries).length > 0) {
    const hasData = Object.values(indicator.mapSeries).some(
      (yearData) => Object.keys(yearData).length > 0,
    )
    if (hasData) return true
  }

  if (indicator.byMunicipio && Object.keys(indicator.byMunicipio).length > 0) {
    return true
  }

  return false
}

function getAvailableYears(indicator: Indicator, fallbackYear: number): number[] {
  const mapSeries = getIndicatorMapSeries(indicator, fallbackYear)

  if (!mapSeries) return []

  return Object.keys(mapSeries)
    .map(Number)
    .sort((a, b) => a - b)
}

export function IndicadoresMapa({
  activeSectionId,
  data,
  isLoading,
}: IndicadoresMapaProps) {
  const sectionData = data[activeSectionId]

  const fallbackYear = useMemo(() => {
    if (!sectionData) return new Date().getFullYear()
    return getSectionFallbackMapYear(sectionData)
  }, [sectionData])

  const mapEnabledIndicators = useMemo((): MapEnabledIndicator[] => {
    if (!sectionData) return []

    const indicators: MapEnabledIndicator[] = []

    for (const group of sectionData.groups) {
      for (const indicator of group.indicators) {
        if (isMapEnabled(indicator)) {
          const availableYears = getAvailableYears(indicator, fallbackYear)
          if (availableYears.length > 0) {
            indicators.push({
              indicator,
              groupId: group.id,
              groupLabel: group.label,
              availableYears,
            })
          }
        }
      }
    }

    return indicators
  }, [sectionData, fallbackYear])

  const [selectedIndicatorKey, setSelectedIndicatorKey] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    if (mapEnabledIndicators.length > 0) {
      const first = mapEnabledIndicators[0]
      setSelectedIndicatorKey(first.indicator.id)
      setSelectedYear(first.availableYears[first.availableYears.length - 1])
    } else {
      setSelectedIndicatorKey('')
      setSelectedYear(new Date().getFullYear())
    }
  }, [activeSectionId, mapEnabledIndicators])

  const [colorScale, setColorScale] = useState<MapColorScale>('verde')

  const selectedIndicator = useMemo(() => {
    return mapEnabledIndicators.find((item) => item.indicator.id === selectedIndicatorKey)
  }, [mapEnabledIndicators, selectedIndicatorKey])

  const indicatorGroups = useMemo(() => {
    const groups: Record<string, { label: string; options: { key: string; label: string }[] }> =
      {}

    for (const item of mapEnabledIndicators) {
      if (!groups[item.groupId]) {
        groups[item.groupId] = { label: item.groupLabel, options: [] }
      }
      groups[item.groupId].options.push({
        key: item.indicator.id,
        label: item.indicator.label,
      })
    }

    return Object.values(groups)
  }, [mapEnabledIndicators])

  const mapData = useMemo(() => {
    if (!selectedIndicator) {
      return {
        dataByMunicipio: {} as Record<string, number>,
        label: 'Indicador',
        unit: '',
      }
    }

    const mapSeries = getIndicatorMapSeries(
      selectedIndicator.indicator,
      fallbackYear,
    )

    const dataByMunicipio = mapSeries?.[String(selectedYear)] ?? {}

    return {
      dataByMunicipio,
      label: `${selectedIndicator.indicator.label} (${selectedYear})`,
      unit: selectedIndicator.indicator.unit,
    }
  }, [selectedIndicator, selectedYear])

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-xl border border-areia-200 shadow-sm overflow-hidden dark:bg-[#4a5546] dark:border-white/12">
          <div className="h-1 bg-gradient-to-r from-verde-400 via-verde-300 to-verde-400" />
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-areia-200 rounded w-1/3" />
              <div className="h-4 bg-areia-100 rounded w-1/4" />
              <div className="h-[480px] bg-areia-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (mapEnabledIndicators.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-xl border border-areia-200 shadow-sm overflow-hidden dark:bg-[#4a5546] dark:border-white/12">
          <div className="h-1 bg-gradient-to-r from-verde-400 via-verde-300 to-verde-400" />
          <div className="flex flex-col items-center justify-center py-16">
            <Map size={48} className="text-areia-300 mb-4 dark:text-areia-600" />
            <p className="text-sm text-areia-500 font-jakarta dark:text-areia-400">
              Não há dados municipais disponíveis para esta seção.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in motion-reduce:animate-none">
      <div className="bg-white rounded-xl border border-areia-200 shadow-sm overflow-hidden dark:bg-[#4a5546] dark:border-white/12">
        <div className="h-1 bg-gradient-to-r from-verde-400 via-verde-300 to-verde-400" />

        {/* Header bar */}
        <div className="px-4 py-3 border-b border-areia-100 dark:border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
            {/* Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-verde-600 shadow-md ring-2 ring-verde-200 dark:bg-verde-500 dark:ring-verde-800">
                <Map size={18} className="text-white" />
              </div>
              {selectedIndicator && (
                <div className="min-w-0 animate-fade-in motion-reduce:animate-none">
                  <p className="text-[18px] font-bold text-verde-950 dark:text-white font-fraunces leading-snug truncate tracking-tight">
                    {selectedIndicator.indicator.label}
                  </p>
                  <p className="text-[10px] text-areia-500 dark:text-areia-400 font-jakarta truncate">
                    Fonte: {selectedIndicator.indicator.source}
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Indicator select */}
              <AnimatedSelect
                value={selectedIndicatorKey}
                onChange={(val) => {
                  setSelectedIndicatorKey(val)
                  const indicator = mapEnabledIndicators.find(
                    (item) => item.indicator.id === val,
                  )
                  if (indicator && indicator.availableYears.length > 0) {
                    setSelectedYear(
                      indicator.availableYears[indicator.availableYears.length - 1],
                    )
                  }
                }}
                groups={indicatorGroups}
                icon={<Layers size={10} />}
                className="min-w-0 w-[240px]"
              />

              {/* Year select */}
              {selectedIndicator && (
                <AnimatedSelect
                  value={String(selectedYear)}
                  onChange={(val) => setSelectedYear(Number(val))}
                  groups={[
                    {
                      label: 'Ano',
                      options: selectedIndicator.availableYears.map((year) => ({
                        key: String(year),
                        label: String(year),
                      })),
                    },
                  ]}
                  icon={<CalendarDays size={10} />}
                  className="w-[120px]"
                />
              )}

              {/* Palette select */}
              <AnimatedSelect<MapColorScale>
                value={colorScale}
                onChange={setColorScale}
                groups={[
                  {
                    label: 'Paleta',
                    options: MAP_COLOR_SCALES.map((scale) => ({
                      key: scale,
                      label: MAP_COLOR_SCALE_LABELS[scale],
                    })),
                  },
                ]}
                icon={<Palette size={10} />}
                className="w-[120px]"
              />
            </div>
          </div>
        </div>

        {/* Map with crossfade animation */}
        <div
          key={`${selectedIndicatorKey}-${selectedYear}-${colorScale}`}
          className="animate-fade-in motion-reduce:animate-none"
        >
          <AcreMap
            dataByMunicipio={mapData.dataByMunicipio}
            unit={mapData.unit}
            label={mapData.label}
            colorScale={colorScale}
            height={480}
          />
        </div>
      </div>
    </div>
  )
}