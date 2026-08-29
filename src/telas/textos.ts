import type { DiaLocal } from '../dominio/datas'

/**
 * `new Date('2026-03-12')` é interpretado como meia-noite **UTC**, e
 * formatar isso num fuso a oeste devolve 11 de março. Construindo com os
 * componentes separados, a data nasce na meia-noite local e o dia exibido é
 * o dia registrado.
 */
function comoData(dia: DiaLocal): Date {
  const [ano, mes, data] = dia.split('-').map(Number)
  return new Date(ano, mes - 1, data)
}

const DIA_E_MES = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' })
const COMPLETO = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const CURTO = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })

export function formatarDia(dia: DiaLocal): string {
  return DIA_E_MES.format(comoData(dia))
}

export function formatarDiaCompleto(dia: DiaLocal): string {
  return COMPLETO.format(comoData(dia))
}

export function formatarDiaCurto(dia: DiaLocal): string {
  return CURTO.format(comoData(dia))
}

/** "hoje", "ontem", "há 3 dias", "em 2 dias". */
export function descreverDistancia(dias: number): string {
  if (dias === 0) return 'hoje'
  if (dias === 1) return 'ontem'
  if (dias === -1) return 'amanhã'
  return dias > 0 ? `há ${dias} dias` : `em ${Math.abs(dias)} dias`
}

/** Frase da situação da rega, para a etiqueta. */
export function detalheDoAtraso(diasDeAtraso: number): string | undefined {
  if (diasDeAtraso <= 0) return undefined
  return diasDeAtraso === 1 ? 'há 1 dia' : `há ${diasDeAtraso} dias`
}

export const NOMES_EVENTO: Record<string, string> = {
  rega: 'Rega',
  adubacao: 'Adubação',
  floracao: 'Floração',
  replantio: 'Replantio',
  nota: 'Anotação',
}
