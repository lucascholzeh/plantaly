import { listarPlantas } from '../dados/plantas'
import { useCarregamento } from '../dados/useCarregamento'
import { irPara } from '../navegacao/rotas'
import { Aviso, Botao, Cartao, EstadoVazio, Etiqueta } from '../visual/componentes'
import { estadoVisual } from './estados'
import { descreverDistancia, detalheDoAtraso } from './textos'
import { diferencaEmDias } from '../dominio/datas'

export function MinhasPlantas() {
  const { dados, carregando, erro, recarregar } = useCarregamento(listarPlantas)

  if (carregando && !dados) return <p>Carregando…</p>

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
            <a className="planta__nome" href={`#/plantas/${planta.id}`}>
              {planta.nickname}
            </a>
            {planta.species_label && <p className="planta__especie">{planta.species_label}</p>}
            <p className="planta__rega">
              {status.ultima_rega
                ? `Regada ${descreverDistancia(diferencaEmDias(status.ultima_rega, status.hoje))}`
                : 'Sem rega registrada'}
            </p>
            <Etiqueta
              estado={estadoVisual(status.situacao_rega)}
              detalhe={
                status.situacao_rega === 'sem-historico'
                  ? 'sem histórico'
                  : detalheDoAtraso(status.dias_de_atraso_rega)
              }
            />
          </Cartao>
        ))}
      </section>
    </>
  )
}
