import { useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { PageShell, PageContent } from '@/components/layout/PageShell'
import { SectionSelector } from './SectionSelector'
import { SectionHero } from './SectionHero'
import { SectionKpiGrid } from './SectionKpiGrid'
import { EducacaoCharts } from './EducacaoCharts'
import { SaudeCharts } from './SaudeCharts'
import { SegurancaCharts } from './SegurancaCharts'
import { OrcamentoCharts } from './OrcamentoCharts'
import { IndicatorDataTable } from './IndicatorDataTable'
import {
  INDICATOR_SECTION_META,
  INDICATOR_SECTION_IDS,
  type IndicatorSectionId,
} from '@/lib/constants/indicator-sections'
import { SECTIONS } from '@/lib/constants/sections'
import { formatCompactCurrency } from '@/lib/utils/format'
import type { IndicatorSection, TimeSeriesPoint } from '@/types/indicators'

interface IndicadoresPageProps {
  activeSectionId: IndicatorSectionId
  onSectionChange: (sectionId: IndicatorSectionId) => void
  data: Record<IndicatorSectionId, IndicatorSection | null>
}

type KpiItem = {
  id: string
  section: string
  label: string
  value: number | string
  unit: string
  delta?: number
  deltaDirection?: 'up' | 'down' | 'neutral'
  positiveDirection?: 'up' | 'down'
  year: number
  sparklineData?: TimeSeriesPoint[]
  accentColor?: string
}

const SECTION_COLORS: Record<IndicatorSectionId, string[]> = {
  educacao: ['#157244', '#229157', '#44b375', '#F2C230'],
  saude: ['#C7392F', '#229157', '#e67e22', '#157244'],
  seguranca: ['#e67e22', '#C7392F', '#d4a017', '#157244'],
  orcamento: ['#d4a017', '#0f5b36', '#229157', '#F2C230'],
}

function getSectionKpis(
  sectionId: IndicatorSectionId,
  data: IndicatorSection,
): KpiItem[] {
  const colors = SECTION_COLORS[sectionId]

  switch (sectionId) {
    case 'educacao':
      return data.groups.flatMap((group) =>
        group.indicators
          .filter((indicator) => indicator.latestValue !== undefined)
          .map((indicator, idx) => ({
            id: indicator.id,
            section: sectionId,
            label: indicator.label,
            value: indicator.latestValue!,
            unit: indicator.unit,
            delta: indicator.delta,
            deltaDirection: indicator.deltaDirection,
            year: indicator.timeSeries.at(-1)?.year ?? 2023,
            sparklineData: indicator.timeSeries,
            accentColor: colors[idx % colors.length],
          })),
      )
    case 'saude':
      return data.groups.flatMap((group) =>
        group.indicators
          .filter((indicator) => indicator.latestValue !== undefined)
          .map((indicator, idx) => ({
            id: indicator.id,
            section: sectionId,
            label: indicator.label,
            value: indicator.latestValue!,
            unit: indicator.unit,
            delta: indicator.delta,
            deltaDirection: indicator.deltaDirection,
            positiveDirection: indicator.id.includes('mortalidade')
              ? 'down'
              : 'up',
            year: indicator.timeSeries.at(-1)?.year ?? 2023,
            sparklineData: indicator.timeSeries,
            accentColor: colors[idx % colors.length],
          })),
      )
    case 'seguranca':
      return data.groups.flatMap((group) =>
        group.indicators
          .filter((indicator) => indicator.latestValue !== undefined)
          .map((indicator, idx) => ({
            id: indicator.id,
            section: sectionId,
            label: indicator.label,
            value: indicator.latestValue!,
            unit: indicator.unit,
            delta: indicator.delta,
            deltaDirection: indicator.deltaDirection,
            positiveDirection: 'down',
            year: indicator.timeSeries.at(-1)?.year ?? 2023,
            sparklineData: indicator.timeSeries,
            accentColor: colors[idx % colors.length],
          })),
      )
    case 'orcamento':
      return data.groups.flatMap((group) =>
        group.indicators
          .filter((indicator) => indicator.latestValue !== undefined)
          .map((indicator, idx) => ({
            id: indicator.id,
            section: sectionId,
            label: indicator.label,
            value: formatCompactCurrency(indicator.latestValue!),
            unit: '',
            delta: indicator.delta,
            deltaDirection: indicator.deltaDirection,
            year: indicator.timeSeries.at(-1)?.year ?? 2023,
            sparklineData: indicator.timeSeries,
            accentColor: colors[idx % colors.length],
          })),
      )
  }
}

const SECTION_OPTIONS = INDICATOR_SECTION_IDS.map((id) => ({
  id,
  label: INDICATOR_SECTION_META[id].title,
  description: SECTIONS.find((s) => s.id === id)?.description ?? '',
}))

export function IndicadoresPage({
  activeSectionId,
  onSectionChange,
  data,
}: IndicadoresPageProps) {
  const meta = INDICATOR_SECTION_META[activeSectionId]
  const activeData = data[activeSectionId]

  const allIndicators = useMemo(() => {
    if (!activeData) return []
    return activeData.groups.flatMap((g) => g.indicators)
  }, [activeData])

  const kpis = useMemo(
    () => (activeData ? getSectionKpis(activeSectionId, activeData) : []),
    [activeSectionId, activeData],
  )

  const lastUpdated = activeData?.lastUpdated
    ? new Date(activeData.lastUpdated).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : undefined

  return (
    <PageShell>
      <Header
        title="Indicadores"
        subtitle="Selecione uma área temática para explorar os indicadores do Estado do Acre"
      />

      <PageContent>
        <section className="mb-6">
          <SectionSelector
            sections={SECTION_OPTIONS}
            activeSectionId={activeSectionId}
            onChange={onSectionChange}
          />
        </section>

        <SectionHero
          title={meta.title}
          subtitle={meta.subtitle}
          lastUpdated={lastUpdated}
        />

        {kpis.length > 0 && (
          <div className="mt-6">
            <SectionKpiGrid kpis={kpis} />
          </div>
        )}

        <div className="mt-6" style={{ minHeight: 200 }}>
          {activeData ? (
            <>
              {activeSectionId === 'educacao' && <EducacaoCharts data={activeData} />}
              {activeSectionId === 'saude' && <SaudeCharts data={activeData} />}
              {activeSectionId === 'seguranca' && <SegurancaCharts data={activeData} />}
              {activeSectionId === 'orcamento' && <OrcamentoCharts data={activeData} />}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-4xl mb-3 opacity-30">📊</span>
              <p className="text-sm text-areia-400 font-jakarta">
                Dados não disponíveis. Verifique o arquivo{' '}
                <code className="bg-areia-200 rounded px-1.5 py-0.5 text-xs">
                  {meta.missingDataPath}
                </code>.
              </p>
            </div>
          )}
        </div>

        {allIndicators.length > 0 && (
          <div className="mt-8">
            <IndicatorDataTable
              indicators={allIndicators}
              sectionId={activeSectionId}
            />
          </div>
        )}
      </PageContent>
    </PageShell>
  )
}
