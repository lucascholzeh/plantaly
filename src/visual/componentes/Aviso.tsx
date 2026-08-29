import type { ReactNode } from 'react'
import { estados } from '../tokens'

type Tom = 'informacao' | 'atencao' | 'erro'

const TONS = {
  informacao: { forte: 'var(--primaria-base)', tint: 'var(--primaria-tint)', papel: 'status' },
  atencao: { forte: estados.atencao.forte, tint: estados.atencao.tint, papel: 'status' },
  erro: { forte: estados.atrasada.forte, tint: estados.atrasada.tint, papel: 'alert' },
} as const

/**
 * Aviso.
 *
 * `role="alert"` só no tom de erro: leitor de tela interrompe o que estiver
 * lendo para anunciá-lo. Usar isso em mensagem informativa é grosseria com
 * quem depende do leitor.
 */
export function Aviso({ tom = 'informacao', children }: { tom?: Tom; children: ReactNode }) {
  const { forte, tint, papel } = TONS[tom]
  return (
    <div className="aviso" role={papel} style={{ background: tint, borderLeftColor: forte }}>
      <span>{children}</span>
    </div>
  )
}
