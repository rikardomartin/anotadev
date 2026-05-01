import { useState, useEffect, useCallback } from 'react'
import { supabase, type Projeto } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useProjetos() {
  const { user } = useAuth()
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjetos = useCallback(async () => {
    if (!user) {
      setProjetos([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('projetos')
      .select('*')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setProjetos(data || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchProjetos()
  }, [fetchProjetos])

  const criarProjeto = async (projeto: Omit<Projeto, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null
    const { data, error: err } = await supabase
      .from('projetos')
      .insert([{ ...projeto, user_id: user.uid }])
      .select()
      .single()

    if (err) throw new Error(err.message)
    setProjetos(prev => [data, ...prev])
    return data
  }

  const atualizarProjeto = async (id: string, updates: Partial<Projeto>) => {
    const { data, error: err } = await supabase
      .from('projetos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (err) throw new Error(err.message)
    setProjetos(prev => prev.map(p => (p.id === id ? data : p)))
    return data
  }

  const deletarProjeto = async (id: string) => {
    const { error: err } = await supabase
      .from('projetos')
      .delete()
      .eq('id', id)

    if (err) throw new Error(err.message)
    setProjetos(prev => prev.filter(p => p.id !== id))
  }

  return {
    projetos,
    loading,
    error,
    fetchProjetos,
    criarProjeto,
    atualizarProjeto,
    deletarProjeto,
  }
}
