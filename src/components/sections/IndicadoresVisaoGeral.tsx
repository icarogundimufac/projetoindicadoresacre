import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { EducacaoCharts } from './EducacaoCharts'
import { SaudeCharts } from './SaudeCharts'
import { SegurancaCharts } from './SegurancaCharts'
import { OrcamentoCharts } from './OrcamentoCharts'
import { IndicatorDataTable } from './IndicatorDataTable'
import { EducacaoKpis } from './EducacaoKpis'
import { SaudeKpis } from './SaudeKpis'
import { SegurancaKpis } from './SegurancaKpis'
import { OrcamentoKpis } from './OrcamentoKpis'
import type { IndicatorSectionId } from '@/lib/constants/indicator-sections'
import type { IndicatorSection, IndicatorGroup } from '@/types/indicators'
import type { IndicadoresOutletContext } from '@/components/layout/IndicadoresLayout'

export function IndicadoresVisaoGeral() {
  const { activeSectionId, data } = useOutletContext<IndicadoresOutletContext>()

  const activeData = data[activeSectionId]

  const allIndicators = useMemo(() => {
    if (!activeData) return []
    return activeData.groups.flatMap((g: IndicatorGroup) => g.indicators)
  }, [activeData])

  return (
    <div key={activeSectionId} className="animate-fade-in motion-reduce:animate-none">
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
              Dados não disponíveis para esta seção.
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
  )
}