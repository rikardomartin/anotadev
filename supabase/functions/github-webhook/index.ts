/**
 * AnotaDev — GitHub Webhook Handler
 * Supabase Edge Function (Deno runtime)
 *
 * Fluxo:
 *  1. GitHub envia POST com payload de "push"
 *  2. Verificamos a assinatura HMAC-SHA256 com o webhook_secret do projeto
 *  3. Identificamos o repositório pelo nome (campo github_url na tabela projetos)
 *  4. Para cada commit, adicionamos a mensagem em `concluidos` (tasks_done)
 *  5. Atualizamos `last_commit_msg` com o commit mais recente
 *  6. Retornamos 200 OK
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Tipos ──────────────────────────────────────────────────────────────────

interface GitHubCommit {
  id: string
  message: string
  timestamp: string
  author: { name: string; email: string }
  url: string
}

interface GitHubPushPayload {
  ref: string
  repository: {
    name: string
    full_name: string
    html_url: string
  }
  commits: GitHubCommit[]
  head_commit: GitHubCommit | null
  pusher: { name: string; email: string }
}

interface ChecklistItem {
  id: string
  texto: string
  feito: boolean
}

interface Projeto {
  id: string
  github_url: string
  webhook_secret: string
  concluidos: ChecklistItem[]
  pendencias: ChecklistItem[]
  last_commit_msg: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Gera um ID simples compatível com Deno (sem crypto.randomUUID em todos os contextos) */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

/**
 * Verifica a assinatura HMAC-SHA256 enviada pelo GitHub no header
 * X-Hub-Signature-256: sha256=<hex>
 */
async function verifySignature(
  secret: string,
  body: string,
  signatureHeader: string | null
): Promise<boolean> {
  if (!signatureHeader) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const hexSignature = 'sha256=' + Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Comparação segura (timing-safe)
  if (hexSignature.length !== signatureHeader.length) return false
  let mismatch = 0
  for (let i = 0; i < hexSignature.length; i++) {
    mismatch |= hexSignature.charCodeAt(i) ^ signatureHeader.charCodeAt(i)
  }
  return mismatch === 0
}

/**
 * Extrai o nome do repositório de uma URL do GitHub
 * Ex: https://github.com/user/repo → repo
 */
function extractRepoName(url: string): string {
  return url.replace(/\.git$/, '').split('/').pop() || ''
}

/**
 * Filtra mensagens de commit que não são merges automáticos ou vazias
 */
function isRelevantCommit(message: string): boolean {
  const lower = message.toLowerCase().trim()
  if (!lower) return false
  if (lower.startsWith('merge pull request')) return false
  if (lower.startsWith('merge branch')) return false
  if (lower === 'initial commit') return false
  return true
}

// ── Handler principal ──────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Hub-Signature-256, X-GitHub-Event',
      },
    })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  // Só processa eventos de push
  const githubEvent = req.headers.get('X-GitHub-Event')
  if (githubEvent !== 'push') {
    return json({ message: `Event "${githubEvent}" ignored — only "push" is handled` }, 200)
  }

  // Lê o body como texto (necessário para verificar assinatura)
  const rawBody = await req.text()
  let payload: GitHubPushPayload

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return json({ error: 'Invalid JSON payload' }, 400)
  }

  const repoName = payload.repository?.name
  const repoFullName = payload.repository?.full_name

  if (!repoName) {
    return json({ error: 'Missing repository name in payload' }, 400)
  }

  // ── Conecta ao Supabase com a service_role key (acesso total) ──
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })

  // ── Busca projetos que correspondem ao repositório ──
  // Procura por github_url que contenha o nome do repo
  const { data: projetos, error: fetchError } = await supabase
    .from('projetos')
    .select('id, github_url, webhook_secret, concluidos, pendencias, last_commit_msg')
    .or(`github_url.ilike.%/${repoName},github_url.ilike.%/${repoName}.git,github_url.ilike.%/${repoFullName}`)

  if (fetchError) {
    console.error('Supabase fetch error:', fetchError)
    return json({ error: 'Database error', details: fetchError.message }, 500)
  }

  if (!projetos || projetos.length === 0) {
    return json({
      message: `No project found matching repository "${repoName}"`,
      tip: 'Make sure the github_url in your project matches the repository URL',
    }, 200)
  }

  const signatureHeader = req.headers.get('X-Hub-Signature-256')
  const results: Array<{ projectId: string; status: string; commitsAdded: number }> = []

  for (const projeto of projetos as Projeto[]) {
    // ── Verifica assinatura se o projeto tem webhook_secret configurado ──
    if (projeto.webhook_secret) {
      const valid = await verifySignature(projeto.webhook_secret, rawBody, signatureHeader)
      if (!valid) {
        console.warn(`Signature mismatch for project ${projeto.id}`)
        results.push({ projectId: projeto.id, status: 'signature_mismatch', commitsAdded: 0 })
        continue
      }
    }

    // ── Processa os commits ──
    const commits = payload.commits || []
    const relevantCommits = commits.filter(c => isRelevantCommit(c.message))

    if (relevantCommits.length === 0 && !payload.head_commit) {
      results.push({ projectId: projeto.id, status: 'no_relevant_commits', commitsAdded: 0 })
      continue
    }

    // Monta os novos itens de checklist
    const newItems: ChecklistItem[] = relevantCommits.map(commit => ({
      id: generateId(),
      texto: `[${commit.id.slice(0, 7)}] ${commit.message.split('\n')[0].trim()}`,
      feito: true,
    }))

    // Evita duplicatas: verifica se o commit já existe pelo texto
    const existingTexts = new Set(
      (projeto.concluidos || []).map((item: ChecklistItem) => item.texto)
    )
    const uniqueNewItems = newItems.filter(item => !existingTexts.has(item.texto))

    if (uniqueNewItems.length === 0) {
      results.push({ projectId: projeto.id, status: 'already_up_to_date', commitsAdded: 0 })
      continue
    }

    // Prepend: commits mais recentes aparecem primeiro
    const updatedConcluidos = [...uniqueNewItems, ...(projeto.concluidos || [])]

    // Última mensagem de commit (sem o hash)
    const latestCommit = payload.head_commit || relevantCommits[0]
    const lastCommitMsg = latestCommit
      ? `[${latestCommit.id.slice(0, 7)}] ${latestCommit.message.split('\n')[0].trim()}`
      : projeto.last_commit_msg

    // ── Atualiza o projeto no banco ──
    const { error: updateError } = await supabase
      .from('projetos')
      .update({
        concluidos: updatedConcluidos,
        last_commit_msg: lastCommitMsg,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projeto.id)

    if (updateError) {
      console.error(`Update error for project ${projeto.id}:`, updateError)
      results.push({ projectId: projeto.id, status: 'update_error', commitsAdded: 0 })
      continue
    }

    console.log(`✅ Project ${projeto.id}: added ${uniqueNewItems.length} commit(s)`)
    results.push({
      projectId: projeto.id,
      status: 'updated',
      commitsAdded: uniqueNewItems.length,
    })
  }

  return json({
    success: true,
    repository: repoFullName,
    branch: payload.ref?.replace('refs/heads/', ''),
    pusher: payload.pusher?.name,
    totalCommits: payload.commits?.length || 0,
    projectsUpdated: results.filter(r => r.status === 'updated').length,
    results,
  }, 200)
})

// ── Utilitário de resposta JSON ────────────────────────────────────────────
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
