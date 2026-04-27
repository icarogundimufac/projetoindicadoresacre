import { useCallback, useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from '@/components/layout/Sidebar'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useThemeMode } from '@/lib/theme/useThemeMode'

interface AppShellProps {
  children: React.ReactNode
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem('portal:sidebar:collapsed') === 'true'
  } catch {
    return false
  }
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed)
  const { isDarkMode, toggleDarkMode } = useThemeMode()

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('portal:sidebar:collapsed', String(next)) } catch {}
      return next
    })
  }, [])

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-[60px] items-center justify-between border-b border-[#0a4028] bg-[#0f5b36]/95 px-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#161b14]/95 dark:shadow-black/30">
        <div className="flex items-center gap-3">
          {/* Toggle button */}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/60 transition-all duration-150 hover:bg-white/10 hover:text-white dark:text-areia-300 dark:hover:bg-white/8 dark:hover:text-ouro-300"
          >
            <Menu className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <div className="h-6 w-px bg-white/15 dark:bg-white/12" />

          {/* Logo */}
          <img
            src="/seplan.svg"
            alt="SEPLAN — Secretaria de Estado de Planejamento"
            className="h-9 w-auto brightness-0 invert opacity-90 dark:brightness-100 dark:invert-0"
          />

          <div className="hidden h-6 w-px bg-white/15 md:block dark:bg-white/12" />

          <div className="hidden min-w-0 flex-col justify-center md:flex">
            <span className="block truncate text-[21px] font-semibold tracking-[-0.055em] text-white font-fraunces leading-none dark:text-areia-100">
              Painel de Indicadores do Estado do Acre
            </span>
          </div>
        </div>

        <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
      </header>

      <div className="flex min-h-screen pt-[60px]">
        <Sidebar collapsed={collapsed} />
        <main
          className="flex-1 min-h-screen bg-areia-100 transition-[margin-left] duration-300 ease-in-out dark:bg-[var(--seplan-night-bg)]"
          style={{ marginLeft: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
        >
          {children}
        </main>
      </div>
    </>
  )
}
