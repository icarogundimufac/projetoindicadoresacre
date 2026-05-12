import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Outlet, useLocation } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { PageShell, PageContent } from '@/components/layout/PageShell'
import {
  PerspectivePillSidebar,
  loadPerspectiveSidebarCollapsed,
  savePerspectiveSidebarCollapsed,
} from '@/components/layout/PerspectivePillSidebar'
import { SectionSelector } from '@/components/sections/SectionSelector'
import { cn } from '@/lib/utils/cn'
import {
  INDICATOR_SECTION_IDS,
  INDICATOR_SECTION_META,
  isIndicatorSectionId,
  type IndicatorSectionId,
} from '@/lib/constants/indicator-sections'
import { SECTIONS } from '@/lib/constants/sections'
import { portalDataClient, queryKeys } from '@/lib/data/client'
import type { IndicatorSection } from '@/types/indicators'

const DEFAULT_SECTION: IndicatorSectionId = 'educacao'

export interface IndicadoresOutletContext {
  activeSectionId: IndicatorSectionId
  onSectionChange: (sectionId: IndicatorSectionId) => void
  data: Record<IndicatorSectionId, IndicatorSection | null>
  isLoading: boolean
}

export function IndicadoresLayout() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    loadPerspectiveSidebarCollapsed,
  )

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      savePerspectiveSidebarCollapsed(next)
      return next
    })
  }

  const rawSecao = searchParams.get('secao') ?? DEFAULT_SECTION
  const activeSectionId: IndicatorSectionId = isIndicatorSectionId(rawSecao)
    ? rawSecao
    : DEFAULT_SECTION

  const isMapaRoute = location.pathname === '/indicadores/mapa' || location.pathname.startsWith('/indicadores/mapa')

  useEffect(() => {
    if (!isIndicatorSectionId(rawSecao)) {
      setSearchParams({ secao: DEFAULT_SECTION }, { replace: true })
    }
  }, [rawSecao, setSearchParams])

  const sectionQueries = useQueries({
    queries: INDICATOR_SECTION_IDS.map((sectionId) => ({
      queryKey: queryKeys.section(sectionId),
      queryFn: () => portalDataClient.getSection(sectionId),
    })),
  })

  const isLoading = sectionQueries.some((q) => q.isLoading)

  const dataKey = sectionQueries.map((q) => q.dataUpdatedAt).join(',')
  const data = useMemo(
    () =>
      Object.fromEntries(
        INDICATOR_SECTION_IDS.map((sectionId, index) => [
          sectionId,
          sectionQueries[index].data ?? null,
        ]),
      ) as Record<IndicatorSectionId, IndicatorSection | null>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataKey],
  )

  const handleSectionChange = (sectionId: IndicatorSectionId) => {
    setSearchParams({ secao: sectionId }, { replace: true })
  }

  const outletContext: IndicadoresOutletContext = useMemo(
    () => ({
      activeSectionId,
      onSectionChange: handleSectionChange,
      data,
      isLoading,
    }),
    [activeSectionId, data, isLoading],
  )

  return (
    <PageShell>
      <PerspectivePillSidebar
        variant="fixed"
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
      />
      <div className="flex min-h-screen">
        <main
          className={cn(
            'min-w-0 flex-1 transition-[padding] duration-300 ease-out',
            sidebarCollapsed ? 'md:pl-[64px]' : 'md:pl-[200px]',
          )}
        >
          <section className="w-full border-b border-areia-200 px-4 pt-4 pb-5 sm:px-6 lg:px-8 dark:border-ouro-400/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 border-l-2 border-verde-500 pl-3 dark:border-ouro-400 lg:max-w-sm overflow-visible">
                <div className="flex items-center gap-2 flex-wrap overflow-visible">
                  <h1 className="mt-1 text-[clamp(1.1rem,1.6vw,1.55rem)] font-semibold tracking-[-0.04em] text-verde-950 font-fraunces leading-[0.98]">
                    Indicadores
                  </h1>
                  <PerspectivePillSidebar variant="inline" />
                </div>
                <p className="mt-1 max-w-3xl text-[11px] leading-4 text-areia-500 font-jakarta dark:text-areia-300">
                  Selecione uma área temática para explorar os indicadores do Estado do Acre
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {!isMapaRoute && (
                  <div className="w-full lg:w-auto lg:min-w-[560px] lg:max-w-[680px] lg:pt-0.5">
                    <SectionSelector
                      sections={INDICATOR_SECTION_IDS.map((id) => ({
                        id,
                        label: INDICATOR_SECTION_META[id].title,
                        description: SECTIONS.find((s) => s.id === id)?.description ?? '',
                      }))}
                      activeSectionId={activeSectionId}
                      onChange={handleSectionChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          <PageContent>
            <Outlet context={outletContext} />
          </PageContent>
        </main>
      </div>
    </PageShell>
  )
}