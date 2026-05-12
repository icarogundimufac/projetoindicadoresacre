'use client'

import { useState, useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapaSkeleton } from '@/components/sections/IndicadoresMapa/components/MapaSkeleton'
import { PainelMunicipal } from '@/components/sections/IndicadoresMapa/components/PainelMunicipal'
import { PainelMapa } from '@/components/sections/IndicadoresMapa/components/PainelMapa'
import { PainelMunicipioInfo } from '@/components/sections/IndicadoresMapa/components/PainelMunicipioInfo'
import {
  DEFAULT_MAP_VARIABLE_KEY,
  getMapVariableOptions,
  getMapVariableData,
} from '@/lib/data/portal-data'
import { getMunicipioDashboardData, getAllMunicipioOptions } from '@/lib/data/municipio-dashboard'
import type { IndicadoresOutletContext } from '@/components/layout/IndicadoresLayout'
import type { MapColorScale } from '@/components/maps/AcreMap'
import { MAP_COLOR_PALETTES } from '@/components/maps/AcreMap'

const STORAGE_KEY = 'portal:municipio-dashboard:selectedSlug'
const DEFAULT_SLUG = 'rio-branco'
const MAP_COLOR_SCALE_STORAGE_KEY = 'portal:municipio-dashboard:mapColorScale'
const MAP_COLOR_SCALES = Object.keys(MAP_COLOR_PALETTES) as MapColorScale[]

function readPersistedColorScale(): MapColorScale {
  try {
    const value = localStorage.getItem(MAP_COLOR_SCALE_STORAGE_KEY)
    if (value && (MAP_COLOR_SCALES as string[]).includes(value)) {
      return value as MapColorScale
    }
  } catch {}
  return 'verde'
}

export function IndicadoresMapa() {
  const { data: sectionData, isLoading: isLoadingSections } = useOutletContext<IndicadoresOutletContext>()

  const [selectedSlug, setSelectedSlug] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return stored
    }
    return DEFAULT_SLUG
  })

  const [showEstadual, setShowEstadual] = useState(false)
  const [showSatellite, setShowSatellite] = useState(true)

  // Map indicator selection
  const [selectedVariableKey, setSelectedVariableKey] = useState(DEFAULT_MAP_VARIABLE_KEY)
  const [selectedYear, setSelectedYear] = useState(2023)
  const [colorScale, setColorScale] = useState<MapColorScale>(readPersistedColorScale)

  const handleColorScaleChange = (scale: MapColorScale) => {
    setColorScale(scale)
    try {
      localStorage.setItem(MAP_COLOR_SCALE_STORAGE_KEY, scale)
    } catch {}
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedSlug)
  }, [selectedSlug])

  const { data: municipioOptions = [], isLoading: isLoadingOptions } = useQuery({
    queryKey: ['municipios-options'],
    queryFn: getAllMunicipioOptions,
  })

  const { data: dashboardData, isPending: isPendingDashboard } = useQuery({
    queryKey: ['municipio-dashboard', selectedSlug],
    queryFn: () => getMunicipioDashboardData(selectedSlug),
    enabled: !!selectedSlug,
    placeholderData: (previousData) => previousData,
  })

  // Build bundle from section data
  const bundle = useMemo(() => {
    const sections = Object.fromEntries(
      Object.entries(sectionData)
        .filter(([, section]) => section !== null)
        .map(([id, section]) => [id, section]),
    )

    if (Object.keys(sections).length === 0) return null

    return {
      dashboard: { lastUpdated: new Date().toISOString().slice(0, 10), kpis: [], sectionSummaries: [] },
      sections,
      municipiosIndex: municipioOptions.map((m) => ({ ...m, slug: m.slug, nome: m.nome, populacao: 0, area: 0, regiaoJudiciaria: '', distanciaCapital: 0, idhm: 0, lat: 0, lng: 0 })),
      municipioDetails: {},
    }
  }, [sectionData, municipioOptions])

  const variableOptions = useMemo(
    () => (bundle ? getMapVariableOptions(bundle) : []),
    [bundle],
  )

  const selectedVariable = variableOptions.find(
    (option) => option.key === selectedVariableKey,
  )

  // Auto-select first available variable when options load
  useEffect(() => {
    if (variableOptions.length === 0) return

    const preferred =
      variableOptions.find((option) => option.key === selectedVariableKey) ??
      variableOptions.find((option) => option.key === DEFAULT_MAP_VARIABLE_KEY) ??
      variableOptions[0]

    if (preferred.key !== selectedVariableKey) {
      setSelectedVariableKey(preferred.key)
      return
    }

    if (!preferred.years.includes(selectedYear)) {
      setSelectedYear(preferred.years[preferred.years.length - 1] ?? 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariableKey, variableOptions])

  const mapData = useMemo(
    () =>
      bundle
        ? getMapVariableData(bundle, selectedVariableKey, selectedYear)
        : {
            dataByMunicipio: {} as Record<string, number>,
            label: 'Indicador',
            unit: '',
            source: '',
          },
    [bundle, selectedVariableKey, selectedYear],
  )

  // Group variable options by section for <optgroup>
  const optionsBySection = useMemo(() => {
    const groups: Record<string, { label: string; options: typeof variableOptions }> = {}
    for (const option of variableOptions) {
      if (!groups[option.sectionId]) {
        groups[option.sectionId] = { label: option.sectionLabel, options: [] }
      }
      groups[option.sectionId].options.push(option)
    }
    return Object.values(groups)
  }, [variableOptions])

  const destaques = useMemo(() => {
    if (!dashboardData) return []
    return dashboardData.kpis
      .filter((k) => k.estadualValue !== undefined && k.estadualValue !== 0)
      .map((k) => ({
        ...k,
        pctDiff: ((k.value - (k.estadualValue ?? 0)) / (k.estadualValue ?? 1)) * 100,
      }))
      .sort((a, b) => Math.abs(b.pctDiff) - Math.abs(a.pctDiff))
      .slice(0, 3)
  }, [dashboardData])

  const isInitialLoading = isLoadingOptions || isPendingDashboard || isLoadingSections

  return (
    <>
      {isInitialLoading && <MapaSkeleton />}

      {dashboardData && (
        <div className="space-y-4">
          {/* Top 3-column section */}
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-4">
            {/* Left: Controls panel */}
            <PainelMunicipal
              selectedSlug={selectedSlug}
              onChangeSlug={setSelectedSlug}
              municipioOptions={municipioOptions}
              showEstadual={showEstadual}
              onToggleEstadual={setShowEstadual}
              showSatellite={showSatellite}
              onToggleSatellite={setShowSatellite}
            />

            {/* Center: Map with indicator controls */}
            <PainelMapa
              selectedVariableKey={selectedVariableKey}
              onChangeVariableKey={setSelectedVariableKey}
              selectedYear={selectedYear}
              onChangeYear={setSelectedYear}
              colorScale={colorScale}
              onChangeColorScale={handleColorScaleChange}
              optionsBySection={optionsBySection.map((g) => ({
                label: g.label,
                options: g.options.map((o) => ({ key: o.key, label: o.indicatorLabel })),
              }))}
              selectedVariable={selectedVariable}
              years={selectedVariable?.years ?? []}
              mapData={mapData}
              selectedSlug={selectedSlug}
              onMunicipioClick={setSelectedSlug}
              showSatellite={showSatellite}
            />

            {/* Right: Municipality data panel */}
            <PainelMunicipioInfo
              dashboardData={dashboardData}
              destaques={destaques}
            />
          </div>


        </div>
      )}
    </>
  )
}
