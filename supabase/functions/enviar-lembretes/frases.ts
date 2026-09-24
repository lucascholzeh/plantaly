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
 * **Onda 2 (2026-09-24).** As 9 frases da primeira lista foram aposentadas a
 * pedido do Lucas — "já foram" — e substituídas por 50 novas. Não as
 * reintroduza: `frases.test.ts` guarda os nomes. Todas as 50 foram
 * conferidas no Wikiquote, que separa as citações com obra e passagem das
 * seções "Disputed" e "Misattributed": só entrou frase da parte com fonte, e
 * `obra` repete a referência que a página dá. As de Pessoa, Guimarães Rosa e
 * Saramago estão no original.
 *
 * Três frases foram deliberadamente REJEITADAS, e ficam registradas aqui para
 * ninguém "corrigir" a ausência mais tarde:
 *
 * - *"A felicidade da tua vida depende da qualidade dos teus pensamentos"*,
 *   atribuída a Marco Aurélio em toda parte. Não há passagem correspondente
 *   nas Meditações, e a mesma frase circula atribuída a Einstein. Apócrifa.
 *
 * - *"Quem tem um porquê enfrenta qualquer como"* é de **Nietzsche**
 *   (Crepúsculo dos Ídolos, 1888), não de Viktor Frankl — Frankl a cita em
 *   "Em Busca de Sentido" e a popularizou.
 *
 * - *"A única maneira de lidar com um mundo sem liberdade é tornar-se tão
 *   livre que a própria existência seja um ato de revolta"*, atribuída a
 *   Camus. O Wikiquote a lista em "Disputed": circula sempre sem obra.
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

const WQ = 'https://en.wikiquote.org/wiki/'

