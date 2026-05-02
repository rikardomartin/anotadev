import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Palette, GitBranch, Database, User, Check, ExternalLink, Copy, Eye, EyeOff, Heart, Phone, AtSign, Webhook, Link, Zap, Star } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { GITHUB_APP, checkRateLimit } from '../lib/github'
import toast from 'react-hot-toast'

export default function Settings() {
  const { theme, themes, setThemeById } = useTheme()
  const { user } = useAuth()
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('gh-token') || '')
  const [githubUsername, setGithubUsername] = useState(() => localStorage.getItem('gh-username') || '')
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('sb-url') || '')
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('sb-key') || '')
  const [showToken, setShowToken] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const WEBHOOK_SECRET = 'AnotaDev@2026#Webhook$Ricardo!'
  const WEBHOOK_URL = 'https://cmksgidpvuhkfcqlbgkn.supabase.co/functions/v1/github-webhook'
  const [rateLimit, setRateLimit] = useState<{ remaining: number; limit: number } | null>(null)
  const [checkingRate, setCheckingRate] = useState(false)

  // Garante que o secret global está sempre salvo no localStorage
  useEffect(() => {
    if (!localStorage.getItem('webhook-secret-global')) {
      localStorage.setItem('webhook-secret-global', WEBHOOK_SECRET)
    }
  }, [])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`, {
      style: { background: theme.colors.bgModal, color: theme.colors.text, border: `1px solid ${theme.colors.border}` },
      iconTheme: { primary: theme.colors.accent, secondary: '#fff' },
    })
  }

  const handleCheckRateLimit = async () => {
    setCheckingRate(true)
    const result = await checkRateLimit(githubToken)
    if (result) {
      setRateLimit(result)
      toast.success(`API: ${result.remaining}/${result.limit} requests restantes`, {
        style: { background: theme.colors.bgModal, color: theme.colors.text, border: `1px solid ${theme.colors.border}` },
        iconTheme: { primary: theme.colors.accent, secondary: '#fff' },
      })
    } else {
      toast.error('Não foi possível verificar o rate limit', {
        style: { background: theme.colors.bgModal, color: theme.colors.text, border: `1px solid ${theme.colors.border}` },
      })
    }
    setCheckingRate(false)
  }

  const saveGitHub = () => {
    localStorage.setItem('gh-token', githubToken)
    localStorage.setItem('gh-username', githubUsername)
    // Salva o secret global para herança nos projetos
    localStorage.setItem('webhook-secret-global', WEBHOOK_SECRET)
    toast.success('Configurações do GitHub salvas!', {
      style: { background: theme.colors.bgModal, color: theme.colors.text, border: `1px solid ${theme.colors.border}` },
      iconTheme: { primary: theme.colors.accent, secondary: '#fff' },
    })
  }

  const saveSupabase = () => {
    localStorage.setItem('sb-url', supabaseUrl)
    localStorage.setItem('sb-key', supabaseKey)
    toast.success('Configurações do Supabase salvas! Recarregue a página.', {
      style: { background: theme.colors.bgModal, color: theme.colors.text, border: `1px solid ${theme.colors.border}` },
      iconTheme: { primary: theme.colors.accent, secondary: '#fff' },
    })
  }

  const copySQL = () => {
    const sql = `-- Tabela de projetos para AnotaDev
