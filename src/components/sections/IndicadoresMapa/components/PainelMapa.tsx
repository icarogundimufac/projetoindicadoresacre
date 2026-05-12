import { Layers, CalendarDays, Palette } from 'lucide-react'
import { AnimatedSelect } from '@/components/ui/AnimatedSelect'
import {
  AcreMap,
  MAP_COLOR_PALETTES,
  MAP_COLOR_SCALE_LABELS,
  type MapColorScale,
} from '@/components/maps/AcreMap'
import type { MapVariableOption } from '@/types/admin-data'

const MAP_COLOR_SCALES = Object.keys(MAP_COLOR_PALETTES) as MapColorScale[]

interface SelectGroup {
  label: string
  options: { key: string; label: string }[]
}

interface PainelMapaProps {
  selectedVariableKey: string
  onChangeVariableKey: (key: string) => void
  selectedYear: number
  onChangeYear: (year: number) => void
  colorScale: MapColorScale
  onChangeColorScale: (scale: MapColorScale) => void
  optionsBySection: SelectGroup[]
  selectedVariable?: MapVariableOption
  years: number[]
  mapData: {
    dataByMunicipio: Record<string, number>
    label: string
    unit: string
  }
  selectedSlug: string
  onMunicipioClick: (slug: string) => void
  showSatellite: boolean
}

export function PainelMapa({
  selectedVariableKey,
  onChangeVariableKey,
  selectedYear,
  onChangeYear,
  colorScale,
  onChangeColorScale,
  optionsBySection,
  selectedVariable,
  years,
  mapData,
  selectedSlug,
  onMunicipioClick,
  showSatellite,
}: PainelMapaProps) {
  return (
    <div className="bg-white rounded-xl border border-areia-200 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-verde-400 via-verde-300 to-verde-400" />

      {/* Map header with controls */}
      <div className="px-4 py-3 border-b border-areia-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          {/* Title */}
          <div className="flex items-center min-w-0">
            {selectedVariable && (
              <div className="min-w-0">
                <p className="text-[18px] font-bold text-verde-950 font-fraunces leading-snug truncate tracking-tight">
                  {selectedVariable.indicatorLabel}
                </p>
                <p className="text-[10px] text-areia-500 font-jakarta truncate">
                  Fonte: {selectedVariable.source}
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Indicator select */}
            <AnimatedSelect
              value={selectedVariableKey}
              onChange={onChangeVariableKey}
              groups={optionsBySection.map((group) => ({
                label: group.label,
                options: group.options.map((option) => ({
                  key: option.key,
                  label: option.label,
                })),
              }))}
              icon={<Layers size={16} />}
              variant="card"
              className="min-w-0 w-fit max-w-[400px]"
            />

            {/* Year select */}
            <AnimatedSelect
              value={String(selectedYear)}
              onChange={(val) => onChangeYear(Number(val))}
              groups={[
                {
                  label: 'Ano',
                  options: years.map((year) => ({
                    key: String(year),
                    label: String(year),
                  })),
                },
              ]}
              icon={<CalendarDays size={16} />}
              variant="card"
              className="w-[140px]"
            />

            {/* Palette select */}
            <AnimatedSelect<MapColorScale>
              value={colorScale}
              onChange={onChangeColorScale}
              groups={[
                {
                  label: 'Paleta',
                  options: MAP_COLOR_SCALES.map((scale) => ({
                    key: scale,
                    label: MAP_COLOR_SCALE_LABELS[scale],
                  })),
                },
              ]}
              icon={<Palette size={16} />}
              variant="card"
              className="w-[140px]"
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <AcreMap
        dataByMunicipio={mapData.dataByMunicipio}
        unit={mapData.unit}
        label={mapData.label}
        colorScale={colorScale}
        height={520}
        selectedSlug={selectedSlug}
        onMunicipioClick={onMunicipioClick}
        showSatellite={showSatellite}
      />
    </div>
  )
}
