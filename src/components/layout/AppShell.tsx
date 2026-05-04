import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { TopNav } from './TopNav'
import { useThemeMode } from '@/lib/theme/useThemeMode'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { isDarkMode, toggleDarkMode } = useThemeMode()

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-[60px] items-center justify-between border-b border-[#0a4028] bg-[#0f5b36]/95 px-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#161b14]/95 dark:shadow-black/30">
        <div className="flex items-center gap-3">
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

        <div className="flex items-center gap-4">
          <TopNav />
          <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
        </div>
      </header>

      <div className="flex min-h-screen pt-[60px]">
        <main className="flex-1 min-h-screen bg-areia-100 dark:bg-[var(--seplan-night-bg)]">
          {children}
        </main>
      </div>
    </>
  )
}
