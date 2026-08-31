/**
 * As frases da manhã.
 *
 * Existencialistas, tiradas de livros. Uma por dia, a mesma na notificação e
 * no box da aba "Hoje" — ver `escolherFrase`.
 *
 * O princípio 1 do projeto ("dado concreto ou nenhum dado") vale aqui com a
 * mesma força que no catálogo, e pela mesma razão: citação com autor errado
 * é fácil de produzir e quase impossível de perceber depois. Duas regras,
 * então:
 *
 * 1. **Nenhuma frase entra sem fonte conferida.** `fonte` leva a URL usada
 *    na verificação. Frase que não passou na conferência não vai para o
 *    genérico — simplesmente não entra.
 *
 * 2. **Tradução declarada.** Quase todas estas obras foram escritas em
 *    outra língua, e circulam em várias traduções portuguesas com palavras
 *    diferentes. Quando o texto abaixo é uma tradução entre várias
 *    possíveis, `traducaoVariavel: true` registra isso — é o equivalente ao
 *    `numerosDerivados` do catálogo.
 *
 * Duas frases foram deliberadamente REJEITADAS na montagem desta lista, e
 * ficam registradas aqui para ninguém "corrigir" a ausência mais tarde:
 *
 * - *"A felicidade da tua vida depende da qualidade dos teus pensamentos"*,
 *   atribuída a Marco Aurélio em toda parte. Não há passagem correspondente
 *   nas Meditações, e a mesma frase circula atribuída a Einstein. Apócrifa.
 *
 * - *"Quem tem um porquê enfrenta qualquer como"* é de **Nietzsche**
 *   (Crepúsculo dos Ídolos, 1888), não de Viktor Frankl — Frankl a cita em
 *   "Em Busca de Sentido" e a popularizou. Está na lista, com o autor certo.
 */

export interface Frase {
  /** Identidade estável. Reordenar a lista não pode mudar o significado. */
  nome: string
  texto: string
  autor: string
  obra: string
  /** URL onde a atribuição foi conferida. */
  fonte: string
  /** Texto é uma entre várias traduções portuguesas em circulação. */
  traducaoVariavel?: boolean
}

export const FRASES: Frase[] = [
  {
    nome: 'camus-sisifo-feliz',
    texto: 'É preciso imaginar Sísifo feliz.',
    autor: 'Albert Camus',
    obra: 'O Mito de Sísifo (1942)',
    fonte:
      'https://www.mafarlanguageschool.com/post/il-faut-imaginer-sisyphe-heureux-%C3%A9-preciso-imaginar-s%C3%ADsifo-feliz-albert-camus-le-mythe-de',
    traducaoVariavel: true,
  },
  {
    nome: 'camus-luta-cume',
    texto: 'A própria luta para chegar ao cume basta para encher um coração de homem.',
    autor: 'Albert Camus',
    obra: 'O Mito de Sísifo (1942)',
    fonte:
      'https://audesapere.over-blog.com/pages/Albert_Camus_Le_Mythe_de_Sisyphe_extrait-4623978.html',
    traducaoVariavel: true,
  },
  {
    nome: 'kierkegaard-para-tras',
    texto:
      'A vida só pode ser compreendida olhando-se para trás, mas só pode ser vivida olhando-se para a frente.',
    autor: 'Søren Kierkegaard',
    obra: 'Diários, JJ:167 (1843)',
    fonte:
      'https://www.correiobraziliense.com.br/cbradar/segundo-soren-kierkegaard-filosofo-a-vida-so-pode-ser-compreendida-olhando-se-para-tras-mas-so-pode-ser-vivida-olhando-se-para-frente/',
    traducaoVariavel: true,
  },
  {
    nome: 'nietzsche-porque-como',
    texto: 'Quem tem um porquê para viver suporta quase qualquer como.',
    autor: 'Friedrich Nietzsche',
    obra: 'Crepúsculo dos Ídolos (1888)',
    fonte:
      'https://catracalivre.com.br/noticias/nietzsche-ja-alertava-no-seculo-xix-aquele-que-tem-um-porque-para-viver-suporta-quase-qualquer-como/',
    traducaoVariavel: true,
  },
  {
    nome: 'nietzsche-amor-fati',
    texto:
      'Minha fórmula para a grandeza no homem é amor fati: não querer nada diferente, nem para trás, nem para a frente, nem por toda a eternidade.',
    autor: 'Friedrich Nietzsche',
    obra: 'Ecce Homo (1888)',
    fonte: 'https://razaoinadequada.com/2013/04/03/nietzsche-amor-fati/',
    traducaoVariavel: true,
  },
  {
    nome: 'sartre-faz-de-si',
    texto:
      'O homem, de início, não é nada. Só depois será alguma coisa, e será aquilo que ele fizer de si mesmo.',
    autor: 'Jean-Paul Sartre',
    obra: 'O Existencialismo é um Humanismo (1946)',
    fonte: 'https://marxists.architexturez.net/portugues/sartre/1945/10/29.htm',
    traducaoVariavel: true,
  },
  {
    nome: 'marco-aurelio-trabalho-humano',
    texto:
      'Quando te custar levantar de manhã, tem presente este pensamento: desperto para o trabalho de um ser humano.',
    autor: 'Marco Aurélio',
    obra: 'Meditações, Livro V (séc. II)',
    fonte:
      'https://www.meditacaoestoica.com.br/55-meditacoes-marcus-aurelius-livro-v-parte-1-5-estoicismo',
    traducaoVariavel: true,
  },
  {
    nome: 'rilke-paciencia-coracao',
    texto:
      'Tenha paciência com tudo o que está por resolver em seu coração, e tente amar as próprias perguntas.',
    autor: 'Rainer Maria Rilke',
    obra: 'Cartas a um Jovem Poeta (1929)',
    fonte:
      'https://www.dharmalog.com/2012/06/12/carta-de-rainer-maria-rilke-a-nos-jovens-tenha-paciencia-com-o-nao-resolvido-ame-as-perguntas-e-viva-tudo/',
    traducaoVariavel: true,
  },
  {
    nome: 'clarice-perguntas',
    texto: 'Enquanto eu tiver perguntas e não houver resposta, continuarei a escrever.',
    autor: 'Clarice Lispector',
    obra: 'A Hora da Estrela (1977)',
    fonte: 'https://www.goodreads.com/author/quotes/86098.Clarice_Lispector',
  },
]
