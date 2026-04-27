import {
  GraduationCap,
  Heartbeat,
  ShieldCheck,
  Bank,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import type { IndicatorSectionId } from '@/lib/constants/indicator-sections'

interface SectionOption {
  id: IndicatorSectionId
  label: string
  description: string
}

interface SectionSelectorProps {
  sections: SectionOption[]
  activeSectionId: IndicatorSectionId
  onChange: (sectionId: IndicatorSectionId) => void
}

const SECTION_ICONS: Record<IndicatorSectionId, PhosphorIcon> = {
  educacao: GraduationCap,
  saude: Heartbeat,
  seguranca: ShieldCheck,
  orcamento: Bank,
}

const SECTION_STYLES: Record<
  IndicatorSectionId,
  { ring: string; bg: string; bgActive: string; iconBg: string; iconText: string; iconBgActive: string }
> = {
  educacao: {
    ring: 'ring-blue-200 dark:ring-blue-400/30',
    bg: 'bg-white dark:bg-[#4a5546]',
    bgActive: 'bg-blue-50 dark:bg-blue-900/20',
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconText: 'text-blue-600 dark:text-blue-400',
    iconBgActive: 'bg-blue-100 dark:bg-blue-800/40',
  },
  saude: {
    ring: 'ring-emerald-200 dark:ring-emerald-400/30',
    bg: 'bg-white dark:bg-[#4a5546]',
    bgActive: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    iconBgActive: 'bg-emerald-100 dark:bg-emerald-800/40',
  },
  seguranca: {
    ring: 'ring-orange-200 dark:ring-orange-400/30',
    bg: 'bg-white dark:bg-[#4a5546]',
    bgActive: 'bg-orange-50 dark:bg-orange-900/20',
    iconBg: 'bg-orange-50 dark:bg-orange-900/30',
    iconText: 'text-orange-600 dark:text-orange-400',
    iconBgActive: 'bg-orange-100 dark:bg-orange-800/40',
  },
  orcamento: {
    ring: 'ring-amber-200 dark:ring-amber-400/30',
    bg: 'bg-white dark:bg-[#4a5546]',
    bgActive: 'bg-amber-50 dark:bg-amber-900/20',
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconText: 'text-amber-600 dark:text-amber-400',
    iconBgActive: 'bg-amber-100 dark:bg-amber-800/40',
  },
}

export function SectionSelector({
  sections,
  activeSectionId,
  onChange,
}: SectionSelectorProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {sections.map((section) => {
        const isActive = section.id === activeSectionId
        const style = SECTION_STYLES[section.id]
        const Icon = SECTION_ICONS[section.id]

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            className={cn(
              'group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200',
              'hover:-translate-y-0.5 hover:shadow-md',
              isActive
                ? cn(
                    'border-2 shadow-sm',
                    style.bgActive,
                    style.ring,
                  )
                : cn(
                    'border-areia-200 dark:border-white/12',
                    style.bg,
                    'hover:border-areia-300 dark:hover:border-white/20',
                  ),
            )}
          >
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset transition-colors',
                isActive
                  ? cn(style.iconBgActive, style.iconText, style.ring)
                  : cn(style.iconBg, style.iconText, style.ring),
              )}
            >
              <Icon size={22} weight={isActive ? 'duotone' : 'regular'} />
            </span>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-sm font-semibold font-jakarta leading-tight transition-colors',
                  isActive
                    ? 'text-verde-950 dark:text-ouro-100'
                    : 'text-areia-700 dark:text-areia-200',
                )}
              >
                {section.label}
              </p>
              <p
                className={cn(
                  'mt-0.5 text-[11px] leading-snug font-jakarta line-clamp-2 transition-colors',
                  isActive
                    ? 'text-areia-600 dark:text-areia-300'
                    : 'text-areia-400 dark:text-areia-500',
                )}
              >
                {section.description}
              </p>
            </div>

            {isActive && (
              <span className="absolute -top-px -right-px flex h-5 w-5 items-center justify-center rounded-bl-lg rounded-tr-xl bg-verde-600 text-white">
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  className="h-3 w-3"
                >
                  <path
                    d="M3.5 8.5l3 3 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
