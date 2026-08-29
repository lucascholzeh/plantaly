import type { DiaLocal } from './datas'

export type Estacao = 'quente' | 'fria'

/** Ambientes da seção 6 do design. Escolha fechada, nunca texto livre. */
export type Ambiente = 'sol_direto' | 'janela_clara' | 'interior' | 'umido'

export type ToleranciaSeca = 'alta' | 'media' | 'baixa'

/**
 * Situação de uma tarefa recorrente.
 *
 * `sem-historico` é um estado de primeira classe, não um caso degenerado:
 * planta recém-cadastrada sem última rega conhecida **não** aparece
 * atrasada. Inventar um atraso no dia do cadastro seria a primeira mentira
 * que o app conta.
 */
export type Situacao = 'sem-historico' | 'em-dia' | 'vence-hoje' | 'atrasada' | 'atencao'

/**
 * O que o cálculo precisa saber de uma planta.
 *
 * Só os intervalos efetivos e a tolerância — nada de catálogo. É a decisão
 * estrutural 1 da seção 5: os valores são copiados para dentro da planta no
 * cadastro, então quem calcula nunca depende do catálogo.
 */
export interface PlantaCalculo {
  intervaloQuente: number
  intervaloFrio: number
  toleranciaSeca: ToleranciaSeca
}

export interface EstadoTarefa {
  situacao: Situacao
  /** Nulo quando não há histórico. */
  proxima: DiaLocal | null
  /** Positivo quando vencida; 0 quando vence hoje; negativo quando falta. */
  diasDeAtraso: number
  /** Intervalo em vigor hoje, em dias. */
  intervaloVigente: number
  estacao: Estacao
}
