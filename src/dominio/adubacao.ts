import { diferencaEmDias, somarDias, type DiaLocal } from './datas'
import { estacaoDe } from './estacao'
import { LIMIAR_ATENCAO } from './rega'
import type { Estacao, PlantaCalculo, Situacao } from './tipos'

/**
 * Intervalos de adubação. Nulos = adubação desligada nesta planta.
 *
 * Desligada é o padrão de cadastro, e o app inteiro funciona como se o
 * recurso não existisse: nada da rega depende disto (seção 3).
 */
export interface AdubacaoCalculo {
  intervaloQuente: number | null
  intervaloFrio: number | null
}

export type MotivoSupressao = 'rega-atrasada' | 'recuperacao-recente'

export interface EstadoAdubacao {
  /** Falso quando os intervalos são nulos: o recurso está desligado. */
  ativa: boolean
  situacao: Situacao | null
  proxima: DiaLocal | null
  diasDeAtraso: number
  intervaloVigente: number | null
  estacao: Estacao
  /**
   * Preenchido quando há adubação pendente mas o app **não** deve sugeri-la.
   * Nunca se aduba planta em estresse hídrico: adubo em raiz seca queima a
   * raiz (seção 6).
   */
  supressao: MotivoSupressao | null
}

export function estaLigada(adubacao: AdubacaoCalculo): boolean {
  return adubacao.intervaloQuente !== null && adubacao.intervaloFrio !== null
}

/**
 * A última rega foi de recuperação?
 *
 * Detectável pelo intervalo entre as duas últimas regas: se a planta passou
 * do limiar de atenção antes de ser regada, aquela rega tirou-a de um
 * estresse — e o ciclo seguinte ainda é de recuperação.
 */
export function ultimaRegaFoiRecuperacao(
  planta: PlantaCalculo,
  regas: readonly DiaLocal[],
  hoje: DiaLocal,
): boolean {
  if (regas.length < 2) return false

  const ultima = regas[regas.length - 1]
  const penultima = regas[regas.length - 2]
  const intervalo = estacaoDe(hoje) === 'quente' ? planta.intervaloQuente : planta.intervaloFrio

  const espera = diferencaEmDias(penultima, ultima)
  return espera > intervalo * (1 + LIMIAR_ATENCAO[planta.toleranciaSeca])
}

/**
 * Estado da adubação, já com a regra cruzada da rega aplicada.
 *
 * `regas` vem em ordem cronológica, a mais recente por último.
 */
export function estadoDaAdubacao(
  planta: PlantaCalculo,
  adubacao: AdubacaoCalculo,
  ultimaAdubacao: DiaLocal | null,
  regas: readonly DiaLocal[],
  hoje: DiaLocal,
): EstadoAdubacao {
  const estacao = estacaoDe(hoje)

  if (!estaLigada(adubacao)) {
    return {
      ativa: false,
      situacao: null,
      proxima: null,
      diasDeAtraso: 0,
      intervaloVigente: null,
      estacao,
      supressao: null,
    }
  }

  const intervalo = (estacao === 'quente' ? adubacao.intervaloQuente : adubacao.intervaloFrio)!

  if (ultimaAdubacao === null) {
    return {
      ativa: true,
      situacao: 'sem-historico',
      proxima: null,
      diasDeAtraso: 0,
      intervaloVigente: intervalo,
      estacao,
      supressao: null,
    }
  }

  const proxima = somarDias(ultimaAdubacao, intervalo)
  const diasDeAtraso = diferencaEmDias(proxima, hoje)

  // Adubação não tem nível de atenção: atrasar adubo não mata planta.
  const situacao: Situacao =
    diasDeAtraso < 0 ? 'em-dia' : diasDeAtraso === 0 ? 'vence-hoje' : 'atrasada'

  return {
    ativa: true,
    situacao,
    proxima,
    diasDeAtraso,
    intervaloVigente: intervalo,
    estacao,
    supressao: situacao === 'em-dia' ? null : motivoDeSupressao(planta, regas, hoje),
  }
}

/**
 * Por que a adubação não deve ser sugerida agora.
 *
 * Duas causas, nesta ordem: a rega está atrasada, ou a planta acabou de sair
 * de um estresse e ainda não completou um ciclo de rega desde a recuperação.
 */
function motivoDeSupressao(
  planta: PlantaCalculo,
  regas: readonly DiaLocal[],
  hoje: DiaLocal,
): MotivoSupressao | null {
  if (regas.length === 0) return null

  const ultimaRega = regas[regas.length - 1]
  const intervalo = estacaoDe(hoje) === 'quente' ? planta.intervaloQuente : planta.intervaloFrio
  const desdeUltimaRega = diferencaEmDias(ultimaRega, hoje)

  if (desdeUltimaRega > intervalo) return 'rega-atrasada'

  if (ultimaRegaFoiRecuperacao(planta, regas, hoje) && desdeUltimaRega < intervalo) {
    return 'recuperacao-recente'
  }

  return null
}
