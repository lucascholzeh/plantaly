import { ESPECIES } from './especies'
import type { Especie, Faixa } from './tipos'

export type { Especie, Faixa, Foto, Fonte } from './tipos'
export { ESPECIES } from './especies'

/**
 * URLs das fotos, resolvidas pelo Vite em tempo de build.
 *
 * `eager` porque o mapa precisa existir de forma síncrona; o peso real das
 * imagens continua sendo carregado sob demanda pelo navegador, já que o que
 * entra no bundle é só a URL.
 */
const ARQUIVOS = import.meta.glob('./fotos/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export function urlDaFoto(arquivo: string): string | null {
  return ARQUIVOS[`./fotos/${arquivo}`] ?? null
}

const POR_SLUG = new Map(ESPECIES.map((especie) => [especie.slug, especie]))

export function buscarEspecie(slug: string): Especie | null {
  return POR_SLUG.get(slug) ?? null
}

/**
 * Forma comparável de um nome: sem acento, sem caixa e sem separador.
 *
 * Hífen e espaço viram a mesma coisa porque os nomes populares são escritos
 * com hífen ("Rosa-do-deserto", "Espada-de-São-Jorge") e ninguém digita
 * hífen no celular. Sem isto, "rosa do deserto" não encontrava a ficha que
 * se chama exatamente assim.
 */
function comparavel(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '')
}

/**
 * Busca por nome popular, científico ou apelido.
 *
 * Sem acento, sem caixa e sem separador de propósito: ninguém digita
 * "orquídea" com acento no celular, "Phalaenopsis" tem grafia difícil, e
 * quem procura a rosa-do-deserto escreve "rosa do deserto".
 */
export function procurarEspecies(termo: string): Especie[] {
  const alvo = comparavel(termo)
  if (alvo === '') return ESPECIES

  return ESPECIES.filter((especie) =>
    [especie.nomePopular, especie.nomeCientifico, ...especie.apelidos].some((nome) =>
      comparavel(nome).includes(alvo),
    ),
  )
}

/**
 * O que o cadastro copia do catálogo para dentro da planta.
 *
 * Usa o meio da faixa: a faixa descreve a espécie, mas a planta precisa de
 * um número só. O ambiente ajusta esse valor em seguida, e o aprendizado por
 * histórico corrige o resto.
 */
export function valoresParaCadastro(especie: Especie) {
  const meio = (faixa: Faixa) => Math.round((faixa[0] + faixa[1]) / 2)
  return {
    intervaloQuente: meio(especie.regaQuente),
    intervaloFrio: meio(especie.regaFria),
    toleranciaSeca: especie.toleranciaSeca,
  }
}

export function formatarFaixa(faixa: Faixa): string {
  return faixa[0] === faixa[1] ? `${faixa[0]} dias` : `${faixa[0]} a ${faixa[1]} dias`
}

export const GRUPOS: Record<Especie['grupo'], string> = {
  orquidea: 'Orquídeas',
  lirio: 'Lírios e parentes',
  flor: 'Com flor',
  suculenta: 'Suculentas e cactos',
  folhagem: 'Folhagens',
  generico: 'Genéricos',
}
