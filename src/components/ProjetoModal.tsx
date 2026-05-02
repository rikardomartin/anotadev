import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, GitBranch, Plus, Trash2, CheckSquare, Square,
  Link2, User, FileText, Tag, Loader2, Star, Code2,
  Webhook, GitCommitHorizontal, Eye, EyeOff, Zap,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
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

  // Form state
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [contasInput, setContasInput] = useState('')
  const [contas, setContas] = useState<string[]>([])
  const [techInput, setTechInput] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])
  const [pendencias, setPendencias] = useState<ChecklistItem[]>([])
  const [concluidos, setConcluidos] = useState<ChecklistItem[]>([])
  const [pendenciaInput, setPendenciaInput] = useState('')
  const [concluidoInput, setConcluidoInput] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [lastCommitMsg, setLastCommitMsg] = useState('')
  const [showWebhook, setShowWebhook] = useState(false)

  // Secret global das configurações (fallback)
  const globalSecret = localStorage.getItem('webhook-secret-global') || 'AnotaDev@2026#Webhook$Ricardo!'
  const usingGlobalSecret = !webhookSecret.trim() && !!globalSecret

  // GitHub auto-fill state
  const [fetchingGH, setFetchingGH] = useState(false)
  const [ghData, setGhData] = useState<{ name: string; stars: number; language: string | null } | null>(null)

  // UI state
  const [saving, setSaving] = useState(false)
  const [mdPreview, setMdPreview] = useState(false)
  const [simulatingWebhook, setSimulatingWebhook] = useState(false)

  const nomeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      if (editingProjeto) {
        setNome(editingProjeto.nome)
        setDescricao(editingProjeto.descricao)
        setGithubUrl(editingProjeto.github_url)
        setContas(editingProjeto.contas_vinculadas || [])
        setTechStack(editingProjeto.tech_stack || [])
        setPendencias(editingProjeto.pendencias || [])
        setConcluidos(editingProjeto.concluidos || [])
        setWebhookSecret(editingProjeto.webhook_secret || '')
        setLastCommitMsg(editingProjeto.last_commit_msg || '')
        setGhData(null)
      } else {
        resetForm()
      }
      setTimeout(() => nomeRef.current?.focus(), 100)
    }
  }, [open, editingProjeto])

  const resetForm = () => {
    setNome(''); setDescricao(''); setGithubUrl('')
    setContas([]); setContasInput('')
    setTechStack([]); setTechInput('')
    setPendencias([]); setConcluidos([])
    setPendenciaInput(''); setConcluidoInput('')
    setWebhookSecret(''); setLastCommitMsg('')
    setGhData(null); setMdPreview(false)
  }

  // Auto-fill from GitHub on blur
  const handleGithubBlur = async () => {
    if (!githubUrl) return
    setFetchingGH(true)
    const data = await fetchGitHubRepo(githubUrl)
    if (data) {
      setGhData({ name: data.name, stars: data.stargazers_count, language: data.language })
      if (!nome) setNome(data.name)
      if (!descricao && data.description) setDescricao(data.description)
      if (data.language && !techStack.includes(data.language)) {
        setTechStack(prev => [data.language!, ...prev])
      }
    }
    setFetchingGH(false)
  }

  // Simulate webhook: adds a fake commit to "Já implantado"
  const simulateWebhook = () => {
    if (!webhookSecret) return
    setSimulatingWebhook(true)
    const fakeCommit = `feat: auto-deploy via webhook [${new Date().toLocaleTimeString('pt-BR')}]`
    setTimeout(() => {
      setLastCommitMsg(fakeCommit)
      setConcluidos(prev => [
        { id: nanoid(), texto: fakeCommit, feito: true },
        ...prev,
      ])
      setSimulatingWebhook(false)
    }, 1500)
  }

  const addConta = () => {
    const v = contasInput.trim()
    if (v && !contas.includes(v)) { setContas(p => [...p, v]); setContasInput('') }
  }
  const removeConta = (c: string) => setContas(p => p.filter(x => x !== c))

  const addTech = () => {
    const v = techInput.trim()
    if (v && !techStack.includes(v)) { setTechStack(p => [...p, v]); setTechInput('') }
  }
  const removeTech = (t: string) => setTechStack(p => p.filter(x => x !== t))

  const addPendencia = () => {
    const v = pendenciaInput.trim()
    if (v) { setPendencias(p => [...p, { id: nanoid(), texto: v, feito: false }]); setPendenciaInput('') }
  }
  const addConcluido = () => {
    const v = concluidoInput.trim()
    if (v) { setConcluidos(p => [...p, { id: nanoid(), texto: v, feito: true }]); setConcluidoInput('') }
  }

  const togglePendencia = (id: string) => {
    const item = pendencias.find(p => p.id === id)
    if (item) { setPendencias(p => p.filter(x => x.id !== id)); setConcluidos(p => [...p, { ...item, feito: true }]) }
  }
  const toggleConcluido = (id: string) => {
    const item = concluidos.find(c => c.id === id)
    if (item) { setConcluidos(p => p.filter(x => x.id !== id)); setPendencias(p => [...p, { ...item, feito: false }]) }
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
        tech_stack: techStack,
        pendencias,
        concluidos,
        webhook_secret: webhookSecret,
        last_commit_msg: lastCommitMsg,
      })
      onClose()
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    backgroundColor: theme.colors.bgSecondary,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.text,
    borderRadius: '10px',
    padding: '10px 13px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const focusStyle = (e: React.FocusEvent<any>) => (e.target.style.borderColor = theme.colors.accent)
  const blurStyle  = (e: React.FocusEvent<any>) => (e.target.style.borderColor = theme.colors.border)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl glass-modal"
            style={{ border: `1px solid ${theme.colors.border}` }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between p-6 border-b sticky top-0 z-10 glass-modal"
              style={{ borderColor: theme.colors.border }}
            >
              <div>
                <h2
                  className="text-xl font-black"
                  style={{ color: theme.colors.text, fontFamily: 'Montserrat, sans-serif' }}
                >
                  {editingProjeto ? 'Editar Projeto' : 'Novo Projeto'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: theme.colors.textMuted }}>
                  {editingProjeto ? 'Atualize as informações' : 'Preencha os dados do projeto'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl"
                style={{ color: theme.colors.textMuted }}
                onMouseEnter={e => (e.currentTarget.style.color = theme.colors.text)}
                onMouseLeave={e => (e.currentTarget.style.color = theme.colors.textMuted)}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* ── Form ── */}
            <div className="p-6 flex flex-col gap-5">

              {/* Nome */}
              <Field label="NOME DO PROJETO *" icon={<Tag size={12} />} theme={theme}>
                <input
                  ref={nomeRef}
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Meu App Incrível"
                  style={inp}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </Field>

              {/* GitHub URL */}
              <Field
                label="LINK DO GITHUB"
                icon={<GitBranch size={12} />}
                theme={theme}
                extra={
                  fetchingGH
                    ? <Loader2 size={12} className="animate-spin" style={{ color: theme.colors.accent }} />
                    : ghData
                    ? (
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: `${theme.colors.accent}20`, color: theme.colors.accent }}>
                          ✓ {ghData.name}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: '#f59e0b' }}>
                          <Star size={11} /> {ghData.stars}
                        </span>
                        {ghData.language && (
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${theme.colors.accentSecondary}20`, color: theme.colors.accentSecondary }}>
                            {ghData.language}
                          </span>
                        )}
                      </div>
                    )
                    : null
                }
              >
                <input
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  onBlur={handleGithubBlur}
                  placeholder="https://github.com/usuario/repositorio"
                  style={inp}
                  onFocus={focusStyle}
                />
              </Field>

              {/* Descrição com Markdown */}
              <Field
                label="DESCRIÇÃO (Markdown suportado)"
                icon={<FileText size={12} />}
                theme={theme}
                extra={
                  <button
                    onClick={() => setMdPreview(!mdPreview)}
                    className="ml-auto flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg"
                    style={{
                      backgroundColor: mdPreview ? `${theme.colors.accent}20` : 'transparent',
                      color: mdPreview ? theme.colors.accent : theme.colors.textMuted,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    <Eye size={11} />
                    {mdPreview ? 'Editar' : 'Preview'}
                  </button>
                }
              >
                {mdPreview ? (
                  <div
                    className="md-content text-sm p-3 rounded-xl min-h-[80px]"
                    style={{
                      backgroundColor: theme.colors.bgSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {descricao
                      ? <ReactMarkdown>{descricao}</ReactMarkdown>
                      : <span style={{ color: theme.colors.textMuted }}>Nada para pré-visualizar...</span>
                    }
                  </div>
                ) : (
                  <textarea
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    placeholder="Descreva o projeto... Suporta **Markdown**, `código`, listas, etc."
                    rows={4}
                    style={{ ...inp, resize: 'vertical', minHeight: '90px', fontFamily: 'monospace', fontSize: '13px' }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                )}
              </Field>

              {/* Tech Stack */}
              <Field label="TECH STACK" icon={<Code2 size={12} />} theme={theme}>
                <div className="flex gap-2">
                  <input
                    value={techInput}
                    onChange={e => setTechInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTech()}
                    placeholder="React, Node.js, PostgreSQL..."
                    style={{ ...inp, flex: 1 }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={addTech}
                    className="px-3 rounded-xl"
                    style={{ backgroundColor: theme.colors.accent, color: '#fff' }}>
                    <Plus size={16} />
                  </motion.button>
                </div>
                {techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {techStack.map(t => (
                      <span key={t}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: `${theme.colors.accentSecondary}18`, color: theme.colors.accentSecondary }}>
                        {t}
                        <button onClick={() => removeTech(t)} className="hover:opacity-70"><X size={9} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>

              {/* Contas Conectadas */}
              <Field label="CONTAS CONECTADAS" icon={<User size={12} />} theme={theme}>
                <div className="flex gap-2">
                  <input
                    value={contasInput}
                    onChange={e => setContasInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addConta()}
                    placeholder="@usuario ou email"
                    style={{ ...inp, flex: 1 }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={addConta}
                    className="px-3 rounded-xl"
                    style={{ backgroundColor: theme.colors.accent, color: '#fff' }}>
                    <Plus size={16} />
                  </motion.button>
                </div>
                {contas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {contas.map(c => (
                      <span key={c}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${theme.colors.accent}18`, color: theme.colors.accent }}>
                        <Link2 size={10} />{c}
                        <button onClick={() => removeConta(c)} className="hover:opacity-70"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>

              {/* Checklists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ChecklistSection
                  title="O que falta" icon="⏳"
                  items={pendencias} inputValue={pendenciaInput}
                  onInputChange={setPendenciaInput} onAdd={addPendencia}
                  onToggle={togglePendencia}
                  onRemove={id => setPendencias(p => p.filter(x => x.id !== id))}
                  theme={theme} accentColor={theme.colors.accent}
                />
                <ChecklistSection
                  title="Já implantado" icon="✅"
                  items={concluidos} inputValue={concluidoInput}
                  onInputChange={setConcluidoInput} onAdd={addConcluido}
                  onToggle={toggleConcluido}
                  onRemove={id => setConcluidos(p => p.filter(x => x.id !== id))}
                  theme={theme} accentColor="#00cc44"
                />
              </div>

              {/* Webhook Secret */}
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: `${theme.colors.accentSecondary}08`,
                  border: `1px solid ${theme.colors.accentSecondary}25`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Webhook size={14} style={{ color: theme.colors.accentSecondary }} />
                  <span className="text-xs font-bold" style={{ color: theme.colors.accentSecondary }}>
                    WEBHOOK SECRET (GitHub Automação)
                  </span>
                  {usingGlobalSecret && (
                    <span
                      className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: `${theme.colors.accentSecondary}20`, color: theme.colors.accentSecondary }}
                    >
                      ✓ usando secret global
                    </span>
                  )}
                </div>
                <p className="text-xs mb-3" style={{ color: theme.colors.textMuted }}>
                  {usingGlobalSecret
                    ? 'Este projeto vai usar o secret global das Configurações. Deixe em branco para manter ou cole um secret específico para sobrescrever.'
                    : 'Cole o secret do webhook do GitHub. Ao detectar um novo commit, o campo "Já implantado" será atualizado automaticamente.'
                  }
                </p>
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <input
                      value={webhookSecret}
                      onChange={e => setWebhookSecret(e.target.value)}
                      type={showWebhook ? 'text' : 'password'}
                      placeholder={usingGlobalSecret ? `Herdando: ${globalSecret.slice(0, 12)}...` : 'Cole um secret específico (opcional)'}
                      style={{ ...inp, paddingRight: '40px', borderColor: usingGlobalSecret ? `${theme.colors.accentSecondary}50` : theme.colors.border }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                    <button
                      onClick={() => setShowWebhook(!showWebhook)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: theme.colors.textMuted }}
                    >
                      {showWebhook ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={simulateWebhook}
                    disabled={!webhookSecret || simulatingWebhook}
                    className="flex items-center gap-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap"
                    style={{
                      backgroundColor: webhookSecret ? `${theme.colors.accentSecondary}20` : theme.colors.bgSecondary,
                      color: webhookSecret ? theme.colors.accentSecondary : theme.colors.textMuted,
                      border: `1px solid ${webhookSecret ? theme.colors.accentSecondary + '40' : theme.colors.border}`,
                    }}
                  >
                    {simulatingWebhook
                      ? <><Loader2 size={12} className="animate-spin" /> Simulando...</>
                      : <><Zap size={12} /> Simular commit</>
                    }
                  </motion.button>
                </div>

                {/* Last commit display */}
                {lastCommitMsg && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg commit-pop"
                    style={{
                      backgroundColor: `${theme.colors.accentSecondary}12`,
                      border: `1px solid ${theme.colors.accentSecondary}30`,
                    }}
                  >
                    <GitCommitHorizontal size={13} style={{ color: theme.colors.accentSecondary, flexShrink: 0 }} />
                    <span className="text-xs font-mono truncate" style={{ color: theme.colors.accentSecondary }}>
                      {lastCommitMsg}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer ── */}
            <div
              className="flex items-center justify-end gap-3 p-6 border-t sticky bottom-0 glass-modal"
              style={{ borderColor: theme.colors.border }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  backgroundColor: theme.colors.bgSecondary,
                  color: theme.colors.textMuted,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!nome.trim() || saving}
                className="px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2"
                style={{
                  background: nome.trim()
                    ? `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`
                    : theme.colors.bgSecondary,
                  color: nome.trim() ? '#fff' : theme.colors.textMuted,
                  opacity: saving ? 0.7 : 1,
                  boxShadow: nome.trim() ? `0 4px 20px ${theme.colors.gradientFrom}40` : 'none',
                }}
              >
                {saving
                  ? <><Loader2 size={15} className="animate-spin" /> Salvando...</>
                  : editingProjeto ? 'Atualizar' : 'Criar Projeto'
                }
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Field wrapper ──
function Field({
  label, icon, theme, children, extra,
}: {
  label: string; icon: React.ReactNode; theme: any; children: React.ReactNode; extra?: React.ReactNode
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs font-bold mb-2" style={{ color: theme.colors.textMuted }}>
        <span style={{ color: theme.colors.accent }}>{icon}</span>
        {label}
        {extra}
      </label>
      {children}
    </div>
  )
}

// ── Checklist section ──
function ChecklistSection({
  title, icon, items, inputValue, onInputChange, onAdd, onToggle, onRemove, theme, accentColor,
}: {
  title: string; icon: string; items: ChecklistItem[]
  inputValue: string; onInputChange: (v: string) => void
  onAdd: () => void; onToggle: (id: string) => void; onRemove: (id: string) => void
  theme: any; accentColor: string
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <h4 className="text-xs font-black mb-3 flex items-center gap-1.5" style={{ color: theme.colors.textSecondary }}>
        <span>{icon}</span>
        {title.toUpperCase()}
        <span className="ml-auto px-1.5 py-0.5 rounded-full text-xs"
          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
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
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
          }}
        />
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={onAdd}
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
          <Plus size={14} />
        </motion.button>
      </div>

      <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto">
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
                {item.feito
                  ? <CheckSquare size={14} style={{ color: '#00cc44' }} />
                  : <Square size={14} style={{ color: theme.colors.textMuted }} />
                }
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
          <p className="text-xs text-center py-3" style={{ color: theme.colors.textMuted }}>
            Nenhum item ainda
          </p>
        )}
      </div>
    </div>
  )
}
