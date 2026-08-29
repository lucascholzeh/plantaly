import { describe, expect, it } from 'vitest'
import { ajustarPorAmbiente } from './ambiente'
import { estacaoDe, intervaloVigente } from './estacao'
import { atrasoRelativo, estadoDaRega, precisaRecuperacao, proximaRega } from './rega'
import type { PlantaCalculo } from './tipos'

/** Orquídea genérica: 8 dias no calor, 15 no frio, tolerância média. */
const orquidea: PlantaCalculo = {
  intervaloQuente: 8,
  intervaloFrio: 15,
  toleranciaSeca: 'media',
}

/** Suculenta: seca devagar e aguenta muito. */
const suculenta: PlantaCalculo = {
  intervaloQuente: 21,
  intervaloFrio: 30,
  toleranciaSeca: 'alta',
}

/** Samambaia: intervalo curto e nenhuma tolerância. */
const samambaia: PlantaCalculo = {
  intervaloQuente: 3,
  intervaloFrio: 5,
  toleranciaSeca: 'baixa',
}

describe('estação', () => {
  it('outubro a março é quente no hemisfério sul', () => {
    for (const dia of ['2026-10-01', '2026-11-15', '2026-12-31', '2027-01-01', '2027-03-31']) {
      expect(estacaoDe(dia)).toBe('quente')
    }
  })

  it('abril a setembro é fria', () => {
    for (const dia of ['2026-04-01', '2026-06-15', '2026-09-30']) {
      expect(estacaoDe(dia)).toBe('fria')
    }
  })

  it('as fronteiras caem do lado certo', () => {
    expect(estacaoDe('2026-03-31')).toBe('quente')
    expect(estacaoDe('2026-04-01')).toBe('fria')
    expect(estacaoDe('2026-09-30')).toBe('fria')
    expect(estacaoDe('2026-10-01')).toBe('quente')
  })

  it('o intervalo vigente segue a estação', () => {
    expect(intervaloVigente(orquidea, '2026-01-15')).toBe(8)
    expect(intervaloVigente(orquidea, '2026-07-15')).toBe(15)
  })
})

describe('próxima rega', () => {
  it('é a última rega mais o intervalo vigente', () => {
    expect(proximaRega(orquidea, '2026-01-10', '2026-01-10')).toBe('2026-01-18')
  })

  it('usa o intervalo vigente HOJE, não o da data da rega', () => {
    // Regada em 20 de março (verão, 8 dias). Hoje é 5 de abril, já inverno:
    // o intervalo em vigor passa a ser 15, e a previsão recua para 4 de
    // abril em vez dos 28 de março que o intervalo de verão daria.
    expect(proximaRega(orquidea, '2026-03-20', '2026-04-05')).toBe('2026-04-04')
    expect(proximaRega(orquidea, '2026-03-20', '2026-03-25')).toBe('2026-03-28')
  })
})

describe('situação da rega', () => {
  it('planta sem histórico não aparece atrasada', () => {
    const estado = estadoDaRega(orquidea, null, '2026-01-15')
    expect(estado.situacao).toBe('sem-historico')
    expect(estado.proxima).toBeNull()
    expect(estado.diasDeAtraso).toBe(0)
  })

  it('em dia quando ainda falta', () => {
    expect(estadoDaRega(orquidea, '2026-01-10', '2026-01-15').situacao).toBe('em-dia')
  })

  it('vence hoje no dia exato', () => {
    const estado = estadoDaRega(orquidea, '2026-01-10', '2026-01-18')
    expect(estado.situacao).toBe('vence-hoje')
    expect(estado.diasDeAtraso).toBe(0)
  })

  it('atrasada no dia seguinte ao vencimento', () => {
    const estado = estadoDaRega(orquidea, '2026-01-10', '2026-01-19')
    expect(estado.situacao).toBe('atrasada')
    expect(estado.diasDeAtraso).toBe(1)
  })

  it('informa o intervalo e a estação em vigor', () => {
    const estado = estadoDaRega(orquidea, '2026-07-01', '2026-07-10')
    expect(estado.intervaloVigente).toBe(15)
    expect(estado.estacao).toBe('fria')
  })
})

