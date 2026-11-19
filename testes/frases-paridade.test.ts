import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { escolherFrase, hashEstavel, type Frase } from '../src/frases/escolha'
import {
  escolherFrase as escolherNaFuncao,
  hashEstavel as hashNaFuncao,
} from '../supabase/functions/enviar-lembretes/escolha.ts'

/**
 * A frase do app e a frase da notificação são a mesma.
 *
 * As frases em si moram na tabela `frases` (migração 0010), e os dois lados
 * leem a mesma tabela. O que continua em dois lugares é o **cálculo**: o
 * navegador importa de `src/frases/`, e o Deno da Edge Function não alcança
 * `src/` — daí a cópia em `supabase/functions/enviar-lembretes/`.
 *
 * Cópia sem teste apodrece: alguém muda a rotação de um lado, e a
 * notificação passa a citar uma frase enquanto o box mostra outra. É o
 * princípio 3 do projeto — nada calculado em dois lugares sem paridade.
 *
 * **Ao mexer em `escolha.ts`, copie para o outro lado** — inclusive depois de
 * `npm run format`.
 */
const CARGA: Frase[] = JSON.parse(
  readFileSync('supabase/migrations/0010_frases_no_banco.sql', 'utf8').split('$frases$')[1],
)

describe('paridade da escolha da frase entre o app e a Edge Function', () => {
  it('os arquivos de escolha são idênticos', () => {
    const noApp = readFileSync('src/frases/escolha.ts', 'utf8')
    const naFuncao = readFileSync('supabase/functions/enviar-lembretes/escolha.ts', 'utf8')
    expect(naFuncao).toBe(noApp)
  })

  it('os dois hashes concordam', () => {
    for (const entrada of ['', 'a', '2026-08-30:u1', 'ç'.repeat(50)]) {
      expect(hashNaFuncao(entrada)).toBe(hashEstavel(entrada))
    }
  })

  it('os dois lados escolhem a mesma frase para o mesmo dia e usuário', () => {
    // A propriedade que o usuário percebe: abrir o app depois de ler a
    // notificação mostra a mesma frase. Cada lado recebe as linhas numa
    // ordem diferente, como pode acontecer vindo do banco.
    const paraOApp = CARGA
    const paraAFuncao = [...CARGA].reverse()
    const usuarios = ['11111111-1111-1111-1111-111111111111', 'abc-def', '']
    for (const usuario of usuarios) {
      for (let d = 1; d <= 31; d++) {
        const dia = `2026-10-${String(d).padStart(2, '0')}`
        expect(escolherNaFuncao(dia, usuario, paraAFuncao).nome, `${dia} / ${usuario}`).toBe(
          escolherFrase(dia, usuario, paraOApp).nome,
        )
      }
    }
  })
})
