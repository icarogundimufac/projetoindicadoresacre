import { useId } from 'react'
import { cn } from '@/lib/utils/cn'

interface ThemeToggleProps {
  isDarkMode: boolean
  onToggle: () => void
  size?: 'sm' | 'md'
  className?: string
}

export function ThemeToggle({
  isDarkMode,
  onToggle,
  size = 'md',
  className,
}: ThemeToggleProps) {
  const rawId = useId().replace(/:/g, '')
  const glowId = `theme-toggle-glow-${rawId}`
  const skyId = `theme-toggle-sky-${rawId}`
  const buttonSize =
    size === 'sm' ? 'h-8 w-[56px] p-0.5' : 'h-9 w-[64px] p-1'
  const svgSize = size === 'sm' ? 'h-7 w-[50px]' : 'h-7 w-[56px]'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo noturno'}
      aria-pressed={isDarkMode}
      title={isDarkMode ? 'Modo claro' : 'Modo noturno'}
      className={cn(
        'group relative inline-flex shrink-0 items-center overflow-hidden rounded-full border shadow-sm',
        'transition-all duration-300 ease-out hover:-translate-y-px focus:outline-none focus-visible:ring-2',
        'focus-visible:ring-ouro-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        isDarkMode
          ? 'border-ouro-400/35 bg-[var(--seplan-night-surface-raised)] text-ouro-200 hover:border-ouro-400/60 hover:bg-white/8'
          : 'border-areia-200 bg-white text-verde-800 hover:border-verde-200 hover:bg-verde-50',
        buttonSize,
        className,
      )}
    >
      <svg
        viewBox="0 0 56 28"
        aria-hidden="true"
        className={cn('overflow-visible', svgSize)}
      >
        <defs>
          <linearGradient id={skyId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={isDarkMode ? '#121712' : '#ffffff'} />
            <stop offset="100%" stopColor={isDarkMode ? '#2a3327' : '#f5f4ef'} />
          </linearGradient>
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect
          x="1"
          y="1"
          width="54"
          height="26"
          rx="13"
          fill={`url(#${skyId})`}
          stroke={isDarkMode ? 'rgba(242,194,48,.24)' : 'rgba(232,230,220,.95)'}
        />

        <g
          className="transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{
            opacity: isDarkMode ? 1 : 0,
            transform: isDarkMode ? 'translateX(0)' : 'translateX(7px)',
          }}
        >
          <circle cx="17" cy="8" r="1" fill="#f2c230" opacity=".85" />
          <circle cx="25" cy="19" r="0.8" fill="#f5f4ef" opacity=".65" />
          <path
            d="M38 7.2l.55 1.15 1.25.18-.9.88.22 1.24-1.12-.58-1.1.58.2-1.24-.9-.88 1.25-.18z"
            fill="#f2c230"
            opacity=".9"
          />
        </g>

        <g
          filter={`url(#${glowId})`}
          className="transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{
            transform: isDarkMode
              ? 'translateX(28px) rotate(-18deg)'
              : 'translateX(0) rotate(0deg)',
            transformOrigin: '14px 14px',
          }}
        >
          <circle
            cx="14"
            cy="14"
            r="10"
            fill={isDarkMode ? '#f2c230' : '#ffffff'}
            stroke={isDarkMode ? '#f6d56b' : '#e8e6dc'}
            strokeWidth="1"
          />

          <g
            className="transition-all duration-300 ease-out motion-reduce:transition-none"
            style={{
              opacity: isDarkMode ? 1 : 0,
              transform: isDarkMode ? 'scale(1)' : 'scale(.55)',
              transformOrigin: '14px 14px',
            }}
          >
            <circle cx="10.5" cy="11" r="1.35" fill="#b07d0e" opacity=".42" />
            <circle cx="16.7" cy="9.7" r="1" fill="#b07d0e" opacity=".3" />
            <circle cx="17.4" cy="16.7" r="1.7" fill="#b07d0e" opacity=".24" />
          </g>

          <g
            className="transition-all duration-300 ease-out motion-reduce:transition-none"
            style={{
              opacity: isDarkMode ? 0 : 1,
              transform: isDarkMode ? 'scale(.55)' : 'scale(1)',
              transformOrigin: '14px 14px',
            }}
          >
            {Array.from({ length: 8 }, (_, index) => {
              const angle = (Math.PI * 2 * index) / 8
              const x1 = 14 + Math.cos(angle) * 13
              const y1 = 14 + Math.sin(angle) * 13
              const x2 = 14 + Math.cos(angle) * 16
              const y2 = 14 + Math.sin(angle) * 16

              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#f2c230"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )
            })}
            <circle cx="14" cy="14" r="6.2" fill="#f2c230" />
          </g>
        </g>
      </svg>
    </button>
  )
}
