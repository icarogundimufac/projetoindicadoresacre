import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { NavLink, useLocation } from 'react-router-dom'
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

interface PillState {
  left: number
  width: number
  height: number
  top: number
}

export function TopNav() {
  const location = useLocation()
  const pathname = location.pathname
  const queryClient = useQueryClient()
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [pill, setPill] = useState<PillState | null>(null)
  const [hoverPill, setHoverPill] = useState<PillState | null>(null)

  const allNavItems = NAV.flatMap((section) => section.items)

  const activeItem = allNavItems.find((item) =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href),
  )

  useLayoutEffect(() => {
    if (!activeItem || !navRef.current) {
      setPill(null)
      return
    }
    const el = itemRefs.current[activeItem.href]
    if (!el) {
      setPill(null)
      return
    }
    const navRect = navRef.current.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    setPill({
      left: rect.left - navRect.left,
      width: rect.width,
      height: rect.height,
      top: rect.top - navRect.top,
    })
  }, [activeItem, pathname])

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

  const handleMouseEnter = (itemHref: string) => {
    const el = itemRefs.current[itemHref]
    if (!el || !navRef.current) return
    const navRect = navRef.current.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    setHoverPill({
      left: rect.left - navRect.left,
      width: rect.width,
      height: rect.height,
      top: rect.top - navRect.top,
    })
  }

  const handleMouseLeave = () => {
    setHoverPill(null)
  }

  return (
    <nav
      ref={navRef}
      className="relative flex items-center gap-1 px-4"
      onMouseLeave={handleMouseLeave}
    >
      {/* Active pill background with glow */}
      {pill && (
        <span
          className="absolute rounded-lg bg-white/[0.18] pointer-events-none motion-reduce:transition-none"
          style={{
            left: pill.left,
            width: pill.width,
            height: pill.height,
            top: pill.top,
            boxShadow: '0 0 20px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease',
          }}
        />
      )}

      {/* Hover pill background - only shows on non-active items */}
      {hoverPill && (
        <span
          className="absolute rounded-lg bg-white/[0.06] pointer-events-none motion-reduce:transition-none"
          style={{
            left: hoverPill.left,
            width: hoverPill.width,
            height: hoverPill.height,
            top: hoverPill.top,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}

      {allNavItems.map((item) => {
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
          <NavLink
            key={item.href}
            ref={(el) => { itemRefs.current[item.href] = el }}
            to={item.href}
            onMouseEnter={() => {
              prefetch()
              handleMouseEnter(item.href)
            }}
            onFocus={prefetch}
            className={`relative z-10 flex items-center gap-2 px-3 py-2 rounded-lg font-jakarta text-[13px] font-medium transition-colors duration-200
              ${isActive
                ? 'text-white'
                : 'text-white/55 hover:text-white'
              }`}
          >
            <span
              className={`transition-all duration-200 ${
                isActive
                  ? 'text-white scale-105'
                  : 'text-white/60 group-hover:text-white group-hover:scale-105'
              }`}
            >
              {ICONS[item.icon]}
            </span>
            <span className="relative">
              {item.label}
              {/* Active underline dot */}
              {isActive && (
                <span
                  className="absolute -bottom-1 left-1/2 h-0.5 w-0.5 -translate-x-1/2 rounded-full bg-white/80 motion-reduce:animate-none"
                  style={{
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }}
                />
              )}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
