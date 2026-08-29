import { diferencaEmDias, somarDias, type DiaLocal } from './datas'

/**
 * Projeta as próximas ocorrências de uma tarefa dentro de um período.
 *
 * Usada pelo calendário para mostrar o que está previsto adiante. A
 * projeção é ingênua de propósito: assume que a tarefa vai ser cumprida no
 * dia previsto. Não é previsão do comportamento do usuário, é a régua do
 * ciclo — se a rega atrasar, o calendário do mês seguinte já reflete a data
 * real, porque é recalculado a partir do último evento registrado.
 */
export function projetar(
  proxima: DiaLocal | null,
  intervalo: number,
  de: DiaLocal,
  ate: DiaLocal,
): DiaLocal[] {
  if (proxima === null) return []
  if (intervalo < 1) throw new Error(`Intervalo precisa ser de ao menos 1 dia: ${intervalo}`)
  if (diferencaEmDias(de, ate) < 0) return []

  let dia = proxima

  // Se a próxima data já passou do início do período, avança em blocos até
  // alcançá-lo — sem laço dia a dia, que ficaria lento num período distante.
  const atraso = diferencaEmDias(dia, de)
  if (atraso > 0) {
    dia = somarDias(dia, Math.ceil(atraso / intervalo) * intervalo)
  }

  const dias: DiaLocal[] = []
  while (diferencaEmDias(dia, ate) >= 0) {
    dias.push(dia)
    dia = somarDias(dia, intervalo)
  }
  return dias
}

/** Primeiro e último dia do mês a que `dia` pertence. */
export function limitesDoMes(dia: DiaLocal): { primeiro: DiaLocal; ultimo: DiaLocal } {
  const primeiro = `${dia.slice(0, 7)}-01`
  const [ano, mes] = dia.split('-').map(Number)
  const diasNoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
  return { primeiro, ultimo: `${dia.slice(0, 7)}-${String(diasNoMes).padStart(2, '0')}` }
}

/** Desloca um mês para frente ou para trás, sempre caindo no dia 1. */
export function mesVizinho(dia: DiaLocal, passos: number): DiaLocal {
  const [ano, mes] = dia.split('-').map(Number)
  const total = ano * 12 + (mes - 1) + passos
  const novoAno = Math.floor(total / 12)
  const novoMes = (total % 12) + 1
  return `${novoAno}-${String(novoMes).padStart(2, '0')}-01`
}

/**
 * Dia da semana, 0 = domingo.
 *
 * Calculado em UTC sobre a data pura, então nenhum fuso desloca a coluna em
 * que o dia cai na grade.
 */
export function diaDaSemana(dia: DiaLocal): number {
  const [ano, mes, data] = dia.split('-').map(Number)
  return new Date(Date.UTC(ano, mes - 1, data)).getUTCDay()
}
