import { Award, Maximize2, Navigation, MapPin, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'
import { formatNumber } from '@/lib/utils/format'
import type { MunicipioDashboardData, MunicipioKpi } from '@/types/municipio-dashboard'

const ACRE_AREA_KM2 = 164_123
const ACRE_IDHM = 0.69
const RIO_BRANCO_LAT = -9.974
const RIO_BRANCO_LNG = -67.81

const SECTION_LABELS: Record<string, string> = {
  educacao: 'Educação',
  saude: 'Saúde',
  seguranca: 'Segurança',
  orcamento: 'Orçamento',
}

function formatDensity(populacao: number, area: number): string {
  if (area <= 0) return '—'
  const density = populacao / area
  return density >= 100 ? formatNumber(Math.round(density)) : density.toFixed(1).replace('.', ',')
}

function getCardinalDirection(lat: number, lng: number): string {
  const dLat = lat - RIO_BRANCO_LAT
  const dLng = lng - RIO_BRANCO_LNG
  if (Math.abs(dLat) < 0.1 && Math.abs(dLng) < 0.1) return 'na capital'
  const ns = dLat >= 0 ? 'N' : 'S'
  const ew = dLng >= 0 ? 'L' : 'O'
  const ratio = Math.abs(dLng) === 0 ? Infinity : Math.abs(dLat) / Math.abs(dLng)
  if (ratio > 2.5) return ns
  if (ratio < 0.4) return ew
  return ns + ew
}

function getIdhmColor(idhm: number): string {
  if (idhm >= 0.7) return 'text-verde-600'
  if (idhm >= 0.6) return 'text-ouro-500'
  return 'text-areia-500'
}

function getIdhmBadge(idhm: number): { text: string; variant: 'green' | 'amber' | 'default' } {
  if (idhm >= 0.7) return { text: 'Alto', variant: 'green' }
  if (idhm >= 0.6) return { text: 'Médio', variant: 'amber' }
  return { text: 'Baixo', variant: 'default' }
}

function computePct(value: number, max: number): number {
  if (max <= 0) return 0
  return Math.min(100, Math.max(4, (value / max) * 100))
}

interface DestaqueKpi extends MunicipioKpi {
  pctDiff: number
}

interface PainelMunicipioInfoProps {
  dashboardData: MunicipioDashboardData
  destaques: DestaqueKpi[]
}

export function PainelMunicipioInfo({ dashboardData, destaques }: PainelMunicipioInfoProps) {
  const idhmBadge = getIdhmBadge(dashboardData.idhm)

  return (
    <div className="bg-white rounded-xl border border-areia-200 shadow-sm overflow-hidden flex flex-col">
      <div className="h-1 bg-gradient-to-r from-ouro-400 via-ouro-300 to-ouro-400" />

      {/* Header */}
      <div className="relative px-5 py-4 border-b border-areia-100 bg-gradient-to-br from-ouro-50/40 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-areia-400 font-jakarta">
              Município
            </p>
            <p className="text-[22px] font-bold font-fraunces text-verde-900 leading-tight mt-1 truncate">
              {dashboardData.nome}
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-[9px] text-areia-400 font-jakarta tabular-nums">
              <MapPin size={9} strokeWidth={2.5} className="opacity-60" />
              {dashboardData.lat.toFixed(4)}°, {dashboardData.lng.toFixed(4)}°
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-[9px] px-2 py-0.5 flex-shrink-0 mt-0.5"
          >
            {dashboardData.regiaoJudiciaria}
          </Badge>
        </div>
      </div>

      {/* Metrics grid 2x2 */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Population */}
        <div className="group rounded-lg bg-areia-50/60 border border-areia-100 hover:border-areia-200 hover:bg-areia-50 transition-colors p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-verde-700/70">
            <Users size={11} strokeWidth={2.5} />
            <span className="text-[9px] font-bold uppercase tracking-widest font-jakarta">
              População
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-xl font-bold font-fraunces text-verde-900 tabular-nums leading-none">
              {formatNumber(dashboardData.populacao)}
            </p>
            <span className="text-[10px] text-areia-400 font-jakarta">hab.</span>
          </div>
          <p className="text-[9px] text-areia-500 font-jakarta tabular-nums">
            {formatDensity(dashboardData.populacao, dashboardData.area)} hab/km²
          </p>
        </div>

        {/* Area */}
        <div className="group rounded-lg bg-areia-50/60 border border-areia-100 hover:border-areia-200 hover:bg-areia-50 transition-colors p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-verde-700/70">
            <Maximize2 size={11} strokeWidth={2.5} />
            <span className="text-[9px] font-bold uppercase tracking-widest font-jakarta">
              Área
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-xl font-bold font-fraunces text-verde-900 tabular-nums leading-none">
              {formatNumber(dashboardData.area)}
            </p>
            <span className="text-[10px] text-areia-400 font-jakarta">km²</span>
          </div>
          <p className="text-[9px] text-areia-500 font-jakarta tabular-nums">
            {((dashboardData.area / ACRE_AREA_KM2) * 100).toFixed(1).replace('.', ',')}% do estado
          </p>
        </div>

        {/* IDHM — hero card */}
        <div className="group rounded-lg bg-gradient-to-br from-ouro-50/80 to-areia-50/40 border border-ouro-100 hover:border-ouro-200 transition-colors p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 text-ouro-600">
              <Award size={11} strokeWidth={2.5} />
              <span className="text-[9px] font-bold uppercase tracking-widest font-jakarta">
                IDHM
              </span>
            </div>
            <Badge variant={idhmBadge.variant} className="text-[8px] px-1.5 py-0">
              {idhmBadge.text}
            </Badge>
          </div>
          <div className="flex items-baseline gap-1">
            <p
              className={cn(
                'text-xl font-bold font-fraunces tabular-nums leading-none',
                getIdhmColor(dashboardData.idhm),
              )}
            >
              {dashboardData.idhm.toFixed(3)}
            </p>
            <span className="text-[10px] text-areia-400 font-jakarta">/ 1.000</span>
          </div>
          <div className="h-1 w-full rounded-full bg-ouro-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-ouro-500 transition-all duration-700 group-hover:bg-ouro-600"
              style={{ width: `${computePct(dashboardData.idhm, 1)}%` }}
            />
          </div>
          <p className="text-[9px] text-areia-500 font-jakarta tabular-nums">
            AC: {ACRE_IDHM.toFixed(3).replace('.', ',')}
            <span
              className={cn(
                'ml-1 font-bold',
                dashboardData.idhm >= ACRE_IDHM ? 'text-verde-600' : 'text-areia-500',
              )}
            >
              {dashboardData.idhm >= ACRE_IDHM ? '▲' : '▼'}
              {Math.abs(((dashboardData.idhm - ACRE_IDHM) / ACRE_IDHM) * 100).toFixed(1).replace('.', ',')}%
            </span>
          </p>
        </div>

        {/* Distance */}
        <div className="group rounded-lg bg-areia-50/60 border border-areia-100 hover:border-areia-200 hover:bg-areia-50 transition-colors p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-verde-700/70">
            <Navigation size={11} strokeWidth={2.5} />
            <span className="text-[9px] font-bold uppercase tracking-widest font-jakarta">
              {dashboardData.distanciaCapital === 0 ? 'Capital' : 'Distância'}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            {dashboardData.distanciaCapital === 0 ? (
              <>
                <p className="text-xl font-bold font-fraunces text-verde-900 leading-none">★</p>
                <span className="text-[10px] text-areia-400 font-jakarta">do Acre</span>
              </>
            ) : (
              <>
                <p className="text-xl font-bold font-fraunces text-verde-900 tabular-nums leading-none">
                  {formatNumber(dashboardData.distanciaCapital)}
                </p>
                <span className="text-[10px] text-areia-400 font-jakarta">km</span>
              </>
            )}
          </div>
          <p className="text-[9px] text-areia-500 font-jakarta uppercase tracking-wide">
            {dashboardData.distanciaCapital === 0
              ? 'Rio Branco'
              : `${getCardinalDirection(dashboardData.lat, dashboardData.lng)} da capital`}
          </p>
        </div>
      </div>

      {/* Destaques — KPIs com maior desvio da média estadual */}
      <div className="flex-1 px-4 pb-4 flex flex-col">
        <div className="flex-1 rounded-lg bg-gradient-to-br from-verde-50/30 via-areia-50/20 to-transparent border border-areia-100 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-areia-500 font-jakarta">
              Destaques vs Estado
            </p>
            <span className="text-[8px] text-areia-400 font-jakarta uppercase tracking-wider">
              maior desvio
            </span>
          </div>

          {destaques.length > 0 ? (
            <div className="flex-1 flex flex-col gap-3 justify-around">
              {destaques.map((kpi) => {
                const isPositive = kpi.pctDiff >= 0
                return (
                  <div key={kpi.id} className="group/row">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <p className="text-[10.5px] font-semibold font-jakarta text-verde-900 truncate min-w-0">
                        {kpi.label}
                      </p>
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5 text-[10.5px] font-bold tabular-nums whitespace-nowrap',
                          isPositive ? 'text-verde-600' : 'text-areia-600',
                        )}
                      >
                        <span className="text-[9px] leading-none">
                          {isPositive ? '▲' : '▼'}
                        </span>
                        {Math.abs(kpi.pctDiff).toFixed(1).replace('.', ',')}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-jakarta">
                      <span className="text-areia-500 uppercase tracking-wider">
                        {SECTION_LABELS[kpi.section] ?? kpi.section}
                      </span>
                      <span className="text-areia-400 tabular-nums">
                        {formatNumber(kpi.value)}{kpi.unit ? ` ${kpi.unit}` : ''}
                        <span className="mx-1 text-areia-300">·</span>
                        AC {formatNumber(kpi.estadualValue ?? 0)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="flex-1 flex items-center justify-center text-[10px] text-areia-400 font-jakarta italic">
              Sem indicadores comparáveis
            </p>
          )}

          <p className="text-[8px] text-areia-400 font-jakarta mt-3 uppercase tracking-wider">
            valores municipal × média estadual
          </p>
        </div>
      </div>
    </div>
  )
}
