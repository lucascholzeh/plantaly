import { useState } from 'react'
import { diasDeEvento } from '../dados/eventos'
import { atualizarPlanta } from '../dados/plantas'
import type { PlantaLinha, StatusLinha } from '../dados/tipos'
import { useCarregamento } from '../dados/useCarregamento'
import { sugerirAjuste } from '../dominio/aprendizado'
import { Aviso, Botao, Cartao } from '../visual/componentes'

/**
 * Sugestão de ajuste de intervalo, a partir do comportamento real.
 *
 * É este mecanismo — e não o fator de ambiente — que resolve de verdade "a
 * minha varanda seca mais rápido que a sala dela": em vez de o app adivinhar
 * o quanto uma varanda específica seca, a própria planta responde.
 *
 * Regras da seção 6, todas cumpridas aqui: **nunca altera sozinho**, só
 * propõe; e recusada, não insiste.
 */
export function BlocoAprendizado({
  planta,
  status,
  aoMudar,
}: {
  planta: PlantaLinha
  status: StatusLinha
  aoMudar: () => void
}) {
  const regas = useCarregamento(() => diasDeEvento(planta.id, 'rega'), [planta.id])
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  if (!regas.dados) return null

  const sugestao = sugerirAjuste(
    {
      intervaloQuente: planta.water_interval_warm,
      intervaloFrio: planta.water_interval_cold,
      toleranciaSeca: planta.drought_tolerance,
    },
    regas.dados,
    status.hoje,
    planta.rejected_interval ?? undefined,
  )

  if (!sugestao) return null

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

  // O ajuste vale para o intervalo em vigor: no verão muda o de verão, no
  // inverno o de inverno. Mexer nos dois com uma observação feita numa
  // estação só seria extrapolar.
  const campo = status.estacao === 'quente' ? 'water_interval_warm' : 'water_interval_cold'

  function aceitar() {
    return executar(() =>
      atualizarPlanta(planta.id, {
        [campo]: sugestao!.intervaloSugerido,
        rejected_interval: null,
      }),
    )
  }

  function recusar() {
    return executar(() =>
      atualizarPlanta(planta.id, { rejected_interval: sugestao!.intervaloSugerido }),
    )
  }

  const observado = sugestao.observados.join(', ')

  return (
    <Cartao elevado className="aprendizado">
      <h2 className="lista__titulo">Ajustar o intervalo?</h2>

      <p>
        Você tem regado esta planta a cada <strong>{sugestao.intervaloSugerido} dias</strong>, mas
        ela está configurada para {sugestao.intervaloAtual}. Quer usar o ritmo que você já pratica
        na estação {status.estacao}?
      </p>

      <p className="formulario__nota">Intervalos observados nas últimas regas: {observado} dias.</p>

      <div className="acoes">
        <Botao onClick={aceitar} disabled={ocupado}>
          {ocupado ? 'Salvando…' : `Usar ${sugestao.intervaloSugerido} dias`}
        </Botao>
        <Botao variante="discreto" onClick={recusar} disabled={ocupado}>
          Manter {sugestao.intervaloAtual}
        </Botao>
      </div>

      <p className="formulario__nota">
        Mantendo, não pergunto de novo — só se o seu ritmo mudar outra vez.
      </p>

      {erro && <Aviso tom="erro">{erro}</Aviso>}
    </Cartao>
  )
}
