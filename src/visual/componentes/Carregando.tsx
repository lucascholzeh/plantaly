/**
 * Estado de carregamento anunciado.
 *
 * `role="status"` (que já implica `aria-live="polite"`) faz o leitor de tela
 * dizer "Carregando…" quando o texto aparece, e depois anunciar o conteúdo
 * que o substitui. Sem isso a tela troca em silêncio: quem não vê a mudança
 * não fica sabendo que ela aconteceu.
 */
export function Carregando({ children = 'Carregando…' }: { children?: string }) {
  return (
    <p className="formulario__nota" role="status">
      {children}
    </p>
  )
}
