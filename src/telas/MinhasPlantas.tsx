import { listarPlantas } from '../dados/plantas'
import { useCarregamento } from '../dados/useCarregamento'
import { useFotosAssinadas } from '../dados/useFotos'
import { diferencaEmDias } from '../dominio/datas'
import { irPara } from '../navegacao/rotas'
import {
  Aviso,
  Botao,
  Carregando,
  Cartao,
  EstadoVazio,
  Etiqueta,
  FotoDaPlanta,
} from '../visual/componentes'
import { estadoVisual } from './estados'
import { descreverDistancia, detalheDoAtraso, proximaRegaEmLinha } from './textos'

export function MinhasPlantas() {
  const { dados, carregando, erro, recarregar } = useCarregamento(listarPlantas)
  const fotos = useFotosAssinadas(dados)

  if (carregando && !dados) return <Carregando />

  if (erro) {
    return (
      <>
        <Aviso tom="erro">{erro}</Aviso>
        <Botao variante="secundario" onClick={recarregar}>
          Tentar de novo
        </Botao>
      </>
    )
  }

  const plantas = dados ?? []

  if (plantas.length === 0) {
    return (
      <EstadoVazio
        titulo="Nenhuma planta ainda"
        texto="Cadastre a primeira e o Plantaly começa a acompanhar as regas."
        acao={<Botao onClick={() => irPara('plantas/nova')}>Cadastrar planta</Botao>}
      />
    )
  }

  return (
    <>
      <Botao largo onClick={() => irPara('plantas/nova')}>
        Cadastrar planta
      </Botao>

      <section className="lista">
        {plantas.map(({ planta, status }) => (
          <Cartao key={planta.id} className="planta">
            <FotoDaPlanta
              caminho={planta.photo_path}
              apelido={planta.nickname}
              url={planta.photo_path ? fotos.get(planta.photo_path) : null}
            />

            {/* A foto entra ao lado do texto, nunca no lugar dele: o apelido
                continua sendo o que identifica a planta. */}
            <div className="planta__texto">
              <a className="planta__nome" href={`#/plantas/${planta.id}`}>
                {planta.nickname}
              </a>
              {planta.species_label && <p className="planta__especie">{planta.species_label}</p>}
              <p className="planta__rega">
                {status.ultima_rega
                  ? `Regada ${descreverDistancia(diferencaEmDias(status.ultima_rega, status.hoje))}`
                  : 'Sem rega registrada'}
              </p>
              <p className="planta__proxima">
                {proximaRegaEmLinha(
                  status.proxima_rega,
                  status.proxima_rega ? diferencaEmDias(status.hoje, status.proxima_rega) : 0,
                )}
              </p>
              <Etiqueta
                estado={estadoVisual(status.situacao_rega)}
                detalhe={
                  status.situacao_rega === 'sem-historico'
                    ? 'sem histórico'
                    : detalheDoAtraso(status.dias_de_atraso_rega)
                }
              />
            </div>
          </Cartao>
        ))}
      </section>
    </>
  )
}
