import { useState, useEffect, useLayoutEffect, useRef, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { IndicatorSectionId } from '@/lib/constants/indicator-sections'

const STORAGE_KEY = 'portal:indicadores:sidebar:collapsed'

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  activeSectionId: IndicatorSectionId
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

/* ═══════════════════════════════════════
   MOBILE — Drawer
   ═══════════════════════════════════════ */
function MobileSidebar({ activeSectionId }: { activeSectionId: IndicatorSectionId }) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { path: '/indicadores/visao-geral', icon: LayoutDashboard, label: 'Visão Geral' },
    { path: '/indicadores/mapa', icon: Map, label: 'Mapa Municipal' },
  ] as const

  const activeIndex = navItems.findIndex((item) =>
    location.pathname.startsWith(item.path),
  )

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleNav = (path: string) => {
    navigate({ pathname: path, search: `?secao=${activeSectionId}` })
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed left-3 top-[72px] z-40 flex h-9 items-center gap-2 rounded-full',
          'bg-verde-700 pl-3 pr-3.5 text-white shadow-md',
          'hover:bg-verde-600 active:scale-95',
          'transition-all duration-150',
        )}
      >
        <Menu className="h-3.5 w-3.5" strokeWidth={2} />
        <span className="text-[11px] font-semibold font-jakarta">Menu</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/25"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-3 top-[68px] w-[240px] rounded-2xl bg-white p-2 shadow-xl dark:bg-[#3a4437] animate-slide-in-left motion-reduce:animate-none">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-verde-800 font-jakarta dark:text-verde-200">
                Perspectivas
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-areia-400 hover:bg-areia-100 hover:text-verde-700"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-1">
              {navItems.map(({ path, icon: Icon, label }, idx) => {
                const active = idx === activeIndex
                return (
                  <button
                    key={path}
                    onClick={() => handleNav(path)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left',
                      'font-jakarta text-sm font-medium transition-colors duration-150',
                      active
                        ? 'bg-verde-700 text-white'
                        : 'text-verde-900 hover:bg-verde-50 dark:text-areia-200 dark:hover:bg-white/5',
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.75} />
                    <span>{label}</span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════
   DESKTOP — Floating Pill
   ═══════════════════════════════════════ */
function DesktopSidebar({
  isCollapsed,
  onToggleCollapse,
  activeSectionId,
}: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { path: '/indicadores/visao-geral', icon: LayoutDashboard, label: 'Visão Geral' },
    { path: '/indicadores/mapa', icon: Map, label: 'Mapa Municipal' },
  ] as const

  const activeIndex = navItems.findIndex((item) =>
    location.pathname.startsWith(item.path),
  )

  useLayoutEffect(() => {
    if (!navRef.current || !indicatorRef.current || activeIndex < 0) return
    const items = navRef.current.querySelectorAll<HTMLElement>('[data-nav-item]')
    const item = items[activeIndex]
    if (!item) return

    const update = () => {
      if (!indicatorRef.current || !item) return
      indicatorRef.current.style.transform = `translateY(${item.offsetTop}px)`
      indicatorRef.current.style.height = `${item.offsetHeight}px`
    }

    const raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [activeIndex, isCollapsed])

  const handleNav = (path: string) => {
    navigate({ pathname: path, search: `?secao=${activeSectionId}` })
  }

  const ToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className={cn(
        'fixed left-3 top-[72px] z-30 flex flex-col',
        'rounded-[20px] bg-white shadow-md dark:bg-[#3d473a]',
        'transition-[width] duration-200 ease-out',
        isCollapsed ? 'w-[52px]' : 'w-[188px]',
      )}
    >
      {/* Header with integrated toggle */}
      <div
        className={cn(
          'flex items-center border-b border-areia-100/30 transition-all duration-200 dark:border-white/5',
          isCollapsed ? 'h-10 justify-center px-0' : 'h-11 px-3.5',
        )}
      >
        {/* Title — hidden when collapsed */}
        <div
          className={cn(
            'flex items-center gap-2 overflow-hidden',
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-verde-500" />
          <span className="whitespace-nowrap font-jakarta text-[10px] font-bold uppercase tracking-widest text-verde-900 dark:text-verde-200">
            Perspectivas
          </span>
        </div>

        {/* Toggle button — always visible */}
        <button
          onClick={onToggleCollapse}
          className={cn(
            'flex items-center justify-center rounded-lg text-areia-400',
            'transition-all duration-150 hover:bg-verde-50 hover:text-verde-700',
            'active:scale-90',
            isCollapsed
              ? 'mx-auto h-7 w-7'
              : 'ml-auto h-7 w-7',
          )}
          aria-label={isCollapsed ? 'Expandir' : 'Recolher'}
          title={isCollapsed ? 'Expandir' : 'Recolher'}
        >
          <ToggleIcon className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Nav with sliding indicator */}
      <nav ref={navRef} className="relative flex flex-col gap-1 p-1.5">
        {/* Sliding active indicator */}
        <div
          ref={indicatorRef}
          className="absolute left-1.5 right-1.5 top-0 rounded-xl bg-verde-700 dark:bg-verde-600"
          style={{
            opacity: activeIndex >= 0 ? 0.95 : 0,
          }}
        />

        {navItems.map(({ path, icon: Icon, label }, idx) => {
          const active = idx === activeIndex
          return (
            <button
              key={path}
              data-nav-item
              onClick={() => handleNav(path)}
              className={cn(
                'group relative z-10 flex items-center gap-3 rounded-xl',
                'font-jakarta text-[12px] font-medium',
                'transition-colors duration-150',
                isCollapsed ? 'justify-center px-0 py-2' : 'px-3 py-[7px]',
                active
                  ? 'text-white'
                  : 'text-verde-900/70 hover:text-verde-900 dark:text-areia-300/80 dark:hover:text-areia-100',
              )}
            >
              <Icon
                className="flex-shrink-0"
                size={isCollapsed ? 17 : 16}
                strokeWidth={active ? 2 : 1.5}
              />

              {/* Label */}
              <span
                className={cn(
                  'whitespace-nowrap overflow-hidden',
                  isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                )}
              >
                {label}
              </span>

              {/* Tooltip collapsed */}
              {isCollapsed && (
                <span className="pointer-events-none absolute left-full ml-2.5 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg bg-verde-800 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity duration-100 group-hover:opacity-100 dark:bg-verde-700">
                  {label}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="flex-1 min-h-2" />
    </aside>
  )
}

/* ═══════════════════════════════════════
   MAIN — Memoized wrapper
   ═══════════════════════════════════════ */
export const IndicadoresSidebar = memo(function IndicadoresSidebar({
  isCollapsed,
  onToggleCollapse,
  activeSectionId,
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    const debounced = debounce(check, 150)
    window.addEventListener('resize', debounced)
    return () => window.removeEventListener('resize', debounced)
  }, [])

  if (isMobile) {
    return <MobileSidebar activeSectionId={activeSectionId} />
  }

  return (
    <DesktopSidebar
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      activeSectionId={activeSectionId}
    />
  )
})

/* ═══════ Helpers ═══════ */

export function loadSidebarState(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'true'
}

export function saveSidebarState(collapsed: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(collapsed))
}
