'use client'

import { cn } from '@/lib/utils/cn'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  const toggle = (
    <label
      className={cn(
        'relative inline-block h-6 w-[40px] cursor-pointer rounded-full bg-areia-300 transition [-webkit-tap-highlight-color:_transparent]',
        'has-[:checked]:bg-verde-500 dark:bg-areia-600 dark:has-[:checked]:bg-verde-600',
        'focus-within-visible:outline-none focus-within-visible:ring-2 focus-within-visible:ring-verde-500 focus-within-visible:ring-offset-2',
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={() => onChange(!checked)}
        aria-label={label}
      />
      <span
        className={cn(
          'absolute inset-y-0 start-0 m-1 size-4 rounded-full bg-white ring-[4px] ring-inset ring-white transition-all',
          'peer-checked:start-4 peer-checked:w-2 peer-checked:bg-white peer-checked:ring-transparent',
          'dark:bg-areia-300 dark:ring-areia-300 dark:peer-checked:bg-white',
          'shadow-sm',
        )}
      />
    </label>
  )

  if (!label) {
    return toggle
  }

  return (
    <div className="flex items-center gap-2">
      {toggle}
      <span className="text-xs font-jakarta text-areia-600">{label}</span>
    </div>
  )
}
