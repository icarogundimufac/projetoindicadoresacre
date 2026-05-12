import { useCallback, useEffect, useState } from 'react'

type ThemeMode = 'dark' | 'light'

const THEME_STORAGE_KEY = 'portal:theme'

function readDarkMode(): boolean {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
    if (stored === 'dark') return true
    if (stored === 'light') return false
  } catch {
    // fallback para modo claro abaixo
  }

  // padrao: modo claro
  return false
}

export function useThemeMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(readDarkMode)

  const applyThemeMode = useCallback((next: boolean) => {
    document.documentElement.classList.toggle('dark', next)
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    document.documentElement.style.colorScheme = next ? 'dark' : 'light'
  }, [])

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light')
      } catch {
        // storage pode estar indisponivel
      }
      applyThemeMode(next)
      return next
    })
  }, [applyThemeMode])

  useEffect(() => {
    applyThemeMode(isDarkMode)
  }, [applyThemeMode, isDarkMode])

  return { isDarkMode, toggleDarkMode }
}
