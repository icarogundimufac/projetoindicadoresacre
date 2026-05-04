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
  className?: string
}

const SECTION_ICONS: Record<IndicatorSectionId, PhosphorIcon> = {
  educacao: GraduationCap,
  saude: Heartbeat,
  seguranca: ShieldCheck,
  orcamento: Bank,
}

const SECTION_STYLES: Record<
  IndicatorSectionId,
  { ring: string; bg: string; bgActive: string; iconBg: string; iconText: string; iconBgActive: string; accent: string }
> = {
  educacao: {
    ring: 'ring-blue-200 dark:ring-blue-400/30',
    bg: 'bg-white dark:bg-[#4a5546]',
    bgActive: 'bg-blue-50 dark:bg-blue-900/20',
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconText: 'text-blue-600 dark:text-blue-400',
    iconBgActive: 'bg-blue-100 dark:bg-blue-800/40',
    accent: 'bg-blue-600 dark:bg-blue-400',
  },
  saude: {
    ring: 'ring-emerald-200 dark:ring-emerald-400/30',
    bg: 'bg-white dark:bg-[#4a5546]',
    bgActive: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    iconBgActive: 'bg-emerald-100 dark:bg-emerald-800/40',
    accent: 'bg-emerald-600 dark:bg-emerald-400',
  },
  seguranca: {
    ring: 'ring-orange-200 dark:ring-orange-400/30',
    bg: 'bg-white dark:bg-[#4a5546]',
    bgActive: 'bg-orange-50 dark:bg-orange-900/20',
    iconBg: 'bg-orange-50 dark:bg-orange-900/30',
    iconText: 'text-orange-600 dark:text-orange-400',
    iconBgActive: 'bg-orange-100 dark:bg-orange-800/40',
    accent: 'bg-orange-600 dark:bg-orange-400',
  },
  orcamento: {
    ring: 'ring-amber-200 dark:ring-amber-400/30',
    bg: 'bg-white dark:bg-[#4a5546]',
    bgActive: 'bg-amber-50 dark:bg-amber-900/20',
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconText: 'text-amber-600 dark:text-amber-400',
    iconBgActive: 'bg-amber-100 dark:bg-amber-800/40',
    accent: 'bg-amber-600 dark:bg-amber-400',
  },
}

export function SectionSelector({
  sections,
  activeSectionId,
  onChange,
  className,
}: SectionSelectorProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-[repeat(4,minmax(max-content,1fr))] lg:gap-2.5', className)}>
      {sections.map((section) => {
        const isActive = section.id === activeSectionId
        const style = SECTION_STYLES[section.id]
        const Icon = SECTION_ICONS[section.id]

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            aria-pressed={isActive}
            aria-label={`${section.label}: ${section.description}`}
            className={cn(
              'group relative flex h-14 min-w-max items-center gap-3 overflow-hidden rounded-lg border px-3.5 py-2.5 text-left transition-all duration-300 motion-reduce:transition-none',
              'hover:border-areia-300 hover:bg-white/90 hover:shadow-sm hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
              'active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-500 focus-visible:ring-offset-2 focus-visible:ring-offset-areia-100',
              'dark:focus-visible:ring-ouro-400 dark:focus-visible:ring-offset-[var(--seplan-night-bg)]',
              isActive && 'pr-8',
              isActive
                ? cn(
                    'border-transparent shadow-sm ring-1 ring-inset',
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
                'absolute inset-y-1.5 left-1 w-0.5 rounded-full opacity-0 transition-all duration-300 ease-out',
                'scale-y-0 origin-top motion-reduce:transition-none',
                isActive && 'opacity-100 scale-y-100',
                style.accent,
              )}
            />
            <span
              className={cn(
                'ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1 ring-inset transition-all duration-300',
                isActive
                  ? cn(style.iconBgActive, style.iconText, style.ring)
                  : cn(style.iconBg, style.iconText, style.ring),
              )}
            >
              <Icon size={20} weight={isActive ? 'duotone' : 'regular'} />
            </span>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'whitespace-nowrap text-sm font-semibold font-jakarta leading-none transition-all duration-300',
                  isActive
                    ? 'text-verde-950 dark:text-ouro-100'
                    : 'text-areia-700 dark:text-areia-200',
                )}
              >
                {section.label}
              </p>
              <p
                className={cn(
                  'sr-only',
                  isActive
                    ? 'text-areia-600 dark:text-areia-300'
                    : 'text-areia-400 dark:text-areia-500',
                )}
              >
                {section.description}
              </p>
            </div>

            {isActive && (
              <span className="absolute right-3 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-verde-600 text-white dark:bg-ouro-400 dark:text-verde-950 animate-fade-in">
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  className="h-2.5 w-2.5"
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
