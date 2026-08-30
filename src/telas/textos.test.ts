import { describe, expect, it } from 'vitest'
import { proximaRegaEmLinha } from './textos'

/**
 * Linha da próxima rega no balão.
 *
 * A regra que estes testes protegem é que o balão fala em **dias**, nunca em
 * data: ninguém sabe de cabeça se 7 de outubro é longe. "hoje" e "amanhã" são
 * as duas exceções, porque a palavra é mais curta que a contagem.
 */
describe('próxima rega em uma linha', () => {
  it('diz hoje quando vence hoje', () => {
    expect(proximaRegaEmLinha('2026-08-30', 0)).toBe('Regar hoje')
  })

  it('diz hoje também quando já passou', () => {
    // O atraso já é dito pela etiqueta ao lado; repeti-lo aqui seria cobrança.
    expect(proximaRegaEmLinha('2026-08-27', -3)).toBe('Regar hoje')
  })

  it('usa a palavra quando o dia está próximo', () => {
    expect(proximaRegaEmLinha('2026-08-31', 1)).toBe('Regar amanhã')
    expect(proximaRegaEmLinha('2026-09-01', 2)).toBe('Regar em 2 dias')
    expect(proximaRegaEmLinha('2026-09-05', 6)).toBe('Regar em 6 dias')
  })

  it('continua contando os dias quando falta muito', () => {
    // Nunca a data: "Regar 7 de outubro" mandava o Lucas abrir o calendário
    // para descobrir se era longe. A contagem já responde isso.
    expect(proximaRegaEmLinha('2026-09-06', 7)).toBe('Regar em 7 dias')
    expect(proximaRegaEmLinha('2026-09-22', 23)).toBe('Regar em 23 dias')
    expect(proximaRegaEmLinha('2026-10-07', 38)).toBe('Regar em 38 dias')
  })

  it('planta sem histórico não ganha previsão inventada', () => {
    expect(proximaRegaEmLinha(null, 0)).toBe('Sem previsão de rega')
  })
})
