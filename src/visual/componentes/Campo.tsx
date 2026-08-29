import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

interface Comum {
  rotulo: string
  ajuda?: string
  erro?: string
}

/**
 * O `id` é gerado aqui e amarrado ao rótulo.
 *
 * Sem essa amarração, tocar no rótulo não foca o campo e o leitor de tela
 * anuncia "campo de texto" sem dizer qual — o defeito de acessibilidade mais
 * comum em formulário, e o mais fácil de evitar.
 */
function useAmarracao({ ajuda, erro }: Comum) {
  const id = useId()
  const idAjuda = ajuda ? `${id}-ajuda` : undefined
  const idErro = erro ? `${id}-erro` : undefined
  return {
    id,
    idAjuda,
    idErro,
    descrito: [idErro, idAjuda].filter(Boolean).join(' ') || undefined,
  }
}

function Moldura({
  id,
  rotulo,
  ajuda,
  erro,
  idAjuda,
  idErro,
  children,
}: Comum & { id: string; idAjuda?: string; idErro?: string; children: ReactNode }) {
  return (
    <div className={`campo${erro ? ' campo--invalido' : ''}`}>
      <label className="campo__rotulo" htmlFor={id}>
        {rotulo}
      </label>
      {children}
      {erro && (
        <span className="campo__erro" id={idErro}>
          {erro}
        </span>
      )}
      {ajuda && (
        <span className="campo__ajuda" id={idAjuda}>
          {ajuda}
        </span>
      )}
    </div>
  )
}

type PropsCampo = Comum & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>

export function Campo({ rotulo, ajuda, erro, ...resto }: PropsCampo) {
  const { id, idAjuda, idErro, descrito } = useAmarracao({ rotulo, ajuda, erro })
  return (
    <Moldura {...{ id, rotulo, ajuda, erro, idAjuda, idErro }}>
      <input
        id={id}
        className="campo__controle"
        aria-invalid={erro ? true : undefined}
        aria-describedby={descrito}
        {...resto}
      />
    </Moldura>
  )
}

type PropsSeletor = Comum & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'>

export function Seletor({ rotulo, ajuda, erro, children, ...resto }: PropsSeletor) {
  const { id, idAjuda, idErro, descrito } = useAmarracao({ rotulo, ajuda, erro })
  return (
    <Moldura {...{ id, rotulo, ajuda, erro, idAjuda, idErro }}>
      <select
        id={id}
        className="campo__controle campo__controle--seletor"
        aria-invalid={erro ? true : undefined}
        aria-describedby={descrito}
        {...resto}
      >
        {children}
      </select>
    </Moldura>
  )
}
