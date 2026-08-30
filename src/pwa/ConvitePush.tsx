import { useEffect, useState } from 'react'
import { Botao, Cartao } from '../visual/componentes'
import { ativarPush, estadoDoPush, type EstadoDoPush } from './push'

const CHAVE = 'plantaly:convite-push-dispensado'

/**
 * Convite para ligar os lembretes.
 *
 * Aparece na aba "Hoje" apenas quando já existe planta cadastrada e o app
 * está instalado — as duas condições da seção 10 para pedir a permissão na
 * hora certa. Dispensar esconde para sempre; a opção continua em Ajustes.
 */
export function ConvitePush() {
  const [estado, setEstado] = useState<EstadoDoPush | null>(null)
  const [dispensado, setDispensado] = useState(() => {
    try {
      return window.localStorage.getItem(CHAVE) === 'sim'
    } catch {
      return false
    }
  })
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    estadoDoPush()
      .then(setEstado)
      .catch(() => setEstado('indisponivel'))
  }, [])

  if (dispensado || estado !== 'desativado') return null

  function dispensar() {
    try {
      window.localStorage.setItem(CHAVE, 'sim')
    } catch {
      // Sem armazenamento o convite volta; a alternativa seria insistir sempre.
    }
    setDispensado(true)
  }

  async function ligar() {
    setOcupado(true)
    try {
      setEstado(await ativarPush())
    } catch {
      setEstado('indisponivel')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <Cartao elevado className="convite">
      <h2 className="lista__titulo">Quer ser lembrado?</h2>
      <p className="formulario__nota">
        Uma notificação por dia, no horário que você escolher, e só quando houver planta precisando.
        Nada vencendo, nada de aviso.
      </p>
      <div className="acoes">
        <Botao onClick={ligar} disabled={ocupado}>
          {ocupado ? 'Aguarde…' : 'Ligar lembretes'}
        </Botao>
        <Botao variante="discreto" onClick={dispensar}>
          Agora não
        </Botao>
      </div>
    </Cartao>
  )
}
