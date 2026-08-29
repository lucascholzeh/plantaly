import { supabase } from '../lib/supabase'
import type { TipoEvento } from './tipos'

export interface EventoDoCalendario {
  id: string
  dia: string
  tipo: TipoEvento
  plantaId: string
  planta: string
  nota: string | null
}

/**
 * Eventos de todas as plantas num período.
 *
 * O apelido vem embutido na mesma consulta: o calendário mostra o nome da
 * planta em cada marca, e buscar planta por planta transformaria um mês em
 * dezenas de idas ao banco.
 */
export async function eventosNoPeriodo(de: string, ate: string): Promise<EventoDoCalendario[]> {
  const { data, error } = await supabase
    .from('care_events')
    .select('id, type, occurred_at, note, plant_id, plants(nickname)')
    .gte('occurred_at', `${de}T00:00:00`)
    .lte('occurred_at', `${ate}T23:59:59`)
    .order('occurred_at', { ascending: true })

  if (error) throw new Error(`Não consegui carregar o calendário: ${error.message}`)

  return (data as unknown as RegistroBruto[]).map((linha) => ({
    id: linha.id,
    dia: linha.occurred_at.slice(0, 10),
    tipo: linha.type,
    plantaId: linha.plant_id,
    planta: linha.plants?.nickname ?? 'planta removida',
    nota: linha.note,
  }))
}

interface RegistroBruto {
  id: string
  type: TipoEvento
  occurred_at: string
  note: string | null
  plant_id: string
  plants: { nickname: string } | null
}
