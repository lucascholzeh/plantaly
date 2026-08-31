import { FRASES, type Frase } from './frases'

/**
 * Qual frase é a de hoje.
 *
 * **Determinística de propósito.** A frase precisa ser a mesma na
 * notificação e no box da aba "Hoje": ler uma coisa na Tela de Bloqueio,
 * abrir o app e ver outra faria o app parecer quebrado. Sortear nos dois
 * lados garantiria justamente isso.
 *
 * A alternativa seria gravar a escolha do dia numa tabela e a tela lê-la —
 * mas isso é uma coluna, uma migração e uma ida ao banco para reproduzir o
 * que uma função pura resolve: os dois lados calculam o mesmo índice a
 * partir dos mesmos dados, sem se falarem.
 *
 * O `id` do usuário entra na conta para que as duas contas da casa não
 * recebam a mesma frase na mesma manhã — o que seria notado, sendo duas
 * pessoas na mesma cozinha.
 */

/**
 * Hash estável de string (FNV-1a de 32 bits).
 *
 * Não é criptográfico e nem precisa ser — só precisa espalhar e devolver
 * sempre o mesmo número para a mesma entrada, inclusive entre o Deno da
 * Edge Function e o navegador. `String.prototype.hashCode` não existe em
 * JS, e `Math.random` com semente traria uma dependência para isto aqui.
 */
export function hashEstavel(texto: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i)
    // Multiplicação FNV escrita com deslocamentos: `hash * 16777619` estoura
    // o inteiro seguro do JS e perde precisão silenciosamente.
    hash = (hash + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)) >>> 0
  }
  return hash >>> 0
}

/**
 * A frase do dia `dia` para o usuário `usuarioId`.
 *
 * `dia` é um `DiaLocal` ('AAAA-MM-DD') — dia de calendário no fuso da
 * pessoa, como todo o resto do cálculo do app. Usar um instante UTC aqui
 * faria a frase virar de madrugada para quem estivesse a leste.
 */
export function escolherFrase(dia: string, usuarioId: string, lista: Frase[] = FRASES): Frase {
  if (lista.length === 0) throw new Error('Lista de frases vazia')
  return lista[hashEstavel(`${dia}:${usuarioId}`) % lista.length]
}
