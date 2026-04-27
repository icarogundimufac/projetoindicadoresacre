import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useThemeMode } from '@/lib/theme/useThemeMode'

export function SpreadsheetShell({ children }: { children: ReactNode }) {
  const { isDarkMode, toggleDarkMode } = useThemeMode()

  return (
    <div className="flex h-screen flex-col bg-[#f4f1e8] overflow-hidden dark:bg-[var(--seplan-night-bg)]">
      {/* Header */}
      <header className="shrink-0 border-b border-areia-200 bg-white/95 backdrop-blur-sm dark:border-white/10 dark:bg-[var(--seplan-night-surface)]/95">
        <div className="flex items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-verde-600 dark:bg-verde-700 dark:ring-1 dark:ring-ouro-400/20">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="0.5" fill="white" opacity="0.9" />
                <rect x="9" y="2" width="5" height="5" rx="0.5" fill="white" opacity="0.6" />
                <rect x="2" y="9" width="5" height="5" rx="0.5" fill="white" opacity="0.6" />
                <rect x="9" y="9" width="5" height="5" rx="0.5" fill="white" opacity="0.3" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-verde-600/60 font-jakarta dark:text-ouro-300/70">
                Admin de Dados
              </p>
              <h1 className="text-base font-semibold text-verde-800 font-fraunces leading-tight dark:text-verde-100">
                Gestao do Portal de Indicadores
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle
              isDarkMode={isDarkMode}
              onToggle={toggleDarkMode}
              size="sm"
            />

            <Link
              to="/"
              className="rounded-lg border border-areia-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-areia-600 shadow-sm transition hover:border-areia-300 hover:text-verde-700 font-jakarta dark:border-white/10 dark:bg-[var(--seplan-night-surface-raised)] dark:text-areia-100 dark:hover:border-ouro-400/40 dark:hover:text-ouro-200"
            >
              Voltar ao portal
            </Link>
          </div>
        </div>
      </header>

      {/* Spreadsheet area */}
      <div className="flex flex-1 flex-col overflow-hidden p-2">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-areia-200 bg-white shadow-md dark:border-white/10 dark:bg-[var(--seplan-night-surface)]">
          {children}
        </div>
      </div>
    </div>
  )
}
