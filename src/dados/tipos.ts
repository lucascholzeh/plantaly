import type { Ambiente, Situacao, ToleranciaSeca } from '../dominio/tipos'

export type TipoEvento = 'rega' | 'adubacao' | 'floracao' | 'replantio' | 'nota'

export type OrigemEspecie = 'catalogo' | 'manual' | 'assistente'

/** Linha de `public.plants`, como vem do banco. */
export interface PlantaLinha {
  id: string
  user_id: string
  nickname: string
  species_slug: string | null
  species_label: string | null
  species_source: OrigemEspecie
  /** Caminho da foto no bucket `fotos-plantas`. Nulo = sem foto. */
  photo_path: string | null
  environment: Ambiente
  water_interval_warm: number
  water_interval_cold: number
  fertilize_interval_warm: number | null
  fertilize_interval_cold: number | null
  drought_tolerance: ToleranciaSeca
  /** Última sugestão do aprendizado que o usuário dispensou. */
  rejected_interval: number | null
  archived_at: string | null
  created_at: string
}

/**
 * Linha de `public.plant_status`.
 *
 * Vem calculada do banco, que é a verdade sobre quem está atrasado. As
 * funções de `src/dominio/` respondem o mesmo — há teste de paridade.
 */
export interface StatusLinha {
  plant_id: string
  user_id: string
  nickname: string
  hoje: string
  estacao: 'quente' | 'fria'
  intervalo_rega: number
  intervalo_adubacao: number | null
  ultima_rega: string | null
  ultima_adubacao: string | null
  ultima_floracao: string | null
  proxima_rega: string | null
  dias_de_atraso_rega: number
  situacao_rega: Situacao
  proxima_adubacao: string | null
  dias_de_atraso_adubacao: number
  situacao_adubacao: Situacao | null
}

export interface EventoLinha {
  id: string
  plant_id: string
  user_id: string
  type: TipoEvento
  occurred_at: string
  note: string | null
  created_at: string
}

/** Planta com o status já junto — o que as telas realmente consomem. */
export interface PlantaComStatus {
  planta: PlantaLinha
  status: StatusLinha
}
