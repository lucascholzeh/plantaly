import type { Especie } from './tipos'

/**
 * Catálogo de espécies — onda 1.
 *
 * Cada ficha só entra depois de uma fonte ser efetivamente consultada, e as
 * faixas de dias são marcadas como derivadas quando a fonte descreve um
 * critério em vez de um número. As fontes de horticultura sérias quase nunca
 * dizem "regue a cada 8 dias"; dizem "quando o substrato secar".
 *
 * O catálogo cresce em ondas. Espécie sem base confiável não entra — vai
 * para o genérico.
 */
export const ESPECIES: Especie[] = [
  {
    slug: 'phalaenopsis',
    nomePopular: 'Orquídea Phalaenopsis',
    nomeCientifico: 'Phalaenopsis spp.',
    apelidos: ['orquídea-borboleta', 'orquídea-mariposa', 'orquídea de supermercado'],
    grupo: 'orquidea',

    criterioDeRega:
      'Olhe as raízes: verdes significa hidratada, prateadas ou esbranquiçadas significa que ' +
      'chegou a hora. Nunca deixe secar por completo, e nunca deixe o vaso parado na água.',
    regaQuente: [7, 10],
    regaFria: [10, 14],
    toleranciaSeca: 'media',
    numerosDerivados: true,

    adubacaoQuente: [7, 14],
    adubacaoFria: [30, 45],
    notaAdubacao:
      'Adubo próprio para orquídea, fraco. A cada quarta rega, regue sem adubo nenhum para ' +
      'lavar o sal acumulado no substrato.',

    luz: 'Luz clara e indireta. Sol direto queima a folha. Janela leste ou oeste é o lugar típico.',

    comoIdentificar: [
      'Não tem pseudobulbo — nenhum engrossamento na base, diferente de Cattleya e Dendrobium.',
      'Folhas grossas, largas e carnudas, saindo em pares opostos, bem rentes ao substrato.',
      'Raízes grossas e achatadas, prateadas quando secas, muitas para fora do vaso.',
      'Flores achatadas numa haste arqueada, todas voltadas para o mesmo lado.',
    ],
    confundidaCom: [
      {
        com: 'Cattleya',
        diferenca:
          'A Cattleya tem pseudobulbo — um engrossamento em forma de charuto na base de cada ' +
          'folha. A Phalaenopsis não tem nada disso.',
      },
      {
        com: 'Dendrobium',
        diferenca:
          'O Dendrobium cresce numa haste alta e cheia de nós, com folhas ao longo dela. A ' +
          'Phalaenopsis tem folhas baixas, quase no vaso.',
      },
    ],
    sinaisDeProblema: [
      {
        sinal: 'Folhas enrugadas ou murchas',
        significado:
          'Desidratação — ou falta de água, ou raiz apodrecida que não consegue mais absorver. ' +
          'Olhe a raiz antes de decidir: raiz marrom e mole é o segundo caso, e mais água piora.',
      },
      {
        sinal: 'Raízes marrons e moles',
        significado: 'Apodrecimento por excesso de água ou vaso sem drenagem.',
      },
      {
        sinal: 'Folha de baixo amarelando devagar',
        significado: 'Normal: a planta descarta a folha mais velha de tempos em tempos.',
      },
      {
        sinal: 'Botões caindo antes de abrir',
        significado: 'Mudança brusca de lugar, corrente de ar frio, ou estresse por seca.',
      },
    ],
    cuidadoEspecifico: [
      'Depois que a última flor cair, a haste pode ser cortada acima do segundo nó de baixo — ' +
        'às vezes ela ramifica e floresce de novo.',
      'Substrato é casca, não terra. Terra comum sufoca a raiz.',
    ],
    notaRecuperacao:
      'Na orquídea o efeito da imersão é visível: a raiz prateada volta a verde em minutos. ' +
      'Deixe o vaso na bacia por 15 minutos e observe.',
    avisoClimatico:
      'A orientação da RHS é de inverno britânico — frio, seco e com aquecedor ligado. No ' +
      'inverno brasileiro, mais úmido e ameno, o intervalo tende a ficar mais perto do limite ' +
      'inferior da faixa fria.',

    fotos: [
      {
        arquivo: 'phalaenopsis-flor.jpg',
        mostra: 'flor',
        alt: 'Flor branca de Phalaenopsis amabilis, com labelo amarelo e duas antenas curvas.',
        autor: 'Orchi',
        licenca: 'CC BY-SA 3.0',
        origem: 'https://commons.wikimedia.org/wiki/File:Phalaenopsis_amabilis_Orchi_004.jpg',
      },
    ],

    fontes: [
      {
        titulo: 'RHS — How to grow moth orchids (Phalaenopsis)',
        url: 'https://www.rhs.org.uk/plants/phalaenopsis/growing-guide',
      },
    ],
  },

  {
    slug: 'lirio-da-paz',
    nomePopular: 'Lírio-da-paz',
    nomeCientifico: 'Spathiphyllum wallisii',
    apelidos: ['bandeira-branca', 'flor-da-paz'],
    grupo: 'lirio',

    criterioDeRega:
      'Ela avisa sozinha: murcha de forma dramática e se recupera em poucas horas depois de ' +
      'regada. Só que deixar chegar nesse ponto toda vez desgasta a planta — o certo é o ' +
      'substrato úmido, nunca encharcado.',
    regaQuente: [4, 7],
    regaFria: [7, 10],
    toleranciaSeca: 'baixa',
    numerosDerivados: true,

    adubacaoQuente: [28, 35],
    adubacaoFria: [45, 60],
    notaAdubacao: 'Fertilizante líquido equilibrado, mensal na estação de crescimento.',

    luz: 'Luz indireta ou filtrada. Aguenta sombra, mas na sombra profunda para de florir.',

    comoIdentificar: [
      'Não é lírio: a "flor" branca é uma espata, uma folha modificada, com uma espiga ' +
        'granulada (espádice) no meio.',
      'Folhas lanceoladas, verde-escuras e brilhantes, saindo direto do substrato em touceira.',
      'Não tem caule aéreo nem bulbo.',
    ],
    confundidaCom: [
      {
        com: 'Antúrio',
        diferenca:
          'O antúrio tem a mesma estrutura de espata e espádice, mas a espata é geralmente ' +
          'vermelha, em forma de coração e brilhante como plástico. A do lírio-da-paz é ' +
          'branca e mais fina.',
      },
      {
        com: 'Lírio verdadeiro (Lilium)',
        diferenca:
          'Não têm nada a ver. O Lilium nasce de bulbo, tem caule alto com folhas ao longo ' +
          'dele e flores com seis pétalas e estames evidentes.',
      },
    ],
    sinaisDeProblema: [
      {
        sinal: 'Murcha geral e súbita',
        significado: 'Sede. Costuma recuperar por completo em algumas horas depois da rega.',
      },
      {
        sinal: 'Pontas das folhas marrons e secas',
        significado:
          'Ar seco demais, ou acúmulo de sal e cloro da água de torneira. A RHS recomenda ' +
          'água de chuva.',
      },
      {
        sinal: 'Folhas amarelas',
        significado: 'Excesso de água, ou sol direto demais.',
      },
      {
        sinal: 'Para de florir',
        significado: 'Luz insuficiente. Sombra profunda mantém a folhagem mas cancela a flor.',
      },
    ],
    notaRecuperacao:
      'É das plantas que mais assustam e mais perdoam: a murcha total costuma reverter em ' +
      'horas. Folha que secou por inteiro não volta e pode ser cortada na base.',
    avisoClimatico:
      'A umidade do ar no Brasil costuma ser maior que a britânica, então a recomendação de ' +
      'borrifar com frequência raramente é necessária aqui.',

    fotos: [
      {
        arquivo: 'lirio-da-paz-flor.jpg',
        mostra: 'flor',
        alt: 'Espata branca de lírio-da-paz envolvendo a espiga verde do espádice.',
        autor: 'W.carter',
        licenca: 'CC BY-SA 4.0',
        origem: 'https://commons.wikimedia.org/wiki/File:Peace_lily_-_1_-_cropped.jpg',
      },
    ],

    fontes: [
      {
        titulo: 'RHS — How to grow peace lilies',
        url: 'https://www.rhs.org.uk/plants/peace-lilies/how-to-grow-peace-lilies',
      },
    ],
  },

  {
    slug: 'violeta-africana',
    nomePopular: 'Violeta africana',
    nomeCientifico: 'Streptocarpus ionanthus',
    apelidos: ['violeta', 'santa-paulina', 'Saintpaulia ionantha'],
    grupo: 'flor',

    criterioDeRega:
      'Superfície do substrato seca ao toque. Regue por baixo: deixe o vaso num pratinho com ' +
      'água morna por cerca de 30 minutos e descarte o que sobrar. Água nas folhas mancha.',
    regaQuente: [5, 7],
    regaFria: [7, 12],
    toleranciaSeca: 'media',
    numerosDerivados: true,

    adubacaoQuente: [14, 21],
    adubacaoFria: [45, 60],
    notaAdubacao:
      'De vez em quando regue por cima até escorrer, para lavar o sal que a rega por baixo ' +
      'acumula no substrato.',

    luz: 'Luz clara e indireta. Sol direto queima as folhas peludas.',

    comoIdentificar: [
      'Folhas arredondadas, grossas e cobertas de pelos curtos, dispostas em roseta rente ao vaso.',
      'Flores pequenas em cachos no centro da roseta, com cinco pétalas.',
      'Planta baixa e compacta, raramente passa de um palmo.',
    ],
    confundidaCom: [
      {
        com: 'Gloxínia',
        diferenca:
          'A gloxínia tem folhas bem maiores e flores em forma de sino, bem mais largas que ' +
          'as da violeta.',
      },
    ],
    sinaisDeProblema: [
      {
        sinal: 'Manchas claras ou marrons redondas nas folhas',
        significado:
          'Água fria caiu na folha. É o motivo de a rega ser por baixo. Água à temperatura ' +
          'ambiente reduz o problema.',
      },
      {
        sinal: 'Base mole e escura, planta tomba',
        significado:
          'Podridão de raiz por excesso de água — a causa mais comum de morte da espécie ' +
          'segundo a extensão da Universidade de Minnesota.',
      },
      { sinal: 'Não floresce', significado: 'Luz insuficiente.' },
    ],

    fotos: [],
    semFotoAinda:
      'A busca no acervo aberto devolveu, entre outras, a capa de um catálogo de sementes de ' +
      '1897 cujo texto menciona a espécie. Nenhuma candidata passou na conferência ainda.',

    fontes: [
      {
        titulo: 'University of Minnesota Extension — African violets',
        url: 'https://extension.umn.edu/houseplants/african-violets',
      },
      {
        titulo: 'Wisconsin Horticulture — African Violets',
        url: 'https://hort.extension.wisc.edu/articles/african-violets/',
      },
    ],
  },

  {
    slug: 'kalanchoe',
    nomePopular: 'Kalanchoe',
    nomeCientifico: 'Kalanchoe blossfeldiana',
    apelidos: ['flor-da-fortuna', 'calanchoe'],
    grupo: 'flor',

    criterioDeRega:
      'É suculenta: as folhas guardam água. Regue com moderação enquanto cresce e bem menos ' +
      'fora da floração, sempre esperando o substrato secar em boa parte.',
    regaQuente: [10, 14],
    regaFria: [21, 30],
    toleranciaSeca: 'alta',
    numerosDerivados: true,

    adubacaoQuente: [45, 60],
    adubacaoFria: null,
    notaAdubacao:
      'A RHS indica apenas duas ou três adubações ao longo de toda a estação de crescimento.',

    luz: 'Luz clara e filtrada, e umidade do ar relativamente baixa.',

    comoIdentificar: [
      'Folhas suculentas, grossas, verde-escuras e brilhantes, com a borda serrilhada.',
      'Flores pequenas em buquês densos acima da folhagem, muito numerosas.',
      'Planta compacta e arbustiva.',
    ],
    confundidaCom: [
      {
        com: 'Outras suculentas de flor',
        diferenca:
          'A borda serrilhada da folha somada ao buquê denso de flores pequenas é a ' +
          'combinação característica.',
      },
    ],
    sinaisDeProblema: [
      { sinal: 'Base escurecida e mole', significado: 'Excesso de água. É o erro típico com ela.' },
      { sinal: 'Caules esticados e folhas espaçadas', significado: 'Luz insuficiente.' },
      {
        sinal: 'Não floresce de novo',
        significado:
          'Ela precisa de noites longas para formar botão: cerca de seis semanas com no ' +
          'mínimo catorze horas de escuro por noite.',
      },
    ],

    fotos: [],
    semFotoAinda: 'O acervo não devolveu candidata utilizável na primeira busca.',

    fontes: [
      {
        titulo: 'RHS — Kalanchoe blossfeldiana',
        url: 'https://www.rhs.org.uk/plants/78810/kalanchoe-blossfeldiana/details',
      },
      {
        titulo: 'Illinois Extension — A nontraditional holiday plant: Kalanchoe',
        url: 'https://extension.illinois.edu/blogs/good-growing/2025-12-19-nontraditional-holiday-plant-kalanchoe',
      },
    ],
  },

  {
    slug: 'echeveria',
    nomePopular: 'Suculenta Echeveria',
    nomeCientifico: 'Echeveria spp.',
    apelidos: ['rosa-de-pedra', 'suculenta rosetada'],
    grupo: 'suculenta',

    criterioDeRega:
      'Substrato completamente seco antes de regar. Regue fundo, até escorrer pelo furo, e ' +
      'descarte a água do prato. Nunca deixe o vaso na água.',
    regaQuente: [14, 21],
    regaFria: [21, 35],
    toleranciaSeca: 'alta',
    numerosDerivados: true,

    adubacaoQuente: [45, 60],
    adubacaoFria: null,

    luz: 'Luz clara, cerca de seis horas por dia. Sem luz suficiente ela estica e perde a cor.',

    comoIdentificar: [
      'Roseta simétrica e compacta de folhas carnudas, vista de cima parece uma flor.',
      'Folhas lisas, muitas vezes com camada pruinosa acinzentada ou azulada.',
      'Cresce em altura muito devagar; o que aumenta é o diâmetro da roseta.',
    ],
    confundidaCom: [
      {
        com: 'Sempre-viva (Sempervivum)',
        diferenca:
          'A Sempervivum tem folhas mais finas e pontiagudas, com pelinhos na borda, e ' +
          'produz muitas mudas rentes ao redor da roseta-mãe.',
      },
      {
        com: 'Haworthia',
        diferenca:
          'A Haworthia tem folhas mais estreitas, rígidas e frequentemente com listras ou ' +
          'pontos brancos.',
      },
    ],
    sinaisDeProblema: [
      {
        sinal: 'Roseta esticada, folhas afastadas',
        significado: 'Luz insuficiente. Não tem volta: a parte esticada fica assim.',
      },
      { sinal: 'Folhas de baixo moles e translúcidas', significado: 'Excesso de água.' },
      {
        sinal: 'Folhas enrugadas',
        significado: 'Falta de água — nela isso demora muito a acontecer e é fácil de reverter.',
      },
      { sinal: 'Perda de cor, volta ao verde', significado: 'Pouca luz.' },
    ],
    notaRecuperacao:
      'Numa Echeveria, uma semana de atraso não é atraso. Se as folhas ainda estão firmes, ' +
      'não há nada a corrigir.',

    fotos: [],
    semFotoAinda: 'Candidata baixada, ainda não conferida visualmente.',

    fontes: [
      {
        titulo: 'RHS — How to grow cacti and succulents',
        url: 'https://www.rhs.org.uk/plants/types/cacti-succulents/houseplants/growing-guide',
      },
      {
        titulo: 'University of Minnesota Extension — Cacti and succulents',
        url: 'https://extension.umn.edu/houseplants/cacti-and-succulents',
      },
    ],
  },

  {
    slug: 'anturio',
    nomePopular: 'Antúrio',
    nomeCientifico: 'Anthurium andraeanum',
    apelidos: ['flor-flamingo', 'flor-de-cera'],
    grupo: 'flor',

    criterioDeRega:
      'Deixe o substrato secar antes de regar bem de novo. Regue fartamente na estação quente ' +
      'e pouco na fria. Nunca deixe o vaso parado na água.',
    regaQuente: [5, 8],
    regaFria: [10, 14],
    toleranciaSeca: 'media',
    numerosDerivados: true,

    adubacaoQuente: [14, 14],
    adubacaoFria: null,
    notaAdubacao: 'Fertilizante de orquídea a cada duas semanas, só na estação de crescimento.',

    luz: 'Luz clara e indireta, calor e umidade alta. Nunca sol direto.',

    comoIdentificar: [
      'Espata em forma de coração, muito brilhante, quase com aparência de plástico — ' +
        'geralmente vermelha, mas existe branca e rosa.',
      'Espádice reto saindo do centro da espata, amarelo ou creme.',
      'Folhas grandes, também em forma de coração, verde-escuras e brilhantes.',
    ],
    confundidaCom: [
      {
        com: 'Lírio-da-paz',
        diferenca:
          'A mesma estrutura de espata e espádice, mas a do lírio-da-paz é branca e fina, e ' +
          'a folha é lanceolada em vez de acoraçoada.',
      },
    ],
    sinaisDeProblema: [
      {
        sinal: 'Pontas marrons',
        significado: 'Ar seco, ou água de torneira. A RHS recomenda água de chuva.',
      },
      {
        sinal: 'Folhas amarelas',
        significado: 'Excesso de água, ou frio — abaixo de 18 °C ele sofre.',
      },
      { sinal: 'Espatas pequenas ou ausentes', significado: 'Luz insuficiente ou falta de adubo.' },
    ],
    cuidadoEspecifico: [
      'Água gelada danifica a planta: deixe a água chegar à temperatura ambiente antes de regar.',
    ],

    fotos: [],
    semFotoAinda: 'Candidata baixada, ainda não conferida visualmente.',

    fontes: [
      {
        titulo: 'RHS — How to grow anthuriums',
        url: 'https://www.rhs.org.uk/plants/anthuriums/how-to-grow-anthuriums',
      },
    ],
  },
]