CREATE TABLE IF NOT EXISTS projetos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  github_url TEXT DEFAULT '',
  contas_vinculadas JSONB DEFAULT '[]',
  tech_stack JSONB DEFAULT '[]',
  descricao TEXT DEFAULT '',
  pendencias JSONB DEFAULT '[]',
  concluidos JSONB DEFAULT '[]',
  webhook_secret TEXT DEFAULT '',
  last_commit_msg TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects"
  ON projetos FOR ALL
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE INDEX IF NOT EXISTS projetos_user_id_idx ON projetos(user_id);`
    navigator.clipboard.writeText(sql)
    toast.success('SQL copiado!', {
      style: { background: theme.colors.bgModal, color: theme.colors.text, border: `1px solid ${theme.colors.border}` },
    })
  }

  const inputStyle = {
    backgroundColor: theme.colors.bgSecondary,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.text,
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-6" style={{ backgroundColor: theme.colors.bg }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1
            className="text-3xl font-black mb-1"
            style={{ color: theme.colors.text, fontFamily: 'Montserrat, Inter, sans-serif' }}
          >
            Configurações
          </h1>
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>
            Personalize o AnotaDev ao seu gosto
          </p>
        </motion.div>

        <div className="flex flex-col gap-6">
          {/* Profile */}
          <Section title="Perfil" icon={<User size={16} />} theme={theme}>
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-16 h-16 rounded-2xl" style={{ outline: `2px solid ${theme.colors.accent}`, outlineOffset: '2px' }} />
              ) : (
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`, color: '#fff' }}>
                  {user?.displayName?.[0]}
                </div>
              )}
              <div>
                <p className="font-bold text-lg" style={{ color: theme.colors.text }}>{user?.displayName}</p>
                <p className="text-sm" style={{ color: theme.colors.textMuted }}>{user?.email}</p>
                <p className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
                  style={{ backgroundColor: `${theme.colors.accent}20`, color: theme.colors.accent }}>
                  Google Account
                </p>
              </div>
            </div>
          </Section>

          {/* Themes */}
          <Section title="Temas" icon={<Palette size={16} />} theme={theme}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {themes.map(t => (
                <motion.button
                  key={t.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setThemeById(t.id)}
                  className="relative p-4 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: t.colors.bgCard,
                    border: `2px solid ${theme.id === t.id ? t.colors.accent : t.colors.border}`,
                  }}
                >
                  {theme.id === t.id && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: t.colors.accent }}
                    >
                      <Check size={11} color="#fff" />
                    </div>
                  )}
                  {/* Color preview */}
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.accent }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.accentSecondary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.bg }} />
                  </div>
                  <p className="font-bold text-sm" style={{ color: t.colors.text }}>{t.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: t.colors.textMuted }}>
                    {t.mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  </p>
                  {/* Gradient preview bar */}
                  <div
                    className="h-1 rounded-full mt-3"
                    style={{ background: `linear-gradient(90deg, ${t.colors.gradientFrom}, ${t.colors.gradientTo})` }}
                  />
                </motion.button>
              ))}
            </div>
          </Section>

          {/* GitHub */}
          <Section title="GitHub API" icon={<GitBranch size={16} />} theme={theme}>
            <p className="text-xs mb-4" style={{ color: theme.colors.textMuted }}>
              Configure sua conta do GitHub para sincronizar dados dos repositórios automaticamente.
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: theme.colors.textMuted }}>
                  USERNAME DO GITHUB
                </label>
                <input
                  value={githubUsername}
                  onChange={e => setGithubUsername(e.target.value)}
                  placeholder="seu-usuario"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = theme.colors.accent)}
                  onBlur={e => (e.target.style.borderColor = theme.colors.border)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: theme.colors.textMuted }}>
                  PERSONAL ACCESS TOKEN (opcional, para repos privados)
                </label>
                <div className="relative">
                  <input
                    value={githubToken}
                    onChange={e => setGithubToken(e.target.value)}
                    type={showToken ? 'text' : 'password'}
                    placeholder="ghp_xxxxxxxxxxxx"
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    onFocus={e => (e.target.style.borderColor = theme.colors.accent)}
                    onBlur={e => (e.target.style.borderColor = theme.colors.border)}
                  />
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs mt-1.5 hover:underline"
                  style={{ color: theme.colors.accent }}
                >
                  <ExternalLink size={11} />
                  Gerar token no GitHub
                </a>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveGitHub}
                className="px-5 py-2.5 rounded-xl text-sm font-bold self-start"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
                  color: '#fff',
                }}
              >
                Salvar GitHub
              </motion.button>
            </div>
          </Section>

          {/* Supabase */}
          <Section title="Supabase" icon={<Database size={16} />} theme={theme}>            <p className="text-xs mb-4" style={{ color: theme.colors.textMuted }}>
              Configure a conexão com o banco de dados Supabase.
            </p>

            {/* SQL Setup */}
            <div
              className="p-4 rounded-xl mb-4"
              style={{ backgroundColor: theme.colors.bgSecondary, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold" style={{ color: theme.colors.textSecondary }}>
                  SQL para criar a tabela
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copySQL}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: `${theme.colors.accent}20`, color: theme.colors.accent }}
                >
                  <Copy size={12} />
                  Copiar SQL
                </motion.button>
              </div>
              <pre
                className="text-xs overflow-x-auto p-3 rounded-lg"
                style={{
                  backgroundColor: theme.colors.bg,
                  color: theme.colors.textMuted,
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  lineHeight: '1.6',
                }}
              >
{`CREATE TABLE projetos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  github_url TEXT DEFAULT '',
  contas_vinculadas JSONB DEFAULT '[]',
  tech_stack JSONB DEFAULT '[]',
  descricao TEXT DEFAULT '',
  pendencias JSONB DEFAULT '[]',
  concluidos JSONB DEFAULT '[]',
  webhook_secret TEXT DEFAULT '',
  last_commit_msg TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}
              </pre>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: theme.colors.textMuted }}>
                  SUPABASE URL
                </label>
                <input
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  placeholder="https://xxxx.supabase.co"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = theme.colors.accent)}
                  onBlur={e => (e.target.style.borderColor = theme.colors.border)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: theme.colors.textMuted }}>
                  ANON KEY
                </label>
                <div className="relative">
                  <input
                    value={supabaseKey}
                    onChange={e => setSupabaseKey(e.target.value)}
                    type={showKey ? 'text' : 'password'}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    onFocus={e => (e.target.style.borderColor = theme.colors.accent)}
                    onBlur={e => (e.target.style.borderColor = theme.colors.border)}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveSupabase}
                className="px-5 py-2.5 rounded-xl text-sm font-bold self-start"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
                  color: '#fff',
                }}
              >
                Salvar Supabase
              </motion.button>
            </div>
          </Section>

          {/* GitHub App */}
          <Section title="GitHub App — AnotaDev" icon={<Star size={16} />} theme={theme}>
            <p className="text-xs mb-4" style={{ color: theme.colors.textMuted }}>
              App oficial do AnotaDev registrado no GitHub. Use o Client ID para autenticação OAuth e acesso a repositórios privados com rate limit elevado (5.000 req/h).
            </p>

            {/* App info cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'App ID', value: GITHUB_APP.appId, icon: '🆔' },
                { label: 'Client ID', value: GITHUB_APP.clientId, icon: '🔑' },
                { label: 'Owner', value: `@${GITHUB_APP.owner}`, icon: '👤' },
                { label: 'Rate Limit', value: rateLimit ? `${rateLimit.remaining}/${rateLimit.limit}` : 'Verificar →', icon: '⚡' },
              ].map(item => (
                <div
                  key={item.label}
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: theme.colors.bgSecondary, border: `1px solid ${theme.colors.border}` }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs">{item.icon}</span>
                    <span className="text-xs font-bold" style={{ color: theme.colors.textMuted }}>{item.label}</span>
                  </div>
                  <p className="text-xs font-mono font-semibold truncate" style={{ color: theme.colors.textSecondary }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => copyToClipboard(GITHUB_APP.clientId, 'Client ID')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
                style={{ backgroundColor: `${theme.colors.accent}20`, color: theme.colors.accent, border: `1px solid ${theme.colors.accent}30` }}
              >
                <Copy size={12} />
                Copiar Client ID
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckRateLimit}
                disabled={checkingRate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
                style={{ backgroundColor: `${theme.colors.accentSecondary}20`, color: theme.colors.accentSecondary, border: `1px solid ${theme.colors.accentSecondary}30` }}
              >
                <Zap size={12} />
                {checkingRate ? 'Verificando...' : 'Checar Rate Limit'}
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={GITHUB_APP.installUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
                style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.textSecondary, border: `1px solid ${theme.colors.border}` }}
              >
                <ExternalLink size={12} />
                Instalar App no GitHub
              </motion.a>
            </div>
          </Section>

          {/* Webhook */}
          <Section title="GitHub Webhook" icon={<Webhook size={16} />} theme={theme}>
            <p className="text-xs mb-4" style={{ color: theme.colors.textMuted }}>
              Configure o webhook no GitHub para atualizar automaticamente o campo "Já implantado" a cada novo commit.
            </p>

            {/* Webhook URL */}
            <div className="mb-4">
              <label className="text-xs font-bold mb-2 block" style={{ color: theme.colors.textMuted }}>
                PAYLOAD URL — cole no GitHub
              </label>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ backgroundColor: theme.colors.bgSecondary, border: `1px solid ${theme.colors.border}` }}
              >
                <Link size={13} style={{ color: theme.colors.accent, flexShrink: 0 }} />
                <span className="flex-1 text-xs font-mono truncate" style={{ color: theme.colors.textSecondary }}>
                  {WEBHOOK_URL}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyToClipboard(WEBHOOK_URL, 'URL')}
                  className="flex-shrink-0 p-1.5 rounded-lg"
                  style={{ backgroundColor: `${theme.colors.accent}20`, color: theme.colors.accent }}
                >
                  <Copy size={13} />
                </motion.button>
              </div>
            </div>

            {/* Webhook Secret */}
            <div className="mb-4">
              <label className="text-xs font-bold mb-2 block" style={{ color: theme.colors.textMuted }}>
                SECRET — cole no GitHub E no campo "Webhook Secret" de cada projeto
              </label>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{
                  backgroundColor: theme.colors.bgSecondary,
                  border: `1px solid ${theme.colors.accentSecondary}40`,
                }}
              >
                <span className="text-xs" style={{ color: theme.colors.accentSecondary }}>🔑</span>
                <span className="flex-1 text-sm font-mono font-bold" style={{ color: theme.colors.accentSecondary }}>
                  {WEBHOOK_SECRET}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyToClipboard(WEBHOOK_SECRET, 'Secret')}
                  className="flex-shrink-0 p-1.5 rounded-lg"
                  style={{ backgroundColor: `${theme.colors.accentSecondary}20`, color: theme.colors.accentSecondary }}
                >
                  <Copy size={13} />
                </motion.button>
              </div>
            </div>

            {/* Instruções */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: theme.colors.bgSecondary, border: `1px solid ${theme.colors.border}` }}
            >
              <p className="text-xs font-bold mb-3" style={{ color: theme.colors.textSecondary }}>
                📋 Checklist de configuração
              </p>
              {[
                { step: '1', text: 'No GitHub: Settings → Webhooks → Add webhook', done: true },
                { step: '2', text: 'Cole a Payload URL acima', done: true },
                { step: '3', text: 'Content type: application/json', done: true },
                { step: '4', text: 'Cole o Secret acima no campo Secret do GitHub', done: false },
                { step: '5', text: 'Selecione "Just the push event"', done: false },
                { step: '6', text: 'No AnotaDev, abra cada projeto → cole o mesmo Secret no campo "Webhook Secret"', done: false },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-2 mb-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: item.done ? `${theme.colors.accent}20` : `${theme.colors.accentSecondary}20`,
                      color: item.done ? theme.colors.accent : theme.colors.accentSecondary,
                    }}
                  >
                    {item.step}
                  </div>
                  <span className="text-xs leading-relaxed" style={{ color: theme.colors.textMuted }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* Desenvolvido por */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 text-center"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.bgCard}, ${theme.colors.bgSecondary})`,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <span className="text-xs font-semibold" style={{ color: theme.colors.textMuted }}>
                Desenvolvido com
              </span>
              <Heart size={13} style={{ color: theme.colors.accent }} fill={theme.colors.accent} />
              <span className="text-xs font-semibold" style={{ color: theme.colors.textMuted }}>
                por
              </span>
            </div>

            <p
              className="text-lg font-black mb-4"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Ricardo Martins
            </p>

            <div className="flex items-center justify-center gap-6">
              <a
                href="tel:21970902074"
                className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: theme.colors.textSecondary }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${theme.colors.accent}20` }}
                >
                  <Phone size={13} style={{ color: theme.colors.accent }} />
                </div>
                (21) 97090-2074
              </a>

              <div className="w-px h-6" style={{ backgroundColor: theme.colors.border }} />

              <a
                href="mailto:tecnicorikardo@gmail.com"
                className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: theme.colors.textSecondary }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${theme.colors.accent}20` }}
                >
                  <AtSign size={13} style={{ color: theme.colors.accent }} />
                </div>
                tecnicorikardo
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  icon,
  theme,
  children,
}: {
  title: string
  icon: React.ReactNode
  theme: any
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6"
      style={{
        backgroundColor: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <h2
        className="flex items-center gap-2 text-base font-bold mb-5"
        style={{ color: theme.colors.text }}
      >
        <span style={{ color: theme.colors.accent }}>{icon}</span>
        {title}
      </h2>
      {children}
    </motion.div>
  )
}
