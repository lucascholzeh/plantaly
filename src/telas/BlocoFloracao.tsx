import { useState } from 'react'
import { registrarEvento } from '../dados/eventos'
import type { EventoLinha } from '../dados/tipos'
import { Aviso, Botao, Campo, Cartao, Motivo } from '../visual/componentes'
import { formatarDia } from './textos'

/**
 * Registro de floração.
 *
 * É o momento de comemoração do app — e o único lugar onde a seção 9
 * autoriza o motivo floral a ser expressivo em vez de discreto. Para quem
 * cuida de orquídea, ver "floresceu em julho do ano passado" é a
 * recompensa de ter feito o resto direito.
 *
 * Não é tarefa recorrente: não vence, não atrasa, não notifica.
 */
export function BlocoFloracao({
  plantaId,
  hoje,
  eventos,
  aoMudar,
}: {
  plantaId: string
  hoje: string
  eventos: EventoLinha[]
  aoMudar: () => void
}) {
  const [registrando, setRegistrando] = useState(false)
  const [data, setData] = useState(hoje)
  const [nota, setNota] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const floracoes = eventos.filter((evento) => evento.type === 'floracao')

  async function registrar() {
    setOcupado(true)
    setErro(null)
    try {
      await registrarEvento(plantaId, 'floracao', data, nota)
      setRegistrando(false)
      setNota('')
      setData(hoje)
      aoMudar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
    } finally {
      setOcupado(false)
    }
  }

  return (
    <Cartao className="floracao">
      <h2 className="lista__titulo">Floração</h2>

      {floracoes.length > 0 ? (
        <ul className="floracao__lista">
          {floracoes.map((evento) => (
            <li key={evento.id}>
              <Motivo contexto="floracao" />
              <div>
                <strong>{formatarDia(evento.occurred_at.slice(0, 10))}</strong>
                {evento.note && <p className="formulario__nota">{evento.note}</p>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="formulario__nota">
          Nenhuma floração registrada. Quando ela florir, marque aqui — daqui a um ano você vai
          querer saber quando foi.
        </p>
      )}

      {!registrando ? (
        <Botao variante="secundario" onClick={() => setRegistrando(true)}>
          Registrar floração
        </Botao>
      ) : (
        <div className="formulario__campos">
          <Campo
            rotulo="Quando floresceu"
            type="date"
            value={data}
            max={hoje}
            onChange={(e) => setData(e.target.value)}
          />
          <Campo
            rotulo="Observação"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            ajuda="Opcional. Quantas hastes, que cor, quanto tempo durou."
            maxLength={200}
          />
          <div className="acoes">
            <Botao onClick={registrar} disabled={ocupado || !data}>
              {ocupado ? 'Salvando…' : 'Registrar'}
            </Botao>
            <Botao variante="discreto" onClick={() => setRegistrando(false)}>
              Cancelar
            </Botao>
          </div>
        </div>
      )}

      {erro && <Aviso tom="erro">{erro}</Aviso>}
    </Cartao>
  )
}
