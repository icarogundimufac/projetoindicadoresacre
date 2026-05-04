import { TrendingUp, TrendingDown, GraduationCap, BookOpen } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import type { IndicatorSection } from '@/types/indicators'

interface EducacaoKpisProps {
  data: IndicatorSection
}

export function EducacaoKpis({ data }: EducacaoKpisProps) {
  const indicatorsWithSeries = data.groups
    .flatMap((g) => g.indicators)
    .filter((ind) => ind.timeSeries && ind.timeSeries.length > 0)

  if (indicatorsWithSeries.length === 0) return null

  // ── Card esquerdo: Total de Matrículas ──
  const matriculas = data.groups
    .find((g) => g.id === 'matriculas')
    ?.indicators.find((ind) => ind.id === 'matriculas_total')

  // ── Card direito: Taxa de Analfabetismo ──
  const analfabetismo = data.groups
    .find((g) => g.id === 'alfabetizacao')
    ?.indicators.find((ind) => ind.id === 'taxa_analfabetismo')

  // Maior alta / maior queda (mesma lógica do SectionKpis)
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
      {/* ── Total de Matrículas ── */}
      <div className="rounded-xl border border-areia-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <GraduationCap size={12} className="text-verde-700" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-areia-400 font-jakarta">
            Matrículas
          </p>
        </div>
        {matriculas && matriculas.latestValue !== undefined ? (
          <>
            <p className="text-xl font-bold font-fraunces text-verde-900 tabular-nums leading-tight">
              {formatNumber(matriculas.latestValue)}
            </p>
            <p className="text-[10px] text-areia-400 font-jakarta mt-0.5">
              {matriculas.unit} — {matriculas.timeSeries.at(-1)?.year}
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

      {/* ── Taxa de Analfabetismo ── */}
      <div className="rounded-xl border border-areia-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <BookOpen size={12} className="text-verde-700" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-areia-400 font-jakarta">
            Analfabetismo
          </p>
        </div>
        {analfabetismo ? (
          <>
            <p className="text-xl font-bold font-fraunces text-verde-900 tabular-nums leading-tight">
              {analfabetismo.latestValue}%
            </p>
            <p className="text-[10px] text-areia-400 font-jakarta mt-0.5">
              Pop. 15+ anos — {analfabetismo.timeSeries.at(-1)?.year}
            </p>
          </>
        ) : (
          <p className="text-sm text-areia-400 font-jakarta">—</p>
        )}
      </div>
    </div>
  )
}
