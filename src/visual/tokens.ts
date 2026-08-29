/**
 * Paleta do Plantaly — fonte de verdade.
 *
 * Referência: docs/superpowers/specs/2026-08-29-plantaly-design.md, seção 9.
 *
 * Os mesmos valores existem em `tokens.css`, porque o CSS precisa deles em
 * tempo de execução e os testes precisam deles em JavaScript. Duas cópias da
 * mesma verdade é exatamente o que o princípio 3 do projeto proíbe sem teste
 * de paridade — e `tokens.test.ts` é esse teste: ele falha se um arquivo mudar
 * sem o outro.
 */

/**
 * Superfícies.
 *
 * O risco de paleta clara é tudo se fundir. A separação vem de três meios
 * combinados (seção 9): luminosidade escalonada, borda em tom da própria cor
 * — nunca cinza — e o acento colorido carregando o estado.
 */
export const superficies = {
  /** Off-white levemente esverdeado. Nunca branco puro. */
  fundo: '#E9EFE4',
  /** Cartão: branco quente sobre o fundo. */
  cartao: '#F9FBF7',
  /** Cartão elevado: o único branco puro da interface. */
  elevada: '#FFFFFF',
  /** Bordas em verde dessaturado, não cinza. Separação decorativa. */
  borda: '#D3DFCB',
  bordaForte: '#B4C6A9',
  /**
   * Contorno de campo e botão. Mais escura que as outras de propósito: a
   * WCAG exige 3:1 para o limite de um controle, e uma borda bonita e
   * invisível é um campo que ninguém acha.
   */
  bordaControle: '#5F7D57',
} as const

export const texto = {
  /** Verde profundo no lugar do preto: harmoniza com a paleta. */
  principal: '#1B3822',
  /** Secundário: datas, legendas, texto de apoio. */
  suave: '#42624C',
  /** Sobre a cor primária. */
  sobrePrimaria: '#FFFFFF',
} as const

export const primaria = {
  /** Verde-folha médio: ações e navegação ativa. */
  base: '#356B41',
  /** Pressionado e foco. */
  escura: '#27512F',
  /** Fundo de realce discreto. */
  tint: '#DDEAD8',
} as const

/**
 * Estados das plantas.
 *
 * Sem vermelho de alarme, por decisão da seção 11: atraso se comunica sem
 * dramatizar. `forte` é para texto e ícone; `tint` é fundo de etiqueta.
 *
 * `rotulo` e `icone` não são enfeite: a seção 9 exige que estado nunca seja
 * comunicado só por cor. Quem consome estes tokens recebe os três juntos,
 * então usar só a cor exige contrariar a API de propósito.
 */
export const estados = {
  emDia: { forte: '#356B41', tint: '#DDEAD8', rotulo: 'Em dia', icone: '✓' },
  hoje: { forte: '#6E5200', tint: '#FAEFCB', rotulo: 'Vence hoje', icone: '●' },
  atrasada: { forte: '#A8442F', tint: '#FAE4DE', rotulo: 'Atrasada', icone: '!' },
  atencao: { forte: '#5C2A0B', tint: '#EFD8C0', rotulo: 'Atenção', icone: '!!' },
  floracao: { forte: '#6F4394', tint: '#EFE5F6', rotulo: 'Floresceu', icone: '✿' },
} as const

/**
 * Acentos florais decorativos.
 *
 * Usados apenas nos motivos da seção 9, sempre em opacidade baixa e nunca
 * atrás de texto — por isso não precisam passar em contraste de leitura.
 */
export const flores = {
  orquidea: '#C4658F',
  gerbera: '#DCAE38',
  violeta: '#957BC0',
  coral: '#D4826C',
} as const

export const espacos = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
} as const

export const raios = {
  sm: '0.375rem',
  md: '0.75rem',
  lg: '1.25rem',
  completo: '999px',
} as const

export type ChaveEstado = keyof typeof estados
