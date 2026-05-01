import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  GitBranch,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Link2,
  User,
  FileText,
  Tag,
  Loader2,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import type { Projeto, ChecklistItem } from '../lib/supabase'
import { fetchGitHubRepo } from '../lib/github'
import { nanoid } from '../lib/nanoid'

type Props = {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Projeto, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  editingProjeto?: Projeto | null
}

export default function ProjetoModal({ open, onClose, onSave, editingProjeto }: Props) {
  const { theme } = useTheme()
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [contasInput, setContasInput] = useState('')
  const [contas, setContas] = useState<string[]>([])
  const [pendencias, setPendencias] = useState<ChecklistItem[]>([])
  const [concluidos, setConcluidos] = useState<ChecklistItem[]>([])
  const [pendenciaInput, setPendenciaInput] = useState('')
  const [concluidoInput, setConcluidoInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [fetchingGH, setFetchingGH] = useState(false)
  const [ghPreview, setGhPreview] = useState<string | null>(null)
  const nomeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      if (editingProjeto) {
        setNome(editingProjeto.nome)
        setDescricao(editingProjeto.descricao)
        setGithubUrl(editingProjeto.github_url)
        setContas(editingProjeto.contas_vinculadas || [])
        setPendencias(editingProjeto.pendencias || [])
        setConcluidos(editingProjeto.concluidos || [])
      } else {
        resetForm()
      }
      setTimeout(() => nomeRef.current?.focus(), 100)
    }
  }, [open, editingProjeto])

  const resetForm = () => {
    setNome('')
    setDescricao('')
    setGithubUrl('')
    setContas([])
    setContasInput('')
    setPendencias([])
    setConcluidos([])
    setPendenciaInput('')
    setConcluidoInput('')
    setGhPreview(null)
  }

  const handleGithubBlur = async () => {
    if (!githubUrl) return
    setFetchingGH(true)
    const data = await fetchGitHubRepo(githubUrl)
    if (data) {
      setGhPreview(data.name)
      if (!nome) setNome(data.name)
      if (!descricao && data.description) setDescricao(data.description)
    }
    setFetchingGH(false)
  }

  const addConta = () => {
    const v = contasInput.trim()
    if (v && !contas.includes(v)) {
      setContas(prev => [...prev, v])
      setContasInput('')
    }
  }

  const removeConta = (c: string) => setContas(prev => prev.filter(x => x !== c))

  const addPendencia = () => {
    const v = pendenciaInput.trim()
    if (v) {
      setPendencias(prev => [...prev, { id: nanoid(), texto: v, feito: false }])
      setPendenciaInput('')
    }
  }

  const addConcluido = () => {
    const v = concluidoInput.trim()
    if (v) {
      setConcluidos(prev => [...prev, { id: nanoid(), texto: v, feito: true }])
      setConcluidoInput('')
    }
  }

  const togglePendencia = (id: string) => {
    const item = pendencias.find(p => p.id === id)
    if (item) {
      setPendencias(prev => prev.filter(p => p.id !== id))
      setConcluidos(prev => [...prev, { ...item, feito: true }])
    }
  }

  const toggleConcluido = (id: string) => {
    const item = concluidos.find(c => c.id === id)
    if (item) {
      setConcluidos(prev => prev.filter(c => c.id !== id))
      setPendencias(prev => [...prev, { ...item, feito: false }])
    }
  }

  const handleSave = async () => {
    if (!nome.trim()) return
    setSaving(true)
    try {
      await onSave({
        nome: nome.trim(),
        descricao: descricao.trim(),
        github_url: githubUrl.trim(),
        contas_vinculadas: contas,
        pendencias,
        concluidos,
      })
      onClose()
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    backgroundColor: theme.colors.bgSecondary,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.text,
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{
              backgroundColor: theme.colors.bgModal,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between p-6 border-b sticky top-0 z-10"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.bgModal,
              }}
            >
              <div>
                <h2
                  className="text-xl font-black"
                  style={{ color: theme.colors.text, fontFamily: 'Montserrat, Inter, sans-serif' }}
                >
                  {editingProjeto ? 'Editar Projeto' : 'Novo Projeto'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: theme.colors.textMuted }}>
                  {editingProjeto ? 'Atualize as informações do projeto' : 'Adicione um novo projeto ao seu dashboard'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.textMuted }}
                onMouseEnter={e => (e.currentTarget.style.color = theme.colors.text)}
                onMouseLeave={e => (e.currentTarget.style.color = theme.colors.textMuted)}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Form */}
            <div className="p-6 flex flex-col gap-5">
              {/* Nome */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: theme.colors.textMuted }}>
                  <Tag size={12} />
                  NOME DO PROJETO *
                </label>
                <input
                  ref={nomeRef}
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Meu App Incrível"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = theme.colors.accent)}
                  onBlur={e => (e.target.style.borderColor = theme.colors.border)}
                />
              </div>

              {/* GitHub URL */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: theme.colors.textMuted }}>
                  <GitBranch size={12} />
                  LINK DO GITHUB
                  {fetchingGH && <Loader2 size={12} className="animate-spin" style={{ color: theme.colors.accent }} />}
                  {ghPreview && !fetchingGH && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${theme.colors.accent}20`, color: theme.colors.accent }}>
                      ✓ {ghPreview}
                    </span>
                  )}
                </label>
                <input
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  onBlur={handleGithubBlur}
                  placeholder="https://github.com/usuario/repositorio"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = theme.colors.accent)}
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: theme.colors.textMuted }}>
                  <FileText size={12} />
                  DESCRIÇÃO
                </label>
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Descreva o projeto..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                  onFocus={e => (e.target.style.borderColor = theme.colors.accent)}
                  onBlur={e => (e.target.style.borderColor = theme.colors.border)}
                />
              </div>

              {/* Contas Conectadas */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: theme.colors.textMuted }}>
                  <User size={12} />
                  CONTAS CONECTADAS
                </label>
                <div className="flex gap-2">
                  <input
                    value={contasInput}
                    onChange={e => setContasInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addConta()}
                    placeholder="@usuario ou email"
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => (e.target.style.borderColor = theme.colors.accent)}
                    onBlur={e => (e.target.style.borderColor = theme.colors.border)}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addConta}
                    className="px-3 rounded-lg font-semibold text-sm"
                    style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                  >
                    <Plus size={16} />
                  </motion.button>
                </div>
                {contas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contas.map(c => (
                      <span
                        key={c}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${theme.colors.accent}20`, color: theme.colors.accent }}
                      >
                        <Link2 size={10} />
                        {c}
                        <button onClick={() => removeConta(c)} className="hover:opacity-70">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Checklists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* O que falta */}
                <ChecklistSection
                  title="O que falta"
                  icon="⏳"
                  items={pendencias}
                  inputValue={pendenciaInput}
                  onInputChange={setPendenciaInput}
                  onAdd={addPendencia}
                  onToggle={togglePendencia}
                  onRemove={id => setPendencias(prev => prev.filter(p => p.id !== id))}
                  theme={theme}
                  accentColor={theme.colors.accent}
                />

                {/* O que já foi implantado */}
                <ChecklistSection
                  title="Já implantado"
                  icon="✅"
                  items={concluidos}
                  inputValue={concluidoInput}
                  onInputChange={setConcluidoInput}
                  onAdd={addConcluido}
                  onToggle={toggleConcluido}
                  onRemove={id => setConcluidos(prev => prev.filter(c => c.id !== id))}
                  theme={theme}
                  accentColor="#00cc44"
                />
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-3 p-6 border-t sticky bottom-0"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.bgModal,
              }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
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
                onClick={handleSave}
                disabled={!nome.trim() || saving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                style={{
                  background: nome.trim()
                    ? `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`
                    : theme.colors.bgSecondary,
                  color: nome.trim() ? '#fff' : theme.colors.textMuted,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  editingProjeto ? 'Atualizar' : 'Criar Projeto'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ChecklistSection({
  title,
  icon,
  items,
  inputValue,
  onInputChange,
  onAdd,
  onToggle,
  onRemove,
  theme,
  accentColor,
}: {
  title: string
  icon: string
  items: ChecklistItem[]
  inputValue: string
  onInputChange: (v: string) => void
  onAdd: () => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  theme: any
  accentColor: string
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: theme.colors.bgSecondary, border: `1px solid ${theme.colors.border}` }}
    >
      <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: theme.colors.textSecondary }}>
        <span>{icon}</span>
        {title.toUpperCase()}
        <span
          className="ml-auto px-1.5 py-0.5 rounded-full text-xs"
          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
        >
          {items.length}
        </span>
      </h4>

      <div className="flex gap-2 mb-3">
        <input
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onAdd()}
          placeholder="Adicionar item..."
          className="flex-1 text-xs px-3 py-2 rounded-lg outline-none"
          style={{
            backgroundColor: theme.colors.bgCard,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
          }}
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAdd}
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
        >
          <Plus size={14} />
        </motion.button>
      </div>

      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2 group/item"
            >
              <button onClick={() => onToggle(item.id)} className="flex-shrink-0">
                {item.feito ? (
                  <CheckSquare size={14} style={{ color: '#00cc44' }} />
                ) : (
                  <Square size={14} style={{ color: theme.colors.textMuted }} />
                )}
              </button>
              <span
                className="flex-1 text-xs leading-relaxed"
                style={{
                  color: item.feito ? theme.colors.textMuted : theme.colors.textSecondary,
                  textDecoration: item.feito ? 'line-through' : 'none',
                }}
              >
                {item.texto}
              </span>
              <button
                onClick={() => onRemove(item.id)}
                className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                style={{ color: '#ff4444' }}
              >
                <Trash2 size={11} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <p className="text-xs text-center py-2" style={{ color: theme.colors.textMuted }}>
            Nenhum item ainda
          </p>
        )}
      </div>
    </div>
  )
}
