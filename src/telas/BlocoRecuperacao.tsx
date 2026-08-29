import { buscarEspecie } from '../catalogo'
import { PASSOS_DE_RECUPERACAO } from '../dominio/recuperacao'
import { Aviso, Cartao } from '../visual/componentes'

/**
 * Bloco de recuperação, exibido quando a planta entra em atenção.
 *
 * **Sem motivo floral aqui.** A seção 9 é explícita: não se decora um
 * problema. Esta é a única área da ficha onde a decoração está proibida por
 * regra, e não por acaso.
 */
export function BlocoRecuperacao({
  diasDeAtraso,
  especieSlug,
}: {
  diasDeAtraso: number
  especieSlug: string | null
}) {
  const especie = especieSlug ? buscarEspecie(especieSlug) : null
  const notaDaEspecie = especie?.notaRecuperacao

  return (
    <Cartao elevado className="recuperacao">
      <h2 className="lista__titulo">Como recuperar</h2>
      <Aviso tom="atencao">
        Esta planta está {diasDeAtraso} {diasDeAtraso === 1 ? 'dia' : 'dias'} sem rega além do
        previsto — o bastante, para a tolerância dela, para exigir cuidado na hora de corrigir.
      </Aviso>

      {notaDaEspecie && (
        <p className="recuperacao__especifico">
          <strong>{especie!.nomePopular}:</strong> {notaDaEspecie}
        </p>
      )}

      <ol className="recuperacao__passos">
        {PASSOS_DE_RECUPERACAO.map((passo) => (
          <li key={passo.titulo}>
            <strong>{passo.titulo}.</strong> {passo.detalhe}
          </li>
        ))}
      </ol>
    </Cartao>
  )
}
