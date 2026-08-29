import { describe, expect, it } from 'vitest'
import { intervalosObservados, MINIMO_REGAS, sugerirAjuste } from './aprendizado'
import { somarDias, type DiaLocal } from './datas'
import type { PlantaCalculo } from './tipos'

/** Orquídea configurada para 8 dias no verão. */
const orquidea: PlantaCalculo = {
  intervaloQuente: 8,
  intervaloFrio: 15,
  toleranciaSeca: 'media',
}

const HOJE = '2026-02-01'

/** Constrói um histórico terminando pouco antes de HOJE. */
function historico(intervalos: number[], fim: DiaLocal = '2026-01-30'): DiaLocal[] {
  const dias: DiaLocal[] = [fim]
  for (let i = intervalos.length - 1; i >= 0; i--) {
    dias.unshift(somarDias(dias[0], -intervalos[i]))
  }
  return dias
}

describe('intervalosObservados', () => {
  it('mede os vãos entre regas consecutivas', () => {
    expect(intervalosObservados(['2026-01-01', '2026-01-06', '2026-01-12'])).toEqual([5, 6])
  })

  it('devolve vazio com menos de duas regas', () => {
    expect(intervalosObservados(['2026-01-01'])).toEqual([])
    expect(intervalosObservados([])).toEqual([])
  })
})

describe('quando não deve sugerir nada', () => {
  it('com poucas regas registradas', () => {
    const poucas = historico([5, 5, 5])
    expect(poucas.length).toBeLessThan(MINIMO_REGAS)
    expect(sugerirAjuste(orquidea, poucas, HOJE)).toBeNull()
  })

  it('quando o comportamento bate com o configurado', () => {
    expect(sugerirAjuste(orquidea, historico([8, 8, 8, 8]), HOJE)).toBeNull()
  })

  it('quando o desvio é pequeno demais para incomodar', () => {
    // 7 contra 8 configurados é 12,5% — abaixo do mínimo de 25%.
    expect(sugerirAjuste(orquidea, historico([7, 7, 7, 7]), HOJE)).toBeNull()
  })

  it('quando uma única rega saiu do ritmo', () => {
    // Uma viagem de duas semanas no meio de uma rotina de 8 dias não pode
    // arrastar a sugestão. A mediana ignora o ponto fora da curva.
    expect(sugerirAjuste(orquidea, historico([8, 8, 20, 8, 8]), HOJE)).toBeNull()
  })

  it('quando a rotina é caótica', () => {
    // Sem consistência não há comportamento a descrever, e sugerir um
    // número aqui seria inventar.
    expect(sugerirAjuste(orquidea, historico([3, 20, 4, 18, 5]), HOJE)).toBeNull()
  })
})

describe('quando deve sugerir', () => {
  it('rega consistentemente mais curta que o configurado', () => {
    // O caso do Lucas: a varanda seca mais rápido que o catálogo previu.
    const sugestao = sugerirAjuste(orquidea, historico([5, 5, 5, 5]), HOJE)
    expect(sugestao).not.toBeNull()
    expect(sugestao!.intervaloSugerido).toBe(5)
    expect(sugestao!.intervaloAtual).toBe(8)
    expect(sugestao!.desvio).toBeCloseTo(0.375, 3)
  })

  it('rega consistentemente mais longa', () => {
    const sugestao = sugerirAjuste(orquidea, historico([12, 12, 12, 13]), HOJE)
    expect(sugestao!.intervaloSugerido).toBe(12)
  })

  it('mediana empatada arredonda para cima', () => {
    // [12, 12, 13, 13] tem mediana 12,5. O empate sobe, e meio dia de
    // diferença não muda nada numa sugestão que o usuário revisa antes de
    // aceitar. Está aqui para o comportamento ser deliberado, não acidental.
    const sugestao = sugerirAjuste(orquidea, historico([12, 12, 13, 13]), HOJE)
    expect(sugestao!.intervaloSugerido).toBe(13)
  })

  it('tolera pequena variação em torno de um ritmo real', () => {
    const sugestao = sugerirAjuste(orquidea, historico([5, 4, 5, 6]), HOJE)
    expect(sugestao!.intervaloSugerido).toBe(5)
  })

  it('sobrevive a um único ponto fora da curva', () => {
    // Quatro regas a cada ~5 dias e uma espera de 14: a mediana continua 5.
    const sugestao = sugerirAjuste(orquidea, historico([5, 5, 14, 5, 5]), HOJE)
    expect(sugestao!.intervaloSugerido).toBe(5)
  })

  it('devolve os intervalos que embasaram a proposta', () => {
    const sugestao = sugerirAjuste(orquidea, historico([5, 5, 5, 5]), HOJE)
    expect(sugestao!.observados).toEqual([5, 5, 5, 5])
  })

  it('compara com o intervalo da estação vigente', () => {
    // Em julho o configurado é 15, então regar a cada 12 é desvio pequeno e
    // não gera sugestão; a mesma rotina no verão geraria.
    const emJulho = historico([12, 12, 12, 12], '2026-07-20')
    expect(sugerirAjuste(orquidea, emJulho, '2026-07-25')).toBeNull()
  })
})

describe('não insistir', () => {
  it('cala quando a sugestão é a mesma que já foi recusada', () => {
    const regas = historico([5, 5, 5, 5])
    expect(sugerirAjuste(orquidea, regas, HOJE)!.intervaloSugerido).toBe(5)
    expect(sugerirAjuste(orquidea, regas, HOJE, 5)).toBeNull()
  })

  it('volta a falar quando o desvio muda de magnitude', () => {
    // Recusou 5. Se o comportamento mudar para ~12, é uma proposta nova.
    const outroRitmo = historico([12, 12, 12, 12])
    expect(sugerirAjuste(orquidea, outroRitmo, HOJE, 5)!.intervaloSugerido).toBe(12)
  })

  it('nunca altera o intervalo por conta própria', () => {
    // A função é pura e só devolve uma proposta: a planta que entra sai
    // intacta. A decisão continua sendo do usuário.
    const antes = { ...orquidea }
    sugerirAjuste(orquidea, historico([5, 5, 5, 5]), HOJE)
    expect(orquidea).toEqual(antes)
  })
})
