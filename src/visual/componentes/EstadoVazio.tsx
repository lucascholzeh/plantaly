import type { ReactNode } from 'react'
import { Motivo } from './Motivo'

/**
 * Estado vazio.
 *
 * Um dos quatro lugares onde a seção 9 autoriza motivo floral — e o mais
 * importante deles: e a tela que a pessoa ve antes de o app ter qualquer
 * conteudo, entao e onde a decoracao trabalha de verdade.
 */
export function EstadoVazio({
  titulo,
  texto,
  acao,
}: {
  titulo: string
  texto?: string
  acao?: ReactNode
}) {
  return (
    <div className="estado-vazio">
      <Motivo contexto="estado-vazio" />
      <p className="estado-vazio__titulo">{titulo}</p>
      {texto && <p className="estado-vazio__texto">{texto}</p>}
      {acao}
    </div>
  )
}
