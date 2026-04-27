import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'
import { NAV } from '@/lib/constants/nav'
import {
  prefetchIndicatorSections,
  prefetchPathData,
} from '@/lib/data/client'

const ICONS: Record<string, React.ReactNode> = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-[18px] h-[18px] flex-shrink-0">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  'book-open': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  'heart-pulse': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l1.5-2 2 4.5 1.5-3 1.5 2.5h5.27" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-[18px] h-[18px] flex-shrink-0">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  ),
  coins: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-[18px] h-[18px] flex-shrink-0">
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-[18px] h-[18px] flex-shrink-0">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-[18px] h-[18px] flex-shrink-0">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  ),
  'bar-chart': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-[18px] h-[18px] flex-shrink-0">
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  ),
}

const PREFETCHED_ROUTES = new Set<string>()

interface SidebarNavProps {
  collapsed: boolean
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const location = useLocation()
  const pathname = location.pathname
  const queryClient = useQueryClient()

  useEffect(() => {
    let cancelled = false

    const warmUp = () => {
      if (cancelled) return
      void prefetchIndicatorSections(queryClient)
    }

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(warmUp, { timeout: 1200 })
      return () => {
        cancelled = true
        window.cancelIdleCallback(idleId)
      }
    }

    const timeoutId = window.setTimeout(warmUp, 500)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [queryClient])

  return (
    <nav className="flex-1 px-2 py-5">
      {NAV.map((section, si) => (
        <div key={section.label} className={cn('mb-1', si > 0 && 'mt-4')}>
          {/* Section label */}
          {!collapsed && (
            <p className="mb-1 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-verde-700/60 font-jakarta dark:text-ouro-300/70">
              {section.label}
            </p>
          )}
          {collapsed && si > 0 && (
            <div className="mx-auto mb-2 h-px w-5 bg-areia-200 dark:bg-ouro-400/20" />
          )}

          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href)

              const prefetch = () => {
                if (PREFETCHED_ROUTES.has(item.href)) return
                PREFETCHED_ROUTES.add(item.href)
                void prefetchPathData(queryClient, item.href)
              }

              return (
                <li key={item.href} className="relative group">
                  <NavLink
                    to={item.href}
                    onMouseEnter={prefetch}
                    onFocus={prefetch}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center rounded-lg transition-all duration-150 font-jakarta relative overflow-hidden',
                      collapsed
                        ? 'justify-center w-10 h-10 mx-auto'
                        : 'gap-3 px-3 py-2.5',
                      isActive
                        ? 'bg-white text-verde-900 ring-1 ring-inset ring-verde-100 shadow-sm dark:bg-[var(--seplan-night-surface-raised)] dark:text-ouro-100 dark:ring-ouro-400/25'
                        : 'text-areia-600 hover:bg-white/70 hover:text-verde-800 dark:text-areia-300 dark:hover:bg-white/8 dark:hover:text-ouro-200',
                    )}
                  >
                    {/* Active accent: left bar when expanded, top bar when collapsed */}
                    {isActive && !collapsed && (
                      <span className="absolute left-0 inset-y-1.5 w-[2px] rounded-full bg-ouro-400" />
                    )}
                    {isActive && collapsed && (
                      <span className="absolute inset-x-1.5 top-0 h-[2px] rounded-full bg-ouro-400" />
                    )}

                    <span className={cn(
                      'transition-colors duration-150',
                      isActive
                        ? 'text-verde-800 dark:text-ouro-300'
                        : 'text-areia-400 group-hover:text-verde-700 dark:text-verde-100/55 dark:group-hover:text-ouro-300',
                    )}>
                      {ICONS[item.icon]}
                    </span>

                    {!collapsed && (
                      <span className="text-[13px] font-medium leading-none">
                        {item.label}
                      </span>
                    )}
                  </NavLink>

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <div
                      className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
                        bg-white border border-areia-200 text-areia-700 text-[11px] font-medium font-jakarta
                        dark:border-white/10 dark:bg-[var(--seplan-night-surface-raised)] dark:text-areia-100
                        px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-xl
                        opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    >
                      {item.label}
                      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white dark:border-r-[var(--seplan-night-surface-raised)]" />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
