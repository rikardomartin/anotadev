import { motion } from 'framer-motion'
import {
  GitBranch,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  Edit3,
  Star,
  GitFork,
  AlertCircle,
  Wifi,
  WifiOff,
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
    progress === 100
      ? '#00cc44'
      : progress >= 50
      ? theme.colors.accentSecondary
      : theme.colors.accent

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative rounded-xl overflow-hidden cursor-pointer group ${theme.colors.gradientClass}`}
      style={{ backgroundColor: theme.colors.bgCard }}
    >
      {/* Inner content */}
      <div className="p-5 flex flex-col gap-3 h-full">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-base leading-tight truncate"
              style={{ color: theme.colors.text, fontFamily: 'Montserrat, Inter, sans-serif' }}
            >
              {projeto.nome}
            </h3>
            {githubData?.language && (
              <span
                className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${theme.colors.accent}20`,
                  color: theme.colors.accent,
                }}
              >
                {githubData.language}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onEdit(projeto) }}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: theme.colors.textMuted }}
              onMouseEnter={e => (e.currentTarget.style.color = theme.colors.accent)}
              onMouseLeave={e => (e.currentTarget.style.color = theme.colors.textMuted)}
            >
              <Edit3 size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onDelete(projeto.id!) }}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: theme.colors.textMuted }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ff4444')}
              onMouseLeave={e => (e.currentTarget.style.color = theme.colors.textMuted)}
            >
              <Trash2 size={14} />
            </motion.button>
          </div>
        </div>

        {/* Description */}
        {projeto.descricao && (
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: theme.colors.textMuted }}
          >
            {githubData?.description || projeto.descricao}
          </p>
        )}

        {/* GitHub stats */}
        {githubData && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" style={{ color: theme.colors.textMuted }}>
              <Star size={12} />
              <span className="text-xs">{githubData.stargazers_count}</span>
            </div>
            <div className="flex items-center gap-1" style={{ color: theme.colors.textMuted }}>
              <GitFork size={12} />
              <span className="text-xs">{githubData.forks_count}</span>
            </div>
            {githubData.open_issues_count > 0 && (
              <div className="flex items-center gap-1" style={{ color: '#ff9900' }}>
                <AlertCircle size={12} />
                <span className="text-xs">{githubData.open_issues_count} issues</span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto" style={{ color: theme.colors.textMuted }}>
              {githubData.visibility === 'public' ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span className="text-xs">{githubData.visibility}</span>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {total > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium" style={{ color: theme.colors.textMuted }}>
                Progresso
              </span>
              <span className="text-xs font-bold" style={{ color: statusColor }}>
                {progress}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: `${theme.colors.border}` }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: index * 0.05 + 0.3, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
                }}
              />
            </div>
          </div>
        )}

        {/* Checklist summary */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} style={{ color: '#00cc44' }} />
            <span className="text-xs" style={{ color: theme.colors.textMuted }}>
              {totalConcluidos} feitos
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} style={{ color: theme.colors.accent }} />
            <span className="text-xs" style={{ color: theme.colors.textMuted }}>
              {totalPendencias} pendentes
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-2 mt-auto border-t"
          style={{ borderColor: theme.colors.border }}
        >
          {/* Contas vinculadas */}
          {projeto.contas_vinculadas?.length > 0 && (
            <div className="flex items-center gap-1">
              {projeto.contas_vinculadas.slice(0, 3).map((conta, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: theme.colors.accent,
                    color: '#fff',
                    fontSize: '9px',
                  }}
                  title={conta}
                >
                  {conta[0]?.toUpperCase()}
                </div>
              ))}
              {projeto.contas_vinculadas.length > 3 && (
                <span className="text-xs" style={{ color: theme.colors.textMuted }}>
                  +{projeto.contas_vinculadas.length - 3}
                </span>
              )}
            </div>
          )}

          {/* GitHub link */}
          {projeto.github_url && (
            <motion.a
              whileHover={{ scale: 1.1 }}
              href={projeto.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs transition-colors ml-auto"
              style={{ color: theme.colors.textMuted }}
              onMouseEnter={e => (e.currentTarget.style.color = theme.colors.accent)}
              onMouseLeave={e => (e.currentTarget.style.color = theme.colors.textMuted)}
            >
              <GitBranch size={13} />
              <ExternalLink size={11} />
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
