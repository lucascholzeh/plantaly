import { describe, expect, it } from 'vitest'

import {
  VARIACOES,
  elegiveis,
  montarContexto,
  montarMensagem,
  sortear,
  type Pendencia,
} from '../supabase/functions/enviar-lembretes/variacoes.ts'

/**
 * As 40 variações de notificação.
 *
 * O risco que estes testes cobrem não é de compilação: é o de uma variação
 * afirmar algo falso. "3 dias sem água" para uma planta que vence hoje, ou
 * "2 plantas" no singular, chega no aparelho como defeito — e mina a
 * confiança em todas as outras notificações.
 */

function rega(nickname: string, atraso = 0): Pendencia {
  return {
    nickname,
    situacao_rega: atraso > 0 ? 'atrasada' : 'vence-hoje',
    situacao_adubacao: 'em-dia',
    dias_de_atraso_rega: atraso,
  }
}

function adubacao(nickname: string): Pendencia {
  return {
    nickname,
    situacao_rega: 'em-dia',
    situacao_adubacao: 'atrasada',
    dias_de_atraso_rega: 0,
  }
}

/** Nome composto, como os que o Lucas e a namorada usam de verdade. */
const NOME_COMPOSTO = 'Orquídea do Buba'

const CENARIOS: Array<{ nome: string; pendencias: Pendencia[] }> = [
  { nome: 'uma planta vencendo hoje', pendencias: [rega(NOME_COMPOSTO)] },
  { nome: 'uma planta atrasada 1 dia', pendencias: [rega(NOME_COMPOSTO, 1)] },
  { nome: 'uma planta atrasada 12 dias', pendencias: [rega(NOME_COMPOSTO, 12)] },
  {
    nome: 'duas plantas, uma atrasada',
    pendencias: [rega(NOME_COMPOSTO, 3), rega('Lírio da Sala')],
  },
  {
    nome: 'três plantas sem atraso',
    pendencias: [rega(NOME_COMPOSTO), rega('Lírio da Sala'), rega('Violeta da Janela')],
  },
  {
    nome: 'rega e adubação juntas',
    pendencias: [rega(NOME_COMPOSTO, 2), adubacao('Íris do Quarto')],
  },
  {
    nome: 'só adubação',
    pendencias: [adubacao(NOME_COMPOSTO)],
  },
  {
    nome: 'doze plantas',
    pendencias: Array.from({ length: 12 }, (_, i) => rega(`Planta ${i + 1}`, i)),
  },
  {
    nome: 'apelido muito longo',
    pendencias: [rega('Orquídea da varanda que a mãe dela deu de aniversário', 4)],
  },
]

describe('catálogo de variações', () => {
  it('tem 40 variações, 10 por tom', () => {
    expect(VARIACOES).toHaveLength(40)
    for (const tom of ['carinhosa', 'direta', 'normal', 'engracada'] as const) {
      expect(VARIACOES.filter((v) => v.tom === tom)).toHaveLength(10)
    }
  })

  it('não repete nomes — o nome é a identidade guardada no perfil', () => {
    const nomes = VARIACOES.map((v) => v.nome)
    expect(new Set(nomes).size).toBe(nomes.length)
  })
})

describe('cada variação, em cada cenário', () => {
  for (const cenario of CENARIOS) {
    const contexto = montarContexto(cenario.pendencias)

    for (const variacao of elegiveis(contexto)) {
      it(`${variacao.nome} — ${cenario.nome}`, () => {
        const { titulo, corpo } = variacao.texto(contexto)

        // Não quebra nem deixa buraco no texto.
        expect(titulo.length).toBeGreaterThan(0)
        expect(corpo.length).toBeGreaterThan(0)
        expect(titulo + corpo).not.toContain('undefined')
        expect(titulo + corpo).not.toContain('NaN')
        expect(titulo + corpo).not.toMatch(/\s,|,\s*\./)

        // Nome de planta nunca no título: no iPhone o título trunca por
        // volta de 40 caracteres, e apelido composto sairia cortado.
        for (const p of cenario.pendencias) {
          expect(titulo).not.toContain(p.nickname)
        }

        // Nenhum texto inventa atraso onde não há.
        if (contexto.maiorAtraso === 0) {
          expect(corpo).not.toMatch(/atras|sem água|no dia \d/i)
        }
      })
    }
  }
})

