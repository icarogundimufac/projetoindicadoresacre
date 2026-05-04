import { useMemo } from 'react'
import { PageShell, PageContent } from '@/components/layout/PageShell'
import { SectionSelector } from './SectionSelector'
import { EducacaoCharts } from './EducacaoCharts'
import { SaudeCharts } from './SaudeCharts'
import { SegurancaCharts } from './SegurancaCharts'
import { OrcamentoCharts } from './OrcamentoCharts'
import { IndicatorDataTable } from './IndicatorDataTable'
import { SectionKpis } from './SectionKpis'
import { EducacaoKpis } from './EducacaoKpis'
import { SaudeKpis } from './SaudeKpis'
import { SegurancaKpis } from './SegurancaKpis'
import { OrcamentoKpis } from './OrcamentoKpis'
import {
  INDICATOR_SECTION_META,
  INDICATOR_SECTION_IDS,
  type IndicatorSectionId,
} from '@/lib/constants/indicator-sections'
import { SECTIONS } from '@/lib/constants/sections'
import type { IndicatorSection } from '@/types/indicators'

interface IndicadoresPageProps {
  activeSectionId: IndicatorSectionId
  onSectionChange: (sectionId: IndicatorSectionId) => void
  data: Record<IndicatorSectionId, IndicatorSection | null>
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

  return (
    <PageShell>
      <section className="w-full border-b border-areia-200 px-4 pt-4 pb-5 sm:px-6 lg:px-8 dark:border-ouro-400/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 border-l-2 border-verde-500 pl-3 dark:border-ouro-400 lg:max-w-sm">
            <h1 className="mt-1 text-[clamp(1.1rem,1.6vw,1.55rem)] font-semibold tracking-[-0.04em] text-verde-950 font-fraunces leading-[0.98]">
              Indicadores
            </h1>
            <p className="mt-1 max-w-3xl text-[11px] leading-4 text-areia-500 font-jakarta dark:text-areia-300">
              Selecione uma área temática para explorar os indicadores do Estado do Acre
            </p>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[560px] lg:max-w-[680px] lg:pt-0.5">
            <SectionSelector
              sections={SECTION_OPTIONS}
              activeSectionId={activeSectionId}
              onChange={onSectionChange}
            />
          </div>
        </div>
      </section>

      <PageContent>
        <div
          key={activeSectionId}
          className="animate-fade-in motion-reduce:animate-none"
        >
          {activeData && (
            <div
              className="mt-1 animate-slide-up motion-reduce:animate-none"
              style={{ animationDelay: '80ms' }}
            >
              {activeSectionId === 'educacao' && <EducacaoKpis data={activeData} />}
              {activeSectionId === 'saude' && <SaudeKpis data={activeData} />}
              {activeSectionId === 'seguranca' && <SegurancaKpis data={activeData} />}
              {activeSectionId === 'orcamento' && <OrcamentoKpis data={activeData} />}
            </div>
          )}

          <div
            className="mt-3 animate-slide-up motion-reduce:animate-none"
            style={{ minHeight: 200, animationDelay: '100ms' }}
          >
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
            <div
              className="mt-5 animate-slide-up motion-reduce:animate-none"
              style={{ animationDelay: '200ms' }}
            >
              <IndicatorDataTable
                indicators={allIndicators}
                sectionId={activeSectionId}
              />
            </div>
          )}
        </div>
      </PageContent>
    </PageShell>
  )
}
