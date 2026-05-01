import { createClient } from '@supabase/supabase-js'

// Read from localStorage (set via Settings page) or env vars
const supabaseUrl =
  localStorage.getItem('sb-url') ||
  import.meta.env.VITE_SUPABASE_URL ||
  'https://placeholder.supabase.co'

const supabaseAnonKey =
  localStorage.getItem('sb-key') ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
