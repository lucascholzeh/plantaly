import { useState } from 'react'
import { apagarEvento, existeNoDia, registrarEvento } from '../dados/eventos'
import { listarPlantas } from '../dados/plantas'
import type { PlantaComStatus } from '../dados/tipos'
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
import { ConvitePush } from '../pwa/ConvitePush'
import { estadoVisual } from './estados'
import { detalheDoAtraso, proximaRegaEmLinha } from './textos'

interface Desfazivel {
  eventoId: string
  planta: string
  tipo: 'Rega' | 'Adubação'
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
  const fotos = useFotosAssinadas(dados)
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
      setDesfazivel({ eventoId, planta: item.planta.nickname, tipo: 'Rega' })
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

  async function aoAdubar(item: PlantaComStatus) {
    setFalha(null)
    setOcupada(item.planta.id)
    try {
      const eventoId = await registrarEvento(item.planta.id, 'adubacao', item.status.hoje)
      setDesfazivel({ eventoId, planta: item.planta.nickname, tipo: 'Adubação' })
      recarregar()
    } catch (e) {
      setFalha(e instanceof Error ? e.message : String(e))
    } finally {
      setOcupada(null)
    }
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

  const por = (situacao: string) => plantas.filter((p) => p.status.situacao_rega === situacao)

  const precisamDeVoce = [...por('atencao'), ...por('atrasada'), ...por('vence-hoje')]

  // Adubação entra numa seção própria e só quando a rega está em dia: a
  // regra cruzada da seção 6 proíbe sugerir adubo para planta com sede.
  const adubacaoPendente = plantas.filter(
    (p) =>
      (p.status.situacao_adubacao === 'atrasada' || p.status.situacao_adubacao === 'vence-hoje') &&
      p.status.situacao_rega !== 'atrasada' &&
      p.status.situacao_rega !== 'atencao',
  )
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
      {/* Só aparece depois de haver planta cadastrada: pedir permissão numa
          tela vazia é o caminho mais curto para um "Não permitir" que o iOS
          não deixa reverter com facilidade. */}
      <ConvitePush />

      {falha && <Aviso tom="erro">Não salvei: {falha}</Aviso>}

      {duplicada && (
        <Cartao elevado role="alert">
          <p>{duplicada.planta.nickname} já tem uma rega registrada hoje.</p>
          <div className="acoes">
            <Botao onClick={() => gravarRega(duplicada)}>Registrar mesmo assim</Botao>
            <Botao variante="discreto" onClick={() => setDuplicada(null)}>
              Cancelar
            </Botao>
          </div>
        </Cartao>
      )}

      {/* `role="status"` porque este cartão é a única pista de que a rega foi
          gravada — e de que dá para voltar atrás. Sem ele, quem usa leitor de
          tela tocava em "Reguei" e não ouvia absolutamente nada. */}
      {desfazivel && (
        <Cartao elevado role="status">
          <div className="acoes acoes--espalhadas">
            <span>
              {desfazivel.tipo} registrada em {desfazivel.planta}.
            </span>
            <Botao variante="discreto" onClick={desfazer}>
              Desfazer
            </Botao>
          </div>
        </Cartao>
      )}

      {precisamDeVoce.length === 0 && (
        <EstadoVazio titulo="Nada para hoje" texto="Todas as plantas estão em dia." />
      )}

      {adubacaoPendente.length > 0 && (
        <section className="lista">
          <h2 className="lista__titulo">Adubar</h2>
          {adubacaoPendente.map((item) => (
            <ItemDeAdubacao
              key={item.planta.id}
              item={item}
              urlFoto={urlDe(item, fotos)}
              ocupado={ocupada === item.planta.id}
              aoAdubar={() => aoAdubar(item)}
            />
          ))}
        </section>
      )}

      {secoes.map(([titulo, itens]) =>
        itens.length === 0 ? null : (
          <section className="lista" key={titulo}>
            <h2 className="lista__titulo">{titulo}</h2>
            {itens.map((item) => (
              <ItemDeHoje
                key={item.planta.id}
                item={item}
                urlFoto={urlDe(item, fotos)}
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

/** URL já assinada da foto do item, quando existir. */
function urlDe(item: PlantaComStatus, fotos: Map<string, string>): string | null {
  const caminho = item.planta.photo_path
  return caminho ? (fotos.get(caminho) ?? null) : null
}

/**
 * Linha da seção de adubação.
 *
 * Componente separado do de rega de propósito: reaproveitar o item com o
 * botão "Reguei" faria o toque registrar o evento errado.
 */
function ItemDeAdubacao({
  item,
  urlFoto,
  ocupado,
  aoAdubar,
}: {
  item: PlantaComStatus
  urlFoto: string | null
  ocupado: boolean
  aoAdubar: () => void
}) {
  const { planta, status } = item
  return (
    <Cartao className="item">
      <FotoDaPlanta caminho={planta.photo_path} apelido={planta.nickname} url={urlFoto} />
      <a className="item__nome" href={`#/plantas/${planta.id}`}>
        {planta.nickname}
      </a>
      <Etiqueta
        estado={status.situacao_adubacao === 'atrasada' ? 'atrasada' : 'hoje'}
        detalhe={
          status.dias_de_atraso_adubacao > 0
            ? `adubo há ${status.dias_de_atraso_adubacao} dias`
            : 'adubo hoje'
        }
      />
      <Botao variante="secundario" onClick={aoAdubar} disabled={ocupado}>
        {ocupado ? 'Salvando…' : 'Adubei'}
      </Botao>
    </Cartao>
  )
}

function ItemDeHoje({
  item,
  urlFoto,
  ocupado,
  aoRegar,
}: {
  item: PlantaComStatus
  urlFoto: string | null
  ocupado: boolean
  aoRegar: () => void
}) {
  const { planta, status } = item
  const semHistorico = status.situacao_rega === 'sem-historico'

  return (
    <Cartao className="item">
      <FotoDaPlanta caminho={planta.photo_path} apelido={planta.nickname} url={urlFoto} />
      <a className="item__nome" href={`#/plantas/${planta.id}`}>
        {planta.nickname}
      </a>
      <Etiqueta
        estado={estadoVisual(status.situacao_rega)}
        detalhe={semHistorico ? 'sem histórico' : detalheDoAtraso(status.dias_de_atraso_rega)}
      />
      {/* Nesta tela a próxima rega só faz sentido para quem não está
          atrasado: quem está tem o botão "Reguei" logo ao lado, e "Regar
          hoje" ao lado dele seria ruído. */}
      {status.situacao_rega === 'em-dia' && status.proxima_rega && (
        <p className="item__proxima">
          {proximaRegaEmLinha(
            status.proxima_rega,
            diferencaEmDias(status.hoje, status.proxima_rega),
          )}
        </p>
      )}
      <Botao onClick={aoRegar} disabled={ocupado}>
        {ocupado ? 'Salvando…' : 'Reguei'}
      </Botao>
    </Cartao>
  )
}
