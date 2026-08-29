import { mesDe, type DiaLocal } from './datas'
import type { Estacao, PlantaCalculo } from './tipos'

/**
 * Estação vigente, hemisfério sul.
 *
 * Outubro a março é a estação quente; abril a setembro, a fria. É um corte
 * grosseiro de propósito: a alternativa seria data astronômica de solstício,
 * que muda a resposta em um ou dois dias e não muda nada na planta.
 */
export function estacaoDe(dia: DiaLocal): Estacao {
  const mes = mesDe(dia)
  return mes >= 10 || mes <= 3 ? 'quente' : 'fria'
}

/**
 * Intervalo em vigor **hoje**, não na data da última rega.
 *
 * Consequência deliberada (seção 6): na virada de estação a previsão de uma
 * planta muda de uma vez — em abril ela ganha folga, em outubro pode
 * aparecer atrasada de repente. É o comportamento correto, e a ficha mostra
 * qual intervalo está em vigor para não parecer defeito.
 */
export function intervaloVigente(planta: PlantaCalculo, dia: DiaLocal): number {
  return estacaoDe(dia) === 'quente' ? planta.intervaloQuente : planta.intervaloFrio
}
