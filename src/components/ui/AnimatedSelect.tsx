import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SelectGroup<T extends string> {
  label: string
  options: { key: T; label: string }[]
}

interface AnimatedSelectProps<T extends string> {
  value: T
  onChange: (value: T) => void
  groups: SelectGroup<T>[]
  icon?: React.ReactNode
  placeholder?: string
  className?: string
}

export function AnimatedSelect<T extends string>({
  value,
  onChange,
  groups,
  icon,
  placeholder = 'Selecionar…',
  className,
}: AnimatedSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedLabel = groups
    .flatMap((g) => g.options)
    .find((o) => o.key === value)?.label ?? placeholder

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

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'group flex items-center gap-2 w-full min-w-0 rounded-xl border bg-white',
          'pl-2.5 pr-8 py-2 text-left',
          'transition-all duration-200 ease-out',
          'shadow-sm hover:shadow-md hover:-translate-y-px',
          'cursor-pointer dark:bg-[#4a5546] dark:border-white/12',
          isOpen
            ? 'border-verde-500 shadow-md ring-2 ring-verde-500/20'
            : 'border-areia-200 hover:border-verde-400',
        )}
      >
        {icon && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-verde-100 text-verde-700 transition-colors group-hover:bg-verde-600 group-hover:text-white dark:bg-verde-900/40 dark:text-verde-300 dark:group-hover:bg-verde-500">
            {icon}
          </span>
        )}
        <span className="truncate text-[12px] font-bold text-areia-800 font-fraunces dark:text-areia-100">
          {selectedLabel}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'absolute right-2.5 top-1/2 -translate-y-1/2 text-areia-400 transition-all duration-200',
            isOpen && 'rotate-180 text-verde-600',
          )}
        />
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          'absolute top-full left-0 mt-1 z-[60] min-w-[260px] max-w-[320px]',
          'rounded-xl border border-areia-200 bg-white shadow-xl',
          'dark:bg-[#3d4739] dark:border-white/12',
          'origin-top-left transition-all duration-200',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-[0.98] -translate-y-2 pointer-events-none',
        )}
        role="listbox"
        aria-activedescendant={value}
      >
        <div className="max-h-[320px] overflow-y-auto py-2">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="px-3 py-1.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-verde-700 dark:text-verde-400 font-jakarta">
                  {group.label}
                </p>
              </div>
              {group.options.map((option) => {
                const isSelected = option.key === value
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.key)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-[12px] font-jakarta transition-colors duration-150',
                      'flex items-center gap-2',
                      isSelected
                        ? 'bg-verde-50 text-verde-800 font-semibold dark:bg-verde-900/30 dark:text-verde-300'
                        : 'text-areia-700 hover:bg-areia-50 dark:text-areia-200 dark:hover:bg-white/5',
                    )}
                  >
                    <span className="flex-1 truncate">{option.label}</span>
                    {isSelected && (
                      <Check size={12} className="shrink-0 text-verde-600 dark:text-verde-400" />
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
