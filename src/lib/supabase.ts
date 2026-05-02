import { createClient } from '@supabase/supabase-js'

// Prioridade: env vars do build (produção) > localStorage (configurado pelo usuário)
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  localStorage.getItem('sb-url') ||
  'https://placeholder.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  localStorage.getItem('sb-key') ||
  'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type ChecklistItem = {
  id: string
  texto: string
  feito: boolean
}

export type Projeto = {
  id?: string
  user_id: string
  nome: string
  github_url: string
  contas_vinculadas: string[]
  descricao: string
  tech_stack: string[]
  pendencias: ChecklistItem[]
  concluidos: ChecklistItem[]
  webhook_secret?: string
  last_commit_msg?: string
  created_at?: string
  updated_at?: string
}

export type GitHubRepo = {
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
  open_issues_count: number
  default_branch: string
  visibility: string
}
