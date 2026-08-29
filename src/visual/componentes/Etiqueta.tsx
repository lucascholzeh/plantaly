import { estados, type ChaveEstado } from '../tokens'

/**
 * Etiqueta de estado da planta.
 *
 * Cor, ícone e rótulo saem juntos do mesmo token — a exigência da seção 9 de
 * que estado nunca seja comunicado só por cor não depende de quem usa
 * lembrar dela. O ícone é `aria-hidden` porque o rótulo ao lado já diz tudo;
 * anunciar "exclamação Atrasada" seria ruído.
 */
export function Etiqueta({ estado, detalhe }: { estado: ChaveEstado; detalhe?: string }) {
  const { forte, tint, rotulo, icone } = estados[estado]
  return (
    <span className="etiqueta" style={{ color: forte, background: tint }}>
      <span className="etiqueta__icone" aria-hidden="true">
        {icone}
      </span>
      {detalhe ? `${rotulo} · ${detalhe}` : rotulo}
    </span>
  )
}
