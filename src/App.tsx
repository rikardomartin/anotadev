import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Login from './pages/Login'

type Page = 'dashboard' | 'settings'

function AppContent() {
  const { user, loading } = useAuth()
  const { theme } = useTheme()
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.colors.bg }}
      >
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 size={36} style={{ color: theme.colors.accent }} />
          </motion.div>
          <p
            className="text-sm font-medium"
            style={{ color: theme.colors.textMuted }}
          >
            Carregando AnotaDev...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div style={{ backgroundColor: theme.colors.bg, minHeight: '100vh' }}>
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <AnimatePresence mode="wait">
        {currentPage === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Dashboard />
          </motion.div>
        ) : (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Settings />
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
