import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Sessão atual do Supabase.
 *
 * `carregando` existe para separar "ainda não sei" de "não tem ninguém
 * logado" — sem isso a tela de login pisca antes de a sessão salva ser lida.
 */
export function useSessao() {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      setCarregando(false)
    })

    const { data: inscricao } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao)
    })

    return () => inscricao.subscription.unsubscribe()
  }, [])

  return { sessao, carregando }
}
