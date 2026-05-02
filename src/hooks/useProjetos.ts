import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, type Projeto } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

type CommitCallback = (projeto: Projeto, commitMsg: string) => void

export function useProjetos(onNewCommit?: CommitCallback) {
  const { user } = useAuth()
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const onNewCommitRef = useRef(onNewCommit)
  onNewCommitRef.current = onNewCommit

  const fetchProjetos = useCallback(async () => {
    if (!user) { setProjetos([]); setLoading(false); return }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('projetos')
      .select('*')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: false })

    if (err) setError(err.message)
    else setProjetos(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchProjetos() }, [fetchProjetos])

  // ── Realtime subscription ──────────────────────────────────────────────
  // Escuta mudanças na tabela projetos e atualiza o estado local
  // Quando last_commit_msg muda → dispara o callback onNewCommit
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`projetos:${user.uid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projetos',
          filter: `user_id=eq.${user.uid}`,
        },
        (payload) => {
          const updated = payload.new as Projeto
          const old = payload.old as Projeto

          // Atualiza o projeto no estado local
          setProjetos(prev =>
            prev.map(p => (p.id === updated.id ? { ...p, ...updated } : p))
          )

          // Se o last_commit_msg mudou → novo commit chegou via webhook!
          if (
            updated.last_commit_msg &&
            updated.last_commit_msg !== old.last_commit_msg &&
            onNewCommitRef.current
          ) {
            onNewCommitRef.current(updated, updated.last_commit_msg)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'projetos',
          filter: `user_id=eq.${user.uid}`,
        },
        (payload) => {
          const inserted = payload.new as Projeto
          setProjetos(prev => {
            if (prev.find(p => p.id === inserted.id)) return prev
            return [inserted, ...prev]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'projetos',
        },
        (payload) => {
          const deleted = payload.old as Projeto
          setProjetos(prev => prev.filter(p => p.id !== deleted.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const criarProjeto = async (
    projeto: Omit<Projeto, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return null

    // Herda o secret global se o projeto não tiver um específico
    const globalSecret = localStorage.getItem('webhook-secret-global') || ''
    const finalSecret = projeto.webhook_secret?.trim() || globalSecret

    const { data, error: err } = await supabase
      .from('projetos')
      .insert([{ ...projeto, webhook_secret: finalSecret, user_id: user.uid }])
      .select()
      .single()
    if (err) throw new Error(err.message)
    setProjetos(prev => [data, ...prev])
    return data
  }

  const atualizarProjeto = async (id: string, updates: Partial<Projeto>) => {
    // Herda o secret global se o update não tiver um específico
    const globalSecret = localStorage.getItem('webhook-secret-global') || ''
    const finalSecret = updates.webhook_secret?.trim() || globalSecret

    const { data, error: err } = await supabase
      .from('projetos')
      .update({
        ...updates,
        webhook_secret: finalSecret,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    if (err) throw new Error(err.message)
    setProjetos(prev => prev.map(p => (p.id === id ? data : p)))
    return data
  }

  const deletarProjeto = async (id: string) => {
    const { error: err } = await supabase.from('projetos').delete().eq('id', id)
    if (err) throw new Error(err.message)
    setProjetos(prev => prev.filter(p => p.id !== id))
  }

  return { projetos, loading, error, fetchProjetos, criarProjeto, atualizarProjeto, deletarProjeto }
}
