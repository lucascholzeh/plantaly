import { diferencaEmDias, somarDias, type DiaLocal } from './datas'
import { estacaoDe, intervaloVigente } from './estacao'
import type { EstadoTarefa, PlantaCalculo, ToleranciaSeca } from './tipos'

/**
 * A partir de que proporção de atraso a planta entra em **atenção**.
 *
 * O app reage à proporção, não a dias absolutos: uma semana de atraso é
 * irrelevante numa suculenta de intervalo 21 e é emergência numa samambaia
 * de intervalo 3. Calibração inicial da seção 6, ajustável com o uso.
 */
export const LIMIAR_ATENCAO: Record<ToleranciaSeca, number> = {
  alta: 1,
  media: 0.5,
  baixa: 0.25,
}

/** Última rega + intervalo em vigor hoje. */
export function proximaRega(planta: PlantaCalculo, ultimaRega: DiaLocal, hoje: DiaLocal): DiaLocal {
  return somarDias(ultimaRega, intervaloVigente(planta, hoje))
}

/**
 * Estado da rega de uma planta.
 *
 * `ultimaRega` nula é o caso da planta recém-cadastrada cujo dono não sabia
 * quando foi a última vez — ela fica em `sem-historico` e **não** conta como
 * atrasada.
 */
export function estadoDaRega(
  planta: PlantaCalculo,
  ultimaRega: DiaLocal | null,
  hoje: DiaLocal,
): EstadoTarefa {
  const intervalo = intervaloVigente(planta, hoje)
  const estacao = estacaoDe(hoje)

  if (ultimaRega === null) {
    return {
      situacao: 'sem-historico',
      proxima: null,
      diasDeAtraso: 0,
      intervaloVigente: intervalo,
      estacao,
    }
  }

  const proxima = proximaRega(planta, ultimaRega, hoje)
  const diasDeAtraso = diferencaEmDias(proxima, hoje)

  const base = { proxima, diasDeAtraso, intervaloVigente: intervalo, estacao }

  if (diasDeAtraso < 0) return { ...base, situacao: 'em-dia' }
  if (diasDeAtraso === 0) return { ...base, situacao: 'vence-hoje' }

  const grave = atrasoRelativo(diasDeAtraso, intervalo) > LIMIAR_ATENCAO[planta.toleranciaSeca]
  return { ...base, situacao: grave ? 'atencao' : 'atrasada' }
}

/** Atraso como proporção do intervalo. 0.5 = metade de um ciclo perdido. */
export function atrasoRelativo(diasDeAtraso: number, intervalo: number): number {
  return diasDeAtraso / intervalo
}

/**
 * Se a planta precisa do bloco de recuperação da seção 6.
 *
 * Também é o gatilho da regra cruzada: planta em atenção não recebe sugestão
 * de adubação, porque adubo em raiz seca queima a raiz.
 */
export function precisaRecuperacao(estado: EstadoTarefa): boolean {
  return estado.situacao === 'atencao'
}
