import { motion } from 'framer-motion'
import { LogOut, Settings, LayoutDashboard, Phone, AtSign, ChevronDown } from 'lucide-react'
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
  const { theme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

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
      style={{ backgroundColor: theme.colors.header, borderBottom: `1px solid ${theme.colors.border}` }}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6"
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
          icon={<LayoutDashboard size={16} />}
          label="Dashboard"
          theme={theme}
        />
        <NavBtn
          active={currentPage === 'settings'}
          onClick={() => onNavigate('settings')}
          icon={<Settings size={16} />}
          label="Configurações"
          theme={theme}
        />
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Contact info */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-1.5" style={{ color: theme.colors.textMuted }}>
            <Phone size={13} />
            <span className="text-xs font-medium">21970902074</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ color: theme.colors.textMuted }}>
            <AtSign size={13} />
            <span className="text-xs font-medium">tenicorikardo</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6" style={{ backgroundColor: theme.colors.border }} />

        {/* Profile dropdown */}
        <div className="relative" ref={dropRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
            style={{
              backgroundColor: dropdownOpen ? theme.colors.bgCard : 'transparent',
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
            <span className="text-sm font-medium hidden sm:block" style={{ color: theme.colors.text }}>
              {user?.displayName?.split(' ')[0] || 'Usuário'}
            </span>
            <ChevronDown
              size={14}
              style={{
                color: theme.colors.textMuted,
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </motion.button>

          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden shadow-2xl"
              style={{
                backgroundColor: theme.colors.bgModal,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div className="p-3 border-b" style={{ borderColor: theme.colors.border }}>
                <p className="text-sm font-semibold" style={{ color: theme.colors.text }}>
                  {user?.displayName}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: theme.colors.textMuted }}>
                  {user?.email}
                </p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { onNavigate('settings'); setDropdownOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80"
                  style={{ color: theme.colors.textSecondary }}
                >
                  <Settings size={15} />
                  Configurações
                </button>
                <button
                  onClick={() => { logout(); setDropdownOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ color: '#ff4444' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,68,68,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={15} />
                  Sair
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  )
}

function NavBtn({
  active,
  onClick,
  icon,
  label,
  theme,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  theme: any
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
      style={{
        backgroundColor: active ? `${theme.colors.accent}20` : 'transparent',
        color: active ? theme.colors.accent : theme.colors.textMuted,
        border: active ? `1px solid ${theme.colors.border}` : '1px solid transparent',
      }}
    >
      {icon}
      {label}
    </motion.button>
  )
}
