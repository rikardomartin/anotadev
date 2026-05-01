import { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, GitBranch, Database, User, Check, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
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

  const saveGitHub = () => {
    localStorage.setItem('gh-token', githubToken)
    localStorage.setItem('gh-username', githubUsername)
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
          <Section title="Supabase" icon={<Database size={16} />} theme={theme}>
            <p className="text-xs mb-4" style={{ color: theme.colors.textMuted }}>
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
