import { diferencaEmDias, type DiaLocal } from './datas'
import { intervaloVigente } from './estacao'
import type { PlantaCalculo } from './tipos'

/**
 * Aprendizado por histórico.
 *
 * É este mecanismo, e não o fator de ambiente, que resolve de verdade "a
 * minha varanda seca mais rápido que a sala dela": em vez de o app adivinhar
 * o quanto uma varanda específica seca, a própria planta responde.
 *
 * Regras da seção 6, todas obrigatórias:
 * - só depois de regas suficientes;
 * - só quando o desvio é consistente, nunca por uma rega fora do ritmo;
 * - **nunca altera sozinho** — esta função só devolve uma sugestão;
 * - recusada, não insiste; volta apenas se o desvio mudar de magnitude.
 */

/** Regas necessárias para haver intervalos suficientes (4). */
export const MINIMO_REGAS = 5

/** Abaixo disto o desvio não compensa incomodar o usuário. */
export const DESVIO_MINIMO = 0.25

/** Quantas regas recentes entram na conta. */
const JANELA = 7

export interface Sugestao {
  intervaloSugerido: number
  intervaloAtual: number
  /** Desvio relativo observado, em módulo. 0.4 = 40% fora. */
  desvio: number
  /** Intervalos observados que embasaram a sugestão. */
  observados: number[]
}

function mediana(valores: readonly number[]): number {
  const ordenados = [...valores].sort((a, b) => a - b)
  const meio = Math.floor(ordenados.length / 2)
  return ordenados.length % 2 === 0 ? (ordenados[meio - 1] + ordenados[meio]) / 2 : ordenados[meio]
}

/** Intervalos entre regas consecutivas, em dias. */
export function intervalosObservados(regas: readonly DiaLocal[]): number[] {
  const intervalos: number[] = []
  for (let i = 1; i < regas.length; i++) {
    intervalos.push(diferencaEmDias(regas[i - 1], regas[i]))
  }
  return intervalos
}

/**
 * Sugere um novo intervalo, ou null quando não há o que sugerir.
 *
 * `intervaloRecusado` é a última sugestão que o usuário dispensou: repetir a
 * mesma proposta é insistência, e o design proíbe.
 */
export function sugerirAjuste(
  planta: PlantaCalculo,
  regas: readonly DiaLocal[],
  hoje: DiaLocal,
  intervaloRecusado?: number,
): Sugestao | null {
  if (regas.length < MINIMO_REGAS) return null

  const observados = intervalosObservados(regas.slice(-JANELA))
  const central = mediana(observados)

  // Mediana, não média: uma única viagem de duas semanas não deve arrastar
  // a sugestão. O outlier entra na lista e é ignorado pela posição.
  const atual = intervaloVigente(planta, hoje)
  const desvio = Math.abs(central - atual) / atual
  if (desvio < DESVIO_MINIMO) return null

  // Consistência: a maioria dos intervalos precisa estar perto da mediana.
  // Sem isso, uma rotina caótica (3, 20, 4, 18) produziria uma "sugestão"
  // que não descreve comportamento nenhum.
  const perto = observados.filter((valor) => Math.abs(valor - central) <= central * 0.3)
  if (perto.length < Math.ceil(observados.length * 0.7)) return null

  const intervaloSugerido = Math.max(1, Math.round(central))
  if (intervaloSugerido === atual) return null
  if (intervaloRecusado !== undefined && intervaloSugerido === intervaloRecusado) return null

  return { intervaloSugerido, intervaloAtual: atual, desvio, observados }
}
