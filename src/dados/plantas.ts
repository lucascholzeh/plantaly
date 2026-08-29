import { ajustarPorAmbiente } from '../dominio/ambiente'
import type { Ambiente, ToleranciaSeca } from '../dominio/tipos'
import { supabase } from '../lib/supabase'
import type { PlantaComStatus, PlantaLinha, StatusLinha } from './tipos'

export interface NovaPlanta {
  apelido: string
  especie: string
  ambiente: Ambiente
  /** Intervalos de referência, antes do ajuste de ambiente. */
  intervaloQuente: number
  intervaloFrio: number
  toleranciaSeca: ToleranciaSeca
  /** Nulo = "não sei quando foi a última rega" (fica sem histórico). */
  ultimaRega: string | null
}

function erro(contexto: string, mensagem: string): never {
  throw new Error(`${contexto}: ${mensagem}`)
}

/**
 * Lista as plantas ativas com o status calculado pelo banco.
 *
 * Duas consultas em vez de um join: o PostgREST não relaciona tabela com
 * view automaticamente, e com o punhado de plantas de uma casa a diferença
 * é irrelevante perto da clareza.
 */
export async function listarPlantas(): Promise<PlantaComStatus[]> {
  const [plantas, status] = await Promise.all([
    supabase.from('plants').select('*').is('archived_at', null).order('nickname'),
    supabase.from('plant_status').select('*'),
  ])

  if (plantas.error) erro('Não consegui carregar as plantas', plantas.error.message)
  if (status.error) erro('Não consegui carregar o status', status.error.message)

  const porId = new Map((status.data as StatusLinha[]).map((linha) => [linha.plant_id, linha]))

  return (plantas.data as PlantaLinha[])
    .filter((planta) => porId.has(planta.id))
    .map((planta) => ({ planta, status: porId.get(planta.id)! }))
}

export async function buscarPlanta(id: string): Promise<PlantaComStatus | null> {
  const [planta, status] = await Promise.all([
    supabase.from('plants').select('*').eq('id', id).maybeSingle(),
    supabase.from('plant_status').select('*').eq('plant_id', id).maybeSingle(),
  ])

  if (planta.error) erro('Não consegui carregar a planta', planta.error.message)
  if (!planta.data || !status.data) return null

  return { planta: planta.data as PlantaLinha, status: status.data as StatusLinha }
}

/**
 * Cadastra uma planta.
 *
 * O ambiente é aplicado aqui, uma vez, e o resultado vira o intervalo
 * efetivo da planta — a decisão estrutural 1 do design. A partir daí o
 * número é do usuário, editável, e nada mais o recalcula sozinho.
 */
export async function criarPlanta(nova: NovaPlanta): Promise<string> {
  const { data: sessao } = await supabase.auth.getUser()
  if (!sessao.user) erro('Cadastro', 'sem sessão ativa')

  const { data, error } = await supabase
    .from('plants')
    .insert({
      user_id: sessao.user.id,
      nickname: nova.apelido.trim(),
      species_label: nova.especie.trim() || null,
      species_source: 'manual',
      environment: nova.ambiente,
      water_interval_warm: ajustarPorAmbiente(nova.intervaloQuente, nova.ambiente),
      water_interval_cold: ajustarPorAmbiente(nova.intervaloFrio, nova.ambiente),
      drought_tolerance: nova.toleranciaSeca,
    })
    .select('id')
    .single()

  if (error) erro('Não consegui cadastrar a planta', error.message)

  if (nova.ultimaRega) {
    const { error: erroEvento } = await supabase.from('care_events').insert({
      plant_id: data.id,
      user_id: sessao.user.id,
      type: 'rega',
      occurred_at: `${nova.ultimaRega}T12:00:00`,
    })
    if (erroEvento) erro('Planta criada, mas não registrei a rega', erroEvento.message)
  }

  return data.id
}

export type CamposEditaveis = Partial<
  Pick<
    PlantaLinha,
    | 'nickname'
    | 'species_label'
    | 'environment'
    | 'water_interval_warm'
    | 'water_interval_cold'
    | 'fertilize_interval_warm'
    | 'fertilize_interval_cold'
    | 'rejected_interval'
  >
>

export async function atualizarPlanta(id: string, campos: CamposEditaveis): Promise<void> {
  const { error } = await supabase.from('plants').update(campos).eq('id', id)
  if (error) erro('Não consegui salvar', error.message)
}

/**
 * Arquiva: some da lista, preserva tudo.
 *
 * É o caminho para planta que morreu ou foi doada. O histórico continua
 * existindo — princípio 2 do projeto.
 */
export async function arquivarPlanta(id: string): Promise<void> {
  const { error } = await supabase
    .from('plants')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
  if (error) erro('Não consegui arquivar', error.message)
}

/**
 * Exclusão real, com o histórico junto.
 *
 * Existe só para cadastro errado. Quem chama tem obrigação de confirmar
 * antes — a tela pede confirmação digitada, não um "tem certeza?".
 */
export async function excluirPlanta(id: string): Promise<void> {
  const { error } = await supabase.from('plants').delete().eq('id', id)
  if (error) erro('Não consegui excluir', error.message)
}
