'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Feature, GeoJsonObject } from 'geojson'
import L, { type Layer, type LeafletMouseEvent, type PathOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet'
import { queryKeys, portalDataClient } from '@/lib/data/client'
import type { MunicipioSummary } from '@/types/municipio'
import { generateColorScale } from '@/lib/utils/color-scale'
import { MapLegend } from './MapLegend'

export type MapColorScale = 'verde' | 'estrela' | 'heat' | 'azul' | 'roxo'

export interface AcreMapProps {
  dataByMunicipio?: Record<string, number>
  unit?: string
  label?: string
  colorScale?: MapColorScale
  height?: number
}

export const MAP_COLOR_PALETTES: Record<MapColorScale, string[]> = {
  verde: ['#d6f3e1', '#7bd09e', '#229157', '#0f5b36', '#072d1c'],
  estrela: ['#fde8e8', '#f5a0a0', '#e74c3c', '#c0392b', '#7b1f1a'],
  heat: ['#fffde7', '#fff176', '#ffd600', '#f57f17', '#e65100'],
  azul: ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'],
  roxo: ['#ede9fe', '#c4b5fd', '#8b5cf6', '#6d28d9', '#4c1d95'],
}

export const MAP_COLOR_SCALE_LABELS: Record<MapColorScale, string> = {
  verde: 'Verde',
  estrela: 'Vermelho',
  heat: 'Amarelo',
  azul: 'Azul',
  roxo: 'Roxo',
}

const SATELLITE_TILE_URL =
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

const SATELLITE_ATTRIBUTION =
  '&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community'

const ACRE_CENTER: [number, number] = [-9.0238, -70.812]

interface HoverState {
  x: number
  y: number
  name: string
  value: string
}

function getGeoJsonBounds(geoJson: GeoJsonObject | undefined) {
  if (!geoJson) return null

  const bounds = L.geoJSON(geoJson).getBounds()
  return bounds.isValid() ? bounds : null
}

function fitMapToAcreBounds(map: L.Map, bounds: L.LatLngBounds, animate: boolean) {
  window.requestAnimationFrame(() => {
    map.invalidateSize(false)
    map.fitBounds(bounds, {
      animate,
      paddingTopLeft: [24, 24],
      paddingBottomRight: [24, 24],
    })
  })
}

function getMunicipioName(feature: Feature | undefined) {
  return (
    (feature?.properties?.NM_MUN as string | undefined) ??
    (feature?.properties?.name as string | undefined) ??
    (feature?.properties?.NOME as string | undefined) ??
    'Município'
  )
}

function normalizeMunicipioText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\uFFFD/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getCanonicalMunicipioKey(name: string) {
  return normalizeMunicipioText(name).replace(/\s+/g, '-')
}

interface NormalizedSlugEntry {
  slug: string
  normalized: string
  compact: string
}

function buildMunicipioAliasMap(municipios: MunicipioSummary[]) {
  const aliasMap = new Map<string, string>()

  for (const municipio of municipios) {
    const canonicalSlug = getCanonicalMunicipioKey(municipio.slug)
    const normalizedSlug = normalizeMunicipioText(municipio.slug)
    const normalizedName = normalizeMunicipioText(municipio.nome)

    aliasMap.set(canonicalSlug, canonicalSlug)
    aliasMap.set(getCanonicalMunicipioKey(municipio.nome), canonicalSlug)
    aliasMap.set(normalizedSlug.replace(/\s+/g, ''), canonicalSlug)
    aliasMap.set(normalizedName.replace(/\s+/g, ''), canonicalSlug)
  }

  return aliasMap
}

function buildValueByMunicipioSlug(
  dataByMunicipio: Record<string, number>,
  aliasToSlug: Map<string, string>,
) {
  const valueMap = new Map<string, number>()

  for (const [rawKey, rawValue] of Object.entries(dataByMunicipio)) {
    if (typeof rawValue !== 'number' || Number.isNaN(rawValue)) continue

    const canonicalKey = getCanonicalMunicipioKey(rawKey)
    const compactKey = normalizeMunicipioText(rawKey).replace(/\s+/g, '')
    const canonicalSlug =
      aliasToSlug.get(canonicalKey) ??
      aliasToSlug.get(compactKey) ??
      canonicalKey

    valueMap.set(canonicalSlug, rawValue)
  }

  return valueMap
}

function getLevenshteinDistance(left: string, right: string) {
  if (left === right) return 0
  if (left.length === 0) return right.length
  if (right.length === 0) return left.length

  const previousRow = Array.from({ length: right.length + 1 }, (_, index) => index)

  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previousRow[0]
    previousRow[0] = row

    for (let column = 1; column <= right.length; column += 1) {
      const up = previousRow[column]
      const leftCost = previousRow[column - 1]
      const substituteCost = diagonal + (left[row - 1] === right[column - 1] ? 0 : 1)

      diagonal = up
      previousRow[column] = Math.min(up + 1, leftCost + 1, substituteCost)
    }
  }

  return previousRow[right.length]
}

