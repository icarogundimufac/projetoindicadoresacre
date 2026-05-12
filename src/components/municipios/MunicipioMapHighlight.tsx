'use client'

import { AcreMap, type MapColorScale } from '@/components/maps/AcreMap'

interface MunicipioMapHighlightProps {
  dataByMunicipio: Record<string, number>
  label: string
  unit: string
  colorScale?: MapColorScale
  height?: number
}

export function MunicipioMapHighlight({
  dataByMunicipio,
  label,
  unit,
  colorScale = 'verde',
  height = 480,
}: MunicipioMapHighlightProps) {
  return (
    <AcreMap
      dataByMunicipio={dataByMunicipio}
      label={label}
      unit={unit}
      colorScale={colorScale}
      height={height}
    />
  )
}