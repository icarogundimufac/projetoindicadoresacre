import { useEffect, useMemo, useState } from 'react'
import { Map, Layers, CalendarDays, Palette, ChevronDown } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { PageShell, PageContent } from '@/components/layout/PageShell'
import { SectionSummary } from '@/components/dashboard/SectionSummary'
import { AnimatedSelect } from '@/components/ui/AnimatedSelect'
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
import { cn } from '@/lib/utils/cn'
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
          <div className="flex flex-col gap-5 xl:flex-row xl:items-stretch">
            <div className="xl:flex-[2] min-w-0 bg-white rounded-xl border border-areia-200 shadow-sm overflow-hidden dark:bg-[#4a5546] dark:border-white/12">
              <div className="h-1 bg-gradient-to-r from-verde-400 via-verde-300 to-verde-400" />

              {/* ── Compact header bar ── */}
              <div className="px-4 py-3 border-b border-areia-100 dark:border-white/10">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
                  {/* Title */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-verde-600 shadow-md ring-2 ring-verde-200 dark:bg-verde-500 dark:ring-verde-800">
                      <Map size={18} className="text-white" />
                    </div>
                    {selectedVariable && (
                      <div
                        key={selectedVariableKey}
                        className="min-w-0 animate-fade-in motion-reduce:animate-none"
                      >
                        <p className="text-[18px] font-bold text-verde-950 dark:text-white font-fraunces leading-snug truncate tracking-tight">
                          {selectedVariable.indicatorLabel}
                        </p>
                        <p className="text-[10px] text-areia-500 dark:text-areia-400 font-jakarta truncate">
                          Fonte: {selectedVariable.source}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Indicator select — animated custom dropdown */}
                    <AnimatedSelect
                      value={selectedVariableKey}
                      onChange={setSelectedVariableKey}
                      groups={optionsBySection.map((group) => ({
                        label: group.label,
                        options: group.options.map((option) => ({
                          key: option.key,
                          label: option.indicatorLabel,
                        })),
                      }))}
                      icon={<Layers size={10} />}
                      className="min-w-0 w-[240px]"
                    />

                    {/* Year select — animated custom dropdown */}
                    <AnimatedSelect
                      value={String(selectedYear)}
                      onChange={(val) => setSelectedYear(Number(val))}
                      groups={[
                        {
                          label: 'Ano',
                          options: (selectedVariable?.years ?? []).map((year) => ({
                            key: String(year),
                            label: String(year),
                          })),
                        },
                      ]}
                      icon={<CalendarDays size={10} />}
                      className="w-[120px]"
                    />

                    {/* Palette select — animated custom dropdown */}
                    <AnimatedSelect<MapColorScale>
                      value={colorScale}
                      onChange={handleColorScaleChange}
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
                key={`${selectedVariableKey}-${selectedYear}-${colorScale}`}
                className="animate-fade-in motion-reduce:animate-none"
              >
                <AcreMap
                  dataByMunicipio={mapData.dataByMunicipio}
                  unit={mapData.unit}
                  label={mapData.label}
                  colorScale={colorScale}
                  height={460}
                />
              </div>
            </div>

            {data?.kpis && data.kpis.length > 0 && (
              <div className="xl:flex-[1] min-w-0 rounded-xl border border-areia-200 bg-white shadow-sm overflow-hidden xl:sticky xl:top-6 xl:flex xl:flex-col dark:bg-[#4a5546] dark:border-white/12">
                <div className="h-1 bg-gradient-to-r from-ouro-400 via-ouro-300 to-ouro-400" />
                <div className="border-b border-areia-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-verde-700 font-jakarta">
                      Indicadores-chave
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] text-areia-500 font-jakarta">
                    Principais metricas para leitura rapida.
                  </p>
                </div>

                <div className="flex-1 px-3 py-3">
                  <ul className="space-y-2">
                    {data.kpis.map((kpi) => (
                      <KpiLedgerRow
                        key={kpi.id}
                        kpi={kpi}
                      />
                    ))}
                  </ul>
                </div>

                <div className="mt-auto border-t border-areia-200 px-4 py-2 bg-areia-50/50">
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
