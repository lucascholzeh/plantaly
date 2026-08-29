import { describe, expect, it } from 'vitest'
import { estaLigada, estadoDaAdubacao, ultimaRegaFoiRecuperacao } from './adubacao'
import type { AdubacaoCalculo } from './adubacao'
import type { PlantaCalculo } from './tipos'

const orquidea: PlantaCalculo = {
  intervaloQuente: 8,
  intervaloFrio: 15,
  toleranciaSeca: 'media',
}

const ligada: AdubacaoCalculo = { intervaloQuente: 14, intervaloFrio: 30 }
const desligada: AdubacaoCalculo = { intervaloQuente: null, intervaloFrio: null }

describe('adubação desligada', () => {
  it('é o estado padrão e não produz nada', () => {
    const estado = estadoDaAdubacao(orquidea, desligada, null, [], '2026-01-15')
    expect(estado.ativa).toBe(false)
    expect(estado.situacao).toBeNull()
    expect(estado.proxima).toBeNull()
    expect(estado.supressao).toBeNull()
  })

  it('estaLigada exige os dois intervalos', () => {
    expect(estaLigada(ligada)).toBe(true)
    expect(estaLigada(desligada)).toBe(false)
    expect(estaLigada({ intervaloQuente: 14, intervaloFrio: null })).toBe(false)
  })

  it('desligar não interfere em nada da rega', () => {
    // A exigência explícita da seção 3: o app funciona como se o recurso
    // não existisse. Nenhum campo do estado da adubação influencia a rega,
    // e o teste de rega roda sem sequer importar este módulo.
    const comAdubo = estadoDaAdubacao(orquidea, ligada, '2026-01-01', ['2026-01-14'], '2026-01-15')
    const semAdubo = estadoDaAdubacao(orquidea, desligada, null, ['2026-01-14'], '2026-01-15')
    expect(comAdubo.ativa).toBe(true)
    expect(semAdubo.ativa).toBe(false)
  })
})

describe('adubação ligada', () => {
  it('sem histórico não aparece atrasada', () => {
    const estado = estadoDaAdubacao(orquidea, ligada, null, ['2026-01-14'], '2026-01-15')
    expect(estado.situacao).toBe('sem-historico')
    expect(estado.proxima).toBeNull()
  })

  it('segue a sazonalidade própria, diferente da rega', () => {
    expect(
      estadoDaAdubacao(orquidea, ligada, '2026-01-01', [], '2026-01-05').intervaloVigente,
    ).toBe(14)
    expect(
      estadoDaAdubacao(orquidea, ligada, '2026-07-01', [], '2026-07-05').intervaloVigente,
    ).toBe(30)
  })

  it('em dia, vence hoje e atrasada', () => {
    const regaEmDia = ['2026-01-14']
    expect(estadoDaAdubacao(orquidea, ligada, '2026-01-10', regaEmDia, '2026-01-15').situacao).toBe(
      'em-dia',
    )
    expect(estadoDaAdubacao(orquidea, ligada, '2026-01-01', regaEmDia, '2026-01-15').situacao).toBe(
      'vence-hoje',
    )
    expect(estadoDaAdubacao(orquidea, ligada, '2025-12-30', regaEmDia, '2026-01-15').situacao).toBe(
      'atrasada',
    )
  })

  it('nunca chega a atenção — atrasar adubo não mata planta', () => {
    const estado = estadoDaAdubacao(orquidea, ligada, '2025-10-01', ['2026-01-14'], '2026-01-15')
    expect(estado.situacao).toBe('atrasada')
  })
})

describe('regra cruzada: nunca adubar planta com sede', () => {
  it('suprime enquanto a rega está atrasada', () => {
    // Rega em 1º de janeiro, intervalo 8: em 15 de janeiro está atrasada.
    const estado = estadoDaAdubacao(orquidea, ligada, '2025-12-30', ['2026-01-01'], '2026-01-15')
    expect(estado.situacao).toBe('atrasada')
    expect(estado.supressao).toBe('rega-atrasada')
  })

  it('não suprime quando a rega está em dia', () => {
    const estado = estadoDaAdubacao(orquidea, ligada, '2025-12-30', ['2026-01-14'], '2026-01-15')
    expect(estado.situacao).toBe('atrasada')
    expect(estado.supressao).toBeNull()
  })

  it('não inventa supressão quando a adubação nem venceu', () => {
    const estado = estadoDaAdubacao(orquidea, ligada, '2026-01-14', ['2026-01-01'], '2026-01-15')
    expect(estado.situacao).toBe('em-dia')
    expect(estado.supressao).toBeNull()
  })
})

describe('recuperação recente', () => {
  it('reconhece a rega que tirou a planta do estresse', () => {
    // Intervalo 8, limiar 0.5: uma espera acima de 12 dias significa que a
    // planta estava em atenção quando foi regada.
    expect(ultimaRegaFoiRecuperacao(orquidea, ['2026-01-01', '2026-01-14'], '2026-01-15')).toBe(
      true,
    )
    expect(ultimaRegaFoiRecuperacao(orquidea, ['2026-01-01', '2026-01-09'], '2026-01-15')).toBe(
      false,
    )
  })

  it('não conclui nada com uma rega só', () => {
    expect(ultimaRegaFoiRecuperacao(orquidea, ['2026-01-14'], '2026-01-15')).toBe(false)
    expect(ultimaRegaFoiRecuperacao(orquidea, [], '2026-01-15')).toBe(false)
  })

  it('segura o adubo por um ciclo depois da rega de recuperação', () => {
    const historico = ['2026-01-01', '2026-01-14']
    const estado = estadoDaAdubacao(orquidea, ligada, '2025-12-01', historico, '2026-01-16')
    expect(estado.situacao).toBe('atrasada')
    expect(estado.supressao).toBe('recuperacao-recente')
  })

  it('libera o adubo quando o ciclo de recuperação se completa', () => {
    // Rega de recuperação em 14 de janeiro, intervalo 8: em 22 o ciclo
    // fechou e o adubo volta a ser sugerido.
    const historico = ['2026-01-01', '2026-01-14']
    const estado = estadoDaAdubacao(orquidea, ligada, '2025-12-01', historico, '2026-01-22')
    expect(estado.supressao).toBeNull()
  })

  it('rega normal recente não segura o adubo', () => {
    const historico = ['2026-01-08', '2026-01-14']
    const estado = estadoDaAdubacao(orquidea, ligada, '2025-12-01', historico, '2026-01-16')
    expect(estado.supressao).toBeNull()
  })
})
