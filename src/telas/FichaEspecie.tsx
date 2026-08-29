import { buscarEspecie, formatarFaixa, urlDaFoto } from '../catalogo'
import { irPara } from '../navegacao/rotas'
import { Aviso, Botao, Cartao } from '../visual/componentes'

/**
 * Ficha completa de uma espécie.
 *
 * A ordem dos blocos é deliberada e segue a seção 7: o critério de rega vem
 * antes de qualquer número, porque "quando o substrato secar" é mais
 * confiável que contar dias no calendário.
 */
export function FichaEspecie({ slug }: { slug: string }) {
  const especie = buscarEspecie(slug)

  if (!especie) {
    return <Aviso tom="atencao">Espécie não encontrada no catálogo.</Aviso>
  }

  const foto = especie.fotos[0]
  const url = foto ? urlDaFoto(foto.arquivo) : null

  return (
    <>
      <Cartao elevado>
        <h1>{especie.nomePopular}</h1>
        <p className="especie__cientifico">{especie.nomeCientifico}</p>
        {especie.apelidos.length > 0 && (
          <p className="formulario__nota">Também chamada de {especie.apelidos.join(', ')}.</p>
        )}

        {url && (
          <figure className="especie__figura">
            <img src={url} alt={foto.alt} loading="lazy" />
            <figcaption>
              Foto de {foto.autor} · {foto.licenca} ·{' '}
              <a href={foto.origem} target="_blank" rel="noreferrer noopener">
                origem
              </a>
            </figcaption>
          </figure>
        )}

        {especie.semFotoAinda && (
          <Aviso tom="informacao">Sem foto conferida ainda. {especie.semFotoAinda}</Aviso>
        )}

        <Botao
          largo
          onClick={() => irPara(`plantas/nova?especie=${especie.slug}`)}
          className="especie__cadastrar"
        >
          Tenho essa planta
        </Botao>
      </Cartao>

      <Cartao>
        <h2 className="lista__titulo">Como saber que chegou a hora</h2>
        <p>{especie.criterioDeRega}</p>
      </Cartao>

      <Cartao>
        <h2 className="lista__titulo">Rega</h2>
        <dl className="ficha__dados">
          <div>
            <dt>Outubro a março</dt>
            <dd>{formatarFaixa(especie.regaQuente)}</dd>
          </div>
          <div>
            <dt>Abril a setembro</dt>
            <dd>{formatarFaixa(especie.regaFria)}</dd>
          </div>
        </dl>

        {especie.numerosDerivados && (
          <p className="formulario__nota">
            Estes dias são a nossa tradução do critério acima, não um número que a fonte informa. O
            critério vale mais que a contagem.
          </p>
        )}

        {especie.avisoClimatico && <Aviso tom="atencao">{especie.avisoClimatico}</Aviso>}
      </Cartao>

      <Cartao>
        <h2 className="lista__titulo">Adubação</h2>
        {especie.adubacaoQuente ? (
          <dl className="ficha__dados">
            <div>
              <dt>Outubro a março</dt>
              <dd>{formatarFaixa(especie.adubacaoQuente)}</dd>
            </div>
            <div>
              <dt>Abril a setembro</dt>
              <dd>{especie.adubacaoFria ? formatarFaixa(especie.adubacaoFria) : 'não adubar'}</dd>
            </div>
          </dl>
        ) : (
          <p className="formulario__nota">Não pede adubação regular.</p>
        )}
        {especie.notaAdubacao && <p className="formulario__nota">{especie.notaAdubacao}</p>}
      </Cartao>

      <Cartao>
        <h2 className="lista__titulo">Como identificar</h2>
        <ul className="marcadores">
          {especie.comoIdentificar.map((traco) => (
            <li key={traco}>{traco}</li>
          ))}
        </ul>

        {especie.confundidaCom.length > 0 && (
          <>
            <h3 className="lista__titulo">Costuma ser confundida com</h3>
            <dl className="ficha__dados">
              {especie.confundidaCom.map((confusao) => (
                <div key={confusao.com}>
                  <dt>{confusao.com}</dt>
                  <dd>{confusao.diferenca}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </Cartao>

      <Cartao>
        <h2 className="lista__titulo">Luz</h2>
        <p>{especie.luz}</p>
      </Cartao>

      <Cartao>
        <h2 className="lista__titulo">Sinais de problema</h2>
        <dl className="ficha__dados">
          {especie.sinaisDeProblema.map((sinal) => (
            <div key={sinal.sinal}>
              <dt>{sinal.sinal}</dt>
              <dd>{sinal.significado}</dd>
            </div>
          ))}
        </dl>
      </Cartao>

      {especie.cuidadoEspecifico && (
        <Cartao>
          <h2 className="lista__titulo">Cuidado específico</h2>
          <ul className="marcadores">
            {especie.cuidadoEspecifico.map((cuidado) => (
              <li key={cuidado}>{cuidado}</li>
            ))}
          </ul>
        </Cartao>
      )}

      <Cartao>
        <h2 className="lista__titulo">Fontes</h2>
        {/* Fonte visível e clicável: é o que torna o catálogo auditável em
            vez de uma lista de números sem procedência. */}
        <ul className="marcadores">
          {especie.fontes.map((fonte) => (
            <li key={fonte.url}>
              <a href={fonte.url} target="_blank" rel="noreferrer noopener">
                {fonte.titulo}
              </a>
            </li>
          ))}
        </ul>
      </Cartao>
    </>
  )
}
