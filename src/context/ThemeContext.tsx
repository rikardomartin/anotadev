import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type ThemeMode = 'dark' | 'light'

export type Theme = {
  id: string
  name: string
  mode: ThemeMode
  colors: {
    bg: string
    bgSecondary: string
    bgCard: string
    bgModal: string
    header: string
    text: string
    textMuted: string
    textSecondary: string
    accent: string
    accentHover: string
    accentSecondary: string
    border: string
    borderHover: string
    gradientFrom: string
    gradientTo: string
    gradientClass: string
  }
}

export const themes: Theme[] = [
  {
    id: 'anotadev-dark',
    name: 'Anotadev Dark',
    mode: 'dark',
    colors: {
      bg: '#080808',
      bgSecondary: '#0f0f0f',
      bgCard: '#141414',
      bgModal: '#181818',
      header: '#0a0a0a',
      text: '#ffffff',
      textMuted: '#777777',
      textSecondary: '#bbbbbb',
      accent: '#ff0033',
      accentHover: '#ff1a4d',
      accentSecondary: '#ff4400',
      border: 'rgba(255,0,51,0.18)',
      borderHover: 'rgba(255,0,51,0.5)',
      gradientFrom: '#ff0033',
      gradientTo: '#ff4400',
      gradientClass: 'gradient-border',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    mode: 'dark',
    colors: {
      bg: '#06000f',
      bgSecondary: '#0d0020',
      bgCard: '#110030',
      bgModal: '#150038',
      header: '#08001a',
      text: '#f0e6ff',
      textMuted: '#7755aa',
      textSecondary: '#cc99ff',
      accent: '#bf00ff',
      accentHover: '#cc33ff',
      accentSecondary: '#00ffcc',
      border: 'rgba(191,0,255,0.22)',
      borderHover: 'rgba(191,0,255,0.6)',
      gradientFrom: '#bf00ff',
      gradientTo: '#00ffcc',
      gradientClass: 'gradient-border gradient-border-cyber',
    },
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    mode: 'dark',
    colors: {
      bg: '#050510',
      bgSecondary: '#0a0a1f',
      bgCard: '#0f0f2a',
      bgModal: '#13132e',
      header: '#080818',
      text: '#e0e0ff',
      textMuted: '#6666aa',
      textSecondary: '#b0b0dd',
      accent: '#7c3aed',
      accentHover: '#8b5cf6',
      accentSecondary: '#00d4ff',
      border: 'rgba(124,58,237,0.25)',
      borderHover: 'rgba(124,58,237,0.6)',
      gradientFrom: '#7c3aed',
      gradientTo: '#00d4ff',
      gradientClass: 'gradient-border gradient-border-blue',
    },
  },
  {
    id: 'forest-code',
    name: 'Forest Code',
    mode: 'dark',
    colors: {
      bg: '#050f08',
      bgSecondary: '#0a1a0e',
      bgCard: '#0f2014',
      bgModal: '#122518',
      header: '#071209',
      text: '#d4f5d4',
      textMuted: '#4a7a4a',
      textSecondary: '#90c890',
      accent: '#00cc44',
      accentHover: '#00e64d',
      accentSecondary: '#00ffcc',
      border: 'rgba(0,204,68,0.2)',
      borderHover: 'rgba(0,204,68,0.5)',
      gradientFrom: '#00cc44',
      gradientTo: '#00ffcc',
      gradientClass: 'gradient-border gradient-border-green',
    },
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    mode: 'dark',
    colors: {
      bg: '#020b18',
      bgSecondary: '#041525',
      bgCard: '#061e33',
      bgModal: '#07243d',
      header: '#030e1e',
      text: '#cce8ff',
      textMuted: '#3a6a8a',
      textSecondary: '#88bbdd',
      accent: '#0ea5e9',
      accentHover: '#38bdf8',
      accentSecondary: '#06b6d4',
      border: 'rgba(14,165,233,0.2)',
      borderHover: 'rgba(14,165,233,0.5)',
      gradientFrom: '#0ea5e9',
      gradientTo: '#06b6d4',
      gradientClass: 'gradient-border gradient-border-ocean',
    },
  },
  {
    id: 'light',
    name: 'Light Mode',
    mode: 'light',
    colors: {
      bg: '#f5f5f7',
      bgSecondary: '#ebebed',
      bgCard: '#ffffff',
      bgModal: '#ffffff',
      header: '#ffffff',
      text: '#111111',
      textMuted: '#888888',
      textSecondary: '#444444',
      accent: '#ff0033',
      accentHover: '#cc0029',
      accentSecondary: '#ff4400',
      border: 'rgba(0,0,0,0.1)',
      borderHover: 'rgba(255,0,51,0.4)',
      gradientFrom: '#ff0033',
      gradientTo: '#ff4400',
      gradientClass: 'gradient-border',
    },
  },
]

type ThemeContextType = {
  theme: Theme
  setThemeById: (id: string) => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes[0],
  setThemeById: () => {},
  themes,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('anotadev-theme') || 'anotadev-dark'
  })

  const theme = themes.find(t => t.id === themeId) || themes[0]

  const setThemeById = (id: string) => {
    setThemeId(id)
    localStorage.setItem('anotadev-theme', id)
  }

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--bg', theme.colors.bg)
    root.style.setProperty('--bg-secondary', theme.colors.bgSecondary)
    root.style.setProperty('--bg-card', theme.colors.bgCard)
    root.style.setProperty('--bg-modal', theme.colors.bgModal)
    root.style.setProperty('--header', theme.colors.header)
    root.style.setProperty('--text', theme.colors.text)
    root.style.setProperty('--text-muted', theme.colors.textMuted)
    root.style.setProperty('--text-secondary', theme.colors.textSecondary)
    root.style.setProperty('--accent', theme.colors.accent)
    root.style.setProperty('--accent-hover', theme.colors.accentHover)
    root.style.setProperty('--accent-secondary', theme.colors.accentSecondary)
    root.style.setProperty('--border', theme.colors.border)
    root.style.setProperty('--border-hover', theme.colors.borderHover)
    document.body.style.backgroundColor = theme.colors.bg
    document.body.style.color = theme.colors.text
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setThemeById, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
