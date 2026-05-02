import { motion } from 'framer-motion'
import {
  GitBranch, CheckCircle2, Clock, ExternalLink,
  Trash2, Edit3, Star, GitFork, AlertCircle,
  Wifi, WifiOff, GitCommitHorizontal,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import type { Projeto, GitHubRepo } from '../lib/supabase'

type Props = {
  projeto: Projeto
  githubData?: GitHubRepo | null
  onEdit: (projeto: Projeto) => void
  onDelete: (id: string) => void
  index: number
}

export default function ProjetoCard({ projeto, githubData, onEdit, onDelete, index }: Props) {
  const { theme } = useTheme()

  const totalPendencias = projeto.pendencias?.length || 0
  const totalConcluidos = projeto.concluidos?.length || 0
  const total = totalPendencias + totalConcluidos
  const progress = total > 0 ? Math.round((totalConcluidos / total) * 100) : 0

  const statusColor =
    progress === 100 ? '#00cc44'
    : progress >= 50 ? theme.colors.accentSecondary
    : theme.colors.accent

  const isCyberpunk = theme.id === 'cyberpunk'
  const isLight = theme.mode === 'light'

  // Fundo sólido do card — nunca transparente para não vazar o gradiente da borda
  const cardBg = isLight ? '#ffffff' : theme.colors.bgCard

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -5, scale: 1.015 }}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group ${theme.colors.gradientClass}`}
    >
      {/* Fundo sólido interno — cobre o gradiente da borda ::before */}
      <div
        className="absolute inset-[2px] rounded-[10px] z-0"
        style={{ backgroundColor: cardBg }}
      />

      {/* Conteúdo acima do fundo */}
      <div className="relative z-10 p-5 flex flex-col gap-3 h-full">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-black text-base leading-tight truncate"
              style={{
                color: theme.colors.text,
                fontFamily: 'Montserrat, Inter, sans-serif',
                ...(isCyberpunk ? { textShadow: `0 0 8px ${theme.colors.accent}88` } : {}),
              }}
            >
              {projeto.nome}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {githubData?.language && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{
                    backgroundColor: `${theme.colors.accent}22`,
                    color: theme.colors.accent,
                    border: `1px solid ${theme.colors.accent}33`,
                  }}
                >
                  {githubData.language}
                </span>
              )}
              {projeto.tech_stack?.filter(t => t !== githubData?.language).slice(0, 2).map(t => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${theme.colors.accentSecondary}18`,
                    color: theme.colors.accentSecondary,
                    border: `1px solid ${theme.colors.accentSecondary}28`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Actions — visíveis no hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={e => { e.stopPropagation(); onEdit(projeto) }}
              className="p-1.5 rounded-lg"
              style={{
                backgroundColor: `${theme.colors.accent}15`,
                color: theme.colors.accent,
              }}
            >
              <Edit3 size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={e => { e.stopPropagation(); onDelete(projeto.id!) }}
              className="p-1.5 rounded-lg"
              style={{
                backgroundColor: 'rgba(255,68,68,0.12)',
                color: '#ff4444',
              }}
            >
              <Trash2 size={14} />
            </motion.button>
          </div>
        </div>

        {/* Description */}
        {(projeto.descricao || githubData?.description) && (
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: theme.colors.textSecondary }}
          >
            {projeto.descricao || githubData?.description}
          </p>
        )}

        {/* Last commit badge */}
        {projeto.last_commit_msg && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{
              backgroundColor: isLight
                ? 'rgba(0,0,0,0.05)'
                : 'rgba(255,255,255,0.06)',
              border: `1px solid ${theme.colors.accentSecondary}35`,
            }}
          >
            <GitCommitHorizontal size={12} style={{ color: theme.colors.accentSecondary, flexShrink: 0 }} />
            <span
              className="text-xs truncate font-mono"
              style={{ color: theme.colors.accentSecondary }}
            >
              {projeto.last_commit_msg}
            </span>
          </div>
        )}

        {/* GitHub stats */}
        {githubData && (
          <div
            className="flex items-center gap-3 px-2.5 py-1.5 rounded-lg"
            style={{
              backgroundColor: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
            }}
          >
            <div className="flex items-center gap-1" style={{ color: theme.colors.textSecondary }}>
              <Star size={12} style={{ color: '#f59e0b' }} />
              <span className="text-xs font-semibold">{githubData.stargazers_count}</span>
            </div>
            <div className="flex items-center gap-1" style={{ color: theme.colors.textSecondary }}>
              <GitFork size={12} />
              <span className="text-xs">{githubData.forks_count}</span>
            </div>
            {githubData.open_issues_count > 0 && (
              <div className="flex items-center gap-1" style={{ color: '#ff9900' }}>
                <AlertCircle size={12} />
                <span className="text-xs font-semibold">{githubData.open_issues_count}</span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto" style={{ color: theme.colors.textSecondary }}>
              {githubData.visibility === 'public'
                ? <Wifi size={12} style={{ color: '#00cc44' }} />
                : <WifiOff size={12} />
              }
              <span className="text-xs">{githubData.visibility}</span>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {total > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                Progresso
              </span>
              <span
                className="text-xs font-black px-1.5 py-0.5 rounded-md"
                style={{
                  color: statusColor,
                  backgroundColor: `${statusColor}18`,
                }}
              >
                {progress}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{
                backgroundColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: index * 0.06 + 0.3, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
                  boxShadow: `0 0 8px ${theme.colors.gradientFrom}60`,
                }}
              />
            </div>
          </div>
        )}

        {/* Checklist summary */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{ backgroundColor: 'rgba(0,204,68,0.1)' }}
          >
            <CheckCircle2 size={13} style={{ color: '#00cc44' }} />
            <span className="text-xs font-semibold" style={{ color: '#00cc44' }}>
              {totalConcluidos} feitos
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{ backgroundColor: `${theme.colors.accent}12` }}
          >
            <Clock size={13} style={{ color: theme.colors.accent }} />
            <span className="text-xs font-semibold" style={{ color: theme.colors.accent }}>
              {totalPendencias} pendentes
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-2 mt-auto border-t"
          style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}
        >
          {projeto.contas_vinculadas?.length > 0 && (
            <div className="flex items-center gap-1">
              {projeto.contas_vinculadas.slice(0, 3).map((conta, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full flex items-center justify-center font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
                    fontSize: '10px',
                    boxShadow: `0 2px 6px ${theme.colors.gradientFrom}50`,
                  }}
                  title={conta}
                >
                  {conta[0]?.toUpperCase()}
                </div>
              ))}
              {projeto.contas_vinculadas.length > 3 && (
                <span className="text-xs ml-1" style={{ color: theme.colors.textSecondary }}>
                  +{projeto.contas_vinculadas.length - 3}
                </span>
              )}
            </div>
          )}

          {projeto.github_url && (
            <motion.a
              whileHover={{ scale: 1.1 }}
              href={projeto.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs ml-auto px-2 py-1 rounded-lg transition-colors"
              style={{
                color: theme.colors.accent,
                backgroundColor: `${theme.colors.accent}15`,
                border: `1px solid ${theme.colors.accent}25`,
              }}
            >
              <GitBranch size={12} />
              <span className="font-semibold">GitHub</span>
              <ExternalLink size={10} />
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
