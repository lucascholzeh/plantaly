import { describe, expect, it } from 'vitest'
import { COMO_REGAR, comoRegar, GUIA_RHS_VASOS, REGA_GERAL } from './comoRegar'
import { ESPECIES } from './especies'

const BLOCOS = Object.entries(COMO_REGAR)

describe('como regar cada espécie', () => {
  it('toda espécie do catálogo diz como regar', () => {
    // Obrigatório como o resto da ficha: espécie nova sem este bloco quebra
    // a build, em vez de cair calada na regra geral.
    for (const especie of ESPECIES) {
      expect(COMO_REGAR[especie.slug], especie.slug).toBeDefined()
    }
  })

  it('não há bloco para espécie que não existe', () => {
    // Slug digitado errado deixaria a espécie de verdade sem bloco.
    const slugs = new Set(ESPECIES.map((e) => e.slug))
    for (const [slug] of BLOCOS) expect(slugs.has(slug), slug).toBe(true)
  })

  it('todo bloco tem fonte com URL', () => {
    for (const [slug, rega] of [...BLOCOS, ['geral', REGA_GERAL] as const]) {
      expect(rega.fontes.length, slug).toBeGreaterThan(0)
      for (const fonte of rega.fontes) expect(fonte.url, slug).toMatch(/^https:\/\//)
    }
  })

  it('quantidade pela regra geral cita o guia da RHS', () => {
    // Sem isso a tela diria "regra geral da RHS" sem a RHS entre as fontes.
    for (const [slug, rega] of BLOCOS.filter(([, r]) => r.quantoPelaRegraGeral)) {
      expect(
        rega.fontes.map((f) => f.url),
        slug,
      ).toContain(GUIA_RHS_VASOS.url)
    }
  })

  it('nunca fala em mililitros nem litros', () => {
    // O volume depende do vaso, e o vaso está fora de escopo (design, seção
    // 3). Um número em ml aqui seria inventado.
    for (const [slug, rega] of [...BLOCOS, ['geral', REGA_GERAL] as const]) {
      const tudo = [rega.resumo, rega.quanto, ...rega.passos, rega.agua ?? '', rega.noFrio ?? '']
      for (const texto of tudo) {
        expect(texto, slug).not.toMatch(/\d\s*(ml|mililitros?|litros?|l)\b/i)
      }
    }
  })

  it('o resumo cabe numa linha da aba "Hoje"', () => {
    for (const [slug, rega] of [...BLOCOS, ['geral', REGA_GERAL] as const]) {
      expect(rega.resumo.length, slug).toBeLessThanOrEqual(40)
      expect(rega.passos.length, slug).toBeGreaterThan(0)
    }
  })

  it('planta sem espécie do catálogo recebe a regra geral, marcada como geral', () => {
    expect(comoRegar(null)).toEqual({ rega: REGA_GERAL, geral: true })
    expect(comoRegar('especie-que-nao-existe').geral).toBe(true)
    expect(comoRegar('violeta-africana').geral).toBe(false)
  })
})