function buildNormalizedSlugEntries(slugs: string[]): NormalizedSlugEntry[] {
  return slugs.map((slug) => {
    const normalized = normalizeMunicipioText(slug)
    return {
      slug,
      normalized,
      compact: normalized.replace(/\s+/g, ''),
    }
  })
}

function resolveMunicipioSlug(
  feature: Feature | undefined,
  slugEntries: NormalizedSlugEntry[],
  aliasToSlug: Map<string, string>,
) {
  const name = getMunicipioName(feature)
  const normalizedName = normalizeMunicipioText(name)
  const compactName = normalizedName.replace(/\s+/g, '')
  const canonicalName = getCanonicalMunicipioKey(name)
  const aliasedSlug = aliasToSlug.get(canonicalName) ?? aliasToSlug.get(compactName)

  if (aliasedSlug) {
    return aliasedSlug
  }

  if (slugEntries.some((entry) => entry.slug === canonicalName)) {
    return canonicalName
  }

  const exact =
    slugEntries.find((entry) => entry.normalized === normalizedName) ??
    slugEntries.find((entry) => entry.compact === compactName)

  if (exact) return exact.slug

  const partialMatches = slugEntries.filter(
    (entry) =>
      entry.compact.startsWith(compactName) ||
      compactName.startsWith(entry.compact),
  )

  if (partialMatches.length === 1) {
    return partialMatches[0].slug
  }

  // Fallback para nomes com caracteres corrompidos no GeoJSON (ex: "M�ncio", "Jord�o").
  if (compactName.length > 0 && slugEntries.length > 0) {
    const rankedMatches = slugEntries
      .map((entry) => ({
        slug: entry.slug,
        distance: getLevenshteinDistance(compactName, entry.compact),
      }))
      .sort((left, right) => left.distance - right.distance)

    const bestMatch = rankedMatches[0]
    const secondBestMatch = rankedMatches[1]

    if (
      bestMatch &&
      bestMatch.distance <= 2 &&
      (!secondBestMatch || bestMatch.distance < secondBestMatch.distance)
    ) {
      return bestMatch.slug
    }
  }

  return canonicalName
}

function FitToGeoJson({ geoJson }: { geoJson: GeoJsonObject | undefined }) {
  const map = useMap()

  useEffect(() => {
    const bounds = getGeoJsonBounds(geoJson)

    if (!bounds) return

    fitMapToAcreBounds(map, bounds.pad(0.03), false)
  }, [geoJson, map])

  return null
}

function BindMapInstance({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap()

  useEffect(() => {
    onReady(map)
  }, [map, onReady])

  return null
}

function SyncMapLayout({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap()

  useEffect(() => {
    if (!bounds) return

    const paddedBounds = bounds.pad(0.03)
    const realignMap = () => fitMapToAcreBounds(map, paddedBounds, false)

    realignMap()

    const delayedRealignId = window.setTimeout(realignMap, 180)
    const settleRealignId = window.setTimeout(realignMap, 420)

    const handleWindowResize = () => {
      map.invalidateSize(false)
      realignMap()
    }

    window.addEventListener('resize', handleWindowResize)

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (!entry) return

        const { width, height } = entry.contentRect
        if (width <= 0 || height <= 0) return

        map.invalidateSize(false)
        realignMap()
      })

      resizeObserver.observe(map.getContainer())
    }

    return () => {
      window.clearTimeout(delayedRealignId)
      window.clearTimeout(settleRealignId)
      window.removeEventListener('resize', handleWindowResize)
      resizeObserver?.disconnect()
    }
  }, [bounds, map])

  return null
}

