import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatNumber } from '@/lib/utils/format'
import { Users, Ruler, Trophy, MapPin } from 'lucide-react'
import type { MunicipioDashboardData } from '@/types/municipio-dashboard'
import { cn } from '@/lib/utils/cn'

interface MunicipioSummaryCardsProps {
  data: MunicipioDashboardData
  compact?: boolean
}

interface SummaryItem {
  label: string
  value: string | number
  unit?: string
  icon: React.ElementType
  isIdhm?: boolean
  idhmValue?: number
}

function getIdhmBadge(idhm: number): { text: string; variant: 'green' | 'amber' | 'default' } {
  if (idhm >= 0.7) return { text: 'Alto', variant: 'green' }
  if (idhm >= 0.6) return { text: 'Médio', variant: 'amber' }
  return { text: 'Baixo', variant: 'default' }
}

function getIdhmColor(idhm: number): string {
  if (idhm >= 0.7) return 'text-verde-600'
  if (idhm >= 0.6) return 'text-ouro-500'
  return 'text-areia-500'
}

export function MunicipioSummaryCards({ data, compact = false }: MunicipioSummaryCardsProps) {
  const items: SummaryItem[] = [
    { label: 'População', value: data.populacao, unit: 'hab', icon: Users },
    { label: 'Área', value: data.area, unit: 'km²', icon: Ruler },
    { label: 'IDHM', value: data.idhm.toFixed(3), unit: '', icon: Trophy, isIdhm: true, idhmValue: data.idhm },
    {
      label: 'Distância à Capital',
      value: data.distanciaCapital === 0 ? 'Capital' : `${formatNumber(data.distanciaCapital)} km`,
      icon: MapPin,
    },
  ]

  // Compact mode: no icons, 2x2 grid, minimal padding
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-lg border border-areia-200 p-2.5 flex flex-col justify-between"
          >
            <p className="text-[9px] font-bold uppercase tracking-widest text-areia-400 font-jakarta leading-tight">
              {item.label}
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <p
                className={cn(
                  'text-base font-bold font-fraunces tabular-nums truncate leading-tight',
                  item.isIdhm && item.idhmValue !== undefined
                    ? getIdhmColor(item.idhmValue)
                    : 'text-verde-900',
                )}
              >
                {item.value}
              </p>
              {item.isIdhm && item.idhmValue !== undefined && (
                <Badge
                  variant={getIdhmBadge(item.idhmValue).variant}
                  className="flex-shrink-0 text-[9px] px-1 py-0 leading-none"
                >
                  {getIdhmBadge(item.idhmValue).text}
                </Badge>
              )}
            </div>
            {item.unit && (
              <p className="text-[9px] text-areia-400 font-jakarta leading-tight mt-0.5">{item.unit}</p>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Default mode: with icons, 4 columns
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-verde-50 text-verde-600 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-areia-400 font-jakarta">
                  {item.label}
                </p>
                <div className="flex items-center gap-1.5">
                  <p
                    className={cn(
                      'text-xl font-bold font-fraunces tabular-nums truncate',
                      item.isIdhm && item.idhmValue !== undefined
                        ? getIdhmColor(item.idhmValue)
                        : 'text-verde-900',
                    )}
                  >
                    {item.value}
                  </p>
                  {item.isIdhm && item.idhmValue !== undefined && (
                    <Badge variant={getIdhmBadge(item.idhmValue).variant} className="flex-shrink-0 text-[10px]">
                      {getIdhmBadge(item.idhmValue).text}
                    </Badge>
                  )}
                </div>
                {item.unit && (
                  <p className="text-[10px] text-areia-400 font-jakarta">{item.unit}</p>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
