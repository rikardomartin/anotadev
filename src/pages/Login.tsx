import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { Loader2, GitBranch, Zap } from 'lucide-react'

export default function Login() {
  const { theme } = useTheme()
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: theme.colors.accent }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: theme.colors.accentSecondary }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(${theme.colors.accent} 1px, transparent 1px), linear-gradient(90deg, ${theme.colors.accent} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`relative w-full max-w-md rounded-2xl p-8 ${theme.colors.gradientClass}`}
        style={{ backgroundColor: theme.colors.bgCard }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
            }}
          >
            <span className="text-4xl font-black text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              A
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black mb-2"
            style={{
              fontFamily: 'Montserrat, Inter, sans-serif',
              background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AnotaDev
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm"
            style={{ color: theme.colors.textMuted }}
          >
            Gerencie seus projetos de desenvolvimento com estilo
          </motion.p>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex flex-col gap-2 mb-8"
        >
          {[
            { icon: '📋', text: 'Organize projetos com checklists' },
            { icon: '🐙', text: 'Integração com GitHub API' },
            { icon: '🎨', text: '4 temas exclusivos' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-base">{f.icon}</span>
              <span className="text-sm" style={{ color: theme.colors.textSecondary }}>{f.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Login button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg"
          style={{
            background: loading
              ? theme.colors.bgSecondary
              : `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
            color: '#fff',
            boxShadow: loading ? 'none' : `0 8px 32px ${theme.colors.gradientFrom}40`,
          }}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
            </>
          )}
        </motion.button>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-4 mt-6"
        >
          <div className="flex items-center gap-1.5" style={{ color: theme.colors.textMuted }}>
            <Zap size={12} style={{ color: theme.colors.accent }} />
            <span className="text-xs">Firebase Auth</span>
          </div>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.colors.border }} />
          <div className="flex items-center gap-1.5" style={{ color: theme.colors.textMuted }}>
            <GitBranch size={12} />
            <span className="text-xs">GitHub API</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
