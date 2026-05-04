import { TrendingUp, TrendingDown, Heart, ShieldCheck } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import type { IndicatorSection } from '@/types/indicators'

interface SaudeKpisProps {
  data: IndicatorSection
}

export function SaudeKpis({ data }: SaudeKpisProps) {
  const indicatorsWithSeries = data.groups
    .flatMap((g) => g.indicators)
    .filter((ind) => ind.timeSeries && ind.timeSeries.length > 0)

  if (indicatorsWithSeries.length === 0) return null

  // ── Card esquerdo: Mortalidade Infantil ──
  const mortalidade = data.groups
    .find((g) => g.id === 'mortalidade')
    ?.indicators.find((ind) => ind.id === 'mortalidade_infantil')

  // ── Card direito: Cobertura Vacinal ──
  const vacinacao = data.groups
    .find((g) => g.id === 'prevencao')
    ?.indicators.find((ind) => ind.id === 'cobertura_vacinacao')

  // Maior alta / maior queda
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {/* ── Mortalidade Infantil ── */}
      <div className="rounded-xl border border-areia-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <Heart size={12} className="text-red-500" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-areia-400 font-jakarta">
            Mortalidade Infantil
          </p>
        </div>
        {mortalidade && mortalidade.latestValue !== undefined ? (
          <>
            <p className="text-xl font-bold font-fraunces text-verde-900 tabular-nums leading-tight">
              {formatNumber(mortalidade.latestValue)}
            </p>
            <p className="text-[10px] text-areia-400 font-jakarta mt-0.5">
              {mortalidade.unit} — {mortalidade.timeSeries.at(-1)?.year}
            </p>
          </>
        ) : (
          <p className="text-sm text-areia-400 font-jakarta">—</p>
        )}
      </div>

      {/* ── Maior alta ── */}
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

      {/* ── Maior queda ── */}
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

      {/* ── Cobertura Vacinal ── */}
      <div className="rounded-xl border border-areia-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <ShieldCheck size={12} className="text-verde-700" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-areia-400 font-jakarta">
            Cobertura Vacinal
          </p>
        </div>
        {vacinacao && vacinacao.latestValue !== undefined ? (
          <>
            <p className="text-xl font-bold font-fraunces text-verde-900 tabular-nums leading-tight">
              {vacinacao.latestValue}%
            </p>
            <p className="text-[10px] text-areia-400 font-jakarta mt-0.5">
              Calendário básico — {vacinacao.timeSeries.at(-1)?.year}
            </p>
          </>
        ) : (
          <p className="text-sm text-areia-400 font-jakarta">—</p>
        )}
      </div>
    </div>
  )
}
