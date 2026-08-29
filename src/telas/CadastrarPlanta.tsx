import { useState, type FormEvent } from 'react'
import { criarPlanta } from '../dados/plantas'
import { ROTULOS_AMBIENTE } from '../dominio/ambiente'
import { hoje as hojeDe } from '../dominio/datas'
import type { Ambiente, ToleranciaSeca } from '../dominio/tipos'
import { irPara, voltar } from '../navegacao/rotas'
import { Aviso, Botao, Campo, Cartao, Seletor } from '../visual/componentes'

const TOLERANCIAS: Record<ToleranciaSeca, string> = {
  baixa: 'Baixa — sofre rápido se atrasar (samambaia, lírio-da-paz)',
  media: 'Média — o caso mais comum',
  alta: 'Alta — aguanta bem (suculenta, cacto, zamioculca)',
}

/**
 * Cadastro de planta.
 *
 * A espécie é texto livre por enquanto: o catálogo, que vai preencher
 * intervalos e tolerância sozinho, é a Etapa 4. Até lá os números aparecem
 * com valores de partida e um aviso de que são chute do usuário — melhor
 * dizer isso do que fingir precisão.
 */
export function CadastrarPlanta() {
  const [apelido, setApelido] = useState('')
  const [especie, setEspecie] = useState('')
  const [ambiente, setAmbiente] = useState<Ambiente>('janela_clara')
  const [intervaloQuente, setIntervaloQuente] = useState(8)
  const [intervaloFrio, setIntervaloFrio] = useState(15)
  const [tolerancia, setTolerancia] = useState<ToleranciaSeca>('media')
  const [sabeUltimaRega, setSabeUltimaRega] = useState(false)
  const [ultimaRega, setUltimaRega] = useState(hojeDe('America/Sao_Paulo'))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setSalvando(true)
    setErro(null)

    try {
      const id = await criarPlanta({
        apelido,
        especie,
        ambiente,
        intervaloQuente,
        intervaloFrio,
        toleranciaSeca: tolerancia,
        ultimaRega: sabeUltimaRega ? ultimaRega : null,
      })
      irPara(`plantas/${id}`)
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
      setSalvando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={aoEnviar}>
      <Cartao elevado>
        <div className="formulario__campos">
          <Campo
            rotulo="Apelido"
            value={apelido}
            onChange={(e) => setApelido(e.target.value)}
            required
            maxLength={60}
            ajuda="Como você chama essa planta em casa."
          />

          <Campo
            rotulo="Espécie"
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
            ajuda="Se não souber, deixe em branco. O catálogo chega numa próxima etapa."
          />

          <Seletor
            rotulo="Ambiente"
            value={ambiente}
            onChange={(e) => setAmbiente(e.target.value as Ambiente)}
            ajuda="Ajusta o intervalo sugerido. Luz e ar mudam muito a velocidade de secagem."
          >
            {Object.entries(ROTULOS_AMBIENTE).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Seletor>
        </div>
      </Cartao>

      <Cartao elevado>
        <div className="formulario__campos">
          <p className="formulario__nota">
            Quase tudo rega menos no inverno — por isso são dois números. Ainda dá para mudar
            depois, e o app vai sugerir ajustes conforme perceber o seu ritmo.
          </p>

          <Campo
            rotulo="Dias entre regas — outubro a março"
            type="number"
            min={1}
            max={365}
            value={intervaloQuente}
            onChange={(e) => setIntervaloQuente(Number(e.target.value))}
            required
          />

          <Campo
            rotulo="Dias entre regas — abril a setembro"
            type="number"
            min={1}
            max={365}
            value={intervaloFrio}
            onChange={(e) => setIntervaloFrio(Number(e.target.value))}
            required
          />

          <Seletor
            rotulo="Tolerância à seca"
            value={tolerancia}
            onChange={(e) => setTolerancia(e.target.value as ToleranciaSeca)}
            ajuda="Decide a partir de quando um atraso vira motivo de atenção."
          >
            {Object.entries(TOLERANCIAS).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Seletor>
        </div>
      </Cartao>

      <Cartao elevado>
        <div className="formulario__campos">
          <label className="marcador">
            <input
              type="checkbox"
              checked={sabeUltimaRega}
              onChange={(e) => setSabeUltimaRega(e.target.checked)}
            />
            Sei quando foi a última rega
          </label>

          {sabeUltimaRega ? (
            <Campo
              rotulo="Última rega"
              type="date"
              value={ultimaRega}
              max={hojeDe('America/Sao_Paulo')}
              onChange={(e) => setUltimaRega(e.target.value)}
            />
          ) : (
            <p className="formulario__nota">
              Sem essa data a planta entra como “sem histórico” e não aparece atrasada. O app não
              inventa um atraso que você não tem como confirmar.
            </p>
          )}
        </div>
      </Cartao>

      {erro && <Aviso tom="erro">{erro}</Aviso>}

      <div className="acoes">
        <Botao type="submit" disabled={salvando || apelido.trim() === ''}>
          {salvando ? 'Salvando…' : 'Cadastrar'}
        </Botao>
        <Botao variante="discreto" onClick={voltar}>
          Cancelar
        </Botao>
      </div>
    </form>
  )
}
