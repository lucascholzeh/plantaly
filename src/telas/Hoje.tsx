import { useState } from 'react'
import { apagarEvento, existeNoDia, registrarEvento } from '../dados/eventos'
import { listarPlantas } from '../dados/plantas'
import type { PlantaComStatus } from '../dados/tipos'
import { useCarregamento } from '../dados/useCarregamento'
import { irPara } from '../navegacao/rotas'
import { Aviso, Botao, Cartao, EstadoVazio, Etiqueta } from '../visual/componentes'
import { estadoVisual } from './estados'
import { detalheDoAtraso } from './textos'

interface Desfazivel {
  eventoId: string
  planta: string
}

/**
 * A tela dos dez segundos da manhã.
 *
 * Mostra só o que exige ação, com o botão de resolver na própria linha. É
 * também o destino da notificação da Etapa 7 e a rede de segurança do app:
 * mesmo que o push nunca funcione, esta tela responde "o que eu faço agora".
 */
export function Hoje() {
  const { dados, carregando, erro, recarregar } = useCarregamento(listarPlantas)
  const [desfazivel, setDesfazivel] = useState<Desfazivel | null>(null)
  const [falha, setFalha] = useState<string | null>(null)
  const [ocupada, setOcupada] = useState<string | null>(null)
  const [duplicada, setDuplicada] = useState<PlantaComStatus | null>(null)

  async function gravarRega(item: PlantaComStatus) {
    setFalha(null)
    setDuplicada(null)
    setOcupada(item.planta.id)
    try {
      const eventoId = await registrarEvento(item.planta.id, 'rega', item.status.hoje)
      setDesfazivel({ eventoId, planta: item.planta.nickname })
      recarregar()
    } catch (e) {
      // Registro otimista com falha visível: o app diz que não salvou em
      // vez de fingir que salvou (seção 12).
      setFalha(e instanceof Error ? e.message : String(e))
    } finally {
      setOcupada(null)
    }
  }

  async function aoRegar(item: PlantaComStatus) {
    setFalha(null)
    setOcupada(item.planta.id)
    try {
      // Toque duplo vira pergunta, não duplicata.
      if (await existeNoDia(item.planta.id, 'rega', item.status.hoje)) {
        setDuplicada(item)
        return
      }
    } catch (e) {
      setFalha(e instanceof Error ? e.message : String(e))
      return
    } finally {
      setOcupada(null)
    }
    await gravarRega(item)
  }

  async function desfazer() {
    if (!desfazivel) return
    try {
      await apagarEvento(desfazivel.eventoId)
      setDesfazivel(null)
      recarregar()
    } catch (e) {
      setFalha(e instanceof Error ? e.message : String(e))
    }
  }

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

  const por = (situacao: string) => plantas.filter((p) => p.status.situacao_rega === situacao)

  const precisamDeVoce = [...por('atencao'), ...por('atrasada'), ...por('vence-hoje')]
  const proximas = por('em-dia').sort((a, b) =>
    (a.status.proxima_rega ?? '').localeCompare(b.status.proxima_rega ?? ''),
  )
  const semHistorico = por('sem-historico')

  const secoes: [string, PlantaComStatus[]][] = [
    ['Precisam de você', precisamDeVoce],
    ['Próximos dias', proximas],
    ['Sem histórico', semHistorico],
  ]

  return (
    <>
      {falha && <Aviso tom="erro">Não salvei: {falha}</Aviso>}

      {duplicada && (
        <Cartao elevado>
          <p>{duplicada.planta.nickname} já tem uma rega registrada hoje.</p>
          <div className="acoes">
            <Botao onClick={() => gravarRega(duplicada)}>Registrar mesmo assim</Botao>
            <Botao variante="discreto" onClick={() => setDuplicada(null)}>
              Cancelar
            </Botao>
          </div>
        </Cartao>
      )}

      {desfazivel && (
        <Cartao elevado>
          <div className="acoes acoes--espalhadas">
            <span>Rega registrada em {desfazivel.planta}.</span>
            <Botao variante="discreto" onClick={desfazer}>
              Desfazer
            </Botao>
          </div>
        </Cartao>
      )}

      {precisamDeVoce.length === 0 && (
        <EstadoVazio titulo="Nada para hoje" texto="Todas as plantas estão em dia." />
      )}

      {secoes.map(([titulo, itens]) =>
        itens.length === 0 ? null : (
          <section className="lista" key={titulo}>
            <h2 className="lista__titulo">{titulo}</h2>
            {itens.map((item) => (
              <ItemDeHoje
                key={item.planta.id}
                item={item}
                ocupado={ocupada === item.planta.id}
                aoRegar={() => aoRegar(item)}
              />
            ))}
          </section>
        ),
      )}
    </>
  )
}

function ItemDeHoje({
  item,
  ocupado,
  aoRegar,
}: {
  item: PlantaComStatus
  ocupado: boolean
  aoRegar: () => void
}) {
  const { planta, status } = item
  const semHistorico = status.situacao_rega === 'sem-historico'

  return (
    <Cartao className="item">
      <a className="item__nome" href={`#/plantas/${planta.id}`}>
        {planta.nickname}
      </a>
      <Etiqueta
        estado={estadoVisual(status.situacao_rega)}
        detalhe={semHistorico ? 'sem histórico' : detalheDoAtraso(status.dias_de_atraso_rega)}
      />
      <Botao onClick={aoRegar} disabled={ocupado}>
        {ocupado ? 'Salvando…' : 'Reguei'}
      </Botao>
    </Cartao>
  )
}
