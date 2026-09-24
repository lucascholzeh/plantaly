import { comoRegar } from '../catalogo/comoRegar'
import { Cartao } from '../visual/componentes'

/**
 * Como regar: o gesto e a quantidade da espécie.
 *
 * Aparece na ficha da planta, logo abaixo do "Reguei hoje" — é onde a dúvida
 * surge, na hora de pegar o regador — e na ficha da espécie. A aba "Hoje"
 * mostra só o `resumo`, numa linha.
 *
 * Planta sem espécie do catálogo recebe a regra geral da RHS, dita como
 * geral: apresentá-la como se fosse específica seria o "dado inventado" que
 * o princípio 1 proíbe.
 */
export function BlocoComoRegar({
  especieSlug,
  emAtencao = false,
}: {
  especieSlug: string | null
  /** A planta passou do limiar de atenção: a recuperação vem antes. */
  emAtencao?: boolean
}) {
  const { rega, geral } = comoRegar(especieSlug)

  return (
    <Cartao className="como-regar">
      <h2 className="lista__titulo">Como regar</h2>

      {emAtencao && (
        <p className="formulario__nota">
          Esta planta está atrasada: siga primeiro o bloco “Como recuperar”, mais abaixo.
        </p>
      )}

      {geral && (
        <p className="formulario__nota">
          Sem espécie do catálogo, vale a regra geral de rega em vasos. Escolha a espécie em “Dados
          da planta” para ver o jeito certo dela.
        </p>
      )}

      <p className="como-regar__quanto">
        <strong>Quanto:</strong> {rega.quanto}
      </p>
      <p className="formulario__nota">
        {rega.quantoPelaRegraGeral && !geral
          ? 'A fonte desta espécie não fala em volume; a quantidade segue o guia geral de rega em vasos da RHS. '
          : ''}
        Sem medida em ml de propósito: a quantidade certa muda com o tamanho do vaso, e o sinal de
        que chegou é o próprio vaso que dá.
      </p>

      <ol className="como-regar__passos">
        {rega.passos.map((passo) => (
          <li key={passo}>{passo}</li>
        ))}
      </ol>

      {rega.agua && (
        <p>
          <strong>Água:</strong> {rega.agua}
        </p>
      )}
      {rega.noFrio && (
        <p>
          <strong>Nos meses frios:</strong> {rega.noFrio}
        </p>
      )}

      <h3 className="como-regar__subtitulo">Evite</h3>
      <ul className="marcadores">
        {rega.evitar.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <ul className="creditos como-regar__fontes">
        {rega.fontes.map((fonte) => (
          <li key={fonte.url}>
            Fonte:{' '}
            <a href={fonte.url} target="_blank" rel="noreferrer noopener">
              {fonte.titulo}
            </a>
          </li>
        ))}
      </ul>
    </Cartao>
  )
}
