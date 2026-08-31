import type { Ambiente } from './tipos'

/**
 * Fatores de ambiente.
 *
 * **Isto é heurística, não medição** — e a interface tem obrigação de dizer
 * isso (seção 6). Que luz e circulação de ar mudam a velocidade de secagem é
 * fato horticultural estabelecido; o quanto exatamente a varanda de uma casa
 * específica muda não é conhecível. O número abaixo é um chute melhor que o
 * chute anterior, e quem converge para a verdade é o aprendizado por
 * histórico, em `aprendizado.ts`.
 *
 * Menor que 1 encurta o intervalo (seca mais rápido).
 */
const FATORES: Record<Ambiente, number> = {
  sol_direto: 0.7,
  janela_clara: 1,
  interior: 1.25,
  umido: 1.4,
}

export const ROTULOS_AMBIENTE: Record<Ambiente, string> = {
  sol_direto: 'Varanda ou janela com sol direto',
  janela_clara: 'Janela clara, sem sol direto',
  interior: 'Interior, longe da janela',
  umido: 'Banheiro ou cozinha',
}

/**
 * Aplica o ambiente ao intervalo sugerido pelo catálogo.
 *
 * Nunca devolve menos de 1 dia: rega mais de uma vez por dia não é um regime
 * de cuidado, é afogamento.
 */
export function ajustarPorAmbiente(intervaloBase: number, ambiente: Ambiente): number {
  return Math.max(1, Math.round(intervaloBase * FATORES[ambiente]))
}

/**
 * O que sugerir quando a planta muda de lugar.
 *
 * A decisão estrutural 1 do design diz que o ambiente é aplicado **uma vez**,
 * no cadastro, e a partir daí o intervalo é do usuário. Recalcular sozinho na
 * edição quebraria isso duas vezes: por cima de um número que a pessoa possa
 * ter ajustado à mão, e por cima do que o aprendizado por histórico já
 * corrigiu a partir das regas reais.
 *
 * Então a troca de ambiente **sugere** e não aplica. Quem decide é a tela,
 * mostrando o número antes.
 *
 * A conta desfaz o fator antigo antes de aplicar o novo — o valor guardado
 * já vem ajustado pelo ambiente de origem. Multiplicar direto pelo fator
 * novo aplicaria o ajuste duas vezes, e cada troca deformaria o número mais
 * um pouco.
 */
export function sugerirPorMudancaDeAmbiente(
  intervaloAtual: number,
  de: Ambiente,
  para: Ambiente,
): number {
  return Math.max(1, Math.round((intervaloAtual / FATORES[de]) * FATORES[para]))
}
