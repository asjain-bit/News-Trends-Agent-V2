'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: ResolvedTheme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage.getItem('theme') as Theme | null
    if (storedTheme === 'dark') {
      setThemeState('dark')
    } else {
      setThemeState('light')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const applyTheme = (currentTheme: Theme) => {
      // Light theme by default
      const resolved: ResolvedTheme = currentTheme === 'dark' ? 'dark' : 'light'

      setResolvedTheme(resolved)
      document.documentElement.setAttribute('data-theme', resolved)
      document.documentElement.style.colorScheme = resolved
      localStorage.setItem('theme', resolved)
    }

    applyTheme(theme)
  }, [theme, mounted])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
