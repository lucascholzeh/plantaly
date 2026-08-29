import type { Situacao } from '../dominio/tipos'
import type { ChaveEstado } from '../visual/tokens'

/**
 * Traduz a situação do domínio para a cor de estado do sistema visual.
 *
 * `sem-historico` cai em "em dia" de propósito: a planta não está atrasada,
 * simplesmente não se sabe nada dela ainda. Quem precisa distinguir usa o
 * detalhe da etiqueta, não a cor.
 */
export function estadoVisual(situacao: Situacao): ChaveEstado {
  switch (situacao) {
    case 'atencao':
      return 'atencao'
    case 'atrasada':
      return 'atrasada'
    case 'vence-hoje':
      return 'hoje'
    case 'em-dia':
    case 'sem-historico':
      return 'emDia'
  }
}
