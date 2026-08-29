import { describe, expect, it } from 'vitest'
import { diaDaSemana, limitesDoMes, mesVizinho, projetar } from './previsao'

describe('projetar', () => {
  it('lista as ocorrências dentro do período', () => {
    expect(projetar('2026-09-03', 7, '2026-09-01', '2026-09-30')).toEqual([
      '2026-09-03',
      '2026-09-10',
      '2026-09-17',
      '2026-09-24',
    ])
  })

  it('não devolve nada sem próxima data', () => {
    // Planta sem histórico não tem o que projetar.
    expect(projetar(null, 7, '2026-09-01', '2026-09-30')).toEqual([])
  })

  it('avança até o início do período quando a data já passou', () => {
    // Rega prevista para agosto, calendário aberto em outubro: as datas
    // mostradas precisam ser as de outubro, não as vencidas.
    expect(projetar('2026-08-05', 10, '2026-10-01', '2026-10-31')).toEqual([
      '2026-10-04',
      '2026-10-14',
      '2026-10-24',
    ])
  })

  it('inclui a data exata do início e do fim', () => {
    expect(projetar('2026-09-01', 29, '2026-09-01', '2026-09-30')).toEqual([
      '2026-09-01',
      '2026-09-30',
    ])
  })

  it('devolve vazio quando a próxima data é depois do período', () => {
    expect(projetar('2026-12-01', 7, '2026-09-01', '2026-09-30')).toEqual([])
  })

  it('devolve vazio quando o período está invertido', () => {
    expect(projetar('2026-09-03', 7, '2026-09-30', '2026-09-01')).toEqual([])
  })

  it('atravessa a virada do ano', () => {
    expect(projetar('2026-12-28', 5, '2026-12-28', '2027-01-07')).toEqual([
      '2026-12-28',
      '2027-01-02',
      '2027-01-07',
    ])
  })

  it('recusa intervalo inválido em vez de entrar em laço infinito', () => {
    expect(() => projetar('2026-09-03', 0, '2026-09-01', '2026-09-30')).toThrow()
  })
})

describe('limitesDoMes', () => {
  it('acha o primeiro e o último dia', () => {
    expect(limitesDoMes('2026-09-15')).toEqual({ primeiro: '2026-09-01', ultimo: '2026-09-30' })
    expect(limitesDoMes('2026-01-01')).toEqual({ primeiro: '2026-01-01', ultimo: '2026-01-31' })
  })

  it('conhece fevereiro comum e bissexto', () => {
    expect(limitesDoMes('2026-02-10').ultimo).toBe('2026-02-28')
    expect(limitesDoMes('2028-02-10').ultimo).toBe('2028-02-29')
  })
})

describe('mesVizinho', () => {
  it('avança e recua', () => {
    expect(mesVizinho('2026-09-15', 1)).toBe('2026-10-01')
    expect(mesVizinho('2026-09-15', -1)).toBe('2026-08-01')
  })

  it('atravessa a virada do ano nos dois sentidos', () => {
    expect(mesVizinho('2026-12-10', 1)).toBe('2027-01-01')
    expect(mesVizinho('2026-01-10', -1)).toBe('2025-12-01')
  })
})

describe('diaDaSemana', () => {
  it('devolve 0 para domingo', () => {
    // 30 de agosto de 2026 é um domingo.
    expect(diaDaSemana('2026-08-30')).toBe(0)
    expect(diaDaSemana('2026-08-31')).toBe(1)
    expect(diaDaSemana('2026-09-05')).toBe(6)
  })
})
