import { useState } from 'react'
import { buscarEspecie, formatarFaixa } from '../catalogo'
import { registrarEvento } from '../dados/eventos'
import { atualizarPlanta } from '../dados/plantas'
import type { PlantaLinha, StatusLinha } from '../dados/tipos'
import { Aviso, Botao, Campo, Cartao } from '../visual/componentes'
import { estadoVisual } from './estados'
import { formatarDia } from './textos'
import { Etiqueta } from '../visual/componentes'

/**
 * Adubação — opcional por planta, desligada por padrão.
 *
 * Com a adubação desligada este bloco não mostra estado nenhum: o app
 * funciona como se o recurso não existisse, que é a exigência da seção 3.
 * Ligar e desligar preserva o histórico dos dois lados.
 */
export function BlocoAdubacao({
  planta,
  status,
  aoMudar,
}: {
  planta: PlantaLinha
  status: StatusLinha
  aoMudar: () => void
}) {
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [ligando, setLigando] = useState(false)
  const [ultimaAdubacao, setUltimaAdubacao] = useState('')

  const ligada = planta.fertilize_interval_warm !== null
  const especie = planta.species_slug ? buscarEspecie(planta.species_slug) : null

  async function executar(acao: () => Promise<unknown>) {
    setOcupado(true)
    setErro(null)
    try {
      await acao()
      aoMudar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
    } finally {
      setOcupado(false)
    }
  }

  async function ligar(comHistorico: boolean) {
    // Valores de partida: o catálogo quando conhece a espécie, senão um
    // ritmo quinzenal no calor e mensal no frio.
    const quente = especie?.adubacaoQuente
      ? Math.round((especie.adubacaoQuente[0] + especie.adubacaoQuente[1]) / 2)
      : 15
    const frio = especie?.adubacaoFria
      ? Math.round((especie.adubacaoFria[0] + especie.adubacaoFria[1]) / 2)
      : 30

    await executar(async () => {
      await atualizarPlanta(planta.id, {
        fertilize_interval_warm: quente,
        fertilize_interval_cold: frio,
      })
      if (comHistorico && ultimaAdubacao) {
        await registrarEvento(planta.id, 'adubacao', ultimaAdubacao)
      }
      setLigando(false)
      setUltimaAdubacao('')
    })
  }

  function desligar() {
    // Nulos nos dois campos = desligada. O histórico de adubação continua
    // no banco; ele só para de ser projetado.
    return executar(() =>
      atualizarPlanta(planta.id, {
        fertilize_interval_warm: null,
        fertilize_interval_cold: null,
      }),
    )
  }

  if (!ligada) {
    return (
      <Cartao>
        <h2 className="lista__titulo">Adubação</h2>

        {especie?.adubacaoQuente ? (
          <p className="formulario__nota">
            {especie.nomePopular} costuma ser adubada a cada {formatarFaixa(especie.adubacaoQuente)}{' '}
            na estação quente.
            {especie.notaAdubacao ? ` ${especie.notaAdubacao}` : ''}
          </p>
        ) : (
          <p className="formulario__nota">
            Acompanhar adubação é opcional. Nada da rega depende disso.
          </p>
        )}

        {!ligando ? (
          <Botao variante="secundario" onClick={() => setLigando(true)} disabled={ocupado}>
            Acompanhar adubação
          </Botao>
        ) : (
          <div className="formulario__campos">
            <Campo
              rotulo="Quando foi a última adubação?"
              type="date"
              value={ultimaAdubacao}
              max={status.hoje}
              onChange={(e) => setUltimaAdubacao(e.target.value)}
              ajuda="Deixe em branco se nunca adubou."
            />
            <div className="acoes">
              <Botao onClick={() => ligar(ultimaAdubacao !== '')} disabled={ocupado}>
                {ocupado ? 'Salvando…' : 'Ligar'}
              </Botao>
              <Botao variante="discreto" onClick={() => setLigando(false)}>
                Cancelar
              </Botao>
            </div>
          </div>
        )}

        {erro && <Aviso tom="erro">{erro}</Aviso>}
      </Cartao>
    )
  }

  return (
    <Cartao>
      <h2 className="lista__titulo">Adubação</h2>

      {status.situacao_adubacao && (
        <div className="ficha__estado">
          <Etiqueta
            estado={estadoVisual(status.situacao_adubacao)}
            detalhe={
              status.situacao_adubacao === 'sem-historico'
                ? 'nunca adubada'
                : status.dias_de_atraso_adubacao > 0
                  ? `há ${status.dias_de_atraso_adubacao} dias`
                  : undefined
            }
          />
        </div>
      )}

      <dl className="ficha__dados">
        <div>
          <dt>Última adubação</dt>
          <dd>
            {status.ultima_adubacao ? formatarDia(status.ultima_adubacao) : 'nunca registrada'}
          </dd>
        </div>
        <div>
          <dt>Próxima adubação</dt>
          <dd>{status.proxima_adubacao ? formatarDia(status.proxima_adubacao) : '—'}</dd>
        </div>
        <div>
          <dt>Intervalo em vigor</dt>
          <dd>{status.intervalo_adubacao} dias</dd>
        </div>
      </dl>

      {/* A regra cruzada da seção 6: nunca adubar planta com sede. */}
      {(status.situacao_rega === 'atrasada' || status.situacao_rega === 'atencao') && (
        <Aviso tom="atencao">
          Adubação suspensa enquanto a rega está atrasada. Adubo em raiz seca queima a raiz — regue
          primeiro e adube no ciclo seguinte.
        </Aviso>
      )}

      <div className="acoes">
        <Botao
          onClick={() => executar(() => registrarEvento(planta.id, 'adubacao', status.hoje))}
          disabled={
            ocupado || status.situacao_rega === 'atrasada' || status.situacao_rega === 'atencao'
          }
        >
          {ocupado ? 'Salvando…' : 'Adubei hoje'}
        </Botao>
        <Botao variante="discreto" onClick={desligar} disabled={ocupado}>
          Parar de acompanhar
        </Botao>
      </div>

      <p className="formulario__nota">
        Desligar preserva todo o histórico de adubação — ele só para de ser previsto.
      </p>

      {erro && <Aviso tom="erro">{erro}</Aviso>}
    </Cartao>
  )
}