export function AcreMap({
  dataByMunicipio = {},
  unit = '',
  label = 'Indicador',
  colorScale = 'verde',
  height = 480,
}: AcreMapProps) {
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null)
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)
  const [hovered, setHovered] = useState<HoverState | null>(null)
  const { data: geoJson, isLoading, isError } = useQuery({
    queryKey: queryKeys.acreGeoJson,
    queryFn: portalDataClient.getAcreGeoJson,
  })
  const { data: municipios = [] } = useQuery({
    queryKey: queryKeys.municipios,
    queryFn: portalDataClient.getMunicipios,
  })

  const municipioAliasToSlug = useMemo(
    () => buildMunicipioAliasMap(municipios as MunicipioSummary[]),
    [municipios],
  )

  const valueByMunicipioSlug = useMemo(
    () => buildValueByMunicipioSlug(dataByMunicipio, municipioAliasToSlug),
    [dataByMunicipio, municipioAliasToSlug],
  )

  const values = useMemo(
    () => Array.from(valueByMunicipioSlug.values()).filter((value) => value !== undefined && value !== null),
    [valueByMunicipioSlug],
  )
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 1
  const colors = MAP_COLOR_PALETTES[colorScale]
  const colorFn = useMemo(
    () => generateColorScale(values, colors),
    [colors, values],
  )
  const geoJsonBounds = useMemo(
    () => getGeoJsonBounds(geoJson as GeoJsonObject | undefined),
    [geoJson],
  )
  const slugEntries = useMemo(
    () => buildNormalizedSlugEntries(Array.from(valueByMunicipioSlug.keys())),
    [valueByMunicipioSlug],
  )
  const municipioNameBySlug = useMemo(() => {
    const map = new Map<string, string>()

    for (const municipio of municipios as MunicipioSummary[]) {
      map.set(getCanonicalMunicipioKey(municipio.slug), municipio.nome)
    }

    return map
  }, [municipios])

  const styleFeature = (feature?: Feature): PathOptions => {
    const slug = resolveMunicipioSlug(feature, slugEntries, municipioAliasToSlug)
    const value = valueByMunicipioSlug.get(slug)

    return {
      fillColor: value !== undefined ? colorFn(value) : '#dbd5c9',
      fillOpacity: 1,
      color: '#f8f3e8',
      weight: 1,
      opacity: 0.95,
    }
  }

  const updateHover = (event: LeafletMouseEvent, feature?: Feature) => {
    const rawName = getMunicipioName(feature)
    const slug = resolveMunicipioSlug(feature, slugEntries, municipioAliasToSlug)
    const name = municipioNameBySlug.get(slug) ?? rawName
    const value = valueByMunicipioSlug.get(slug)

    setHovered({
      x: event.containerPoint.x,
      y: event.containerPoint.y,
      name,
      value:
        value !== undefined
          ? `${value.toLocaleString('pt-BR')} ${unit}`.trim()
          : 'Sem dado',
    })
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-areia-200 shadow-sm bg-white"
      style={{ height }}
    >
      {!isError && (
        <MapContainer
          center={ACRE_CENTER}
          zoom={7}
          minZoom={6}
          maxZoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
          zoomControl={false}
        >
          <BindMapInstance onReady={setMapInstance} />
          <TileLayer
            url={SATELLITE_TILE_URL}
            attribution={SATELLITE_ATTRIBUTION}
            maxZoom={18}
          />
          <SyncMapLayout bounds={geoJsonBounds} />
          {geoJson && (
            <>
              <FitToGeoJson geoJson={geoJson as GeoJsonObject} />
              <GeoJSON
                ref={geoJsonLayerRef}
                data={geoJson as GeoJsonObject}
                style={(feature) => styleFeature(feature as Feature | undefined)}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    mouseover: (event) => {
                      const target = event.target as L.Path
                      target.setStyle({
                        ...styleFeature(feature as Feature),
                        color: '#F2C230',
                        weight: 2,
                        fillOpacity: 1,
                      })

                      if ('bringToFront' in target) {
                        target.bringToFront()
                      }

                      updateHover(event, feature as Feature)
                    },
                    mousemove: (event) => updateHover(event, feature as Feature),
                    mouseout: (event) => {
                      geoJsonLayerRef.current?.resetStyle(event.target as Layer)
                      setHovered(null)
                    },
                  })
                }}
              />
            </>
          )}
        </MapContainer>
      )}

      {!isLoading && !isError && (
        <div className="absolute top-4 right-4 z-[500]">
          <span className="rounded-full border border-black/10 bg-white/92 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-areia-600 shadow-sm backdrop-blur-sm font-jakarta">
            Satelite: Esri
          </span>
        </div>
      )}

      {!isLoading && !isError && geoJsonBounds && mapInstance && (
        <div className="absolute top-4 left-4 z-[500]">
          <button
            type="button"
            onClick={() =>
              fitMapToAcreBounds(mapInstance, geoJsonBounds.pad(0.03), true)
            }
            aria-label="Recentrar mapa"
            title="Recentrar mapa"
            className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white h-10 w-10 text-verde-900 shadow-md transition hover:bg-areia-50 font-jakarta"
          >
            <span className="text-lg leading-none">⌂</span>
          </button>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-areia-100/80 z-10">
          <div className="text-center">
            <div className="text-3xl mb-2 opacity-40">🗺️</div>
            <p className="text-sm text-areia-500 font-jakarta">Carregando mapa...</p>
          </div>
        </div>
      )}

      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-areia-100/80 z-10">
          <div className="text-center max-w-xs">
            <div className="text-3xl mb-2 opacity-40">🗺️</div>
            <p className="text-sm font-semibold text-areia-600 font-fraunces mb-1">
              GeoJSON não carregado
            </p>
            <p className="text-xs text-areia-400 font-jakarta">
              Verifique o arquivo{' '}
              <code className="bg-areia-200 rounded px-1">
                public/shapefiles/acre-municipios.geojson
              </code>
              .
            </p>
          </div>
        </div>
      )}

      {hovered && (
        <div
          className="absolute pointer-events-none bg-verde-900 text-white rounded-lg px-3 py-2 shadow-xl text-xs font-jakarta z-[550]"
          style={{
            left: hovered.x + 12,
            top: hovered.y + 12,
          }}
        >
          <p className="font-semibold text-areia-200 mb-0.5">{hovered.name}</p>
          <p className="text-white">
            {label}: {hovered.value}
          </p>
        </div>
      )}

      {values.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[500]">
          <MapLegend
            min={min}
            max={max}
            unit={unit}
            label={label}
            colors={colors}
          />
        </div>
      )}
    </div>
  )
}
