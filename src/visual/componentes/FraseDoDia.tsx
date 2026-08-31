import type { Frase } from '../../frases/frases'

interface Props {
  frase: Frase
}

/**
 * O box da frase da manhã.
 *
 * Fica abaixo das pendências na aba "Hoje": o que exige ação vem primeiro, e
 * a frase é o fim da leitura. Em dia calmo, sem nada vencendo, ela acaba
 * aparecendo logo no alto de qualquer maneira.
 *
 * Usa `<blockquote>` com `<cite>` porque é literalmente uma citação — e
 * porque assim o leitor de tela anuncia como citação, com autor, em vez de
 * despejar a frase no meio da lista de plantas como se fosse mais uma linha.
 */
export function FraseDoDia({ frase }: Props) {
  return (
    <figure className="frase-do-dia">
      <blockquote className="frase-do-dia__texto">{frase.texto}</blockquote>
      <figcaption className="frase-do-dia__autoria">
        {frase.autor}
        {/* A obra vem em `cite` própria: é o dado que separa "citação de
            livro" de frase de rede social. */}
        <cite className="frase-do-dia__obra">{frase.obra}</cite>
      </figcaption>
    </figure>
  )
}
