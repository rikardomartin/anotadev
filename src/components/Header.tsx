import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut,
  Settings,
  LayoutDashboard,
  Phone,
  AtSign,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

type Page = 'dashboard' | 'settings'

type Props = {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export default function Header({ currentPage, onNavigate }: Props) {
  const { user, logout } = useAuth()
  const { theme, themes, setThemeById } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  // Toggle between light and dark (cycles between 'light' and last dark theme)
  const isLight = theme.mode === 'light'
  const toggleMode = () => {
    if (isLight) {
      const lastDark = localStorage.getItem('anotadev-last-dark') || 'anotadev-dark'
      setThemeById(lastDark)
    } else {
      localStorage.setItem('anotadev-last-dark', theme.id)
      setThemeById('light')
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-5 glass"
      style={{
        backgroundColor: theme.mode === 'light'
          ? 'rgba(255,255,255,0.8)'
          : `${theme.colors.header}cc`,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('dashboard')}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
              color: '#fff',
              boxShadow: `0 0 12px ${theme.colors.gradientFrom}55`,
            }}
          >
            A
          </div>
          <span
            className="font-black text-xl tracking-tight"
            style={{
              fontFamily: 'Montserrat, Inter, sans-serif',
              background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AnotaDev
          </span>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-1">
        <NavBtn
          active={currentPage === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
          icon={<LayoutDashboard size={15} />}
          label="Dashboard"
          theme={theme}
        />
        <NavBtn
          active={currentPage === 'settings'}
          onClick={() => onNavigate('settings')}
          icon={<Settings size={15} />}
          label="Configurações"
          theme={theme}
        />
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Contact info */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5" style={{ color: theme.colors.textMuted }}>
            <Phone size={12} />
            <span className="text-xs font-medium">21970902074</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ color: theme.colors.textMuted }}>
            <AtSign size={12} />
            <span className="text-xs font-medium">tenicorikardo</span>
          </div>
        </div>

        <div className="w-px h-5" style={{ backgroundColor: theme.colors.border }} />

        {/* Dark/Light toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMode}
          className="relative w-12 h-6 rounded-full flex items-center px-0.5 transition-all"
          style={{
            background: isLight
              ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
              : `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
            boxShadow: isLight
              ? '0 0 10px rgba(251,191,36,0.4)'
              : `0 0 10px ${theme.colors.gradientFrom}55`,
          }}
          title={isLight ? 'Mudar para Dark' : 'Mudar para Light'}
        >
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: '#fff',
              marginLeft: isLight ? 'auto' : '0',
            }}
          >
            {isLight
              ? <Sun size={11} style={{ color: '#f59e0b' }} />
              : <Moon size={11} style={{ color: theme.colors.gradientFrom }} />
            }
          </motion.div>
        </motion.button>

        <div className="w-px h-5" style={{ backgroundColor: theme.colors.border }} />

        {/* Profile dropdown */}
        <div className="relative" ref={dropRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all"
            style={{
              backgroundColor: dropdownOpen ? `${theme.colors.accent}15` : 'transparent',
              border: `1px solid ${dropdownOpen ? theme.colors.borderHover : 'transparent'}`,
            }}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-7 h-7 rounded-full"
                style={{ outline: `2px solid ${theme.colors.accent}`, outlineOffset: '1px' }}
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
              >
                {user?.displayName?.[0] || 'U'}
              </div>
            )}
            <span className="text-sm font-semibold hidden sm:block" style={{ color: theme.colors.text }}>
              {user?.displayName?.split(' ')[0] || 'Usuário'}
            </span>
            <ChevronDown
              size={13}
              style={{
                color: theme.colors.textMuted,
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden shadow-2xl glass-modal"
                style={{ border: `1px solid ${theme.colors.border}` }}
              >
                <div className="p-3 border-b" style={{ borderColor: theme.colors.border }}>
                  <p className="text-sm font-bold" style={{ color: theme.colors.text }}>
                    {user?.displayName}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: theme.colors.textMuted }}>
                    {user?.email}
                  </p>
                </div>

                {/* Quick theme switcher */}
                <div className="p-2 border-b" style={{ borderColor: theme.colors.border }}>
                  <p className="text-xs font-semibold px-2 mb-1.5" style={{ color: theme.colors.textMuted }}>
                    TEMA RÁPIDO
                  </p>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {themes.filter(t => t.mode === 'dark').map(t => (
                      <button
                        key={t.id}
                        onClick={() => setThemeById(t.id)}
                        title={t.name}
                        className="w-5 h-5 rounded-full transition-transform hover:scale-125"
                        style={{
                          background: `linear-gradient(135deg, ${t.colors.gradientFrom}, ${t.colors.gradientTo})`,
                          outline: theme.id === t.id ? `2px solid ${t.colors.accent}` : 'none',
                          outlineOffset: '2px',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => { onNavigate('settings'); setDropdownOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
                    style={{ color: theme.colors.textSecondary }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${theme.colors.accent}15`)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Settings size={14} />
                    Configurações
                  </button>
                  <button
                    onClick={() => { logout(); setDropdownOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
                    style={{ color: '#ff4444' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,68,68,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={14} />
                    Sair
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  )
}

function NavBtn({
  active, onClick, icon, label, theme,
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; theme: any
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
      style={{
        backgroundColor: active ? `${theme.colors.accent}18` : 'transparent',
        color: active ? theme.colors.accent : theme.colors.textMuted,
        border: active ? `1px solid ${theme.colors.border}` : '1px solid transparent',
      }}
    >
      {icon}
      {label}
    </motion.button>
  )
}
