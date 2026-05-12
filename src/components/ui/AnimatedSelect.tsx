import { useCallback, useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SelectGroup<T extends string> {
  label?: string
  options: { key: T; label: string; icon?: React.ReactNode }[]
}

export interface AnimatedSelectProps<T extends string> {
  value: T
  onChange: (value: T) => void
  groups: SelectGroup<T>[]
  icon?: React.ReactNode
  placeholder?: string
  className?: string
  triggerClassName?: string
  iconClassName?: string
  /** Visual preset. */
  variant?: 'default' | 'primary' | 'ghost' | 'modern' | 'premium' | 'card'
  ariaLabel?: string
  /** Optional badge rendered next to the selected label. */
  badge?: React.ReactNode
}

const variantStyles = {
  default: {
    trigger:
      'bg-white border-areia-200 text-areia-800 hover:border-verde-400 dark:bg-[#4a5546] dark:border-white/12 dark:text-areia-100',
    icon: 'bg-verde-100 text-verde-700 dark:bg-verde-900/40 dark:text-verde-300',
    chevron: 'text-areia-400',
    chevronOpen: 'text-verde-600',
  },
  primary: {
    trigger:
      'bg-gradient-to-r from-verde-600 to-verde-700 border-transparent text-white hover:from-verde-500 hover:to-verde-600 shadow-lg shadow-verde-700/30 hover:shadow-xl hover:shadow-verde-600/40 hover:-translate-y-0.5',
    icon: 'bg-white/20 text-white ring-1 ring-white/30',
    chevron: 'text-white/80',
    chevronOpen: 'text-white',
  },
  modern: {
    trigger:
      'bg-white border-verde-500/60 text-verde-900 hover:border-verde-500 hover:shadow-lg hover:shadow-verde-500/15 hover:-translate-y-0.5 dark:bg-[#4a5546] dark:border-verde-400/40 dark:text-verde-100 dark:hover:border-verde-400',
    icon: 'bg-verde-100 text-verde-700 dark:bg-verde-900/40 dark:text-verde-300',
    chevron: 'text-verde-500',
    chevronOpen: 'text-verde-700',
  },
  ghost: {
    trigger:
      'bg-transparent border-transparent text-areia-600 hover:bg-areia-100 hover:text-areia-800 dark:text-areia-300 dark:hover:bg-white/5 dark:hover:text-areia-100',
    icon: 'bg-areia-100 text-areia-600 dark:bg-white/10 dark:text-areia-300',
    chevron: 'text-areia-400',
    chevronOpen: 'text-verde-600',
  },
  premium: {
    trigger:
      'bg-verde-800 border-verde-800 text-white hover:bg-verde-700 hover:border-verde-700 shadow-sm dark:bg-verde-900 dark:border-verde-800 dark:hover:bg-verde-800',
    icon: 'bg-white/25 text-white/95',
    chevron: 'text-white/70',
    chevronOpen: 'text-white',
  },
  card: {
    trigger: '', // handled inline
    icon: '',    // handled inline
    chevron: 'text-areia-400',
    chevronOpen: 'text-verde-600',
  },
}

export function AnimatedSelect<T extends string>({
  value,
  onChange,
  groups,
  icon,
  placeholder = 'Selecionar…',
  className,
  triggerClassName,
  iconClassName,
  variant = 'default',
  ariaLabel,
  badge,
}: AnimatedSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = groups
    .flatMap((g) => g.options.map((o) => ({ ...o, groupLabel: g.label })))
    .find((o) => o.key === value)

  const selectedLabel = selectedOption?.label ?? placeholder
  const selectedGroupLabel = selectedOption?.groupLabel ?? ''

  const handleSelect = useCallback(
    (key: T) => {
      onChange(key)
      setIsOpen(false)
    },
    [onChange],
  )

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen])

  const v = variantStyles[variant]

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      {variant === 'card' ? (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel}
          className={cn(
            'group flex w-full items-center gap-2.5 rounded-xl border border-areia-200/80',
            'bg-white py-2 px-3 text-left shadow-sm shadow-areia-900/5',
            'transition-all duration-300 ease-out',
            'hover:shadow-md hover:shadow-areia-900/10 hover:-translate-y-0.5',
            'cursor-pointer select-none',
            isOpen && 'ring-2 ring-verde-500/30 border-verde-500',
            triggerClassName,
          )}
        >
          {icon && (
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                'bg-verde-50 text-verde-600 transition-colors duration-200',
                iconClassName,
              )}
            >
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1 overflow-hidden">
            <p
              className="truncate text-[11px] font-bold font-jakarta text-verde-950 leading-tight"
              title={selectedLabel}
            >
              {selectedLabel}
            </p>
            {selectedGroupLabel && (
              <p
                className="truncate text-[9px] font-medium font-jakarta text-areia-400 leading-tight mt-0.5"
                title={selectedGroupLabel}
              >
                {selectedGroupLabel}
              </p>
            )}
          </div>
          {badge && <span className="shrink-0">{badge}</span>}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center">
            <svg
              className={cn(
                'h-4 w-4 text-areia-400 transition-transform duration-300 ease-out',
                isOpen ? 'rotate-180 text-verde-600' : 'rotate-0',
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel}
          className={cn(
            // Layout & shape
            'group inline-flex items-center gap-2.5 w-full min-w-0 rounded-xl border',
            'pl-3 pr-9 py-2.5 text-left',
            'transition-all duration-200 ease-out',
            'cursor-pointer select-none',
            // Open state
            isOpen && 'ring-2 ring-verde-500/30 border-verde-500',
            // Variant colours
            v.trigger,
            // Custom overrides
            triggerClassName,
          )}
        >
          {icon && (
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
                v.icon,
                iconClassName,
              )}
            >
              {icon}
            </span>
          )}
          <span className="truncate text-[13px] font-bold font-jakarta tracking-wide leading-none">
            {selectedLabel}
          </span>
          {badge && (
            <span className="shrink-0 ml-0.5">
              {badge}
            </span>
          )}

          {/* Chevron */}
          <svg
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform duration-200',
              isOpen ? 'rotate-180 ' + v.chevronOpen : v.chevron,
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Dropdown */}
      <div
        className={cn(
          'absolute top-full left-0 mt-1.5 z-[9999] w-full min-w-0',
          'rounded-xl border border-areia-200/80 bg-white shadow-xl shadow-areia-900/10',
          'dark:bg-[#3d4739] dark:border-white/10',
          'origin-top-left',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-[0.96] -translate-y-2 pointer-events-none',
          'transition-all duration-200 ease-out',
        )}
        role="listbox"
        aria-activedescendant={value}
      >
        <div className="py-1.5 max-h-[320px] overflow-y-auto no-scrollbar">
          {groups.map((group, groupIndex) => (
            <div key={group.label ?? `group-${groupIndex}`}>
              {group.label && (
                <div className="px-3 py-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-verde-700 dark:text-verde-400 font-jakarta">
                    {group.label}
                  </p>
                </div>
              )}
              {group.options.map((option, optionIndex) => {
                const isSelected = option.key === value
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.key)}
                    className={cn(
                      'group/value relative w-full text-left',
                      'px-3 py-2.5 text-[13px] font-jakarta',
                      'flex items-center gap-2.5 rounded-lg mx-1.5 my-0.5',
                      'transition-all duration-150 ease-out',
                      'border-none bg-transparent',
                      'cursor-pointer select-none',
                      // Left accent bar via pseudo-element simulation
                      isSelected
                        ? 'bg-verde-50/80 text-verde-800 font-semibold dark:bg-verde-900/30 dark:text-verde-300'
                        : 'text-areia-700 hover:bg-areia-50/60 dark:text-areia-200 dark:hover:bg-white/5',
                    )}
                    style={{
                      animationDelay: isOpen ? `${optionIndex * 25}ms` : '0ms',
                    }}
                  >
                    {/* Left accent bar */}
                    <span
                      className={cn(
                        'absolute left-0 top-1/2 -translate-y-1/2',
                        'w-[3px] h-[60%] rounded-r-full',
                        'transition-all duration-200 ease-out',
                        isSelected
                          ? 'bg-verde-500 opacity-100'
                          : 'bg-verde-400 opacity-0 group-hover/value:opacity-100',
                      )}
                    />

                    {option.icon && (
                      <span className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center transition-colors duration-150',
                        isSelected
                          ? 'text-verde-600 dark:text-verde-400'
                          : 'text-areia-400 dark:text-areia-500 group-hover/value:text-verde-500',
                      )}>
                        {option.icon}
                      </span>
                    )}
                    <span className="flex-1 truncate">{option.label}</span>
                    {isSelected && (
                      <Check
                        size={12}
                        strokeWidth={2.5}
                        className="shrink-0 text-verde-600 dark:text-verde-400"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
