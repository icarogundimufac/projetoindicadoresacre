import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Activity } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatNumber, formatCompactCurrency } from '@/lib/utils/format'
import type { IndicatorSection } from '@/types/indicators'

interface SectionKpisProps {
  data: IndicatorSection
}

function applyFormat(value: number, format?: 'number' | 'currency', unit?: string) {
  if (format === 'currency') return formatCompactCurrency(value)
  return `${formatNumber(value)}${unit ? ` ${unit}` : ''}`
}

export function SectionKpis({ data }: SectionKpisProps) {
  const indicatorsWithSeries = data.groups
    .flatMap((g) => g.indicators)
    .filter((ind) => ind.timeSeries && ind.timeSeries.length > 0)

  if (indicatorsWithSeries.length === 0) return null

  // Total de indicadores com dados temporais
  const totalIndicators = indicatorsWithSeries.length

  // Encontrar período global (primeiro e último ano entre todos os indicadores)
  const allYears = indicatorsWithSeries.flatMap((ind) => ind.timeSeries.map((p) => p.year))
  const minYear = Math.min(...allYears)
  const maxYear = Math.max(...allYears)

  // Indicador com maior variação positiva
  const withDelta = indicatorsWithSeries.filter(
    (ind) => ind.delta !== undefined && ind.delta !== null && ind.deltaDirection,
  )

  const biggestRiser =
    withDelta.length > 0
      ? withDelta.reduce((max, ind) =>
          (ind.delta ?? 0) > (max.delta ?? 0) ? ind : max,
        )
      : null

  const biggestFaller =
    withDelta.length > 0
      ? withDelta.reduce((min, ind) =>
          (ind.delta ?? 0) < (min.delta ?? 0) ? ind : min,
        )
      : null

  // Último indicador atualizado (com maior latestValue ou apenas o primeiro)
  const mostRecent = indicatorsWithSeries[0]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {/* Total de indicadores */}
      <div className="rounded-xl border border-areia-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <BarChart3 size={12} className="text-verde-700" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-areia-400 font-jakarta">
            Indicadores
          </p>
        </div>
        <p className="text-xl font-bold font-fraunces text-verde-900 tabular-nums leading-tight">
          {totalIndicators}
        </p>
        <p className="text-[10px] text-areia-400 font-jakarta mt-0.5">Com série temporal</p>
      </div>

      {/* Maior alta */}
      <div className="rounded-xl border border-areia-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp size={12} className="text-emerald-600" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-areia-400 font-jakarta">
            Maior alta
          </p>
        </div>
        {biggestRiser ? (
          <>
            <p className="text-sm font-bold font-fraunces text-verde-900 tabular-nums leading-tight truncate">
              {biggestRiser.label}
            </p>
            <p className="text-xs font-semibold text-emerald-600 font-jakarta">
              +{formatNumber(biggestRiser.delta ?? 0)} {biggestRiser.unit}
            </p>
          </>
        ) : (
          <p className="text-sm text-areia-400 font-jakarta">—</p>
        )}
      </div>

      {/* Maior queda */}
      <div className="rounded-xl border border-areia-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingDown size={12} className="text-red-500" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-areia-400 font-jakarta">
            Maior queda
          </p>
        </div>
        {biggestFaller ? (
          <>
            <p className="text-sm font-bold font-fraunces text-verde-900 tabular-nums leading-tight truncate">
              {biggestFaller.label}
            </p>
            <p className="text-xs font-semibold text-red-500 font-jakarta">
              {formatNumber(biggestFaller.delta ?? 0)} {biggestFaller.unit}
            </p>
          </>
        ) : (
          <p className="text-sm text-areia-400 font-jakarta">—</p>
        )}
      </div>

      {/* Período coberto */}
      <div className="rounded-xl border border-areia-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <Calendar size={12} className="text-verde-700" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-areia-400 font-jakarta">
            Período
          </p>
        </div>
        <p className="text-xl font-bold font-fraunces text-verde-900 tabular-nums leading-tight">
          {minYear} – {maxYear}
        </p>
        <p className="text-[10px] text-areia-400 font-jakarta mt-0.5">
          {maxYear - minYear + 1} anos de dados
        </p>
      </div>
    </div>
  )
}
