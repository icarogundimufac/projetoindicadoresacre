import { useEffect, useMemo, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { PageShell, PageContent } from '@/components/layout/PageShell'
import { SectionSummary } from '@/components/dashboard/SectionSummary'
import { KpiLedgerRow } from '@/components/dashboard/KpiLedgerRow'
import {
  AcreMap,
  MAP_COLOR_PALETTES,
  MAP_COLOR_SCALE_LABELS,
  type MapColorScale,
} from '@/components/maps/AcreMap'
import {
  DEFAULT_MAP_VARIABLE_KEY,
  getMapVariableData,
} from '@/lib/data/portal-data'
import { SECTIONS } from '@/lib/constants/sections'
import { isIndicatorSectionId } from '@/lib/constants/indicator-sections'
import type { PortalDataBundle, MapVariableOption } from '@/types/admin-data'
import type { DashboardData } from '@/types/dashboard'

interface DashboardPageProps {
  data: DashboardData | null
  bundle: PortalDataBundle | null
  variableOptions: MapVariableOption[]
}

const MAP_COLOR_SCALE_STORAGE_KEY = 'portal:dashboard:mapColorScale'
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

export function DashboardPage({ data, bundle, variableOptions }: DashboardPageProps) {
  const [selectedVariableKey, setSelectedVariableKey] = useState(DEFAULT_MAP_VARIABLE_KEY)
  const [selectedYear, setSelectedYear] = useState(2023)
  const [colorScale, setColorScale] = useState<MapColorScale>(readPersistedColorScale)

  const handleColorScaleChange = (scale: MapColorScale) => {
    setColorScale(scale)
    try {
      localStorage.setItem(MAP_COLOR_SCALE_STORAGE_KEY, scale)
    } catch {}
  }

  const selectedVariable = variableOptions.find(
    (option) => option.key === selectedVariableKey,
  )

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
  }, [selectedVariableKey, selectedYear, variableOptions])

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

  const indicatorCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    if (!bundle) return counts
    for (const section of SECTIONS) {
      if (!isIndicatorSectionId(section.id)) continue
      const indicatorSection = bundle.sections[section.id]
      if (!indicatorSection) continue
      counts[section.id] = indicatorSection.groups.reduce(
        (acc, group) => acc + group.indicators.length,
        0,
      )
    }
    return counts
  }, [bundle])

  // Group variable options by section for <optgroup>
  const optionsBySection = useMemo(() => {
    const groups: Record<string, { label: string; options: MapVariableOption[] }> = {}
    for (const option of variableOptions) {
      if (!groups[option.sectionId]) {
        groups[option.sectionId] = { label: option.sectionLabel, options: [] }
      }
      groups[option.sectionId].options.push(option)
    }
    return Object.values(groups)
  }, [variableOptions])

  return (
    <PageShell>
      <Header
        title="Dashboard"
        subtitle="Visão geral dos principais indicadores do Estado do Acre"
      />

      <PageContent>
        <section className="mb-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
            <div className="xl:flex-[2] min-w-0 bg-white rounded-xl border border-areia-200 shadow-sm overflow-hidden dark:bg-[#4a5546] dark:border-white/12">
              <div className="px-5 py-3 border-b border-areia-100 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-areia-800 font-jakarta shrink-0">
                  Mapa do Estado do Acre
                </p>

                <div className="flex items-center gap-2 min-w-0">
                  <select
                    value={selectedVariableKey}
                    onChange={(event) => setSelectedVariableKey(event.currentTarget.value)}
                    className="min-w-0 max-w-[260px] truncate rounded-lg border border-areia-200 bg-areia-50/60 px-2.5 py-1 text-[12px] text-areia-700 font-jakarta transition hover:border-areia-300 focus:border-verde-400 focus:ring-1 focus:ring-verde-400/30 focus:outline-none"
                  >
                    {optionsBySection.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map((option) => (
                          <option key={option.key} value={option.key}>
                            {option.indicatorLabel}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(Number(event.currentTarget.value))}
                    className="w-[72px] rounded-lg border border-areia-200 bg-areia-50/60 px-2 py-1 text-[12px] text-areia-700 font-jakarta tabular-nums transition hover:border-areia-300 focus:border-verde-400 focus:ring-1 focus:ring-verde-400/30 focus:outline-none"
                  >
                    {(selectedVariable?.years ?? []).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <select
                    value={colorScale}
                    onChange={(event) =>
                      handleColorScaleChange(event.currentTarget.value as MapColorScale)
                    }
                    aria-label="Paleta de cores do mapa"
                    className="rounded-lg border border-areia-200 bg-areia-50/60 px-2.5 py-1 text-[12px] text-areia-700 font-jakarta transition hover:border-areia-300 focus:border-verde-400 focus:ring-1 focus:ring-verde-400/30 focus:outline-none"
                  >
                    {MAP_COLOR_SCALES.map((scale) => (
                      <option key={scale} value={scale}>
                        {MAP_COLOR_SCALE_LABELS[scale]}
                      </option>
                    ))}
                  </select>

                  {selectedVariable && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-[#F2C230]/40 bg-[#F2C230]/10 text-[#1F6B3A] font-jakarta shrink-0 whitespace-nowrap">
                      Fonte: {selectedVariable.source}
                    </span>
                  )}
                </div>
              </div>
              <AcreMap
                dataByMunicipio={mapData.dataByMunicipio}
                unit={mapData.unit}
                label={mapData.label}
                colorScale={colorScale}
                height={460}
              />
            </div>

            {data?.kpis && data.kpis.length > 0 && (
              <div className="xl:flex-[1] min-w-0 rounded-xl border border-areia-200 bg-white shadow-sm overflow-hidden xl:sticky xl:top-6 dark:bg-[#4a5546] dark:border-white/12">
                <div className="h-1 bg-gradient-to-r from-ouro-400 via-ouro-300 to-ouro-400" />
                <div className="border-b border-areia-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-verde-700 font-jakarta">
                      Indicadores-chave
                    </p>
                    <span className="rounded-md border border-verde-100 bg-verde-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-verde-700 font-jakarta">
                      {data.kpis.length} itens
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-areia-500 font-jakarta">
                    Principais metricas para leitura rapida.
                  </p>
                </div>

                <div className="px-3 py-3">
                  <ul className="space-y-2">
                    {data.kpis.map((kpi) => (
                      <KpiLedgerRow
                        key={kpi.id}
                        kpi={kpi}
                      />
                    ))}
                  </ul>
                </div>

                <div className="border-t border-areia-200 px-4 py-2 bg-areia-50/50">
                  <p className="text-[9px] text-areia-400 font-jakarta tracking-wide">
                    {data.lastUpdated && `Atualizado em ${new Date(data.lastUpdated).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-verde-700 font-jakarta mb-4">
            Áreas temáticas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {SECTIONS.map((section) => (
              <SectionSummary
                key={section.id}
                sectionId={section.id}
                indicatorCount={indicatorCounts[section.id]}
              />
            ))}
          </div>
        </section>

        {!data && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4 opacity-30">📊</span>
            <h2 className="text-xl font-semibold text-areia-600 font-fraunces mb-2">
              Portal em configuração
            </h2>
            <p className="text-sm text-areia-400 font-jakarta max-w-sm">
              Os arquivos de dados ainda não foram carregados. Verifique o diretório{' '}
              <code className="bg-areia-200 rounded px-1.5 py-0.5 text-xs">/public/data</code>.
            </p>
          </div>
        )}
      </PageContent>
    </PageShell>
  )
}
