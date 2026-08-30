import { useState } from 'react'
import { Botao, Cartao } from '../visual/componentes'
import {
  conviteDispensado,
  dispensarConvite,
  ehIOS,
  ehSafari,
  estaInstalado,
  marcarComoInstalado,
} from './instalacao'

/**
 * Convite para adicionar à Tela de Início.
 *
 * O passo em que as pessoas desistem, e por isso ilustrado em vez de
 * descrito em uma linha. No iOS não existe convite automático de instalação
 * como no Android: o caminho é manual e precisa ser ensinado.
 */
export function ConviteInstalacao() {
  const [dispensado, setDispensado] = useState(conviteDispensado)

  if (dispensado || estaInstalado() || !ehIOS()) return null

  function dispensar() {
    dispensarConvite()
    setDispensado(true)
  }

  function jaAdicionei() {
    marcarComoInstalado()
    setDispensado(true)
  }

  if (!ehSafari()) {
    return (
      <Cartao elevado className="convite">
        <h2 className="lista__titulo">Abra no Safari para instalar</h2>
        <p className="formulario__nota">
          No iPhone, só o Safari consegue adicionar um app à Tela de Início. Sem isso o Plantaly
          funciona, mas não consegue enviar lembretes.
        </p>
        <Botao variante="discreto" onClick={dispensar}>
          Agora não
        </Botao>
      </Cartao>
    )
  }

  return (
    <Cartao elevado className="convite">
      <h2 className="lista__titulo">Instale na Tela de Início</h2>
      <p className="formulario__nota">
        É o que permite o Plantaly avisar quando uma planta precisa de água. O iPhone não envia
        notificação para site aberto no navegador — só para app instalado.
      </p>

      <ol className="convite__passos">
        <li>
          Toque em <Compartilhar /> <strong>Compartilhar</strong>, na barra de baixo do Safari.
        </li>
        <li>
          Role e escolha <strong>Adicionar à Tela de Início</strong>.
        </li>
        <li>
          Confirme em <strong>Adicionar</strong>.
        </li>
        <li>Abra o Plantaly pelo ícone novo, não mais pelo Safari.</li>
      </ol>

      <div className="acoes">
        <Botao variante="secundario" onClick={jaAdicionei}>
          Já adicionei
        </Botao>
        <Botao variante="discreto" onClick={dispensar}>
          Agora não
        </Botao>
      </div>
    </Cartao>
  )
}

/** O ícone de compartilhar do iOS, para o passo ser reconhecível de relance. */
function Compartilhar() {
  return (
    <svg
      className="convite__icone"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 15V3" />
      <path d="M8 6.5 12 2.5l4 4" />
      <path d="M6 11H5a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 5 21h14a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 19 11h-1" />
    </svg>
  )
}
