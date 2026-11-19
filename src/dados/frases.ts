import { supabase } from '../lib/supabase'
import type { Frase } from '../frases/escolha'

/**
 * As frases da manhã, lidas da tabela `frases` (migração 0010).
 *
 * Guardadas na memória da página depois da primeira leitura: a lista muda
 * raramente, por edição no painel, e voltar à aba "Hoje" não precisa de
 * outra ida ao banco. Uma frase editada aparece na próxima abertura do app.
 *
 * Falha não fica guardada — a próxima tentativa busca de novo.
 */
let emMemoria: Promise<Frase[]> | null = null

export function listarFrases(): Promise<Frase[]> {
  emMemoria ??= buscar().catch((erro: unknown) => {
    emMemoria = null
    throw erro
  })
  return emMemoria
}

async function buscar(): Promise<Frase[]> {
  const { data, error } = await supabase.from('frases').select('nome, texto, autor, obra')
  if (error) throw new Error(`Não consegui carregar as frases: ${error.message}`)
  return data ?? []
}
