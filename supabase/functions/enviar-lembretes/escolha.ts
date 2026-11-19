import { FRASES, type Frase } from './frases.ts'

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
 * **Rotação, não sorteio (2026-09-24).** A primeira versão sorteava cada dia
 * de forma independente — hash do dia mod tamanho da lista — e repetia: com
 * 10 frases, 9 em cada 10 semanas tinham alguma frase em dobro, e o Lucas
 * recebeu reclamação. Agora cada pessoa tem uma ordem fixa das frases,
 * embaralhada a partir do seu id, e anda uma posição por dia. Cada frase
 * volta exatamente a cada `lista.length` dias, nunca antes.
 *
 * Reembaralhar a cada volta completa foi considerado e recusado: só
 * impediria a repetição no dia da virada, e uma frase podia sair no último
 * dia de uma volta e reaparecer no terceiro da seguinte.
 *
 * O `id` do usuário define a ordem para que as duas contas da casa não
 * recebam a mesma frase na mesma manhã — o que seria notado, sendo duas
 * pessoas na mesma cozinha. Com ordens independentes, coincidem em cerca de
 * um dia a cada `lista.length`.
 *
 * **Mudar a lista reembaralha tudo uma vez.** A ordem depende do tamanho da
 * lista; acrescentar ou tirar frase dá a cada pessoa uma ordem nova, e no dia
 * da troca pode sair uma frase vista há pouco. É o preço de não guardar
 * estado.
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
 * Gerador pseudoaleatório com semente (mulberry32).
 *
 * Precisa ser o mesmo nos dois runtimes, por isso escrito aqui em vez de
 * vir de biblioteca. `Math.imul` mantém a multiplicação em 32 bits — a
 * multiplicação comum perderia precisão como a do FNV acima.
 */
function geradorComSemente(semente: number): () => number {
  let estado = semente >>> 0
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Os índices `0..tamanho-1` embaralhados (Fisher-Yates) pela semente. */
export function ordemDoUsuario(usuarioId: string, tamanho: number): number[] {
  const aleatorio = geradorComSemente(hashEstavel(usuarioId))
  const ordem = Array.from({ length: tamanho }, (_, i) => i)
  for (let i = tamanho - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1))
    ;[ordem[i], ordem[j]] = [ordem[j], ordem[i]]
  }
  return ordem
}

/**
 * Dias corridos de 2026-01-01 até `dia`.
 *
 * Feito sobre a data em UTC de propósito: `dia` já é o dia local da pessoa, e
 * aqui só importa contar dias de calendário. Converter para o fuso de novo
 * faria a contagem pular ou repetir um dia no horário de verão.
 */
export function numeroDoDia(dia: string): number {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dia)
  if (!partes) throw new Error(`Dia fora do formato AAAA-MM-DD: ${dia}`)
  const [, ano, mes, dd] = partes.map(Number)
  return Math.round((Date.UTC(ano, mes - 1, dd) - Date.UTC(2026, 0, 1)) / 86_400_000)
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
  const ordem = ordemDoUsuario(usuarioId, lista.length)
  // Módulo que não fica negativo: dias antes de 2026 continuam válidos.
  const posicao = ((numeroDoDia(dia) % lista.length) + lista.length) % lista.length
  return lista[ordem[posicao]]
}
