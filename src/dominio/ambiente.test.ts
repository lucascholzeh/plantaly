import { describe, expect, it } from 'vitest'
import { ajustarPorAmbiente, sugerirPorMudancaDeAmbiente } from './ambiente'
import type { Ambiente } from './tipos'

const AMBIENTES: Ambiente[] = ['sol_direto', 'janela_clara', 'interior', 'umido']

describe('ajustarPorAmbiente', () => {
  it('não altera o intervalo na janela clara, que é a referência', () => {
    expect(ajustarPorAmbiente(8, 'janela_clara')).toBe(8)
  })

  it('encurta no sol direto e alonga no úmido', () => {
    expect(ajustarPorAmbiente(10, 'sol_direto')).toBeLessThan(10)
    expect(ajustarPorAmbiente(10, 'umido')).toBeGreaterThan(10)
  })

  it('nunca devolve menos de 1 dia', () => {
    for (const ambiente of AMBIENTES) {
      expect(ajustarPorAmbiente(1, ambiente)).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('sugerirPorMudancaDeAmbiente', () => {
  it('não mexe no número quando o ambiente não muda', () => {
    // A tela usa isso para decidir se mostra a sugestão: um valor igual não
    // vira aviso nenhum.
    for (const ambiente of AMBIENTES) {
      for (const dias of [1, 5, 8, 15, 30, 90]) {
        expect(sugerirPorMudancaDeAmbiente(dias, ambiente, ambiente), `${ambiente} ${dias}`).toBe(
          dias,
        )
      }
    }
  })

  it('alonga ao ir para lugar que seca devagar', () => {
    expect(sugerirPorMudancaDeAmbiente(8, 'janela_clara', 'interior')).toBe(10)
    expect(sugerirPorMudancaDeAmbiente(8, 'janela_clara', 'umido')).toBe(11)
  })

  it('encurta ao ir para o sol direto', () => {
    expect(sugerirPorMudancaDeAmbiente(10, 'janela_clara', 'sol_direto')).toBe(7)
  })

  it('desfaz o fator de origem antes de aplicar o novo', () => {
    // O valor guardado já vem ajustado. Uma planta cadastrada no sol direto
    // com base 10 tem 7 gravado; ao ir para a janela clara deve voltar para
    // perto de 10, não virar 7.
    const noSol = ajustarPorAmbiente(10, 'sol_direto')
    expect(noSol).toBe(7)
    expect(sugerirPorMudancaDeAmbiente(noSol, 'sol_direto', 'janela_clara')).toBe(10)
  })

  it('ida e volta não afunda o número', () => {
    // A armadilha que a divisão evita: sem ela, cada troca reaplicaria o
    // ajuste e o intervalo derreteria a cada edição.
    let dias = 12
    for (let i = 0; i < 10; i++) {
      dias = sugerirPorMudancaDeAmbiente(dias, 'janela_clara', 'sol_direto')
      dias = sugerirPorMudancaDeAmbiente(dias, 'sol_direto', 'janela_clara')
    }
    expect(dias).toBeGreaterThanOrEqual(11)
    expect(dias).toBeLessThanOrEqual(13)
  })

  it('nunca sugere menos de 1 dia', () => {
    for (const de of AMBIENTES) {
      for (const para of AMBIENTES) {
        expect(sugerirPorMudancaDeAmbiente(1, de, para), `${de}→${para}`).toBeGreaterThanOrEqual(1)
      }
    }
  })
})
