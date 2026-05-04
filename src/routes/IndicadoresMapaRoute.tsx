import { useOutletContext } from 'react-router-dom'
import { IndicadoresMapa } from '@/components/sections/IndicadoresMapa'
import type { IndicadoresOutletContext } from '@/components/layout/IndicadoresLayout'

export function IndicadoresMapaRoute() {
  const { activeSectionId, data, isLoading } = useOutletContext<IndicadoresOutletContext>()

  return (
    <IndicadoresMapa
      activeSectionId={activeSectionId}
      data={data}
      isLoading={isLoading}
    />
  )
}