describe('limiar de atenção', () => {
  it('tolerância média entra em atenção acima de metade do intervalo', () => {
    // Intervalo 8: 4 dias de atraso é exatamente 0.5 e ainda não é atenção.
    expect(estadoDaRega(orquidea, '2026-01-10', '2026-01-22').situacao).toBe('atrasada')
    expect(estadoDaRega(orquidea, '2026-01-10', '2026-01-23').situacao).toBe('atencao')
  })

  it('tolerância alta só entra em atenção depois de um ciclo inteiro perdido', () => {
    // Intervalo 21, vence em 22 de janeiro. 21 dias de atraso ainda não é
    // atenção; 22 é.
    expect(estadoDaRega(suculenta, '2026-01-01', '2026-02-12').situacao).toBe('atrasada')
    expect(estadoDaRega(suculenta, '2026-01-01', '2026-02-13').situacao).toBe('atencao')
  })

  it('tolerância baixa entra em atenção quase imediatamente', () => {
    // Intervalo 3, vence em 4 de janeiro. Limiar 0.25 = 0.75 dia.
    expect(estadoDaRega(samambaia, '2026-01-01', '2026-01-04').situacao).toBe('vence-hoje')
    expect(estadoDaRega(samambaia, '2026-01-01', '2026-01-05').situacao).toBe('atencao')
  })

  it('uma semana de atraso significa coisas diferentes por espécie', () => {
    // O ponto central da seção 6: o app reage à proporção, não a dias.
    const seteDiasDepoisDoVencimento = (planta: PlantaCalculo, ultima: string, hoje: string) =>
      estadoDaRega(planta, ultima, hoje).situacao

    // Suculenta regada em 1º de janeiro vence em 22; 29 é 7 dias de atraso.
    expect(seteDiasDepoisDoVencimento(suculenta, '2026-01-01', '2026-01-29')).toBe('atrasada')
    // Samambaia regada em 1º vence em 4; 11 é 7 dias de atraso.
    expect(seteDiasDepoisDoVencimento(samambaia, '2026-01-01', '2026-01-11')).toBe('atencao')
  })

  it('precisaRecuperacao acompanha o estado de atenção', () => {
    expect(precisaRecuperacao(estadoDaRega(samambaia, '2026-01-01', '2026-01-11'))).toBe(true)
    expect(precisaRecuperacao(estadoDaRega(suculenta, '2026-01-01', '2026-01-29'))).toBe(false)
    expect(precisaRecuperacao(estadoDaRega(orquidea, null, '2026-01-29'))).toBe(false)
  })

  it('atrasoRelativo é a proporção do intervalo', () => {
    expect(atrasoRelativo(4, 8)).toBe(0.5)
    expect(atrasoRelativo(8, 8)).toBe(1)
  })
})

describe('virada de estação', () => {
  it('em abril a planta ganha folga de uma vez', () => {
    // Regada em 30 de março. Em 31/03 (verão, 8) vence em 7 de abril.
    expect(estadoDaRega(orquidea, '2026-03-30', '2026-03-31').proxima).toBe('2026-04-07')
    // Em 1º de abril já é inverno (15) e a previsão pula para 14 de abril.
    expect(estadoDaRega(orquidea, '2026-03-30', '2026-04-01').proxima).toBe('2026-04-14')
  })

  it('em outubro a planta pode ficar atrasada de repente', () => {
    // Regada em 20 de setembro. Em 30/09 (inverno, 15) ainda está em dia.
    expect(estadoDaRega(orquidea, '2026-09-20', '2026-09-30').situacao).toBe('em-dia')
    // Em 1º de outubro vira verão (8) e ela já venceu em 28 de setembro.
    const emOutubro = estadoDaRega(orquidea, '2026-09-20', '2026-10-01')
    expect(emOutubro.situacao).toBe('atrasada')
    expect(emOutubro.diasDeAtraso).toBe(3)
  })
})

describe('registro retroativo', () => {
  it('recalcula a previsão a partir da data informada', () => {
    // "Reguei anteontem e esqueci de marcar": a previsão sai de anteontem.
    const comDataDeHoje = estadoDaRega(orquidea, '2026-01-15', '2026-01-15')
    const comDataRetroativa = estadoDaRega(orquidea, '2026-01-13', '2026-01-15')
    expect(comDataDeHoje.proxima).toBe('2026-01-23')
    expect(comDataRetroativa.proxima).toBe('2026-01-21')
  })

  it('rega retroativa antiga pode nascer já atrasada', () => {
    const estado = estadoDaRega(orquidea, '2025-12-20', '2026-01-15')
    expect(estado.situacao).toBe('atencao')
    expect(estado.diasDeAtraso).toBe(18)
  })
})

describe('ajuste por ambiente', () => {
  it('sol direto encurta o intervalo', () => {
    expect(ajustarPorAmbiente(10, 'sol_direto')).toBe(7)
  })

  it('janela clara é a referência do catálogo', () => {
    expect(ajustarPorAmbiente(10, 'janela_clara')).toBe(10)
  })

  it('interior e ambiente úmido alongam', () => {
    expect(ajustarPorAmbiente(10, 'interior')).toBe(13)
    expect(ajustarPorAmbiente(10, 'umido')).toBe(14)
  })

  it('nunca desce abaixo de um dia', () => {
    expect(ajustarPorAmbiente(1, 'sol_direto')).toBe(1)
  })

  it('devolve sempre número inteiro de dias', () => {
    for (const base of [1, 3, 7, 8, 13, 21, 30]) {
      expect(Number.isInteger(ajustarPorAmbiente(base, 'sol_direto'))).toBe(true)
      expect(Number.isInteger(ajustarPorAmbiente(base, 'umido'))).toBe(true)
    }
  })
})
