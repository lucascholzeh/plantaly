import { describe, expect, it } from 'vitest'
import { FRASES } from './frases'
import { escolherFrase, hashEstavel, numeroDoDia } from './escolha'

describe('integridade das frases', () => {
  it('toda frase tem texto, autor, obra e fonte', () => {
    for (const frase of FRASES) {
      expect(frase.texto.length, frase.nome).toBeGreaterThan(0)
      expect(frase.autor.length, frase.nome).toBeGreaterThan(0)
      expect(frase.obra.length, frase.nome).toBeGreaterThan(0)
      // A fonte é o que separa "citação conferida" de "citação lembrada".
      expect(frase.fonte, frase.nome).toMatch(/^https:\/\//)
    }
  })

  it('não repete nome', () => {
    const nomes = FRASES.map((f) => f.nome)
    expect(new Set(nomes).size).toBe(nomes.length)
  })

  it('não repete texto', () => {
    const textos = FRASES.map((f) => f.texto)
    expect(new Set(textos).size).toBe(textos.length)
  })

  it('cabe no corpo de uma notificação', () => {
    // O iOS mostra duas linhas na Tela de Bloqueio. Acima de ~180 caracteres
    // a frase é cortada no meio — e citação cortada no meio diz outra coisa.
    for (const frase of FRASES) {
      expect(frase.texto.length, `${frase.nome} é longa demais`).toBeLessThanOrEqual(180)
    }
  })

  it('não contém as atribuições rejeitadas na montagem', () => {
    // Guarda de regressão: as duas frases que a conferência reprovou são
    // as mais fáceis de alguém reintroduzir de memória mais tarde.
    const tudo = FRASES.map((f) => f.texto.toLowerCase()).join(' ')
    expect(tudo).not.toContain('qualidade dos teus pensamentos')

    // A frase do porquê saiu na onda 2; se voltar, volta com o autor certo.
    for (const frase of FRASES.filter((f) => f.texto.includes('porquê'))) {
      expect(frase.autor, 'a frase do porquê é de Nietzsche, não de Frankl').toBe(
        'Friedrich Nietzsche',
      )
    }

    expect(tudo, 'listada em "Disputed" no Wikiquote').not.toContain('mundo sem liberdade')
  })

  it('não traz de volta as frases aposentadas na onda 2', () => {
    // O Lucas pediu para tirar as da primeira lista: "já foram".
    const aposentadas = [
      'camus-sisifo-feliz',
      'camus-luta-cume',
      'kierkegaard-para-tras',
      'nietzsche-porque-como',
      'nietzsche-amor-fati',
      'sartre-faz-de-si',
      'marco-aurelio-trabalho-humano',
      'rilke-paciencia-coracao',
      'clarice-perguntas',
    ]
    const nomes = FRASES.map((f) => f.nome)
    for (const nome of aposentadas) expect(nomes, nome).not.toContain(nome)
  })
})

describe('escolha da frase do dia', () => {
  const USUARIO = '11111111-1111-1111-1111-111111111111'
  const OUTRO = '22222222-2222-2222-2222-222222222222'

  it('devolve a mesma frase para o mesmo dia e o mesmo usuário', () => {
    // Esta é a propriedade que faz a notificação e o box concordarem.
    const uma = escolherFrase('2026-08-30', USUARIO)
    const outra = escolherFrase('2026-08-30', USUARIO)
    expect(uma.nome).toBe(outra.nome)
  })

  it('varia ao longo dos dias', () => {
    const nomes = new Set<string>()
    for (let d = 1; d <= 28; d++) {
      nomes.add(escolherFrase(`2026-09-${String(d).padStart(2, '0')}`, USUARIO).nome)
    }
    // Sem exigir todas: exigir a lista inteira em 28 dias seria testar a
    // sorte do hash, não a intenção.
    expect(nomes.size).toBeGreaterThan(3)
  })

  it('as duas contas da casa não recebem sempre a mesma frase', () => {
    const dias = Array.from({ length: 30 }, (_, i) => `2026-09-${String(i + 1).padStart(2, '0')}`)
    const diferentes = dias.filter(
      (dia) => escolherFrase(dia, USUARIO).nome !== escolherFrase(dia, OUTRO).nome,
    )
    expect(diferentes.length).toBeGreaterThan(15)
  })

  it('devolve sempre uma frase da lista', () => {
    for (let d = 1; d <= 31; d++) {
      const frase = escolherFrase(`2026-10-${String(d).padStart(2, '0')}`, USUARIO)
      expect(FRASES).toContain(frase)
    }
  })

  /** `n` dias seguidos a partir de `inicio`, no formato do `DiaLocal`. */
  function diasSeguidos(inicio: string, n: number): string[] {
    const base = new Date(`${inicio}T12:00:00Z`)
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(base)
      d.setUTCDate(base.getUTCDate() + i)
      return d.toISOString().slice(0, 10)
    })
  }

  it('nenhuma frase se repete antes de todas terem saído', () => {
    // O motivo da rotação: o sorteio independente repetia frase em 9 de
    // cada 10 semanas. Qualquer janela de `FRASES.length` dias seguidos,
    // começando em qualquer dia — inclusive atravessando a virada do ano —
    // mostra cada frase exatamente uma vez.
    for (const usuario of [USUARIO, OUTRO, 'b7c1-uuid-qualquer']) {
      for (const inicio of ['2026-09-24', '2026-12-20', '2025-03-03']) {
        const nomes = diasSeguidos(inicio, FRASES.length).map(
          (dia) => escolherFrase(dia, usuario).nome,
        )
        expect(new Set(nomes).size, `${usuario} a partir de ${inicio}`).toBe(FRASES.length)
      }
    }
  })

  it('cada frase volta exatamente depois de uma volta completa', () => {
    const [hoje, depois] = ['2026-09-24', diasSeguidos('2026-09-24', FRASES.length + 1).at(-1)!]
    expect(escolherFrase(depois, USUARIO).nome).toBe(escolherFrase(hoje, USUARIO).nome)
  })

  it('as duas contas seguem ordens diferentes', () => {
    const dias = diasSeguidos('2026-09-24', FRASES.length)
    const iguais = dias.filter(
      (dia) => escolherFrase(dia, USUARIO).nome === escolherFrase(dia, OUTRO).nome,
    )
    // Ordens independentes coincidem em ~1 dia por volta. Mais que um
    // punhado indicaria que o id não está entrando na ordem.
    expect(iguais.length).toBeLessThan(6)
  })

  it('funciona com listas pequenas, inclusive de uma frase só', () => {
    for (const tamanho of [1, 2, 3]) {
      const lista = FRASES.slice(0, tamanho)
      const nomes = diasSeguidos('2026-09-24', tamanho).map(
        (dia) => escolherFrase(dia, USUARIO, lista).nome,
      )
      expect(new Set(nomes).size).toBe(tamanho)
    }
  })

  it('conta os dias de calendário sem depender de fuso', () => {
    expect(numeroDoDia('2026-01-01')).toBe(0)
    expect(numeroDoDia('2026-01-02')).toBe(1)
    expect(numeroDoDia('2025-12-31')).toBe(-1)
    // Brasil não tem horário de verão hoje, mas os EUA sim: a virada de
    // março não pode pular nem repetir dia.
    expect(numeroDoDia('2026-03-09') - numeroDoDia('2026-03-08')).toBe(1)
  })

  it('recusa dia fora do formato em vez de devolver undefined', () => {
    expect(() => escolherFrase('24/09/2026', USUARIO)).toThrow(/AAAA-MM-DD/)
  })

  it('recusa lista vazia em vez de devolver undefined', () => {
    expect(() => escolherFrase('2026-08-30', USUARIO, [])).toThrow(/vazia/)
  })
})

describe('hashEstavel', () => {
  it('é estável entre chamadas', () => {
    expect(hashEstavel('plantaly')).toBe(hashEstavel('plantaly'))
  })

  it('cabe em inteiro sem sinal de 32 bits', () => {
    // Se a multiplicação FNV estourar, o índice vira NaN e a escolha
    // devolve undefined — falha que só apareceria em produção.
    for (const entrada of ['', 'a', '2026-08-30:abc', 'ç'.repeat(200)]) {
      const h = hashEstavel(entrada)
      expect(Number.isInteger(h)).toBe(true)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(0xffffffff)
    }
  })

  it('separa entradas parecidas', () => {
    expect(hashEstavel('2026-08-30:u1')).not.toBe(hashEstavel('2026-08-31:u1'))
    expect(hashEstavel('2026-08-30:u1')).not.toBe(hashEstavel('2026-08-30:u2'))
  })
})