export const FRASES: Frase[] = [
  // ----------------------------------------------------------------- Camus
  {
    nome: 'camus-verao-invencivel',
    texto: 'No meio do inverno, aprendi enfim que havia em mim um verão invencível.',
    autor: 'Albert Camus',
    obra: '"Retorno a Tipasa", em O Verão (1954)',
    fonte: `${WQ}Albert_Camus`,
    traducaoVariavel: true,
  },
  {
    nome: 'camus-generosidade-presente',
    texto: 'A verdadeira generosidade para com o futuro consiste em dar tudo ao presente.',
    autor: 'Albert Camus',
    obra: 'O Homem Revoltado (1951)',
    fonte: `${WQ}Albert_Camus`,
    traducaoVariavel: true,
  },
  {
    nome: 'camus-longa-paciencia',
    texto:
      'É preciso tempo para ser feliz. Muito tempo. A felicidade, também ela, é uma longa paciência.',
    autor: 'Albert Camus',
    obra: 'A Morte Feliz (escrito em 1936-38, publicado em 1971)',
    fonte: `${WQ}Albert_Camus`,
    traducaoVariavel: true,
  },
  {
    nome: 'camus-mais-a-admirar',
    texto: 'Há nos homens mais coisas a admirar do que coisas a desprezar.',
    autor: 'Albert Camus',
    obra: 'A Peste (1947)',
    fonte: `${WQ}Albert_Camus`,
    traducaoVariavel: true,
  },
  {
    nome: 'camus-alma-determinada',
    texto: 'Tudo considerado, uma alma determinada sempre encontra um jeito.',
    autor: 'Albert Camus',
    obra: 'O Mito de Sísifo (1942)',
    fonte: `${WQ}Albert_Camus`,
    traducaoVariavel: true,
  },
  // ----------------------------------------------------------------- Sartre
  {
    nome: 'sartre-sentido-a-priori',
    texto: 'A vida não tem sentido a priori. Cabe a você dar-lhe um sentido.',
    autor: 'Jean-Paul Sartre',
    obra: 'O Existencialismo é um Humanismo (1946)',
    fonte: `${WQ}Jean-Paul_Sartre`,
    traducaoVariavel: true,
  },
  {
    nome: 'sartre-um-dia-recomecando',
    texto:
      'Você acha que eu conto os dias? Só resta um dia, sempre recomeçando: ele nos é dado na aurora e tirado ao anoitecer.',
    autor: 'Jean-Paul Sartre',
    obra: 'O Diabo e o Bom Deus (1951)',
    fonte: `${WQ}Jean-Paul_Sartre`,
    traducaoVariavel: true,
  },
  {
    nome: 'sartre-o-que-podem-ser',
    texto: 'Nos homens, o que me interessa não é o que eles são, mas o que podem vir a ser.',
    autor: 'Jean-Paul Sartre',
    obra: 'As Mãos Sujas (1948)',
    fonte: `${WQ}Jean-Paul_Sartre`,
    traducaoVariavel: true,
  },
  // --------------------------------------------------------------- Beauvoir
  {
    nome: 'beauvoir-conhecer-a-si',
    texto:
      'Conhecer a si mesmo não garante a felicidade, mas está do lado dela e pode dar a coragem de lutar por ela.',
    autor: 'Simone de Beauvoir',
    obra: 'A Força das Coisas (1963)',
    fonte: `${WQ}Simone_de_Beauvoir`,
    traducaoVariavel: true,
  },
  {
    nome: 'beauvoir-valor-da-vida',
    texto:
      'A vida conserva valor enquanto se atribui valor à vida dos outros, por meio do amor, da amizade, da indignação e da compaixão.',
    autor: 'Simone de Beauvoir',
    obra: 'A Velhice (1970)',
    fonte: `${WQ}Simone_de_Beauvoir`,
    traducaoVariavel: true,
  },
  // ------------------------------------------------------------ Kierkegaard
  {
    nome: 'kierkegaard-pressa-do-prazer',
    texto: 'A maioria dos homens persegue o prazer com tanta pressa que passa direto por ele.',
    autor: 'Søren Kierkegaard',
    obra: 'Ou-Ou (1843)',
    fonte: `${WQ}S%C3%B8ren_Kierkegaard`,
    traducaoVariavel: true,
  },
  // -------------------------------------------------------------- Nietzsche
  {
    nome: 'nietzsche-estrela-dancante',
    texto: 'É preciso ter ainda um caos dentro de si para dar à luz uma estrela dançante.',
    autor: 'Friedrich Nietzsche',
    obra: 'Assim Falou Zaratustra, Prólogo, § 5 (1883)',
    fonte: `${WQ}Friedrich_Nietzsche`,
    traducaoVariavel: true,
  },
  {
    nome: 'nietzsche-sem-musica',
    texto: 'Sem a música, a vida seria um erro.',
    autor: 'Friedrich Nietzsche',
    obra: 'Crepúsculo dos Ídolos, "Máximas e flechas", 33 (1888)',
    fonte: `${WQ}Friedrich_Nietzsche`,
    traducaoVariavel: true,
  },
  // ------------------------------------------------------------ Dostoiévski
  {
    nome: 'dostoievski-dor-antiga',
    texto:
      'É o grande mistério da vida humana: a dor antiga se transforma, aos poucos, numa alegria serena e terna.',
    autor: 'Fiódor Dostoiévski',
    obra: 'Os Irmãos Karamázov (1880)',
    fonte: `${WQ}Fyodor_Dostoyevsky`,
    traducaoVariavel: true,
  },
  {
    nome: 'dostoievski-contar-os-dias',
    texto: 'Para que contar os dias, se um só dia basta para o homem conhecer toda a felicidade?',
    autor: 'Fiódor Dostoiévski',
    obra: 'Os Irmãos Karamázov (1880)',
    fonte: `${WQ}Fyodor_Dostoyevsky`,
    traducaoVariavel: true,
  },
  {
    nome: 'dostoievski-algo-pelo-que-viver',
    texto:
      'O mistério da existência humana não está apenas em continuar vivo, mas em encontrar algo pelo que viver.',
    autor: 'Fiódor Dostoiévski',
    obra: 'Os Irmãos Karamázov, Livro V, cap. 5 (1880)',
    fonte: `${WQ}Fyodor_Dostoyevsky`,
    traducaoVariavel: true,
  },
  // ------------------------------------------------------------------ Kafka
  {
    nome: 'kafka-homem-que-quer-viver',
    texto: 'A lógica pode ser inabalável, mas não resiste a um homem que quer viver.',
    autor: 'Franz Kafka',
    obra: 'O Processo, cap. 10 (1925)',
    fonte: `${WQ}Franz_Kafka`,
    traducaoVariavel: true,
  },
  {
    nome: 'kafka-espinheiro',
    texto:
      'O espinheiro é o velho obstáculo no caminho. Ele precisa pegar fogo, se você quiser seguir adiante.',
    autor: 'Franz Kafka',
    obra: 'Cadernos in-oitavo (1917-1919)',
    fonte: `${WQ}Franz_Kafka`,
    traducaoVariavel: true,
  },
  // ------------------------------------------------------------------ Rilke
  {
    nome: 'rilke-mudar-tua-vida',
    texto: 'Não há ali lugar que não te veja. Tens de mudar tua vida.',
    autor: 'Rainer Maria Rilke',
    obra: '"Torso Arcaico de Apolo", em Novos Poemas (1908)',
    fonte: `${WQ}Rainer_Maria_Rilke`,
    traducaoVariavel: true,
  },
  {
    nome: 'rilke-entrar-em-si',
    texto:
      'Não sei lhe dar outro conselho senão este: entrar em si mesmo e explorar as profundezas de onde brota a sua vida.',
    autor: 'Rainer Maria Rilke',
    obra: 'Cartas a um Jovem Poeta, 1ª carta (1903)',
    fonte: `${WQ}Rainer_Maria_Rilke`,
    traducaoVariavel: true,
  },
  // ------------------------------------------------------------------ Hesse
  {
    nome: 'hesse-o-que-brotava-de-mim',
    texto:
      'Eu queria apenas tentar viver aquilo que brotava espontaneamente de mim. Por que isso era tão difícil?',
    autor: 'Hermann Hesse',
    obra: 'Demian (1919)',
    fonte: `${WQ}Hermann_Hesse`,
    traducaoVariavel: true,
  },
  {
    nome: 'hesse-misterio-da-vida',
    texto:
      'Como era misteriosa esta vida: quão fundas e turvas corriam as suas águas, e quão claro e nobre era o que delas emergia.',
    autor: 'Hermann Hesse',
    obra: 'Narciso e Goldmund (1930)',
    fonte: `${WQ}Hermann_Hesse`,
    traducaoVariavel: true,
  },
  // ----------------------------------------------------------------- Pessoa
  {
    nome: 'pessoa-vale-a-pena',
    texto: 'Valeu a pena? Tudo vale a pena se a alma não é pequena.',
    autor: 'Fernando Pessoa',
    obra: 'Mensagem, "Mar Português" (1934)',
    fonte: `${WQ}Fernando_Pessoa`,
  },
  {
    nome: 'pessoa-se-inteiro',
    texto:
      'Para ser grande, sê inteiro: nada teu exagera ou exclui. Sê todo em cada coisa. Põe quanto és no mínimo que fazes.',
    autor: 'Fernando Pessoa (Ricardo Reis)',
    obra: 'Odes de Ricardo Reis (1933)',
    fonte: `${WQ}Fernando_Pessoa`,
  },
  {
    nome: 'pessoa-lavar-o-destino',
    texto:
      'Assim como lavamos o corpo devíamos lavar o destino, mudar de vida como mudamos de roupa.',
    autor: 'Fernando Pessoa (Bernardo Soares)',
    obra: 'Livro do Desassossego',
    fonte: `${WQ}Fernando_Pessoa`,
  },
  {
    nome: 'pessoa-tamanho-do-que-vejo',
    texto: 'Porque eu sou do tamanho do que vejo e não do tamanho da minha altura.',
    autor: 'Fernando Pessoa (Alberto Caeiro)',
    obra: 'O Guardador de Rebanhos, VII',
    fonte: `${WQ}Fernando_Pessoa`,
  },
  {
    nome: 'pessoa-vivo-no-presente',
    texto: 'Vivo sempre no presente. O futuro, não o conheço. O passado, já o não tenho.',
    autor: 'Fernando Pessoa (Bernardo Soares)',
    obra: 'Livro do Desassossego',
    fonte: `${WQ}Fernando_Pessoa`,
  },
  // ----------------------------------------------------------------- Sêneca
  {
    nome: 'seneca-comeca-ja',
    texto: 'Começa já a viver, e conta cada dia como uma vida à parte.',
    autor: 'Sêneca',
    obra: 'Cartas a Lucílio, 101 (séc. I)',
    fonte: `${WQ}Seneca_the_Younger`,
    traducaoVariavel: true,
  },
  {
    nome: 'seneca-enquanto-adiamos',
    texto:
      'Agarra a tarefa de hoje e dependerás menos da de amanhã. Enquanto adiamos, a vida passa.',
    autor: 'Sêneca',
    obra: 'Cartas a Lucílio, 1 (séc. I)',
    fonte: `${WQ}Seneca_the_Younger`,
    traducaoVariavel: true,
  },
  {
    nome: 'seneca-aprender-a-viver',
    texto: 'Enquanto viveres, continua aprendendo a viver.',
    autor: 'Sêneca',
    obra: 'Cartas a Lucílio, 76 (séc. I)',
    fonte: `${WQ}Seneca_the_Younger`,
    traducaoVariavel: true,
  },
  {
    nome: 'seneca-desperdicamos-muito',
    texto: 'Não é que tenhamos pouco tempo: é que desperdiçamos muito. A vida é longa o bastante.',
    autor: 'Sêneca',
    obra: 'Sobre a Brevidade da Vida, cap. 1 (séc. I)',
    fonte: `${WQ}Seneca_the_Younger`,
    traducaoVariavel: true,
  },
  // ------------------------------------------------ Epicteto e Marco Aurélio
  {
    nome: 'epicteto-o-que-queres-ser',
    texto: 'Diz primeiro a ti mesmo o que queres ser; depois, faz o que tens de fazer.',
    autor: 'Epicteto',
    obra: 'Diatribes, III.23 (séc. II)',
    fonte: `${WQ}Epictetus`,
    traducaoVariavel: true,
  },
  {
    nome: 'marco-aurelio-se-um',
    texto: 'Chega de discutir como deve ser um homem bom. Sê um.',
    autor: 'Marco Aurélio',
    obra: 'Meditações, X.16 (séc. II)',
    fonte: `${WQ}Marcus_Aurelius`,
    traducaoVariavel: true,
  },
  // -------------------------------------------------------------- Montaigne
  {
    nome: 'montaigne-pertencer-a-si',
    texto: 'A maior coisa do mundo é saber pertencer a si mesmo.',
    autor: 'Michel de Montaigne',
    obra: 'Ensaios, I.39 (1580)',
    fonte: `${WQ}Michel_de_Montaigne`,
    traducaoVariavel: true,
  },
  // ---------------------------------------------------------------- Thoreau
  {
    nome: 'thoreau-dia-desperto',
    texto:
      'Só amanhece o dia para o qual estamos despertos. Há mais dia por amanhecer. O sol é apenas uma estrela da manhã.',
    autor: 'Henry David Thoreau',
    obra: 'Walden, Conclusão (1854)',
    fonte: `${WQ}Henry_David_Thoreau`,
    traducaoVariavel: true,
  },
  {
    nome: 'thoreau-caminhada-cedo',
    texto: 'Uma caminhada logo cedo é uma bênção para o dia inteiro.',
    autor: 'Henry David Thoreau',
    obra: 'Diário, 20 de abril de 1840',
    fonte: `${WQ}Henry_David_Thoreau`,
    traducaoVariavel: true,
  },
  {
    nome: 'thoreau-viver-deliberadamente',
    texto:
      'Fui para os bosques porque queria viver deliberadamente, enfrentar só os fatos essenciais da vida e ver se não aprendia o que ela tinha a ensinar.',
    autor: 'Henry David Thoreau',
    obra: 'Walden (1854)',
    fonte: `${WQ}Henry_David_Thoreau`,
    traducaoVariavel: true,
  },
  // ---------------------------------------------------------------- Emerson
  {
    nome: 'emerson-saude-e-um-dia',
    texto: 'Dê-me saúde e um dia, e tornarei ridícula a pompa dos imperadores.',
    autor: 'Ralph Waldo Emerson',
    obra: 'Natureza, "Beleza" (1836)',
    fonte: `${WQ}Ralph_Waldo_Emerson`,
    traducaoVariavel: true,
  },
  {
    nome: 'emerson-dias-como-seculos',
    texto:
      'Quero que a vida não seja barata, mas sagrada. Quero que os dias sejam como séculos, carregados, perfumados.',
    autor: 'Ralph Waldo Emerson',
    obra: 'A Conduta da Vida, "Considerações pelo caminho" (1860)',
    fonte: `${WQ}Ralph_Waldo_Emerson`,
    traducaoVariavel: true,
  },
  {
    nome: 'emerson-melhor-dia-do-ano',
    texto: 'Escreva no coração que cada dia é o melhor dia do ano.',
    autor: 'Ralph Waldo Emerson',
    obra: 'Sociedade e Solidão, "Obras e Dias" (1870)',
    fonte: `${WQ}Ralph_Waldo_Emerson`,
    traducaoVariavel: true,
  },
  // ------------------------------------------------- Ortega e Simone Weil
  {
    nome: 'ortega-atencao',
    texto: 'Diga-me a que você presta atenção e eu lhe direi quem você é.',
    autor: 'José Ortega y Gasset',
    obra: 'Em Torno a Galileu (1933)',
    fonte: `${WQ}Jos%C3%A9_Ortega_y_Gasset`,
    traducaoVariavel: true,
  },
  {
    nome: 'weil-atencao-generosidade',
    texto: 'A atenção é a forma mais rara e mais pura de generosidade.',
    autor: 'Simone Weil',
    obra: 'Carta a Joë Bousquet, 13 de abril de 1942',
    fonte: `${WQ}Simone_Weil`,
    traducaoVariavel: true,
  },
  // ------------------------------------------------------------------ Buber
  {
    nome: 'buber-vida-e-encontro',
    texto: 'Toda vida verdadeira é encontro.',
    autor: 'Martin Buber',
    obra: 'Eu e Tu (1923)',
    fonte: `${WQ}Martin_Buber`,
    traducaoVariavel: true,
  },
  {
    nome: 'buber-saber-comecar',
    texto: 'Envelhecer é uma coisa gloriosa quando não se desaprendeu o que significa começar.',
    autor: 'Martin Buber',
    obra: 'Eclipse de Deus (1952)',
    fonte: `${WQ}Martin_Buber`,
    traducaoVariavel: true,
  },
  // ------------------------------------------------------------------ Fromm
  {
    nome: 'fromm-ato-de-viver',
    texto: 'Só existe um sentido da vida: o próprio ato de viver.',
    autor: 'Erich Fromm',
    obra: 'O Medo à Liberdade, cap. 7 (1941)',
    fonte: `${WQ}Erich_Fromm`,
    traducaoVariavel: true,
  },
  {
    nome: 'fromm-dar-a-luz-a-si',
    texto:
      'A principal tarefa do homem na vida é dar à luz a si mesmo, tornar-se aquilo que ele é em potencial.',
    autor: 'Erich Fromm',
    obra: 'Análise do Homem, cap. 4 (1947)',
    fonte: `${WQ}Erich_Fromm`,
    traducaoVariavel: true,
  },
  // ---------------------------------------------------- Unamuno e Machado
  {
    nome: 'unamuno-habito',
    texto: 'Cair num hábito é começar a deixar de ser.',
    autor: 'Miguel de Unamuno',
    obra: 'Do Sentimento Trágico da Vida, cap. IX (1913)',
    fonte: `${WQ}Miguel_de_Unamuno`,
    traducaoVariavel: true,
  },
  {
    nome: 'machado-caminhante',
    texto: 'Caminhante, não há caminho: faz-se caminho ao andar.',
    autor: 'Antonio Machado',
    obra: 'Campos de Castela, "Provérbios e cantares", XXIX (1917)',
    fonte: `${WQ}Antonio_Machado`,
    traducaoVariavel: true,
  },
  // --------------------------------------------------- Rosa e Saramago
  {
    nome: 'rosa-coragem',
    texto:
      'O correr da vida embrulha tudo, a vida é assim: esquenta e esfria, aperta e daí afrouxa, sossega e depois desinquieta. O que ela quer da gente é coragem.',
    autor: 'João Guimarães Rosa',
    obra: 'Grande Sertão: Veredas (1956)',
    fonte: 'https://pt.wikiquote.org/wiki/Guimar%C3%A3es_Rosa',
  },
  {
    nome: 'saramago-repara',
    texto: 'Se podes olhar, vê. Se podes ver, repara.',
    autor: 'José Saramago',
    obra: 'Ensaio sobre a Cegueira, epígrafe (1995)',
    fonte: 'https://pt.wikiquote.org/wiki/Jos%C3%A9_Saramago',
  },
]
