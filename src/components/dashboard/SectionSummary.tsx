import { useQueryClient } from '@tanstack/react-query'
import {
  Bank,
  GraduationCap,
  Heartbeat,
  ShieldCheck,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'
import { SECTIONS } from '@/lib/constants/sections'
import { prefetchPathData } from '@/lib/data/client'

interface SectionSummaryProps {
  sectionId: string
  indicatorCount?: number
  className?: string
}

const SECTION_ICONS: Record<string, PhosphorIcon> = {
  'book-open': GraduationCap,
  'heart-pulse': Heartbeat,
  shield: ShieldCheck,
  landmark: Bank,
}

interface SectionTone {
  iconBg: string
  iconText: string
  iconRing: string
  hoverArrow: string
}

const TONES: Record<string, SectionTone> = {
  educacao: {
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
    iconRing: 'ring-blue-100',
    hoverArrow: 'group-hover:text-blue-600',
  },
  saude: {
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
    iconRing: 'ring-emerald-100',
    hoverArrow: 'group-hover:text-emerald-600',
  },
  seguranca: {
    iconBg: 'bg-orange-50',
    iconText: 'text-orange-600',
    iconRing: 'ring-orange-100',
    hoverArrow: 'group-hover:text-orange-600',
  },
  orcamento: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    iconRing: 'ring-amber-100',
    hoverArrow: 'group-hover:text-amber-600',
  },
}

export function SectionSummary({
  sectionId,
  indicatorCount,
  className,
}: SectionSummaryProps) {
  const queryClient = useQueryClient()
  const meta = SECTIONS.find((section) => section.id === sectionId)

  if (!meta) return null

  const SectionIcon = SECTION_ICONS[meta.icon]
  const tone = TONES[meta.id] ?? TONES.educacao

  const handlePrefetch = () => {
    void prefetchPathData(queryClient, meta.href)
  }

  return (
    <Link
      to={meta.href}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      className="group block animate-slide-up"
    >
      <div
        className={cn(
          'relative h-full rounded-xl border border-areia-200 bg-white shadow-sm dark:bg-[#4a5546] dark:border-white/12',
          'transition-all duration-200 ease-out',
          'hover:-translate-y-0.5 hover:shadow-md hover:border-areia-300',
          className,
        )}
      >
        <div className="flex items-start gap-4 p-5">
          <span
            className={cn(
              'flex-shrink-0 inline-flex h-14 w-14 items-center justify-center rounded-xl ring-1 ring-inset',
              tone.iconBg,
              tone.iconText,
              tone.iconRing,
            )}
          >
            <SectionIcon size={32} weight="duotone" />
          </span>

          <div className="flex flex-1 flex-col min-w-0">
            <h3 className="text-[17px] font-semibold font-fraunces text-verde-900 leading-tight tracking-tight">
              {meta.label}
            </h3>
            <p className="mt-1 text-[12px] text-areia-600 font-jakarta leading-snug line-clamp-2">
              {meta.description}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2">
              {indicatorCount !== undefined && indicatorCount > 0 ? (
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-areia-500 font-jakarta">
                  {indicatorCount} {indicatorCount === 1 ? 'indicador' : 'indicadores'}
                </span>
              ) : (
                <span />
              )}
              <svg
                viewBox="0 0 16 16"
                className={cn(
                  'h-4 w-4 text-areia-300 transition-all duration-200',
                  'group-hover:translate-x-0.5',
                  tone.hoverArrow,
                )}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
