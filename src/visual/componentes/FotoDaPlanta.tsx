import { useEffect, useState } from 'react'
import { urlDaFotoDaPlanta } from '../../dados/fotos'

interface Props {
  /** Caminho no bucket. Vazio ou nulo mostra a inicial do apelido. */
  caminho: string | null | undefined
  /** Apelido da planta: dá a inicial e entra no alt. */
  apelido: string
  /** URL já assinada, quando a lista assinou tudo de uma vez. */
  url?: string | null
  tamanho?: 'lista' | 'ficha'
}

/**
 * Inicial do apelido, para o balão sem foto.
 *
 * Pelo caractere, não pelo índice: `"Ângela"[0]` funciona, mas apelido que
 * comece por emoji viraria meio par substituto — um losango de erro na tela.
 */
function inicialDe(apelido: string): string {
  const primeiro = [...apelido.trim()][0]
  return primeiro ? primeiro.toLocaleUpperCase('pt-BR') : '?'
}

/**
 * Balão da planta: a foto do usuário, ou a inicial do apelido.
 *
 * O apelido nunca é substituído pela foto — decisão do Lucas em 2026-08-30.
 * Este componente é só o balão; quem o usa desenha o nome ao lado.
 *
 * A URL vem assinada e com prazo (bucket privado), então ela é buscada aqui
 * quando não vier pronta de cima. Falha vira a inicial, sem mensagem de erro:
 * uma lista de plantas cheia de avisos de imagem quebrada seria pior que a
 * ausência silenciosa da foto.
 */
export function FotoDaPlanta({ caminho, apelido, url, tamanho = 'lista' }: Props) {
  // Só o resultado da busca fica em estado. A URL vinda de cima é usada
  // direto, sem passar por `setState` num efeito — copiar prop para estado
  // custaria uma renderização extra e atrasaria a imagem em um quadro.
  // Guarda o caminho junto com a URL: trocar a foto da planta deixaria a
  // URL antiga válida por um instante e o balão mostraria a imagem anterior.
  const [buscada, setBuscada] = useState<{ de: string; url: string } | null>(null)
  const [quebrada, setQuebrada] = useState<string | null>(null)

  useEffect(() => {
    // Nada a buscar: a URL veio pronta da lista, ou não há foto.
    if (url || !caminho) return

    // `ativo` evita gravar o resultado de uma planta que já saiu da tela —
    // rolar rápido dispararia respostas fora de ordem e a foto errada
    // apareceria no balão errado.
    let ativo = true
    urlDaFotoDaPlanta(caminho).then((resultado) => {
      if (ativo && resultado) setBuscada({ de: caminho, url: resultado })
    })
    return () => {
      ativo = false
    }
  }, [caminho, url])

  const endereco = caminho ? (url ?? (buscada?.de === caminho ? buscada.url : null)) : null
  const classe = `foto-planta foto-planta--${tamanho}`

  // Guardar qual endereço falhou, em vez de um booleano, faz a nova tentativa
  // funcionar sozinha quando a URL é renovada: o endereço muda e deixa de
  // bater com o que quebrou.
  if (!endereco || endereco === quebrada) {
    // `aria-hidden` porque o apelido inteiro já está escrito ao lado: sem
    // isto, o leitor de tela anunciaria a inicial e depois o nome completo.
    return (
      <span className={`${classe} foto-planta--inicial`} aria-hidden="true">
        {inicialDe(apelido)}
      </span>
    )
  }

  return (
    <img
      className={classe}
      src={endereco}
      alt={`Foto de ${apelido}`}
      loading="lazy"
      decoding="async"
      onError={() => setQuebrada(endereco)}
    />
  )
}
