import { useEffect, useState } from 'react'
import { Botao, Cartao } from '../visual/componentes'
import {
  ativarPush,
  CHAVE_CONVITE_DISPENSADO as CHAVE,
  estadoDoPush,
  type EstadoDoPush,
} from './push'

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
      .then((novo) => {
        setEstado(novo)
        // Relido aqui porque `estadoDoPush` espera a reconciliação da
        // abertura, e ela esquece o "Agora não" quando a inscrição morreu e
        // não pôde ser refeita sozinha.
        try {
          setDispensado(window.localStorage.getItem(CHAVE) === 'sim')
        } catch {
          // Sem armazenamento, fica o valor lido na montagem.
        }
      })
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
