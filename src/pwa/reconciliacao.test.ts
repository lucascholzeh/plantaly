import { describe, expect, it } from 'vitest'
import { decidirReconciliacao } from './reconciliacao'

describe('reconciliação da inscrição de push', () => {
  it('refaz quando o servidor apagou a linha e o aparelho ainda guarda a inscrição', () => {
    // O caso de 2026-09: a Apple respondeu 410, a Edge Function apagou, e o
    // app seguia dizendo "ativo" sem nunca mais receber nada.
    expect(
      decidirReconciliacao({ permissao: 'granted', temNoAparelho: true, temNoBanco: false }),
    ).toBe('refazer')
  })

  it('não mexe quando a consulta ao banco falhou', () => {
    // Rede ruim não é inscrição perdida. Descartar aqui derrubaria uma
    // inscrição que funciona.
    expect(
      decidirReconciliacao({ permissao: 'granted', temNoAparelho: true, temNoBanco: null }),
    ).toBe('nada')
  })

  it('não mexe quando aparelho e banco concordam', () => {
    expect(
      decidirReconciliacao({ permissao: 'granted', temNoAparelho: true, temNoBanco: true }),
    ).toBe('nada')
  })

  it('não mexe sem inscrição no aparelho — a tela já mostra "desligado"', () => {
    expect(
      decidirReconciliacao({ permissao: 'granted', temNoAparelho: false, temNoBanco: false }),
    ).toBe('nada')
  })

  it('não mexe sem permissão', () => {
    for (const permissao of ['default', 'denied'] as const) {
      expect(decidirReconciliacao({ permissao, temNoAparelho: true, temNoBanco: false })).toBe(
        'nada',
      )
    }
  })
})
