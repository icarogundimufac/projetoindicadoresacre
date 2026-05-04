import { TrendingUp, TrendingDown, Landmark, Receipt } from 'lucide-react'
import { formatCompactCurrency } from '@/lib/utils/format'
import type { IndicatorSection } from '@/types/indicators'

interface OrcamentoKpisProps {
  data: IndicatorSection
}

export function OrcamentoKpis({ data }: OrcamentoKpisProps) {
  const indicatorsWithSeries = data.groups
    .flatMap((g) => g.indicators)
    .filter((ind) => ind.timeSeries && ind.timeSeries.length > 0)

  if (indicatorsWithSeries.length === 0) return null

  // ── Card esquerdo: Receita Total ──
  const receita = data.groups
    .find((g) => g.id === 'receitas')
    ?.indicators.find((ind) => ind.id === 'receita_total')

  // ── Card direito: Despesa Total ──
  const despesa = data.groups
    .find((g) => g.id === 'despesas')
    ?.indicators.find((ind) => ind.id === 'despesa_total')

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
      {/* ── Receita Total ── */}
      <div className="rounded-xl border border-areia-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <Landmark size={12} className="text-verde-700" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-areia-400 font-jakarta">
            Receita Total
          </p>
        </div>
        {receita && receita.latestValue !== undefined ? (
          <>
            <p className="text-xl font-bold font-fraunces text-verde-900 tabular-nums leading-tight">
              {formatCompactCurrency(receita.latestValue)}
            </p>
            <p className="text-[10px] text-areia-400 font-jakarta mt-0.5">
              Arrecadada — {receita.timeSeries.at(-1)?.year}
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
              +{formatCompactCurrency(biggestRiser.delta ?? 0)}
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
              {formatCompactCurrency(biggestFaller.delta ?? 0)}
            </p>
          </>
        ) : (
          <p className="text-sm text-areia-400 font-jakarta">—</p>
        )}
      </div>

      {/* ── Despesa Total ── */}
      <div className="rounded-xl border border-areia-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <Receipt size={12} className="text-ouro-500" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-areia-400 font-jakarta">
            Despesa Total
          </p>
        </div>
        {despesa && despesa.latestValue !== undefined ? (
          <>
            <p className="text-xl font-bold font-fraunces text-verde-900 tabular-nums leading-tight">
              {formatCompactCurrency(despesa.latestValue)}
            </p>
            <p className="text-[10px] text-areia-400 font-jakarta mt-0.5">
              Empenhada — {despesa.timeSeries.at(-1)?.year}
            </p>
          </>
        ) : (
          <p className="text-sm text-areia-400 font-jakarta">—</p>
        )}
      </div>
    </div>
  )
}
