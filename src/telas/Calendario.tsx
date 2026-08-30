import { useMemo, useState } from 'react'
import { eventosNoPeriodo, type EventoDoCalendario } from '../dados/calendario'
import { listarPlantas } from '../dados/plantas'
import { useCarregamento } from '../dados/useCarregamento'
import { hoje as hojeDe, somarDias, type DiaLocal } from '../dominio/datas'
import { diaDaSemana, limitesDoMes, mesVizinho, projetar } from '../dominio/previsao'
import { Aviso, Botao, Cartao, Motivo } from '../visual/componentes'
import { formatarDiaCompleto, NOMES_EVENTO } from './textos'

/**
 * Iniciais dos dias da semana, vindas do próprio `Intl`.
 *
 * 2026-02-01 é um domingo: sete dias a partir dele cobrem a semana na ordem
 * que a grade usa. Escrever as letras à mão obrigaria a traduzi-las junto se
 * o app mudar de idioma.
 */
const INICIAIS = new Intl.DateTimeFormat('pt-BR', { weekday: 'narrow' })
const SEMANA = Array.from({ length: 7 }, (_, i) => INICIAIS.format(new Date(2026, 1, 1 + i, 12)))

/** Nome completo do dia, para o rótulo do cabeçalho da coluna. */
const NOME_DIA = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })
const SEMANA_COMPLETA = Array.from({ length: 7 }, (_, i) =>
  NOME_DIA.format(new Date(2026, 1, 1 + i, 12)),
)

const MES = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })

interface Previsto {
  dia: DiaLocal
  planta: string
  plantaId: string
  tipo: 'rega' | 'adubacao'
}

/**
 * Calendário mensal.
 *
 * Para trás mostra o que aconteceu de fato; para frente, o previsto. São
 * coisas diferentes e a interface não as mistura: registro é marca cheia,
 * previsão é marca vazada.
 */
