import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { IndicadoresPage } from '@/components/sections/IndicadoresPage'
import {
  INDICATOR_SECTION_IDS,
  isIndicatorSectionId,
  type IndicatorSectionId,
} from '@/lib/constants/indicator-sections'
import { portalDataClient, queryKeys } from '@/lib/data/client'
import type { IndicatorSection } from '@/types/indicators'

const DEFAULT_SECTION: IndicatorSectionId = 'educacao'

export function IndicadoresRoute() {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawSeção = searchParams.get('secao') ?? DEFAULT_SECTION
  const activeSectionId: IndicatorSectionId = isIndicatorSectionId(rawSeção)
    ? rawSeção
    : DEFAULT_SECTION

  useEffect(() => {
    if (!isIndicatorSectionId(rawSeção)) {
      setSearchParams({ secao: DEFAULT_SECTION }, { replace: true })
    }
  }, [rawSeção, setSearchParams])

  const sectionQueries = useQueries({
    queries: INDICATOR_SECTION_IDS.map((sectionId) => ({
      queryKey: queryKeys.section(sectionId),
      queryFn: () => portalDataClient.getSection(sectionId),
    })),
  })

  const data = Object.fromEntries(
    INDICATOR_SECTION_IDS.map((sectionId, index) => [
      sectionId,
      sectionQueries[index].data ?? null,
    ]),
  ) as Record<IndicatorSectionId, IndicatorSection | null>

  const handleSectionChange = useCallback(
    (sectionId: IndicatorSectionId) => {
      setSearchParams({ secao: sectionId }, { replace: true })
    },
    [setSearchParams],
  )

  return (
    <IndicadoresPage
      activeSectionId={activeSectionId}
      onSectionChange={handleSectionChange}
      data={data}
    />
  )
}
