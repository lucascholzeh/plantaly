import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variante = 'primario' | 'secundario' | 'discreto'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  largo?: boolean
  children: ReactNode
}

/**
 * Botão.
 *
 * `type="button"` por padrão de propósito: o padrão do HTML é `submit`, que
 * dentro de um formulário faz qualquer botão enviá-lo sem querer.
 */
export function Botao({
  variante = 'primario',
  largo = false,
  className = '',
  type = 'button',
  children,
  ...resto
}: Props) {
  const classes = ['botao', `botao--${variante}`, largo && 'botao--largo', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...resto}>
      {children}
    </button>
  )
}
