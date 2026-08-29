import type { ToleranciaSeca } from '../dominio/tipos'

/**
 * Formato da ficha de espécie.
 *
 * Referência: seção 7 do design. As regras que este tipo existe para
 * sustentar, e que `catalogo.test.ts` verifica na build:
 *
 * - **Faixa, nunca número mágico.** `[7, 10]`, não `8`.
 * - **Critério antes do número.** Como saber que chegou a hora é mais
 *   confiável que contar dias, e por isso é campo obrigatório.
 * - **Fonte por espécie**, com URL, auditável.
 * - **Espécie sem base confiável não entra.** Não há como preencher esta
 *   estrutura pela metade: falta de campo quebra a build.
 */

/** Faixa de dias: `[mínimo, máximo]`. */
export type Faixa = [number, number]

export interface Foto {
  /** Nome do arquivo em `src/catalogo/fotos/`. */
  arquivo: string
  /** O que a foto mostra — decide onde ela aparece na ficha. */
  mostra: 'flor' | 'planta' | 'folha' | 'raiz'
  alt: string
  autor: string
  licenca: string
  /** Página do arquivo no acervo de origem. */
  origem: string
}

export interface Fonte {
  titulo: string
  url: string
}

export interface Confusao {
  /** Com o que costuma ser confundida. */
  com: string
  /** A diferença prática, em traço observável. */
  diferenca: string
}

export interface SinalDeProblema {
  sinal: string
  significado: string
}

export interface Especie {
  slug: string
  nomePopular: string
  nomeCientifico: string
  apelidos: string[]
  grupo: 'orquidea' | 'lirio' | 'flor' | 'suculenta' | 'folhagem' | 'generico'

  /**
   * Como saber que chegou a hora de regar.
   *
   * Vem antes de qualquer número na ficha, de propósito: o dedo no substrato
   * responde melhor que o calendário.
   */
  criterioDeRega: string

  regaQuente: Faixa
  regaFria: Faixa
  toleranciaSeca: ToleranciaSeca

  /**
   * As faixas de dias vieram da fonte ou são tradução nossa?
   *
   * Quase nenhuma fonte boa de horticultura diz "regue a cada 8 dias" — elas
   * dizem "quando o substrato secar". Quando o número é a nossa tradução
   * operacional de um critério qualitativo, isso precisa estar dito na
   * interface, e não escondido atrás de uma citação que não contém o número.
   */
  numerosDerivados: boolean

  /** Nulo quando a espécie não pede adubação regular. */
  adubacaoQuente: Faixa | null
  adubacaoFria: Faixa | null
  notaAdubacao?: string

  luz: string

  /** Dois ou três traços estruturais decisivos. */
  comoIdentificar: string[]
  confundidaCom: Confusao[]
  sinaisDeProblema: SinalDeProblema[]

  /** Cuidado específico da espécie, quando houver. */
  cuidadoEspecifico?: string[]
  /** O que fazer quando ela passou muito tempo seca. */
  notaRecuperacao?: string

  /**
   * Onde o clima brasileiro muda a resposta da fonte.
   *
   * As boas fontes de horticultura são majoritariamente de clima temperado.
   * Transpor um número de lá sem dizer nada é o erro que a seção 7 proíbe.
   */
  avisoClimatico?: string

  fotos: Foto[]

  /**
   * Por que a espécie ainda não tem foto conferida.
   *
   * Foto de acervo aberto só entra depois de alguém abrir a imagem e
   * comparar com os traços de identificação — a busca devolve arquivos cujo
   * texto menciona a espécie, incluindo páginas de livro digitalizado. Sem
   * este campo, a ausência de foto viraria silêncio; com ele, a ficha diz.
   */
  semFotoAinda?: string

  fontes: Fonte[]
}
