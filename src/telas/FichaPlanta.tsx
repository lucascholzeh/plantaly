import { useState } from 'react'
import { BlocoAdubacao } from './BlocoAdubacao'
import { BlocoAprendizado } from './BlocoAprendizado'
import { BlocoFloracao } from './BlocoFloracao'
import { BlocoRecuperacao } from './BlocoRecuperacao'
import { historicoDaPlanta, registrarEvento } from '../dados/eventos'
import { arquivarPlanta, buscarPlanta, excluirPlanta } from '../dados/plantas'
import { useCarregamento } from '../dados/useCarregamento'
import { diferencaEmDias } from '../dominio/datas'
import { irPara } from '../navegacao/rotas'
import { Aviso, Botao, Campo, Cartao, Etiqueta } from '../visual/componentes'
import { estadoVisual } from './estados'
import {
  descreverDistancia,
  detalheDoAtraso,
  formatarDia,
  formatarDiaCompleto,
  NOMES_EVENTO,
} from './textos'

export function FichaPlanta({ id }: { id: string }) {
  const planta = useCarregamento(() => buscarPlanta(id), [id])
  const historico = useCarregamento(() => historicoDaPlanta(id), [id])

  const [dataRetroativa, setDataRetroativa] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [falha, setFalha] = useState<string | null>(null)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [textoExclusao, setTextoExclusao] = useState('')

  if (planta.carregando && !planta.dados) return <p>Carregando…</p>

  if (planta.erro) {
    return (
      <>
        <Aviso tom="erro">{planta.erro}</Aviso>
        <Botao variante="secundario" onClick={planta.recarregar}>
          Tentar de novo
        </Botao>
      </>
    )
  }

  if (!planta.dados) {
    return <Aviso tom="atencao">Planta não encontrada. Talvez tenha sido excluída.</Aviso>
  }

  const { planta: p, status } = planta.dados

  function recarregarTudo() {
    planta.recarregar()
    historico.recarregar()
  }

  async function registrar(dia: string) {
    setSalvando(true)
    setFalha(null)
    try {
      await registrarEvento(id, 'rega', dia)
      setDataRetroativa('')
      recarregarTudo()
    } catch (e) {
      setFalha(e instanceof Error ? e.message : String(e))
    } finally {
      setSalvando(false)
    }
  }

  async function arquivar() {
    try {
      await arquivarPlanta(id)
      irPara('plantas')
    } catch (e) {
      setFalha(e instanceof Error ? e.message : String(e))
    }
  }

  async function excluir() {
    try {
      await excluirPlanta(id)
      irPara('plantas')
    } catch (e) {
      setFalha(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <>
      {falha && <Aviso tom="erro">Não salvei: {falha}</Aviso>}

      <Cartao elevado>
        <h1>{p.nickname}</h1>
        {p.species_label && <p className="planta__especie">{p.species_label}</p>}

        <div className="ficha__estado">
          <Etiqueta
            estado={estadoVisual(status.situacao_rega)}
            detalhe={
              status.situacao_rega === 'sem-historico'
                ? 'sem histórico'
                : detalheDoAtraso(status.dias_de_atraso_rega)
            }
          />
        </div>

        <dl className="ficha__dados">
          <div>
            <dt>Última rega</dt>
            <dd>
              {status.ultima_rega
                ? `${formatarDia(status.ultima_rega)} (${descreverDistancia(
                    diferencaEmDias(status.ultima_rega, status.hoje),
                  )})`
                : 'nunca registrada'}
            </dd>
          </div>
          <div>
            <dt>Próxima rega</dt>
            <dd>{status.proxima_rega ? formatarDiaCompleto(status.proxima_rega) : '—'}</dd>
          </div>
          <div>
            <dt>Intervalo em vigor</dt>
            {/* Mostrar a estação evita que a virada de abril ou outubro
                pareça defeito quando a previsão mudar de uma vez. */}
            <dd>
              {status.intervalo_rega} dias · estação {status.estacao}
            </dd>
          </div>
        </dl>

        <Botao largo onClick={() => registrar(status.hoje)} disabled={salvando}>
          {salvando ? 'Salvando…' : 'Reguei hoje'}
        </Botao>
      </Cartao>

      <BlocoAprendizado planta={p} status={status} aoMudar={recarregarTudo} />

      {status.situacao_rega === 'atencao' && (
        <BlocoRecuperacao diasDeAtraso={status.dias_de_atraso_rega} especieSlug={p.species_slug} />
      )}

      <Cartao>
        <h2 className="lista__titulo">Registrar rega de outro dia</h2>
        <p className="formulario__nota">Para quando você regou e esqueceu de marcar.</p>
        <div className="acoes">
          <Campo
            rotulo="Data"
            type="date"
            value={dataRetroativa}
            max={status.hoje}
            onChange={(e) => setDataRetroativa(e.target.value)}
          />
          <Botao
            variante="secundario"
            disabled={!dataRetroativa || salvando}
            onClick={() => registrar(dataRetroativa)}
          >
            Registrar
          </Botao>
        </div>
      </Cartao>

      <BlocoAdubacao planta={p} status={status} aoMudar={recarregarTudo} />

      <BlocoFloracao
        plantaId={id}
        hoje={status.hoje}
        eventos={historico.dados ?? []}
        aoMudar={recarregarTudo}
      />

      <Cartao>
        <h2 className="lista__titulo">Histórico</h2>
        {historico.dados && historico.dados.length > 0 ? (
          <ol className="historico">
            {historico.dados.map((evento) => (
              <li key={evento.id}>
                <span className="historico__tipo">{NOMES_EVENTO[evento.type] ?? evento.type}</span>
                <span className="historico__data">
                  {formatarDiaCompleto(evento.occurred_at.slice(0, 10))}
                </span>
                {evento.note && <span className="historico__nota">{evento.note}</span>}
              </li>
            ))}
          </ol>
        ) : (
          <p className="formulario__nota">Nada registrado ainda.</p>
        )}
      </Cartao>

      <Cartao>
        <h2 className="lista__titulo">Tirar da lista</h2>
        <p className="formulario__nota">
          <strong>Arquivar</strong> tira da lista e guarda todo o histórico — é o caminho para
          planta que morreu ou foi doada. <strong>Excluir</strong> apaga a planta e o histórico
          junto, e existe só para cadastro errado.
        </p>

        <div className="acoes">
          <Botao variante="secundario" onClick={arquivar}>
            Arquivar
          </Botao>
          <Botao variante="discreto" onClick={() => setConfirmandoExclusao(true)}>
            Excluir
          </Botao>
        </div>

        {confirmandoExclusao && (
          <div className="formulario__campos">
            <Aviso tom="atencao">
              Isso apaga {p.nickname} e todo o histórico dela. Não dá para desfazer.
            </Aviso>
            {/* Confirmação digitada, não um "tem certeza?": exclusão real
                leva o histórico junto, e o histórico é o que o projeto
                promete nunca perder. */}
            <Campo
              rotulo={`Digite ${p.nickname} para confirmar`}
              value={textoExclusao}
              onChange={(e) => setTextoExclusao(e.target.value)}
              autoComplete="off"
            />
            <div className="acoes">
              <Botao disabled={textoExclusao.trim() !== p.nickname} onClick={excluir}>
                Excluir para sempre
              </Botao>
              <Botao variante="discreto" onClick={() => setConfirmandoExclusao(false)}>
                Cancelar
              </Botao>
            </div>
          </div>
        )}
      </Cartao>
    </>
  )
}
