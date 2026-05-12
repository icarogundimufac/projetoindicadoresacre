import { useLayoutEffect, useRef, useState } from 'react'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Map, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const ITEMS = [
  { path: '/indicadores/visao-geral', icon: LayoutDashboard, label: 'Visão Geral' },
  { path: '/indicadores/mapa', icon: Map, label: 'Mapa Municipal' },
] as const

const MARKER_SIZE = 8
const STORAGE_KEY = 'portal:perspective-sidebar:collapsed'

export function loadPerspectiveSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function savePerspectiveSidebarCollapsed(collapsed: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, String(collapsed))
}

interface PerspectivePillSidebarProps {
  variant?: 'fixed' | 'inline'
  className?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function PerspectivePillSidebar({
  variant = 'fixed',
  className,
  isCollapsed = false,
  onToggleCollapse,
}: PerspectivePillSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const markerRef = useRef<HTMLDivElement | null>(null)

  const handleNav = (path: string) => {
    navigate({ pathname: path, search: searchParams.toString() })
  }

  const activeIndex = ITEMS.findIndex((item) =>
    location.pathname.startsWith(item.path),
  )

  useLayoutEffect(() => {
    if (variant !== 'fixed') return
    const marker = markerRef.current
    if (!marker) return
    if (activeIndex < 0) {
      marker.style.opacity = '0'
      return
    }
    const btn = buttonRefs.current[activeIndex]
    if (!btn) return
    const centerY = btn.offsetTop + btn.offsetHeight / 2 - MARKER_SIZE / 2
    marker.style.transform = `translateY(${centerY}px)`
    marker.style.opacity = '1'
  }, [activeIndex, variant, isCollapsed])

  useLayoutEffect(() => {
    if (variant !== 'fixed') return
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [variant])

  const renderPill = (
    { path, icon: Icon, label }: (typeof ITEMS)[number],
    idx: number,
    options: { collapsible: boolean } = { collapsible: false },
  ) => {
    const active = location.pathname.startsWith(path)
    const collapsed = options.collapsible && isCollapsed
    return (
      <button
        key={path}
        ref={(el) => {
          buttonRefs.current[idx] = el
        }}
        type="button"
        onClick={() => handleNav(path)}
        aria-current={active ? 'page' : undefined}
        aria-label={collapsed ? label : undefined}
        title={collapsed ? label : undefined}
        className={cn(
          'group relative inline-flex items-center rounded-full',
          'font-jakarta text-[12px] font-medium',
          'shadow-sm transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-500 focus-visible:ring-offset-2 focus-visible:ring-offset-areia-100 dark:focus-visible:ring-offset-[var(--seplan-night-bg)]',
          collapsed
            ? 'h-9 w-9 justify-center p-0'
            : 'gap-2.5 px-4 py-2.5',
          active
            ? 'bg-verde-700 text-white shadow-md hover:bg-verde-600 dark:bg-verde-600 dark:hover:bg-verde-500'
            : 'bg-white text-verde-900 hover:bg-verde-50 hover:text-verde-700 dark:bg-[#3d473a] dark:text-areia-200 dark:hover:bg-[#465149]',
        )}
      >
        <Icon
          size={collapsed ? 16 : 15}
          strokeWidth={active ? 2 : 1.75}
          className="flex-shrink-0"
        />
        {!collapsed && <span className="whitespace-nowrap">{label}</span>}
        {collapsed && (
          <span
            className={cn(
              'pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2',
              'whitespace-nowrap rounded-lg bg-verde-800 px-2.5 py-1',
              'text-[11px] font-medium text-white shadow-md',
              'opacity-0 transition-opacity duration-100 group-hover:opacity-100',
              'dark:bg-verde-700',
            )}
          >
            {label}
          </span>
        )}
      </button>
    )
  }

  if (variant === 'inline') {
    return (
      <aside
        className={cn('flex flex-row flex-wrap gap-2 md:hidden', className)}
        aria-label="Selecionar perspectiva"
      >
        {ITEMS.map((item, idx) => renderPill(item, idx))}
      </aside>
    )
  }

  const ToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className={cn(
        'fixed left-4 top-[88px] z-30 hidden md:flex flex-col gap-2.5',
        className,
      )}
      aria-label="Selecionar perspectiva"
    >
      <div
        className={cn(
          'flex items-center pl-4',
          isCollapsed ? 'justify-center pl-0' : 'justify-between gap-2',
        )}
      >
        {!isCollapsed && (
          <span className="font-jakarta text-[10px] font-bold uppercase tracking-[0.18em] text-verde-900 dark:text-areia-200">
            Perspectiva
          </span>
        )}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? 'Expandir' : 'Recolher'}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg',
              'text-areia-500 transition-all duration-150 hover:bg-verde-50 hover:text-verde-700',
              'active:scale-90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-500',
              'dark:text-areia-300 dark:hover:bg-white/5 dark:hover:text-verde-300',
            )}
          >
            <ToggleIcon className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      <div
        className={cn(
          'relative flex flex-col gap-2',
          isCollapsed ? 'pl-0 items-center' : 'pl-4',
        )}
      >
        {!isCollapsed && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[6px] top-1.5 bottom-1.5 w-px bg-areia-300/40 dark:bg-white/10"
            />
            <div
              ref={markerRef}
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute left-[2px] top-0 h-2 w-2 rounded-full',
                'bg-verde-700 dark:bg-verde-400',
                'shadow-[0_0_0_3px_rgba(255,255,255,0.85)] dark:shadow-[0_0_0_3px_rgba(61,71,58,0.85)]',
                'opacity-0',
                mounted &&
                  'transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none',
              )}
            />
          </>
        )}
        {ITEMS.map((item, idx) => renderPill(item, idx, { collapsible: true }))}
      </div>
    </aside>
  )
}