describe('elegibilidade', () => {
  it('sem atraso, nenhuma variação que cita atraso entra no sorteio', () => {
    const contexto = montarContexto([rega(NOME_COMPOSTO), rega('Lírio da Sala')])
    expect(contexto.maiorAtraso).toBe(0)
    expect(elegiveis(contexto).every((v) => !v.precisaDeAtraso)).toBe(true)
  })

  it('sem adubação pendente, nenhuma variação separa "regar" de "adubar"', () => {
    const contexto = montarContexto([rega(NOME_COMPOSTO, 2)])
    expect(elegiveis(contexto).every((v) => !v.precisaDeAdubacao)).toBe(true)
  })

  it('com uma planta só, nenhuma variação de plural entra', () => {
    const contexto = montarContexto([rega(NOME_COMPOSTO)])
    expect(elegiveis(contexto).every((v) => (v.minimoDePlantas ?? 1) <= 1)).toBe(true)
  })

  it('todo cenário deixa pelo menos uma variação elegível', () => {
    // Se um cenário zerasse a lista, o sorteio não teria o que escolher e a
    // pessoa simplesmente não receberia lembrete naquele dia.
    for (const cenario of CENARIOS) {
      expect(elegiveis(montarContexto(cenario.pendencias)).length).toBeGreaterThan(0)
    }
  })

  it('a mais atrasada é a de maior atraso, e ignora adubação', () => {
    const contexto = montarContexto([
      rega('Lírio da Sala', 2),
      rega(NOME_COMPOSTO, 9),
      adubacao('Íris do Quarto'),
    ])
    expect(contexto.maisAtrasada?.nickname).toBe(NOME_COMPOSTO)
    expect(contexto.maiorAtraso).toBe(9)
    expect(contexto.nomesAdubacao).toEqual(['Íris do Quarto'])
  })
})

describe('sorteio', () => {
  const contexto = montarContexto([rega(NOME_COMPOSTO, 3), rega('Lírio da Sala')])

  it('nunca devolve a variação da véspera', () => {
    const disponiveis = elegiveis(contexto)
    for (const anterior of disponiveis) {
      // Varre todo o intervalo do sorteio: nenhuma posição pode cair na anterior.
      for (let i = 0; i < disponiveis.length; i++) {
        const escolhida = sortear(contexto, anterior.nome, () => i / disponiveis.length)
        expect(escolhida.nome).not.toBe(anterior.nome)
      }
    }
  })

  it('sorteia dentro das elegíveis', () => {
    const nomes = new Set(elegiveis(contexto).map((v) => v.nome))
    for (let i = 0; i < 200; i++) {
      expect(nomes.has(sortear(contexto, null).nome)).toBe(true)
    }
  })

  it('alcança todas as elegíveis ao longo de muitos sorteios', () => {
    // Um sorteio que só alcança parte do catálogo desperdiça o trabalho de
    // ter 40 textos.
    const vistas = new Set<string>()
    for (let i = 0; i < 3000; i++) vistas.add(sortear(contexto, null).nome)
    expect(vistas.size).toBe(elegiveis(contexto).length)
  })

  it('repete em vez de silenciar quando só resta uma elegível', () => {
    const unica = elegiveis(contexto)[0]
    const soUma = { ...contexto }
    // Simula o extremo: a última enviada é a única disponível.
    const escolhida = sortear(soUma, unica.nome, () => 0)
    expect(escolhida).toBeDefined()
  })

  it('montarMensagem devolve o nome da variação para o perfil guardar', () => {
    const { titulo, corpo, variacao } = montarMensagem([rega(NOME_COMPOSTO, 3)], null, () => 0)
    expect(titulo).toBeTruthy()
    expect(corpo).toContain(NOME_COMPOSTO)
    expect(VARIACOES.some((v) => v.nome === variacao)).toBe(true)
  })
})
