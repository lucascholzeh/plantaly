import { supabase } from '../lib/supabase'
import type { EventoLinha, TipoEvento } from './tipos'

function erro(contexto: string, mensagem: string): never {
  throw new Error(`${contexto}: ${mensagem}`)
}

/**
 * Meio-dia local.
 *
 * O evento guarda um instante, mas o que importa é o dia. Gravando ao
 * meio-dia, nenhuma conversão de fuso empurra o registro para o dia
 * vizinho — o erro que a seção 11 manda evitar.
 */
function meioDiaDe(dia: string): string {
  return `${dia}T12:00:00`
}

export async function historicoDaPlanta(plantaId: string): Promise<EventoLinha[]> {
  const { data, error } = await supabase
    .from('care_events')
    .select('*')
    .eq('plant_id', plantaId)
    .order('occurred_at', { ascending: false })

  if (error) erro('Não consegui carregar o histórico', error.message)
  return data as EventoLinha[]
}

/** Eventos de um tipo, em ordem cronológica (o mais recente por último). */
export async function diasDeEvento(plantaId: string, tipo: TipoEvento): Promise<string[]> {
  const { data, error } = await supabase
    .from('care_events')
    .select('occurred_at')
    .eq('plant_id', plantaId)
    .eq('type', tipo)
    .order('occurred_at', { ascending: true })

  if (error) erro('Não consegui carregar o histórico', error.message)
  return data.map((linha) => linha.occurred_at.slice(0, 10))
}

/** Já existe registro deste tipo neste dia? Base da checagem de toque duplo. */
export async function existeNoDia(
  plantaId: string,
  tipo: TipoEvento,
  dia: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('care_events')
    .select('id')
    .eq('plant_id', plantaId)
    .eq('type', tipo)
    .gte('occurred_at', `${dia}T00:00:00`)
    .lte('occurred_at', `${dia}T23:59:59`)
    .limit(1)

  if (error) erro('Não consegui verificar o histórico', error.message)
  return data.length > 0
}

/**
 * Registra um evento. `dia` no formato AAAA-MM-DD.
 *
 * A data é parâmetro, não `now()`: registro retroativo — "reguei ontem e
 * esqueci de marcar" — é caso de primeira classe, não exceção.
 */
export async function registrarEvento(
  plantaId: string,
  tipo: TipoEvento,
  dia: string,
  nota?: string,
): Promise<string> {
  const { data: sessao } = await supabase.auth.getUser()
  if (!sessao.user) erro('Registro', 'sem sessão ativa')

  const { data, error } = await supabase
    .from('care_events')
    .insert({
      plant_id: plantaId,
      user_id: sessao.user.id,
      type: tipo,
      occurred_at: meioDiaDe(dia),
      note: nota?.trim() || null,
    })
    .select('id')
    .single()

  if (error) erro('Não consegui registrar', error.message)
  return data.id
}

/** Desfaz um registro recém-criado. */
export async function apagarEvento(id: string): Promise<void> {
  const { error } = await supabase.from('care_events').delete().eq('id', id)
  if (error) erro('Não consegui desfazer', error.message)
}
