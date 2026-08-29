import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ESPECIES } from './especies'
import { procurarEspecies, valoresParaCadastro } from './index'

/**
 * Integridade do catálogo.
 *
 * É o teste que impede o catálogo de apodrecer com o tempo: espécie sem
 * campo obrigatório, sem fonte ou com faixa incoerente quebra a build, e não
 * chega ao app. A regra do projeto é "dado concreto ou nenhum dado" — sem
 * uma verificação automática, ela viraria intenção.
 */
describe('integridade do catálogo', () => {
  it('há espécies cadastradas', () => {
    expect(ESPECIES.length).toBeGreaterThan(0)
  })

  it('os slugs são únicos', () => {
    const slugs = ESPECIES.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  for (const especie of ESPECIES) {
    describe(especie.slug, () => {
      it('tem slug em formato de endereço', () => {
        expect(especie.slug).toMatch(/^[a-z0-9-]+$/)
      })

      it('tem nome popular e científico', () => {
        expect(especie.nomePopular.trim().length).toBeGreaterThan(0)
        expect(especie.nomeCientifico.trim().length).toBeGreaterThan(0)
      })

      it('descreve o critério de rega antes de qualquer número', () => {
        // O campo mais importante da ficha: o dedo no substrato responde
        // melhor que o calendário.
        expect(especie.criterioDeRega.length).toBeGreaterThan(40)
      })

      it('as faixas de rega são coerentes', () => {
        for (const faixa of [especie.regaQuente, especie.regaFria]) {
          expect(faixa[0]).toBeGreaterThanOrEqual(1)
          expect(faixa[1]).toBeGreaterThanOrEqual(faixa[0])
          expect(faixa[1]).toBeLessThanOrEqual(365)
        }
      })

      it('rega menos na estação fria', () => {
        // Regar no inverno no ritmo do verão é o erro que mais mata planta
        // de casa. Uma ficha que diga o contrário é quase certamente engano
        // de digitação.
        expect(especie.regaFria[0]).toBeGreaterThanOrEqual(especie.regaQuente[0])
      })

      it('a adubação está ligada ou desligada por inteiro', () => {
        for (const faixa of [especie.adubacaoQuente, especie.adubacaoFria]) {
          if (faixa !== null) {
            expect(faixa[0]).toBeGreaterThanOrEqual(1)
            expect(faixa[1]).toBeGreaterThanOrEqual(faixa[0])
          }
        }
      })

      it('tem ao menos dois traços de identificação', () => {
        // Um traço só não distingue nada. A seção 7 pede dois ou três
        // decisivos.
        expect(especie.comoIdentificar.length).toBeGreaterThanOrEqual(2)
      })

      it('tem ao menos dois sinais de problema', () => {
        expect(especie.sinaisDeProblema.length).toBeGreaterThanOrEqual(2)
      })

      it('tem ao menos uma fonte com URL', () => {
        expect(especie.fontes.length).toBeGreaterThanOrEqual(1)
        for (const fonte of especie.fontes) {
          expect(fonte.url).toMatch(/^https:\/\//)
          expect(fonte.titulo.trim().length).toBeGreaterThan(0)
        }
      })

      it('ou tem foto conferida, ou diz por que não tem', () => {
        // Ausência de foto não pode virar silêncio: ou a espécie tem imagem
        // verificada, ou a ficha declara o motivo de não ter.
        const temFoto = especie.fotos.length > 0
        const explicou = (especie.semFotoAinda ?? '').trim().length > 0
        expect(temFoto || explicou).toBe(true)
      })

      it('cada foto tem crédito, licença, origem e alt', () => {
        for (const foto of especie.fotos) {
          expect(foto.autor.trim().length).toBeGreaterThan(0)
          expect(foto.licenca.trim().length).toBeGreaterThan(0)
          expect(foto.origem).toMatch(/^https:\/\//)
          expect(foto.alt.length).toBeGreaterThan(10)
        }
      })

      it('os arquivos de foto existem no disco', () => {
        for (const foto of especie.fotos) {
          const caminho = fileURLToPath(new URL(`./fotos/${foto.arquivo}`, import.meta.url))
          expect(existsSync(caminho), `${foto.arquivo} não está em src/catalogo/fotos/`).toBe(true)
        }
      })
    })
  }
})

describe('busca', () => {
  it('encontra pelo nome popular', () => {
    expect(procurarEspecies('orquídea').map((e) => e.slug)).toContain('phalaenopsis')
  })

  it('ignora acento e caixa', () => {
    expect(procurarEspecies('ORQUIDEA').map((e) => e.slug)).toContain('phalaenopsis')
    expect(procurarEspecies('anturio').map((e) => e.slug)).toContain('anturio')
  })

  it('encontra pelo nome científico', () => {
    expect(procurarEspecies('Spathiphyllum').map((e) => e.slug)).toContain('lirio-da-paz')
  })

  it('encontra pelo apelido', () => {
    expect(procurarEspecies('flor-da-fortuna').map((e) => e.slug)).toContain('kalanchoe')
    expect(procurarEspecies('borboleta').map((e) => e.slug)).toContain('phalaenopsis')
  })

  it('termo vazio devolve tudo', () => {
    expect(procurarEspecies('  ')).toHaveLength(ESPECIES.length)
  })

  it('termo sem correspondência devolve vazio', () => {
    expect(procurarEspecies('bananeira')).toHaveLength(0)
  })
})

describe('valores levados para o cadastro', () => {
  it('usam o meio da faixa e são inteiros válidos', () => {
    for (const especie of ESPECIES) {
      const valores = valoresParaCadastro(especie)
      expect(Number.isInteger(valores.intervaloQuente)).toBe(true)
      expect(valores.intervaloQuente).toBeGreaterThanOrEqual(especie.regaQuente[0])
      expect(valores.intervaloQuente).toBeLessThanOrEqual(especie.regaQuente[1])
      expect(valores.intervaloFrio).toBeGreaterThanOrEqual(especie.regaFria[0])
      expect(valores.intervaloFrio).toBeLessThanOrEqual(especie.regaFria[1])
      expect(valores.toleranciaSeca).toBe(especie.toleranciaSeca)
    }
  })
})
