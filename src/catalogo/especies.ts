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

    fotos: [
      {
        arquivo: 'violeta-africana-flor.jpg',
        mostra: 'flor',
        alt:
          'Flores azul-violeta de Saintpaulia ionantha, cada uma com cinco pétalas e dois ' +
          'estames amarelos no centro, sobre folhas peludas.',
        autor: 'J.Dncsn',
        licenca: 'CC BY-SA 3.0',
        origem: 'https://commons.wikimedia.org/wiki/File:Saintpaulia_ionantha_(flowers).jpg',
      },
    ],

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

    fotos: [
      {
        arquivo: 'kalanchoe-flor.jpg',
        mostra: 'flor',
        alt:
          'Buquê compacto de flores rosa-escuras de Kalanchoe blossfeldiana, de pétalas ' +
          'dobradas, agrupadas na ponta da haste.',
        autor: 'Luis Miguel Bugallo Sánchez',
        licenca: 'CC BY-SA 4.0',
        origem:
          'https://commons.wikimedia.org/wiki/File:2025_Kalanchoe_blossfeldiana_Poelin._Santiago_de_Compostela._Galiza.jpg',
      },
    ],

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

    fotos: [
      {
        arquivo: 'echeveria-planta.jpg',
        mostra: 'planta',
        alt:
          'Roseta simétrica de Echeveria elegans, de folhas carnudas verde-azuladas cobertas ' +
          'por uma camada branca de cera, com a borda avermelhada.',
        autor: 'Syrio',
        licenca: 'CC BY-SA 4.0',
        origem:
          'https://commons.wikimedia.org/wiki/File:Echeveria_elegans_Edinburg_botanical_garden_03.jpg',
      },
    ],

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

    fotos: [
      {
        arquivo: 'anturio-flor.jpg',
        mostra: 'flor',
        alt:
          'Espata vermelha e lustrosa de Anthurium andraeanum, em forma de coração, com o ' +
          'espádice amarelo saindo do centro.',
        autor: 'ImagePerson',
        licenca: 'CC BY 4.0',
        origem:
          'https://commons.wikimedia.org/wiki/File:Anthurium_andraeanum_Flamingo_flower_Barbados_0998.jpg',
      },
    ],

    fontes: [
      {
        titulo: 'RHS — How to grow anthuriums',
        url: 'https://www.rhs.org.uk/plants/anthuriums/how-to-grow-anthuriums',
      },
    ],
  },

  {
    slug: 'espada-de-sao-jorge',
    nomePopular: 'Espada-de-São-Jorge',
    nomeCientifico: 'Dracaena trifasciata',
    apelidos: ['sansevieria', 'língua-de-sogra', 'espada-de-santa-bárbara', 'snake plant'],
    grupo: 'suculenta',

    criterioDeRega:
      'Enfie o dedo até a segunda falange: só regue se o substrato estiver seco nessa ' +
      'profundidade. Ela guarda água na folha carnuda, e por isso a dúvida se resolve sempre ' +
      'esperando mais — nunca regando por precaução.',
    regaQuente: [14, 21],
    regaFria: [30, 45],
    toleranciaSeca: 'alta',
    numerosDerivados: true,

    adubacaoQuente: [30, 30],
    adubacaoFria: null,
    notaAdubacao:
      'Uma vez por mês na estação quente, com adubo comum na metade da dose, ou adubo de ' +
      'cacto. Na estação fria, nada: ela praticamente não cresce.',

    luz:
      'Aguenta de sol filtrado a sombra, o que a torna a planta de canto escuro por excelência. ' +
      'Cresce mais compacta na luz clara; na sombra, as folhas ficam mais longas e moles. ' +
      'Evite sol direto forte, que queima.',

    comoIdentificar: [
      'Folhas eretas e rígidas, em forma de espada, saindo direto do substrato, sem caule visível.',
      'Faixas horizontais mais claras atravessando a folha — o desenho que dá o nome em inglês, snake plant.',
      'Folha grossa e carnuda ao toque: é uma suculenta, apesar do formato de folhagem.',
    ],
    confundidaCom: [
      {
        com: 'Zamioculca',
        diferenca:
          'A zamioculca tem folhas compostas — várias folhinhas ovais ao longo de uma haste. ' +
          'A espada tem uma lâmina inteiriça, sem divisão.',
      },
      {
        com: 'Dracena-de-madagascar',
        diferenca:
          'A dracena tem tronco lenhoso com um tufo de folhas finas no topo. A espada sai do ' +
          'chão em folhas largas, sem tronco.',
      },
    ],
    sinaisDeProblema: [
      {
        sinal: 'Base da folha mole, marrom e com cheiro',
        significado:
          'Podridão por excesso de água — o modo como quase toda espada morre. Não é falta de ' +
          'água, e regar de novo acelera o fim. A folha afetada não se recupera.',
      },
      {
        sinal: 'Folhas caindo para os lados, abrindo o centro',
        significado:
          'Em geral excesso de água ou vaso grande demais; às vezes falta de luz, que alonga ' +
          'a folha até ela não se sustentar.',
      },
      {
        sinal: 'Folha enrugada, com dobras no comprimento',
        significado:
          'Aí sim é sede — e são precisas semanas de esquecimento para chegar nesse ponto.',
      },
      {
        sinal: 'Pontas secas e marrons',
        significado:
          'Baixa umidade do ar ou excesso de adubo. A dracena é sensível a flúor: água muito ' +
          'tratada queima a ponta e a margem da folha.',
      },
    ],
    cuidadoEspecifico: [
      'Substrato de cacto, ou comum com bastante perlita. Terra que segura água é o inimigo aqui.',
      'Vaso apertado é bom: ela cresce melhor com a raiz confinada.',
    ],
    notaRecuperacao:
      'Se ela passou muito tempo seca, regue normalmente uma vez e espere. Espada seca se ' +
      'recupera; espada encharcada, não — a tentação de compensar o esquecimento com água ' +
      'extra é o que mata.',
    avisoClimatico:
      'A faixa fria vem de extensão americana, onde o inverno tem aquecedor ligado e ar seco. ' +
      'No inverno brasileiro, mais úmido, a espada seca ainda mais devagar: comece pelo limite ' +
      'alto da faixa e observe.',

    fotos: [
      {
        arquivo: 'espada-de-sao-jorge-planta.jpg',
        mostra: 'planta',
        alt:
          'Touceira de Dracaena trifasciata com folhas eretas em forma de espada, marcadas por ' +
          'faixas horizontais claras sobre verde-escuro.',
        autor: 'Fanti Salms',
        licenca: 'CC BY-SA 4.0',
        origem: 'https://commons.wikimedia.org/wiki/File:Dracaena_Trifasciata_Plant.jpg',
      },
    ],

    fontes: [
      {
        titulo: 'RHS — How to grow sansevierias',
        url: 'https://www.rhs.org.uk/plants/sansevieria/growing-guide',
      },
      {
        titulo: 'Penn State Extension — Snake Plant: A Forgiving, Low-maintenance Houseplant',
        url: 'https://extension.psu.edu/snake-plant-a-forgiving-low-maintenance-houseplant',
      },
      {
        titulo: 'Clemson HGIC — Dracaena',
        url: 'https://hgic.clemson.edu/factsheet/dracaena/',
      },
    ],
  },

  {
    slug: 'jiboia',
    nomePopular: 'Jiboia',
    nomeCientifico: 'Epipremnum aureum',
    apelidos: ['pothos', 'hera-do-diabo', 'golden pothos'],
    grupo: 'folhagem',

    criterioDeRega:
      'Regue quando os dois primeiros centímetros do substrato estiverem secos ao dedo. Ela ' +
      'também avisa pela folha: quando perde o brilho e amolece de leve, já passou da hora — ' +
      'mas o dedo avisa antes.',
    regaQuente: [7, 10],
    regaFria: [10, 14],
    toleranciaSeca: 'media',
    numerosDerivados: true,

    adubacaoQuente: [30, 30],
    adubacaoFria: null,
    notaAdubacao:
      'Uma vez por mês de outubro a março, com adubo comum de planta de casa. Na estação fria ' +
      'ela quase não cresce e não precisa.',

    luz:
      'Luz clara e indireta é o ideal. Cresce na sombra também, só que mais devagar e perdendo ' +
      'o desenho branco ou amarelo da folha. Sol direto no verão queima.',

    comoIdentificar: [
      'Folha em forma de coração, lustrosa, com manchas irregulares creme ou amarelas.',
      'Haste pendente ou trepadeira, com raízes aéreas saindo dos nós.',
      'A folha nova sai enrolada e se abre depois, sempre alternada ao longo da haste.',
    ],
    confundidaCom: [
      {
        com: 'Filodendro-coração',
        diferenca:
          'O filodendro tem folha mais fina e fosca, e a folha nova sai protegida por uma ' +
          'bainha que depois seca e cai. A jiboia tem folha grossa, brilhante, e nada dessa bainha.',
      },
      {
        com: 'Scindapsus (pérola-e-jade)',
        diferenca:
          'O scindapsus tem folha aveludada e fosca, com manchas prateadas. A jiboia é ' +
          'brilhante, com manchas amarelas ou creme.',
      },
    ],
    sinaisDeProblema: [
      {
        sinal: 'Folhas amarelas, várias ao mesmo tempo, com o substrato úmido',
        significado:
          'Excesso de água e raiz apodrecendo. Uma folha velha amarelando sozinha de vez em ' +
          'quando é normal; várias juntas, não.',
      },
      {
        sinal: 'Folhas murchas e substrato seco',
        significado: 'Sede simples. Ela se recupera em horas depois de uma rega completa.',
      },
      {
        sinal: 'Folhas novas todas verdes, sem as manchas claras',
        significado: 'Falta de luz. Aproxime da janela e o desenho volta nas folhas seguintes.',
      },
      {
        sinal: 'Hastes longas com folhas só nas pontas',
        significado:
          'Também é falta de luz. Podar as hastes na primavera faz ela ramificar e voltar a encher.',
      },
    ],
    cuidadoEspecifico: [
      'Estaca de haste com um nó enraíza em água em poucas semanas — é a planta mais fácil de multiplicar.',
      'Limpe a folha com pano úmido de vez em quando: o pó acumulado reduz a luz que ela recebe.',
    ],
    notaRecuperacao:
      'Jiboia esquecida se recupera bem: regue até sair água pelo furo do vaso e ela volta em ' +
      'um dia. Folha que já secou por inteiro não volta — corte a haste acima de um nó.',

    fotos: [
      {
        arquivo: 'jiboia-folha.jpg',
        mostra: 'folha',
        alt:
          'Folhas de Epipremnum aureum em forma de coracao, verdes e lustrosas, com manchas ' +
          'irregulares amarelas e creme.',
        autor: 'Joydeep',
        licenca: 'CC BY-SA 3.0',
        origem: 'https://commons.wikimedia.org/wiki/File:Epipremnum_aureum_31082012.jpg',
      },
    ],

    fontes: [
      {
        titulo: 'RHS — How to grow epipremnum',
        url: 'https://www.rhs.org.uk/plants/epipremnum/growing-guide',
      },
      {
        titulo: 'Penn State Extension — Pothos as a Houseplant',
        url: 'https://extension.psu.edu/pothos-as-a-houseplant',
      },
    ],
  },

  {
    slug: 'bambu-da-sorte',
    nomePopular: 'Bambu-da-sorte',
    nomeCientifico: 'Dracaena sanderiana',
    apelidos: ['lucky bamboo', 'bambu-da-fortuna', 'bambu chinês'],
    grupo: 'folhagem',

    criterioDeRega:
      'Depende de como ela vive. Na água, o cuidado não é regar e sim TROCAR a água toda ' +
      'semana, mantendo o nível cobrindo as raízes e ao menos 2,5 cm da haste. No ' +
      'substrato, regue quando o primeiro centímetro estiver seco ao dedo.',
    regaQuente: [7, 7],
    regaFria: [7, 10],
    toleranciaSeca: 'baixa',
    numerosDerivados: true,

    adubacaoQuente: [60, 60],
    adubacaoFria: null,
    notaAdubacao:
      'Na água, adubo líquido a um quarto da dose, a cada dois meses — mais que isso queima a ' +
      'raiz e esverdeia a água. No substrato, adubo comum uma vez por mês na estação quente.',

    luz:
      'Luz clara e indireta, de janela leste ou norte. Sol direto queima a folha e deixa ' +
      'manchas marrons. Gire o vaso toda semana para a touceira crescer pareja.',

    comoIdentificar: [
      'Hastes verdes, cilíndricas e marcadas por nós bem visíveis, quase sempre vendidas em ' +
        'grupo, amarradas ou trancadas.',
      'Folhas de um verde claro, alongadas e onduladas, saindo do topo e dos nós da haste.',
      'Vive com as hastes dentro de água, num vaso sem nenhum substrato — nenhum bambu de ' +
        'verdade faz isso.',
    ],
    confundidaCom: [
      {
        com: 'Bambu de verdade',
        diferenca:
          'Apesar do nome, não é bambu: é uma dracena. Bambu verdadeiro tem colmo lenhoso e oco, ' +
          'folha fina de gramínea, e não vive em água parada.',
      },
      {
        com: 'Dracena-de-madagascar',
        diferenca:
          'A dracena-de-madagascar tem folhas finíssimas e pontudas, em tufo no alto de um ' +
          'tronco fino. O bambu-da-sorte tem folha larga e haste com nós marcados.',
      },
    ],
    sinaisDeProblema: [
      {
        sinal: 'Pontas das folhas amarelas ou marrons',
        significado:
          'Quase sempre a água. A dracena é sensível a flúor e cloro da água de torneira; ' +
          'deixe a água descansar 24 horas num copo aberto antes de usar, ou use água filtrada.',
      },
      {
        sinal: 'Haste amarelando de baixo para cima',
        significado:
          'Grave: costuma ser apodrecimento e não tem volta. Corte a parte sadia acima do ' +
          'amarelo e enraíze de novo em água limpa.',
      },
      {
        sinal: 'Água turva ou com cheiro',
        significado:
          'Passou do ponto de trocar. Lave as pedras e o vaso, troque a água e volte ao ritmo semanal.',
      },
      {
        sinal: 'Folhas queimadas com manchas secas',
        significado: 'Sol direto. Afaste da janela ou filtre com uma cortina.',
      },
    ],
    cuidadoEspecifico: [
      'Na água, o nível precisa cobrir as raízes e ao menos 2,5 cm da haste — abaixo ' +
        'disso ela desidrata mesmo dentro do copo.',
      'Deixe a água de torneira descansar 24 horas antes de usar: o cloro evapora e a folha para ' +
        'de queimar na ponta.',
    ],
    notaRecuperacao:
      'Se o nível da água baixou e a haste enrugou, complete com água descansada e espere alguns ' +
      'dias. Haste que já amarelou não volta — o que se salva é a parte ainda verde, cortada ' +
      'acima de um nó e reenraizada.',
    avisoClimatico:
      'A troca semanal da água vale o ano todo, mas no calor brasileiro ela suja mais rápido. ' +
      'Água turva antes da semana pede troca antes, sem esperar o dia marcado.',

    fotos: [
      {
        arquivo: 'bambu-da-sorte-planta.jpg',
        mostra: 'planta',
        alt:
          'Hastes de Dracaena sanderiana dentro de um vidro com água, com nós visíveis ao longo ' +
          'do talo e folhas verdes saindo do topo.',
        autor: 'Just some student on the web',
        licenca: 'CC BY-SA 4.0',
        origem:
          'https://commons.wikimedia.org/wiki/File:A_trio_of_plantae_%22Dracaena_Sanderiana%22.jpg',
      },
    ],

    fontes: [
      {
        titulo: 'Clemson HGIC — How To Grow and Care for Lucky Bamboo (Dracaena sanderiana)',
        url: 'https://hgic.clemson.edu/how-to-grow-and-care-for-lucky-bamboo-dracaena-sanderiana/',
      },
      {
        titulo: 'Clemson HGIC — Dracaena (sensibilidade a flúor)',
        url: 'https://hgic.clemson.edu/factsheet/dracaena/',
      },
      {
        titulo: 'RHS — Houseplants for students (lucky bamboo)',
        url: 'https://www.rhs.org.uk/plants/types/houseplants/houseplants-for-students',
      },
    ],
  },

  {
    slug: 'rosa-do-deserto',
    nomePopular: 'Rosa-do-deserto',
    nomeCientifico: 'Adenium obesum',
    apelidos: ['adênio', 'desert rose', 'lírio-de-impala'],
    grupo: 'suculenta',

    criterioDeRega:
      'Deixe o substrato secar por completo entre uma rega e outra, e sinta o caudex — a base ' +
      'inchada do tronco. Firme significa que ainda há reserva; começando a ceder ao aperto, ' +
      'chegou a hora. Na dúvida, espere: ela morre de água, não de sede.',
    regaQuente: [7, 10],
    // No frio ela entra em dormência. A faixa larga existe porque o número real depende de a
    // planta ter perdido as folhas ou não — o que a nota de aviso explica.
    regaFria: [30, 60],
    toleranciaSeca: 'alta',
    numerosDerivados: true,

    adubacaoQuente: [14, 14],
    adubacaoFria: null,
    notaAdubacao:
      'Adubo líquido fraco a cada duas semanas só no calor, que é quando ela floresce. Na ' +
      'dormência, nenhum: adubar planta parada queima a raiz.',

    luz:
      'Sol direto, e quanto mais melhor — seis horas por dia no mínimo. É a única planta desta ' +
      'lista que quer o sol pleno da varanda. Com pouca luz ela sobrevive, mas não floresce.',

    comoIdentificar: [
      'Base do tronco inchada e lisa, em forma de garrafa — o caudex, onde ela guarda água.',
      'Flores grandes em forma de trombeta, rosa, vermelhas ou brancas, agrupadas na ponta dos ramos.',
      'Folhas grossas, lustrosas e arredondadas na ponta, agrupadas no alto dos galhos.',
    ],
    confundidaCom: [
      {
        com: 'Espirradeira (Nerium oleander)',
        diferenca:
          'São da mesma família e a flor lembra, mas a espirradeira é um arbusto de folha ' +
          'estreita e comprida, sem nenhum inchaço na base. A rosa-do-deserto tem o caudex.',
      },
      {
        com: 'Pachypodium',
        diferenca:
          'O pachypodium tem espinhos no tronco. A rosa-do-deserto é lisa — se tem espinho, ' +
          'não é ela.',
      },
    ],
    sinaisDeProblema: [
      {
        sinal: 'Caudex mole ou esponjoso ao aperto',
        significado:
          'Podridão por excesso de água, e é urgente. Pare de regar imediatamente. Base mole ' +
          'com cheiro costuma ser perda total.',
      },
      {
        sinal: 'Folhas amarelas caindo no começo do frio',
        significado:
          'Normal: é a dormência. Ela derruba folha e flor e descansa por alguns meses. Não ' +
          'é sinal para regar mais — é o contrário.',
      },
      {
        sinal: 'Nao floresce',
        significado: 'Luz insuficiente. Ela precisa de seis horas de sol direto para florir.',
      },
      {
        sinal: 'Folhas amarelando fora da estação fria',
        significado: 'Frio fora de hora, excesso de água, ou as duas coisas.',
      },
    ],
    cuidadoEspecifico: [
      'Substrato muito drenante, de cacto, e vaso com furo. Terra comum retém água demais para o caudex.',
      'A seiva é tóxica se ingerida: lave as mãos depois de podar.',
    ],
    notaRecuperacao:
      'Rosa-do-deserto seca demais enruga o caudex e derruba folha, e isso se reverte: uma rega ' +
      'normal e alguns dias de sol bastam. O que não se reverte é o caudex mole — por isso, na ' +
      'dúvida entre regar e esperar, espere.',
    avisoClimatico:
      'A dormência das fontes é de inverno subtropical de verdade, com a planta perdendo tudo por ' +
      'três a quatro meses. No inverno ameno de boa parte do Brasil ela costuma segurar as folhas ' +
      'e só desacelerar: se continuar com folha, mantenha uma rega esparsa em vez de suspender. ' +
      'Se derrubar tudo, vá para o limite alto da faixa fria.',

    fotos: [
      {
        arquivo: 'rosa-do-deserto-flor.jpg',
        mostra: 'flor',
        alt:
          'Flor de Adenium obesum com pétalas dobradas em degradê de rosa-escuro para branco, ' +
          'coberta de gotas de água, ao lado de folhas verdes e grossas.',
        autor: 'Timothy A. Gonsalves',
        licenca: 'CC BY-SA 4.0',
        origem:
          'https://commons.wikimedia.org/wiki/File:Double_Petal_Flower_Side_Front_Adenium_Obesum_Graft_Apr22_D72_23135-151_ZS_Pr.jpg',
      },
    ],

    fontes: [
      {
        titulo: 'UF/IFAS Gardening Solutions — Desert Rose',
        url: 'https://gardeningsolutions.ifas.ufl.edu/plants/ornamentals/desert-rose/',
      },
      {
        titulo: 'UF/IFAS EP474 — Florida Foliage House Plant Care: Adenium obesum',
        url: 'https://ask.ifas.ufl.edu/publication/EP474',
      },
    ],
  },
]
