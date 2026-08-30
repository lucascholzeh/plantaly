import { supabase } from '../lib/supabase'

export interface Perfil {
  id: string
  email: string
  time_zone: string
  notification_hour: number
}

export async function buscarPerfil(): Promise<Perfil> {
  const { data: sessao } = await supabase.auth.getUser()
  if (!sessao.user) throw new Error('Sem sessão ativa')

  const { data, error } = await supabase
    .from('profiles')
    .select('id, time_zone, notification_hour')
    .eq('id', sessao.user.id)
    .single()

  if (error) throw new Error(`Não consegui carregar o perfil: ${error.message}`)
  return { ...data, email: sessao.user.email ?? '' }
}

export async function salvarPerfil(
  campos: Partial<Pick<Perfil, 'time_zone' | 'notification_hour'>>,
): Promise<void> {
  const { data: sessao } = await supabase.auth.getUser()
  if (!sessao.user) throw new Error('Sem sessão ativa')

  const { error } = await supabase.from('profiles').update(campos).eq('id', sessao.user.id)
  if (error) throw new Error(`Não consegui salvar: ${error.message}`)
}
