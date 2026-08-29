import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { AA, contraste, luminancia } from './contraste'
import { espacos, estados, flores, primaria, raios, superficies, texto } from './tokens'

describe('contraste (seção 9: mínimo AA)', () => {
  const fundos = {
    fundo: superficies.fundo,
    cartao: superficies.cartao,
    elevada: superficies.elevada,
  }

  describe('texto principal', () => {
    for (const [nome, fundo] of Object.entries(fundos)) {
      it(`é legível sobre ${nome}`, () => {
        expect(contraste(texto.principal, fundo)).toBeGreaterThanOrEqual(AA.texto)
      })
    }
  })

  describe('texto suave', () => {
    for (const [nome, fundo] of Object.entries(fundos)) {
      it(`é legível sobre ${nome}`, () => {
        expect(contraste(texto.suave, fundo)).toBeGreaterThanOrEqual(AA.texto)
      })
    }
  })

  it('texto sobre a cor primária é legível', () => {
    expect(contraste(texto.sobrePrimaria, primaria.base)).toBeGreaterThanOrEqual(AA.texto)
  })

  it('texto sobre a primária pressionada continua legível', () => {
    expect(contraste(texto.sobrePrimaria, primaria.escura)).toBeGreaterThanOrEqual(AA.texto)
  })

  describe('cores de estado', () => {
    for (const [nome, estado] of Object.entries(estados)) {
      it(`${nome}: forte sobre o próprio tint`, () => {
        expect(contraste(estado.forte, estado.tint)).toBeGreaterThanOrEqual(AA.texto)
      })

      for (const [nomeFundo, fundo] of Object.entries(fundos)) {
        it(`${nome}: forte sobre ${nomeFundo}`, () => {
          expect(contraste(estado.forte, fundo)).toBeGreaterThanOrEqual(AA.texto)
        })
      }
    }
  })

  it('a borda de controle passa no mínimo de componente', () => {
    // WCAG 1.4.11: o limite de um campo precisa ser perceptível.
    expect(contraste(superficies.bordaControle, superficies.cartao)).toBeGreaterThanOrEqual(
      AA.componente,
    )
    expect(contraste(superficies.bordaControle, superficies.fundo)).toBeGreaterThanOrEqual(
      AA.componente,
    )
  })
})

describe('separação de superfícies (a regra contra o "tudo parecido")', () => {
  it('a luminosidade sobe de fundo para cartão para elevada', () => {
    expect(luminancia(superficies.fundo)).toBeLessThan(luminancia(superficies.cartao))
    expect(luminancia(superficies.cartao)).toBeLessThan(luminancia(superficies.elevada))
  })

  it('a diferença entre fundo e cartão é perceptível', () => {
    // Abaixo disso as superfícies se fundem, que é justamente o defeito que
    // o Lucas apontou em paletas claras.
    expect(luminancia(superficies.cartao) - luminancia(superficies.fundo)).toBeGreaterThan(0.03)
  })

  it('a diferença entre cartão e elevada é perceptível', () => {
    expect(luminancia(superficies.elevada) - luminancia(superficies.cartao)).toBeGreaterThan(0.015)
  })

  it('as bordas se destacam da própria superfície', () => {
    expect(contraste(superficies.borda, superficies.cartao)).toBeGreaterThan(1.2)
    expect(contraste(superficies.bordaForte, superficies.cartao)).toBeGreaterThan(1.5)
  })
})

describe('estados não dependem só de cor', () => {
  for (const [nome, estado] of Object.entries(estados)) {
    it(`${nome} carrega rótulo e ícone junto com a cor`, () => {
      expect(estado.rotulo.length).toBeGreaterThan(0)
      expect(estado.icone.length).toBeGreaterThan(0)
    })
  }

  it('atrasada e atenção se distinguem por luminosidade, não só por matiz', () => {
    // Coral e terracota têm matizes diferentes mas podem cair na mesma
    // luminosidade — e aí, para daltonismo de eixo vermelho-verde, viram a
    // mesma cor. São os dois estados de alerta e precisam ser separáveis
    // mesmo sem percepção de cor.
    expect(contraste(estados.atrasada.forte, estados.atencao.forte)).toBeGreaterThan(1.6)
  })

  it('nenhum estado usa vermelho de alarme', () => {
    // Seção 11: atraso se comunica sem dramatizar. Vermelho puro tem matiz
    // perto de 0 com saturação alta; coral e terracota não.
    for (const estado of Object.values(estados)) {
      const inteiro = Number.parseInt(estado.forte.slice(1), 16)
      const r = (inteiro >> 16) & 0xff
      const g = (inteiro >> 8) & 0xff
      const b = inteiro & 0xff
      const puroVermelho = r > 180 && g < 60 && b < 60
      expect(puroVermelho).toBe(false)
    }
  })
})

describe('paridade entre tokens.ts e tokens.css', () => {
  const css = readFileSync(fileURLToPath(new URL('./tokens.css', import.meta.url)), 'utf8')

  function paraKebab(nome: string) {
    return nome.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  }

  const esperados = new Map<string, string>()
  for (const [chave, valor] of Object.entries(superficies)) {
    esperados.set(`--superficie-${paraKebab(chave)}`, valor)
  }
  for (const [chave, valor] of Object.entries(texto)) {
    esperados.set(`--texto-${paraKebab(chave)}`, valor)
  }
  for (const [chave, valor] of Object.entries(primaria)) {
    esperados.set(`--primaria-${paraKebab(chave)}`, valor)
  }
  for (const [chave, estado] of Object.entries(estados)) {
    esperados.set(`--estado-${paraKebab(chave)}-forte`, estado.forte)
    esperados.set(`--estado-${paraKebab(chave)}-tint`, estado.tint)
  }
  for (const [chave, valor] of Object.entries(flores)) {
    esperados.set(`--flor-${paraKebab(chave)}`, valor)
  }
  for (const [chave, valor] of Object.entries(espacos)) {
    esperados.set(`--espaco-${paraKebab(chave)}`, valor)
  }
  for (const [chave, valor] of Object.entries(raios)) {
    esperados.set(`--raio-${paraKebab(chave)}`, valor)
  }

  for (const [variavel, valor] of esperados) {
    it(`${variavel} tem o mesmo valor nos dois arquivos`, () => {
      const encontrado = new RegExp(`${variavel}:\\s*([^;]+);`).exec(css)
      expect(encontrado, `${variavel} não existe em tokens.css`).not.toBeNull()
      expect(encontrado![1].trim().toUpperCase()).toBe(valor.toUpperCase())
    })
  }

  it('o CSS não declara variável de cor que o TypeScript desconheça', () => {
    const declaradas = [...css.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => m[1])
    const orfas = declaradas.filter((nome) => !esperados.has(nome))
    expect(orfas).toEqual([])
  })
})
