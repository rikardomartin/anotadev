import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NotebookPen, Search, Grid3X3, List, RefreshCw, GitBranch, Loader2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useProjetos } from '../hooks/useProjetos'
import ProjetoCard from '../components/ProjetoCard'
import ProjetoModal from '../components/ProjetoModal'
import type { Projeto, GitHubRepo } from '../lib/supabase'
import { fetchGitHubRepo } from '../lib/github'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { theme } = useTheme()
  const { projetos, loading, criarProjeto, atualizarProjeto, deletarProjeto, fetchProjetos } = useProjetos()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProjeto, setEditingProjeto] = useState<Projeto | null>(null)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [githubCache, setGithubCache] = useState<Record<string, GitHubRepo | null>>({})
  const [loadingGH, setLoadingGH] = useState(false)

  // Fetch GitHub data for all projects
  useEffect(() => {
    const fetchAll = async () => {
      if (projetos.length === 0) return
      setLoadingGH(true)
      const results: Record<string, GitHubRepo | null> = {}
      await Promise.all(
        projetos
          .filter(p => p.github_url && !githubCache[p.id!])
          .map(async p => {
            const data = await fetchGitHubRepo(p.github_url)
            results[p.id!] = data
          })
      )
      setGithubCache(prev => ({ ...prev, ...results }))
      setLoadingGH(false)
    }
    fetchAll()
  }, [projetos])

  const filtered = projetos.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (data: Omit<Projeto, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editingProjeto) {
      await atualizarProjeto(editingProjeto.id!, data)
      toast.success('Projeto atualizado!', {
        style: {
          background: theme.colors.bgModal,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
        },
        iconTheme: { primary: theme.colors.accent, secondary: '#fff' },
      })
    } else {
      await criarProjeto(data)
      toast.success('Projeto criado com sucesso!', {
        style: {
          background: theme.colors.bgModal,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
        },
        iconTheme: { primary: theme.colors.accent, secondary: '#fff' },
      })
    }
    setEditingProjeto(null)
  }

  const handleEdit = (projeto: Projeto) => {
    setEditingProjeto(projeto)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return
    await deletarProjeto(id)
    toast.success('Projeto excluído', {
      style: {
        background: theme.colors.bgModal,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
      },
    })
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-6" style={{ backgroundColor: theme.colors.bg }}>
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1
            className="text-3xl font-black mb-1"
            style={{ color: theme.colors.text, fontFamily: 'Montserrat, Inter, sans-serif' }}
          >
            Meus Projetos
          </h1>
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>
            {projetos.length} projeto{projetos.length !== 1 ? 's' : ''} no total
            {loadingGH && (
              <span className="ml-2 inline-flex items-center gap-1" style={{ color: theme.colors.accent }}>
                <GitBranch size={12} />
                <span>sincronizando GitHub...</span>
              </span>
            )}
          </p>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-6"
        >
          {/* Search */}
          <div
            className="flex items-center gap-2 flex-1 max-w-sm px-3 py-2.5 rounded-xl"
            style={{
              backgroundColor: theme.colors.bgCard,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <Search size={15} style={{ color: theme.colors.textMuted }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar projetos..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: theme.colors.text }}
            />
          </div>

          {/* Refresh */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, rotate: 180 }}
            onClick={fetchProjetos}
            className="p-2.5 rounded-xl transition-colors"
            style={{
              backgroundColor: theme.colors.bgCard,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.textMuted,
            }}
          >
            <RefreshCw size={16} />
          </motion.button>

          {/* View toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: `1px solid ${theme.colors.border}` }}
          >
            {(['grid', 'list'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="p-2.5 transition-colors"
                style={{
                  backgroundColor: viewMode === mode ? theme.colors.accent : theme.colors.bgCard,
                  color: viewMode === mode ? '#fff' : theme.colors.textMuted,
                }}
              >
                {mode === 'grid' ? <Grid3X3 size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin" style={{ color: theme.colors.accent }} />
              <p className="text-sm" style={{ color: theme.colors.textMuted }}>Carregando projetos...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            search={search}
            theme={theme}
            onNew={() => { setEditingProjeto(null); setModalOpen(true) }}
          />
        ) : (
          <motion.div
            layout
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col gap-3'
            }
          >
            <AnimatePresence>
              {filtered.map((projeto, i) => (
                <ProjetoCard
                  key={projeto.id}
                  projeto={projeto}
                  githubData={githubCache[projeto.id!]}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setEditingProjeto(null); setModalOpen(true) }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl fab-pulse z-40"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
        }}
      >
        <NotebookPen size={22} color="#fff" />
      </motion.button>

      {/* Modal */}
      <ProjetoModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProjeto(null) }}
        onSave={handleSave}
        editingProjeto={editingProjeto}
      />
    </div>
  )
}

function EmptyState({ search, theme, onNew }: { search: string; theme: any; onNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 gap-4"
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: `${theme.colors.accent}15` }}
      >
        <NotebookPen size={36} style={{ color: theme.colors.accent }} />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold mb-1" style={{ color: theme.colors.text }}>
          {search ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
        </h3>
        <p className="text-sm" style={{ color: theme.colors.textMuted }}>
          {search
            ? `Nenhum resultado para "${search}"`
            : 'Clique no botão abaixo para criar seu primeiro projeto'}
        </p>
      </div>
      {!search && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNew}
          className="px-6 py-3 rounded-xl font-bold text-sm"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
            color: '#fff',
          }}
        >
          Criar primeiro projeto
        </motion.button>
      )}
    </motion.div>
  )
}
