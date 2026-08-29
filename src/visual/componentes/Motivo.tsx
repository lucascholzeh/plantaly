/**
 * Motivos florais decorativos.
 *
 * A seção 9 do design separa "decorado" de "bagunçado" com regras rígidas, e
 * elas estão codificadas aqui em vez de confiadas à disciplina de quem usa:
 *
 * - `contexto` é uma união fechada com os QUATRO lugares permitidos. Não há
 *   valor para "aba Hoje" nem para "ficha em atenção" — usar errado não
 *   compila.
 * - A opacidade vem do contexto, nunca de quem chama. Só `floracao`, o
 *   momento de comemoração do app, respira mais.
 * - `aria-hidden`: é decoração, e leitor de tela não deve anunciar.
 */

type Contexto = 'estado-vazio' | 'cabecalho' | 'cartao-especie' | 'floracao'
type Desenho = 'flor' | 'folha' | 'ramo'

const PADRAO: Record<Contexto, Desenho> = {
  'estado-vazio': 'ramo',
  cabecalho: 'folha',
  'cartao-especie': 'flor',
  floracao: 'flor',
}

const CORES: Record<Contexto, string> = {
  'estado-vazio': 'var(--flor-violeta)',
  cabecalho: 'var(--primaria-base)',
  'cartao-especie': 'var(--flor-orquidea)',
  floracao: 'var(--flor-orquidea)',
}

function Flor() {
  // Cinco pétalas iguais giradas em torno do centro.
  return (
    <>
      {[0, 72, 144, 216, 288].map((grau) => (
        <path key={grau} d="M24 23 C 17 11, 31 11, 24 23 Z" transform={`rotate(${grau} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="3.5" />
    </>
  )
}

function Folha() {
  return (
    <>
      <path d="M11 37 C 11 21, 22 11, 37 11 C 37 27, 26 37, 11 37 Z" />
      <path d="M13 36 C 22 28, 29 21, 36 12" />
    </>
  )
}

function Ramo() {
  return (
    <>
      <path d="M24 42 C 24 30, 24 20, 24 8" />
      <path d="M24 30 C 17 29, 13 25, 12 19 C 19 19, 23 23, 24 30 Z" />
      <path d="M24 24 C 31 23, 35 19, 36 13 C 29 13, 25 17, 24 24 Z" />
      <path d="M24 17 C 18 16, 15 13, 14 8 C 20 8, 23 11, 24 17 Z" />
    </>
  )
}

const DESENHOS: Record<Desenho, () => React.JSX.Element> = {
  flor: Flor,
  folha: Folha,
  ramo: Ramo,
}

export function Motivo({ contexto, desenho }: { contexto: Contexto; desenho?: Desenho }) {
  const Escolhido = DESENHOS[desenho ?? PADRAO[contexto]]
  return (
    <svg
      className={`motivo motivo--${contexto}`}
      style={{ color: CORES[contexto] }}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <Escolhido />
    </svg>
  )
}
