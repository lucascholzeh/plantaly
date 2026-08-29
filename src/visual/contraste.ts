/**
 * Contraste WCAG 2.1, sem dependência externa.
 *
 * Existe para que a acessibilidade da seção 9 seja verificada por teste em
 * vez de confiada ao olho. Cor que não passa quebra a suíte, não a revisão.
 */

function canalLinear(valor: number): number {
  const c = valor / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** Luminância relativa (0 = preto, 1 = branco). */
export function luminancia(hex: string): number {
  const limpo = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(limpo)) {
    throw new Error(`Cor fora do formato #RRGGBB: ${hex}`)
  }
  const inteiro = Number.parseInt(limpo, 16)
  const r = (inteiro >> 16) & 0xff
  const g = (inteiro >> 8) & 0xff
  const b = inteiro & 0xff
  return 0.2126 * canalLinear(r) + 0.7152 * canalLinear(g) + 0.0722 * canalLinear(b)
}

/** Razão de contraste entre duas cores. De 1 (iguais) a 21 (preto e branco). */
export function contraste(a: string, b: string): number {
  const la = luminancia(a)
  const lb = luminancia(b)
  const claro = Math.max(la, lb)
  const escuro = Math.min(la, lb)
  return (claro + 0.05) / (escuro + 0.05)
}

/** Mínimos da WCAG 2.1 nível AA. */
export const AA = {
  /** Texto corrido. */
  texto: 4.5,
  /** Texto grande (>= 18.66px em negrito, ou >= 24px). */
  textoGrande: 3,
  /** Limite de componente de interface e elemento gráfico. */
  componente: 3,
} as const
