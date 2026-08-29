import { motion } from 'framer-motion'
import { ABAS, TITULOS, type Aba } from './abas'

/** Ícones de traço, no mesmo peso dos motivos florais. */
const ICONES: Record<Aba, React.JSX.Element> = {
  hoje: (
    <>
      <path d="M12 3c3.5 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2.5-6 6-10Z" />
      <path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" />
    </>
  ),
  plantas: (
    <>
      <path d="M6 10h12l-1.2 9.2a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 10Z" />
      <path d="M12 10c0-3 1.6-5.4 4.4-6-.2 3.3-1.8 5.4-4.4 6Z" />
      <path d="M12 10C11.4 7.6 9.6 6.1 7.2 5.8 7.6 8.3 9.4 9.9 12 10Z" />
    </>
  ),
  calendario: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
      <path d="M8 14h1.5M15 14h1.5M8 17.5h1.5M15 17.5h1.5" />
    </>
  ),
  // Pétalas como círculos, não como curvas: a 22px as curvas viravam um
  // borrão e o ícone lia como uma cruz.
  especies: (
    <>
      <circle cx="12" cy="6.4" r="2.2" />
      <circle cx="16.4" cy="9.6" r="2.2" />
      <circle cx="14.7" cy="14.8" r="2.2" />
      <circle cx="9.3" cy="14.8" r="2.2" />
      <circle cx="7.6" cy="9.6" r="2.2" />
      <path d="M12 17.4V21" />
    </>
  ),
}

/**
 * Barra de navegação inferior.
 *
 * Os itens são links, não botões: trocar de aba é navegação, e link dá de
 * graça o Cmd+clique, o clique do meio e o "copiar endereço" que um botão
 * com `onClick` joga fora.
 *
 * `aoTrocar` existe só para a galeria do sistema visual, que precisa mudar
 * de aba sem sair da própria página. No app, ninguém passa — o hash manda.
 */
export function BarraNavegacao({ atual, aoTrocar }: { atual: Aba; aoTrocar?: (aba: Aba) => void }) {
  return (
    <nav className="barra" aria-label="Seções do app">
      {ABAS.map((aba) => {
        const ativa = aba === atual
        return (
          <a
            key={aba}
            href={`#/${aba}`}
            className="barra__item"
            aria-current={ativa ? 'page' : undefined}
            onClick={
              aoTrocar &&
              ((evento) => {
                evento.preventDefault()
                aoTrocar(aba)
              })
            }
          >
            {ativa && (
              <motion.span
                layoutId="marca-aba"
                className="barra__marca"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <svg
              className="barra__icone"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              {ICONES[aba]}
            </svg>
            {TITULOS[aba]}
          </a>
        )
      })}
    </nav>
  )
}
