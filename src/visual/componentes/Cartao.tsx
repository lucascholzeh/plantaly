import type { HTMLAttributes, ReactNode } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  elevado?: boolean
  children: ReactNode
}

/** Superfície padrão do app. `elevado` é o único branco puro da interface. */
export function Cartao({ elevado = false, className = '', children, ...resto }: Props) {
  const classes = ['cartao', elevado && 'cartao--elevado', className].filter(Boolean).join(' ')
  return (
    <div className={classes} {...resto}>
      {children}
    </div>
  )
}
