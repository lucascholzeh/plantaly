/**
 * Datas em dia local.
 *
 * Todo o cálculo do Plantaly acontece em **dias de calendário no fuso do
 * usuário**, nunca em instantes UTC. O motivo é a exigência da seção 11 do
 * design: uma rega registrada às 23h precisa contar no dia certo. Em UTC,
 * 23h de 5 de março em São Paulo já é 6 de março — e a planta apareceria
 * regada um dia à frente.
 *
 * O tipo `DiaLocal` é uma string 'AAAA-MM-DD'. Sendo uma data pura, a
 * aritmética pode usar UTC sem risco: não há horário para o horário de
 * verão deslocar.
 */

/** Data de calendário, no formato 'AAAA-MM-DD'. */
export type DiaLocal = string

const MS_POR_DIA = 86_400_000
const FORMATO = /^\d{4}-\d{2}-\d{2}$/

/** O dia de calendário em que `instante` cai, no fuso informado. */
export function diaLocal(instante: Date, fuso: string): DiaLocal {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instante)

  const pegar = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)!.value

  return `${pegar('year')}-${pegar('month')}-${pegar('day')}`
}

/** O dia de hoje no fuso informado. */
export function hoje(fuso: string, agora: Date = new Date()): DiaLocal {
  return diaLocal(agora, fuso)
}

function paraUtc(dia: DiaLocal): number {
  if (!FORMATO.test(dia)) throw new Error(`Dia fora do formato AAAA-MM-DD: ${dia}`)
  const [ano, mes, data] = dia.split('-').map(Number)
  return Date.UTC(ano, mes - 1, data)
}

function deUtc(ms: number): DiaLocal {
  return new Date(ms).toISOString().slice(0, 10)
}

/** `dias` pode ser negativo. */
export function somarDias(dia: DiaLocal, dias: number): DiaLocal {
  return deUtc(paraUtc(dia) + dias * MS_POR_DIA)
}

/** Positivo quando `ate` vem depois de `de`. */
export function diferencaEmDias(de: DiaLocal, ate: DiaLocal): number {
  return Math.round((paraUtc(ate) - paraUtc(de)) / MS_POR_DIA)
}

/** Mês de 1 a 12. */
export function mesDe(dia: DiaLocal): number {
  return Number(dia.slice(5, 7))
}

/** O mais recente entre dois dias. */
export function maisRecente(a: DiaLocal, b: DiaLocal): DiaLocal {
  return paraUtc(a) >= paraUtc(b) ? a : b
}
