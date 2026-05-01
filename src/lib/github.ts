import type { GitHubRepo } from './supabase'

const GITHUB_API = 'https://api.github.com'

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

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(`${GITHUB_API}/repos/${parsed.owner}/${parsed.repo}`, { headers })
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
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(
      `${GITHUB_API}/users/${username}/repos?sort=updated&per_page=100`,
      { headers }
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
