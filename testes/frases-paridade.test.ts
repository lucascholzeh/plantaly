import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { FRASES } from '../src/frases/frases'
import { escolherFrase, hashEstavel } from '../src/frases/escolha'
import { FRASES as FRASES_FUNCAO } from '../supabase/functions/enviar-lembretes/frases.ts'
import {
  escolherFrase as escolherNaFuncao,
  hashEstavel as hashNaFuncao,
} from '../supabase/functions/enviar-lembretes/escolha.ts'

/**
 * A frase do app e a frase da notificação são a mesma.
 *
 * O código vive em dois lugares porque precisa rodar em dois runtimes: o
 * navegador importa de `src/frases/`, e o Deno da Edge Function não alcança
 * `src/` — daí a cópia em `supabase/functions/enviar-lembretes/`.
 *
 * Cópia sem teste apodrece: alguém acrescenta uma frase de um lado, e a
 * notificação passa a citar uma coisa enquanto o box mostra outra. É o
 * mesmo raciocínio do princípio 3 do projeto — nada calculado em dois
 * lugares sem teste de paridade.
 *
 * **Ao mexer em qualquer um dos dois arquivos, copie para o outro.**
 */
describe('paridade entre as frases do app e as da Edge Function', () => {
  it('os arquivos de frases são idênticos', () => {
    const noApp = readFileSync('src/frases/frases.ts', 'utf8')
    const naFuncao = readFileSync('supabase/functions/enviar-lembretes/frases.ts', 'utf8')
    expect(naFuncao).toBe(noApp)
  })

  it('os arquivos de escolha só diferem na extensão do import', () => {
    const noApp = readFileSync('src/frases/escolha.ts', 'utf8')
    const naFuncao = readFileSync('supabase/functions/enviar-lembretes/escolha.ts', 'utf8')
    // O Deno exige a extensão no import; o resto tem de bater caractere a
    // caractere.
    expect(naFuncao.replace("'./frases.ts'", "'./frases'")).toBe(noApp)
  })

  it('as duas listas têm as mesmas frases', () => {
    expect(FRASES_FUNCAO.map((f) => f.nome)).toEqual(FRASES.map((f) => f.nome))
    expect(FRASES_FUNCAO.map((f) => f.texto)).toEqual(FRASES.map((f) => f.texto))
  })

  it('os dois hashes concordam', () => {
    for (const entrada of ['', 'a', '2026-08-30:u1', 'ç'.repeat(50)]) {
      expect(hashNaFuncao(entrada)).toBe(hashEstavel(entrada))
    }
  })

  it('os dois lados escolhem a mesma frase para o mesmo dia e usuário', () => {
    // A propriedade que o usuário percebe: abrir o app depois de ler a
    // notificação mostra a mesma frase.
    const usuarios = ['11111111-1111-1111-1111-111111111111', 'abc-def', '']
    for (const usuario of usuarios) {
      for (let d = 1; d <= 31; d++) {
        const dia = `2026-10-${String(d).padStart(2, '0')}`
        expect(escolherNaFuncao(dia, usuario).nome, `${dia} / ${usuario}`).toBe(
          escolherFrase(dia, usuario).nome,
        )
      }
    }
  })
})
