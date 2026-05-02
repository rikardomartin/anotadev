import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  NotebookPen, Search, Grid3X3, List, RefreshCw,
  GitBranch, Loader2, GitCommitHorizontal, Wifi, X, Trash2,
  GitBranch as GitBranchIcon, Webhook, CheckSquare,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useProjetos } from '../hooks/useProjetos'
import ProjetoCard from '../components/ProjetoCard'
import ProjetoModal from '../components/ProjetoModal'
import type { Projeto, GitHubRepo } from '../lib/supabase'
import { fetchGitHubRepo } from '../lib/github'
import toast from 'react-hot-toast'

// ── Toast de commit em tempo real ──────────────────────────────────────────
function CommitToast({
  projetoNome,
  commitMsg,
  accentColor,
  bgModal,
}: {
  projetoNome: string
  commitMsg: string
  accentColor: string
  bgModal: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60 }}
      className="flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl max-w-sm"
      style={{
        background: bgModal,
        border: `1px solid ${accentColor}40`,
        backdropFilter: 'blur(16px)',
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${accentColor}20` }}
      >
        <GitCommitHorizontal size={16} style={{ color: accentColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Wifi size={10} style={{ color: accentColor }} />
          <span className="text-xs font-black" style={{ color: accentColor }}>
            NOVO COMMIT
          </span>
        </div>
        <p className="text-xs font-bold truncate" style={{ color: '#fff' }}>
          {projetoNome}
        </p>
        <p
          className="text-xs font-mono truncate mt-0.5"
          style={{ color: accentColor, opacity: 0.85 }}
        >
          {commitMsg}
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          ✅ Adicionado em "Já implantado"
        </p>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { theme } = useTheme()

  // Callback chamado quando um commit chega via Realtime
  const handleNewCommit = useCallback(
    (projeto: Projeto, commitMsg: string) => {
      toast.custom(
        (_t) => (
          <CommitToast
            projetoNome={projeto.nome}
            commitMsg={commitMsg}
            accentColor={theme.colors.accentSecondary}
            bgModal={theme.colors.bgModal}
          />
        ),
        {
          duration: 6000,
          position: 'bottom-right',
        }
      )
    },
    [theme]
  )

  const {
    projetos,
    loading,
    criarProjeto,
    atualizarProjeto,
    deletarProjeto,
    fetchProjetos,
  } = useProjetos(handleNewCommit)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProjeto, setEditingProjeto] = useState<Projeto | null>(null)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [githubCache, setGithubCache] = useState<Record<string, GitHubRepo | null>>({})
  const [loadingGH, setLoadingGH] = useState(false)
  const [realtimeActive] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmDeleteNome, setConfirmDeleteNome] = useState('')
  const [deleting, setDeleting] = useState(false)

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

  const filtered = projetos.filter(
    p =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (
    data: Omit<Projeto, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    try {
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
    } catch (err: any) {
      console.error('Erro ao salvar projeto:', err)
      toast.error(`Erro ao salvar: ${err.message || 'Tente novamente'}`, {
        style: {
          background: theme.colors.bgModal,
          color: '#ff4444',
          border: '1px solid rgba(255,68,68,0.3)',
        },
        duration: 6000,
      })
    }
  }

  const handleEdit = (projeto: Projeto) => {
    setEditingProjeto(projeto)
    setModalOpen(true)
  }

  const handleDeleteRequest = (id: string, nome: string) => {
    setConfirmDeleteId(id)
    setConfirmDeleteNome(nome)
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return
    setDeleting(true)
    try {
      await deletarProjeto(confirmDeleteId)
      toast.success(`"${confirmDeleteNome}" excluído com sucesso`, {
        style: {
          background: theme.colors.bgModal,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
        },
        iconTheme: { primary: theme.colors.accent, secondary: '#fff' },
      })
    } finally {
      setDeleting(false)
      setConfirmDeleteId(null)
      setConfirmDeleteNome('')
    }
  }

  const handleDeleteCancel = () => {
    setConfirmDeleteId(null)
    setConfirmDeleteNome('')
  }

  return (
    <div
      className="min-h-screen pt-20 pb-24 px-4 md:px-6"
      style={{ backgroundColor: theme.colors.bg }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <h1
              className="text-3xl font-black"
              style={{ color: theme.colors.text, fontFamily: 'Montserrat, Inter, sans-serif' }}
            >
              Meus Projetos
            </h1>
            {/* Realtime indicator */}
            <motion.div
              animate={{ opacity: realtimeActive ? [1, 0.4, 1] : 0.3 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: `${theme.colors.accentSecondary}15`,
                border: `1px solid ${theme.colors.accentSecondary}30`,
              }}
              title="Realtime ativo — commits aparecem automaticamente"
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: theme.colors.accentSecondary }}
              />
              <span className="text-xs font-semibold" style={{ color: theme.colors.accentSecondary }}>
                live
              </span>
            </motion.div>
          </div>
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>
            {projetos.length} projeto{projetos.length !== 1 ? 's' : ''} no total
            {loadingGH && (
              <span
                className="ml-2 inline-flex items-center gap-1"
                style={{ color: theme.colors.accent }}
              >
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
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSearch('')}
                  className="flex-shrink-0 p-0.5 rounded-full"
                  style={{ color: theme.colors.textMuted }}
                  onMouseEnter={e => (e.currentTarget.style.color = theme.colors.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = theme.colors.textMuted)}
                  title="Limpar busca"
                >
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
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
                  backgroundColor:
                    viewMode === mode ? theme.colors.accent : theme.colors.bgCard,
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
              <Loader2
                size={32}
                className="animate-spin"
                style={{ color: theme.colors.accent }}
              />
              <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                Carregando projetos...
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            search={search}
            theme={theme}
            onNew={() => {
              setEditingProjeto(null)
              setModalOpen(true)
            }}
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
                  onDelete={(id) => handleDeleteRequest(id, projeto.nome)}
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
        onClick={() => {
          setEditingProjeto(null)
          setModalOpen(true)
        }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl fab-pulse z-40"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
        }}
      >
        <NotebookPen size={22} color="#fff" />
      </motion.button>

      {/* Modal de confirmação de exclusão */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full max-w-sm rounded-2xl shadow-2xl p-6"
              style={{
                backgroundColor: theme.colors.bgModal,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(255,68,68,0.12)' }}
              >
                <Trash2 size={22} style={{ color: '#ff4444' }} />
              </div>
              <h3 className="text-lg font-black mb-1" style={{ color: theme.colors.text }}>
                Excluir projeto?
              </h3>
              <p className="text-sm mb-5" style={{ color: theme.colors.textMuted }}>
                O projeto <span className="font-bold" style={{ color: theme.colors.textSecondary }}>"{confirmDeleteNome}"</span> será removido permanentemente. Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    backgroundColor: theme.colors.bgSecondary,
                    color: theme.colors.textMuted,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#ff4444',
                    color: '#fff',
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting
                    ? <><Loader2 size={14} className="animate-spin" /> Excluindo...</>
                    : <><Trash2 size={14} /> Excluir</>
                  }
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <ProjetoModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingProjeto(null)
        }}
        onSave={handleSave}
        editingProjeto={editingProjeto}
      />
    </div>
  )
}

function EmptyState({
  search,
  theme,
  onNew,
}: {
  search: string
  theme: any
  onNew: () => void
}) {
  if (search) {
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
          <Search size={36} style={{ color: theme.colors.accent }} />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold mb-1" style={{ color: theme.colors.text }}>
            Nenhum projeto encontrado
          </h3>
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>
            Nenhum resultado para "{search}"
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 gap-6 max-w-lg mx-auto"
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: `${theme.colors.accent}15` }}
      >
        <NotebookPen size={36} style={{ color: theme.colors.accent }} />
      </div>

      <div className="text-center">
        <h3 className="text-xl font-black mb-2" style={{ color: theme.colors.text }}>
          Bem-vindo ao AnotaDev!
        </h3>
        <p className="text-sm" style={{ color: theme.colors.textMuted }}>
          Seu bloco de notas para desenvolvedores. Comece criando seu primeiro projeto e explore os recursos abaixo.
        </p>
      </div>

      {/* Dicas de onboarding */}
      <div className="w-full flex flex-col gap-3">
        {[
          {
            icon: <GitBranchIcon size={16} />,
            title: 'Conecte seu GitHub',
            desc: 'Sincronize commits e dados do repositório automaticamente.',
            color: theme.colors.accent,
          },
          {
            icon: <Webhook size={16} />,
            title: 'Configure o Webhook',
            desc: 'Receba atualizações em tempo real a cada novo push.',
            color: theme.colors.accentSecondary,
          },
          {
            icon: <CheckSquare size={16} />,
            title: 'Use os Checklists',
            desc: 'Organize o que falta e o que já foi implantado em cada projeto.',
            color: '#00cc44',
          },
        ].map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{
              backgroundColor: theme.colors.bgCard,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${tip.color}20`, color: tip.color }}
            >
              {tip.icon}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: theme.colors.text }}>{tip.title}</p>
              <p className="text-xs mt-0.5" style={{ color: theme.colors.textMuted }}>{tip.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNew}
        className="px-8 py-3 rounded-xl font-bold text-sm"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
          color: '#fff',
          boxShadow: `0 4px 20px ${theme.colors.gradientFrom}40`,
        }}
      >
        Criar primeiro projeto
      </motion.button>
    </motion.div>
  )
}
