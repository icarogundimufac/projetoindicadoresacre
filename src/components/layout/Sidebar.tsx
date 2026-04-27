import { SidebarNav } from './SidebarNav'

interface SidebarProps {
  collapsed: boolean
}

export const SIDEBAR_COLLAPSED_WIDTH = 64
export const SIDEBAR_EXPANDED_WIDTH = 220

export function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside
      className="fixed left-0 top-[60px] z-30 flex h-[calc(100vh-60px)] flex-col overflow-hidden border-r border-[#d8d1c2] bg-[#ede9df] transition-[width] duration-300 ease-in-out dark:border-white/10 dark:bg-[var(--seplan-night-surface)]"
      style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
    >
      {/* Navigation */}
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
        <SidebarNav collapsed={collapsed} />
      </div>

      {/* Footer */}
      <div className="relative flex items-center gap-3 overflow-hidden border-t border-areia-200 px-4 py-3 dark:border-ouro-400/20">
        {/* Subtle accent dot */}
        <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ouro-400/70" />
        {!collapsed && (
          <div className="min-w-0 transition-opacity duration-200">
            <p className="text-[10px] font-semibold uppercase leading-none tracking-widest text-verde-800/60 font-jakarta dark:text-ouro-300/80">
              SEPLAN/AC
            </p>
            <p className="mt-0.5 text-[9px] text-areia-500 font-jakarta dark:text-areia-300">
              © {new Date().getFullYear()} Governo do Estado do Acre
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
