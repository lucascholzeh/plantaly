import { describe, expect, it } from 'vitest'
import { diaLocal, diferencaEmDias, hoje, maisRecente, mesDe, somarDias } from './datas'

const SP = 'America/Sao_Paulo'

describe('diaLocal', () => {
  it('usa o dia do fuso do usuário, não o de UTC', () => {
    // 5 de março, 23h em São Paulo, já é 6 de março em UTC. A rega tem que
    // contar no dia 5 — é a exigência da seção 11.
    const vinteETresHoras = new Date('2026-03-06T02:00:00Z')
    expect(diaLocal(vinteETresHoras, SP)).toBe('2026-03-05')
    expect(diaLocal(vinteETresHoras, 'UTC')).toBe('2026-03-06')
  })

  it('trata a virada da meia-noite local', () => {
    expect(diaLocal(new Date('2026-03-06T02:59:59Z'), SP)).toBe('2026-03-05')
    expect(diaLocal(new Date('2026-03-06T03:00:00Z'), SP)).toBe('2026-03-06')
  })

  it('funciona em fuso adiantado em relação a UTC', () => {
    expect(diaLocal(new Date('2026-03-05T22:00:00Z'), 'Asia/Tokyo')).toBe('2026-03-06')
  })

  it('hoje() usa o instante informado', () => {
    expect(hoje(SP, new Date('2026-08-29T15:00:00Z'))).toBe('2026-08-29')
  })
})

describe('somarDias', () => {
  it('atravessa o fim do mês', () => {
    expect(somarDias('2026-01-31', 1)).toBe('2026-02-01')
  })

  it('atravessa o fim do ano', () => {
    expect(somarDias('2026-12-30', 3)).toBe('2027-01-02')
  })

  it('conhece ano bissexto', () => {
    expect(somarDias('2028-02-28', 1)).toBe('2028-02-29')
    expect(somarDias('2026-02-28', 1)).toBe('2026-03-01')
  })

  it('aceita valores negativos', () => {
    expect(somarDias('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('não é afetado por horário de verão', () => {
    // A aritmética é sobre datas puras, sem horário. Somar 1 dia atravessando
    // uma transição de horário de verão continua devolvendo o dia seguinte,
    // e não 23 ou 25 horas depois.
    expect(somarDias('2026-11-01', 1)).toBe('2026-11-02')
    expect(somarDias('2026-03-08', 1)).toBe('2026-03-09')
  })

  it('recusa formato inválido', () => {
    expect(() => somarDias('29/08/2026', 1)).toThrow()
  })
})

describe('diferencaEmDias', () => {
  it('é positiva quando o segundo dia vem depois', () => {
    expect(diferencaEmDias('2026-08-01', '2026-08-10')).toBe(9)
  })

  it('é negativa quando vem antes', () => {
    expect(diferencaEmDias('2026-08-10', '2026-08-01')).toBe(-9)
  })

  it('é zero no mesmo dia', () => {
    expect(diferencaEmDias('2026-08-10', '2026-08-10')).toBe(0)
  })

  it('atravessa anos', () => {
    expect(diferencaEmDias('2026-12-31', '2027-01-01')).toBe(1)
  })
})

describe('auxiliares', () => {
  it('mesDe devolve 1 a 12', () => {
    expect(mesDe('2026-01-15')).toBe(1)
    expect(mesDe('2026-12-15')).toBe(12)
  })

  it('maisRecente escolhe o maior', () => {
    expect(maisRecente('2026-08-01', '2026-08-10')).toBe('2026-08-10')
    expect(maisRecente('2026-08-10', '2026-08-01')).toBe('2026-08-10')
    expect(maisRecente('2026-08-10', '2026-08-10')).toBe('2026-08-10')
  })
})