export function Calendario() {
  const [mes, setMes] = useState<DiaLocal>(() => `${hojeDe('America/Sao_Paulo').slice(0, 7)}-01`)
  const [diaAberto, setDiaAberto] = useState<DiaLocal | null>(null)

  const { primeiro, ultimo } = limitesDoMes(mes)
  const eventos = useCarregamento(() => eventosNoPeriodo(primeiro, ultimo), [primeiro, ultimo])
  const plantas = useCarregamento(listarPlantas)

  const hoje = hojeDe('America/Sao_Paulo')

  const previsoes = useMemo<Previsto[]>(() => {
    const lista: Previsto[] = []
    for (const { planta, status } of plantas.dados ?? []) {
      // Projeta só a partir de amanhã: o passado do calendário é o que foi
      // registrado, não o que estava previsto e talvez não tenha ocorrido.
      const inicio = somarDias(hoje, 1)
      const de = inicio > primeiro ? inicio : primeiro

      for (const dia of projetar(status.proxima_rega, status.intervalo_rega, de, ultimo)) {
        lista.push({ dia, planta: planta.nickname, plantaId: planta.id, tipo: 'rega' })
      }
      if (status.intervalo_adubacao) {
        for (const dia of projetar(
          status.proxima_adubacao,
          status.intervalo_adubacao,
          de,
          ultimo,
        )) {
          lista.push({ dia, planta: planta.nickname, plantaId: planta.id, tipo: 'adubacao' })
        }
      }
    }
    return lista
  }, [plantas.dados, primeiro, ultimo, hoje])

  const porDia = useMemo(() => {
    const mapa = new Map<DiaLocal, { eventos: EventoDoCalendario[]; previstos: Previsto[] }>()
    const entrada = (dia: DiaLocal) => {
      if (!mapa.has(dia)) mapa.set(dia, { eventos: [], previstos: [] })
      return mapa.get(dia)!
    }
    for (const evento of eventos.dados ?? []) entrada(evento.dia).eventos.push(evento)
    for (const previsto of previsoes) entrada(previsto.dia).previstos.push(previsto)
    return mapa
  }, [eventos.dados, previsoes])

  const erro = eventos.erro ?? plantas.erro
  if (erro) {
    return (
      <>
        <Aviso tom="erro">{erro}</Aviso>
        <Botao variante="secundario" onClick={eventos.recarregar}>
          Tentar de novo
        </Botao>
      </>
    )
  }

  const dias: DiaLocal[] = []
  for (let d = primeiro; d <= ultimo; d = somarDias(d, 1)) dias.push(d)
  const vaziosAntes = diaDaSemana(primeiro)

  const detalhe = diaAberto ? porDia.get(diaAberto) : undefined

  return (
    <>
      <Cartao className="mes">
        <Motivo contexto="cabecalho" />
        <div className="mes__topo">
          <Botao
            variante="discreto"
            className="mes__seta"
            onClick={() => setMes(mesVizinho(mes, -1))}
            aria-label="Mês anterior"
          >
            <span aria-hidden="true">‹</span>
          </Botao>
          <h2 className="mes__nome">{MES.format(new Date(`${mes}T12:00:00`))}</h2>
          <Botao
            variante="discreto"
            className="mes__seta"
            onClick={() => setMes(mesVizinho(mes, 1))}
            aria-label="Próximo mês"
          >
            <span aria-hidden="true">›</span>
          </Botao>
        </div>

        {/* Sem `role="grid"`: era uma grade quebrada — 44 filhos diretos e
            nenhum `row`/`gridcell`, o que confunde o leitor de tela mais que a
            ausência do papel. Cada dia é um botão com nome acessível completo
            ("sábado, 1 de agosto, sem nada"), que é o que importa aqui. */}
        <div className="mes__grade" role="group" aria-label="Dias do mês">
          {SEMANA.map((letra, i) => (
            <abbr className="mes__cabecalho" key={i} title={SEMANA_COMPLETA[i]}>
              {letra}
            </abbr>
          ))}

          {Array.from({ length: vaziosAntes }, (_, i) => (
            <span key={`vazio-${i}`} />
          ))}

          {dias.map((dia) => {
            const conteudo = porDia.get(dia)
            const numero = Number(dia.slice(8))
            return (
              <button
                type="button"
                key={dia}
                className={[
                  'mes__dia',
                  dia === hoje && 'mes__dia--hoje',
                  dia === diaAberto && 'mes__dia--aberto',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setDiaAberto(dia === diaAberto ? null : dia)}
                aria-label={`${formatarDiaCompleto(dia)}${
                  conteudo
                    ? `, ${conteudo.eventos.length} registros e ${conteudo.previstos.length} previstos`
                    : ', sem nada'
                }`}
              >
                <span className="mes__numero">{numero}</span>
                <span className="mes__marcas" aria-hidden="true">
                  {conteudo?.eventos.slice(0, 3).map((evento) => (
                    <i key={evento.id} className={`marca marca--${evento.tipo}`} />
                  ))}
                  {conteudo?.previstos.slice(0, 3).map((previsto, i) => (
                    <i key={i} className={`marca marca--prevista marca--${previsto.tipo}`} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>

        <p className="mes__legenda">Marca cheia é o que aconteceu. Marca vazada é o previsto.</p>
      </Cartao>

      {diaAberto && (
        <Cartao elevado>
          <h2 className="lista__titulo">{formatarDiaCompleto(diaAberto)}</h2>

          {!detalhe || (detalhe.eventos.length === 0 && detalhe.previstos.length === 0) ? (
            <p className="formulario__nota">Nada neste dia.</p>
          ) : (
            <>
              {detalhe.eventos.length > 0 && (
                <ul className="marcadores">
                  {detalhe.eventos.map((evento) => (
                    <li key={evento.id}>
                      <a href={`#/plantas/${evento.plantaId}`}>{evento.planta}</a> —{' '}
                      {NOMES_EVENTO[evento.tipo] ?? evento.tipo}
                      {evento.nota && `: ${evento.nota}`}
                    </li>
                  ))}
                </ul>
              )}

              {detalhe.previstos.length > 0 && (
                <>
                  <h3 className="lista__titulo">Previsto</h3>
                  <ul className="marcadores">
                    {detalhe.previstos.map((previsto, i) => (
                      <li key={i}>
                        <a href={`#/plantas/${previsto.plantaId}`}>{previsto.planta}</a> —{' '}
                        {previsto.tipo === 'rega' ? 'rega' : 'adubação'}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </Cartao>
      )}
    </>
  )
}
