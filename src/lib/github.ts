import type { GitHubRepo } from './supabase'

const GITHUB_API = 'https://api.github.com'

// GitHub App credentials
export const GITHUB_APP = {
  appId: '3571929',
  clientId: 'Iv23liiE9qXh3VBn69Yv',
  owner: 'rikardomartin',
  appUrl: 'https://github.com/apps/anotadev',
  installUrl: 'https://github.com/apps/anotadev/installations/new',
}

// Build auth headers — prefers token, falls back to nothing (public API)
function buildHeaders(token?: string): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  const stored = token || localStorage.getItem('gh-token') || ''
  if (stored) h['Authorization'] = `Bearer ${stored}`
  return h
}

// Extract owner/repo from a GitHub URL
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null
  try {
    const clean = url.replace(/\.git$/, '').replace(/\/$/, '')
    const match = clean.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) return null
    return { owner: match[1], repo: match[2] }
  } catch {
    return null
  }
}

// Fetch repo info from GitHub API
export async function fetchGitHubRepo(url: string, token?: string): Promise<GitHubRepo | null> {
  const parsed = parseGitHubUrl(url)
  if (!parsed) return null

  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${parsed.owner}/${parsed.repo}`,
      { headers: buildHeaders(token) }
    )
    if (!res.ok) return null
    const data = await res.json()
    return {
      name: data.name,
      description: data.description,
      html_url: data.html_url,
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
      language: data.language,
      updated_at: data.updated_at,
      open_issues_count: data.open_issues_count,
      default_branch: data.default_branch,
      visibility: data.visibility,
    }
  } catch {
    return null
  }
}

// Fetch all repos for a user
export async function fetchUserRepos(username: string, token?: string): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `${GITHUB_API}/users/${username}/repos?sort=updated&per_page=100`,
      { headers: buildHeaders(token) }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.map((r: any) => ({
      name: r.name,
      description: r.description,
      html_url: r.html_url,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      language: r.language,
      updated_at: r.updated_at,
      open_issues_count: r.open_issues_count,
      default_branch: r.default_branch,
      visibility: r.visibility,
    }))
  } catch {
    return []
  }
}

// Fetch recent commits for a repo
export async function fetchRecentCommits(
  url: string,
  token?: string,
  perPage = 10
): Promise<{ sha: string; message: string; author: string; date: string; url: string }[]> {
  const parsed = parseGitHubUrl(url)
  if (!parsed) return []

  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${parsed.owner}/${parsed.repo}/commits?per_page=${perPage}`,
      { headers: buildHeaders(token) }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.map((c: any) => ({
      sha: c.sha?.slice(0, 7) || '',
      message: c.commit?.message?.split('\n')[0] || '',
      author: c.commit?.author?.name || '',
      date: c.commit?.author?.date || '',
      url: c.html_url || '',
    }))
  } catch {
    return []
  }
}

// Fetch repository topics (tags)
export async function fetchRepoTopics(url: string, token?: string): Promise<string[]> {
  const parsed = parseGitHubUrl(url)
  if (!parsed) return []

  try {
    const headers = {
      ...buildHeaders(token),
      Accept: 'application/vnd.github.mercy-preview+json',
    }
    const res = await fetch(
      `${GITHUB_API}/repos/${parsed.owner}/${parsed.repo}/topics`,
      { headers }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.names || []).slice(0, 8) // máximo 8 topics
  } catch {
    return []
  }
}

// Check GitHub API rate limit
export async function checkRateLimit(token?: string): Promise<{ remaining: number; limit: number; reset: Date } | null> {
  try {
    const res = await fetch(`${GITHUB_API}/rate_limit`, { headers: buildHeaders(token) })
    if (!res.ok) return null
    const data = await res.json()
    return {
      remaining: data.rate.remaining,
      limit: data.rate.limit,
      reset: new Date(data.rate.reset * 1000),
    }
  } catch {
    return null
  }
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d atrás`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}m atrás`
  return `${Math.floor(diff / 31536000)}a atrás`
}
