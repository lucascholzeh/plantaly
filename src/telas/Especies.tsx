import { useState } from 'react'
import { ESPECIES, GRUPOS, procurarEspecies, urlDaFoto, type Especie } from '../catalogo'
import { Campo, Cartao, EstadoVazio, Motivo } from '../visual/componentes'

/**
 * Catálogo navegável.
 *
 * É a seção que responde "qual orquídea eu tenho": comparar as fotos e ler
 * os traços de identificação. Funciona sem possuir a planta — o catálogo
 * vem junto com o app e não consulta o banco.
 */
export function Especies() {
  const [termo, setTermo] = useState('')
  const encontradas = procurarEspecies(termo)

  const grupos = [...new Set(ESPECIES.map((e) => e.grupo))].filter((grupo) =>
    encontradas.some((e) => e.grupo === grupo),
  )

  return (
    <>
      <Campo
        rotulo="Buscar espécie"
        type="search"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        ajuda="Nome popular, científico ou apelido."
      />

      {encontradas.length === 0 && (
        <EstadoVazio
          titulo="Nada encontrado"
          texto="O catálogo cresce em ondas. Se a sua planta não está aqui, cadastre com nome livre."
        />
      )}

      {termo.trim() === '' && <Creditos />}

      {grupos.map((grupo) => (
        <section className="lista" key={grupo}>
          <h2 className="lista__titulo">{GRUPOS[grupo]}</h2>
          {encontradas
            .filter((especie) => especie.grupo === grupo)
            .map((especie) => (
              <CartaoDeEspecie key={especie.slug} especie={especie} />
            ))}
        </section>
      ))}
    </>
  )
}

/**
 * Créditos das fotos.
 *
 * As licenças CC BY-SA exigem atribuição ao autor. Ficam no fim da aba, e
 * não escondidas numa página que ninguém abre.
 */
function Creditos() {
  const comFoto = ESPECIES.flatMap((especie) =>
    especie.fotos.map((foto) => ({ especie: especie.nomePopular, foto })),
  )
  if (comFoto.length === 0) return null

  return (
    <Cartao>
      <h2 className="lista__titulo">Créditos das fotos</h2>
      <ul className="marcadores creditos">
        {comFoto.map(({ especie, foto }) => (
          <li key={foto.arquivo}>
            {especie}: {foto.autor} · {foto.licenca} ·{' '}
            <a href={foto.origem} target="_blank" rel="noreferrer noopener">
              Wikimedia Commons
            </a>
          </li>
        ))}
      </ul>
    </Cartao>
  )
}

function CartaoDeEspecie({ especie }: { especie: Especie }) {
  const foto = especie.fotos[0]
  const url = foto ? urlDaFoto(foto.arquivo) : null

  return (
    <Cartao className="especie">
      {/* Canto do cartão de espécie: um dos quatro lugares onde o motivo
          floral é permitido. Só quando não há foto, para não competir. */}
      {!url && <Motivo contexto="cartao-especie" />}

      <a className="especie__link" href={`#/especies/${especie.slug}`}>
        {url ? (
          <img
            className="especie__foto"
            src={url}
            alt={foto.alt}
            width={72}
            height={72}
            loading="lazy"
          />
        ) : (
          <span className="especie__sem-foto" aria-hidden="true" />
        )}
        <span className="especie__nomes">
          <span className="especie__popular">{especie.nomePopular}</span>
          <span className="especie__cientifico">{especie.nomeCientifico}</span>
        </span>
      </a>
    </Cartao>
  )
}
