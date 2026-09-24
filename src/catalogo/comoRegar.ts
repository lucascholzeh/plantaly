import type { Fonte } from './tipos'

/**
 * Como regar cada espécie: o gesto e a quantidade.
 *
 * O resto do catálogo responde **quando** regar. Este arquivo responde
 * **como** — a dúvida do Lucas em 2026-09-24: "sei o dia, mas não sei a
 * maneira certa de regar aquela espécie".
 *
 * **Quantidade nunca em mililitros.** O volume certo depende do tamanho do
 * vaso, e tamanho e material do vaso estão na tabela de fora de escopo do
 * design (seção 3): alongariam o cadastro por um chute pouco melhor. As fontes
 * também não falam em ml — falam em critério observável no próprio vaso ("até
 * escorrer pelo furo", "até a superfície ficar úmida"), que vale para vaso de
 * qualquer tamanho. É isso que `quanto` registra.
 *
 * **Quando a fonte da espécie não fala em volume**, a quantidade vem do guia
 * geral de rega de vasos da RHS — o mesmo para onde as fichas de espécie da
 * RHS mandam o leitor ("see our watering guides"). `quantoPelaRegraGeral`
 * marca esses casos, e a tela diz isso em vez de apresentar a regra geral
 * como se fosse específica. É o equivalente ao `numerosDerivados`.
 *
 * Mesma disciplina do catálogo: nada aqui sem fonte, e o que a fonte não diz
 * fica de fora — por isso `agua` e `noFrio` são opcionais.
 */

export interface ComoRegar {
  /** Uma linha para a aba "Hoje": o gesto, sem explicação. */
  resumo: string
  /** Quanta água, em critério observável no vaso. */
  quanto: string
  /** A quantidade veio do guia geral da RHS, não da fonte da espécie. */
  quantoPelaRegraGeral: boolean
  /** O gesto, em ordem. */
  passos: string[]
  /** Que água usar, quando a fonte diz. */
  agua?: string
  evitar: string[]
  /** Como a rega muda nos meses frios, quando a fonte diz. */
  noFrio?: string
  fontes: Fonte[]
}

export const GUIA_RHS_VASOS: Fonte = {
  titulo: 'RHS — How to water containers',
  url: 'https://www.rhs.org.uk/container-gardening/how-to-water-containers',
}

/** A quantidade do guia da RHS, dita do mesmo jeito em todo lugar. */
const ATE_ESCORRER =
  'Encha o vaso de água até a borda, deixe absorver e repita uma vez. Pare assim que a água ' +
  'começar a sair pelo furo — encharcar até transbordar só lava os nutrientes.'

/** Para planta sem espécie do catálogo: o guia geral da RHS, sem enfeite. */
export const REGA_GERAL: ComoRegar = {
  resumo: 'Devagar, até começar a escorrer',
  quanto: ATE_ESCORRER,
  quantoPelaRegraGeral: true,
  passos: [
    'Antes de regar, toque o substrato: se estiver úmido, espere.',
    'Regue devagar e perto do substrato, não sobre as folhas — a água que fica na folha não ' +
      'chega à raiz.',
    'Esvazie o prato algumas horas depois, para o substrato não ficar encharcado.',
  ],
  evitar: ['Regar por calendário sem conferir o substrato.'],
  fontes: [GUIA_RHS_VASOS],
}

export const COMO_REGAR: Record<string, ComoRegar> = {
  phalaenopsis: {
    resumo: 'Pouca água, e escorra bem',
    quanto:
      'Pouca. A RHS fala em regar "levemente", cerca de uma vez por semana na estação de ' +
      'crescimento, deixando todo o excesso escorrer.',
    quantoPelaRegraGeral: false,
    passos: [
      'Regue por cima, no substrato. Também serve segurar o vaso sob a torneira em fio fino, ou ' +
        'deixá-lo numa bacia com água.',
      'Deixe escorrer bem e esvazie o prato: a orquídea nunca pode ficar parada na água.',
      'A cada quatro regas, faça uma sem adubo, para lavar os sais acumulados no substrato.',
    ],
    agua: 'Morna, de preferência de chuva.',
    evitar: [
      'Respingar nas folhas ou deixar água no centro da planta, de onde saem as folhas.',
      'Deixar as raízes secarem por completo.',
    ],
    noFrio: 'Reduza um pouco a água, sem deixar as raízes secarem de vez.',
    fontes: [
      {
        titulo: 'RHS — Moth orchids (Phalaenopsis): growing guide',
        url: 'https://www.rhs.org.uk/plants/phalaenopsis/growing-guide',
      },
    ],
  },

  'lirio-da-paz': {
    resumo: 'Por cima, até começar a escorrer',
    quanto: ATE_ESCORRER,
    quantoPelaRegraGeral: true,
    passos: [
      'Espere a camada de cima do substrato secar.',
      'Regue devagar, no substrato, não nas folhas.',
      'Esvazie o prato algumas horas depois.',
      'A cada rega, gire o vaso um quarto de volta, para ela não crescer torta em direção à luz.',
    ],
    agua: 'De chuva ou filtrada: o flúor da água da torneira estraga as folhas.',
    evitar: [
      'Substrato encharcado — folha amarelando ou escurecendo também é sinal de água demais.',
    ],
    noFrio: 'Regue um pouco menos: o crescimento desacelera.',
    fontes: [
      {
        titulo: 'RHS — How to grow peace lilies',
        url: 'https://www.rhs.org.uk/plants/peace-lilies/how-to-grow-peace-lilies',
      },
      GUIA_RHS_VASOS,
    ],
  },

  'violeta-africana': {
    resumo: 'Por baixo: prato com água morna',
    quanto:
      'Deixe o vaso num prato com uns 2,5 cm de água até a superfície do substrato ficar úmida — ' +
      'cerca de 30 minutos. Depois tire e deixe escorrer.',
    quantoPelaRegraGeral: false,
    passos: [
      'Ponha o vaso num prato ou bacia com uns 2,5 cm de água morna.',
      'Quando a superfície do substrato estiver úmida, depois de uns 30 minutos, tire o vaso.',
      'Deixe o excesso escorrer: a violeta nunca pode ficar sentada na água.',
      'Se preferir regar por cima, use um bico fino (seringa ou bisnaga) e molhe só o substrato.',
    ],
    agua:
      'Em temperatura ambiente ou morna — água fria mancha as folhas. A fonte desaconselha água ' +
      'clorada, que é a da torneira: use de chuva ou filtrada.',
    evitar: [
      'Molhar as folhas: a gota fria deixa mancha marrom. Se molhar, sacuda as gotas.',
      'Regar no centro da planta — apodrece.',
      'Regar à noite.',
    ],
    noFrio: 'Um pouco menos de água.',
    fontes: [
      {
        titulo: 'University of Minnesota Extension — African violets',
        url: 'https://extension.umn.edu/houseplants/african-violets',
      },
      {
        titulo: 'Wisconsin Horticulture — African violets',
        url: 'https://hort.extension.wisc.edu/articles/african-violets/',
      },
    ],
  },

  kalanchoe: {
    resumo: 'Com o substrato seco, até escorrer',
    quanto: ATE_ESCORRER,
    quantoPelaRegraGeral: true,
    passos: ['Espere o substrato secar.', 'Regue devagar, no substrato.', 'Esvazie o prato.'],
    evitar: ['Água demais: apodrece caule e raiz.'],
    noFrio: 'Pouca água: a RHS pede rega moderada no crescimento e escassa no repouso.',
    fontes: [
      {
        titulo: 'RHS — Kalanchoe blossfeldiana',
        url: 'https://www.rhs.org.uk/plants/78810/kalanchoe-blossfeldiana/details',
      },
      {
        titulo: 'University of Illinois Extension — Kalanchoe',
        url: 'https://extension.illinois.edu/blogs/good-growing/2025-12-19-nontraditional-holiday-plant-kalanchoe',
      },
      GUIA_RHS_VASOS,
    ],
  },

  echeveria: {
    resumo: 'Farta, só com tudo seco',
    quanto:
      'Farta: regue até a água sair pelos furos do vaso, e descarte o que escorrer depois de ' +
      'alguns minutos.',
    quantoPelaRegraGeral: false,
    passos: [
      'Espere o substrato secar por completo.',
      'Regue bem, até sair água pelo furo.',
      'Depois de alguns minutos, jogue fora a água do prato.',
    ],
    agua: 'Morna, de preferência de chuva: os minerais da água da torneira se acumulam no substrato.',
    evitar: [
      'Regar de novo com o substrato ainda úmido.',
      'Vaso sem furo — a água presa apodrece a raiz.',
    ],
    noFrio: 'Só o bastante para as folhas não murcharem nem enrugarem.',
    fontes: [
      {
        titulo: 'RHS — Indoor cacti and succulents: growing guide',
        url: 'https://www.rhs.org.uk/plants/types/cacti-succulents/houseplants/growing-guide',
      },
      {
        titulo: 'University of Minnesota Extension — Cacti and succulents',
        url: 'https://extension.umn.edu/houseplants/cacti-and-succulents',
      },
    ],
  },

  anturio: {
    resumo: 'Com o dedo seco a 5 cm, até escorrer',
    quanto: ATE_ESCORRER,
    quantoPelaRegraGeral: true,
    passos: [
      'Enfie o dedo uns 5 cm no substrato: regue só se estiver quase seco.',
      'Regue devagar, no substrato.',
      'Esvazie o prato: o antúrio não pode ficar em substrato encharcado.',
    ],
    agua:
      'De chuva ou filtrada, em temperatura ambiente. Água dura da torneira é alcalina e ' +
      'prejudica esta planta de substrato ácido.',
    evitar: ['Regar demais ou com frequência demais: é a causa da podridão da raiz.'],
    fontes: [
      {
        titulo: 'RHS — How to grow anthuriums',
        url: 'https://www.rhs.org.uk/plants/anthuriums/how-to-grow-anthuriums',
      },
      GUIA_RHS_VASOS,
    ],
  },

  'espada-de-sao-jorge': {
    resumo: 'Pouca, fora do centro da roseta',
    quanto:
      'Pouca. A RHS pede errar para menos: molhe o substrato e pare assim que a água começar a ' +
      'sair pelo furo, sem repetir.',
    quantoPelaRegraGeral: true,
    passos: [
      'Enfie o dedo no substrato: regue só se estiver seco. Não regue por rotina.',
      'Regue por cima, no substrato, longe do centro da roseta.',
      'Jogue fora a água do prato ou do cachepô.',
      'A cada rega, gire o vaso um quarto de volta, para ela não entortar em direção à luz.',
    ],
    evitar: [
      'Rega generosa: ela parece tropical, mas vem de região seca.',
      'Vaso sem furo: a raiz apodrece.',
    ],
    noFrio: 'Quase nenhuma água, a não ser que ela esteja num lugar bem quente.',
    fontes: [
      {
        titulo: 'RHS — Sansevieria: growing guide',
        url: 'https://www.rhs.org.uk/plants/sansevieria/growing-guide',
      },
      {
        titulo: 'Penn State Extension — Snake plant',
        url: 'https://extension.psu.edu/snake-plant-a-forgiving-low-maintenance-houseplant',
      },
      GUIA_RHS_VASOS,
    ],
  },

  jiboia: {
    resumo: 'Com o topo seco, até escorrer',
    quanto:
      'Moderada: a RHS fala em regas "leves e regulares". Pare assim que a água começar a sair ' +
      'pelo furo.',
    quantoPelaRegraGeral: true,
    passos: [
      'Toque o substrato: regue só quando a camada de cima tiver secado.',
      'Regue devagar, no substrato.',
      'Não deixe o vaso parado na água do prato.',
    ],
    agua:
      'De chuva ou filtrada, em temperatura ambiente. Usar sempre água da torneira tira a acidez ' +
      'de que o substrato precisa.',
    evitar: ['Regar com o substrato ainda úmido: apodrece a raiz.'],
    fontes: [
      {
        titulo: 'RHS — Epipremnum: growing guide',
        url: 'https://www.rhs.org.uk/plants/epipremnum/growing-guide',
      },
      {
        titulo: 'Penn State Extension — Pothos as a houseplant',
        url: 'https://extension.psu.edu/pothos-as-a-houseplant',
      },
      GUIA_RHS_VASOS,
    ],
  },

  'bambu-da-sorte': {
    resumo: 'Na água: troque toda semana',
    quanto:
      'Na água, o nível cobre as raízes e ao menos 2,5 cm da haste. No substrato, regue e deixe ' +
      'escorrer bem.',
    quantoPelaRegraGeral: false,
    passos: [
      'Na água: mantenha as raízes e ao menos 2,5 cm da haste submersos, e troque a água toda ' +
        'semana.',
      'No substrato: regue quando os primeiros 2,5 cm estiverem secos, deixe escorrer bem e não ' +
        'deixe água no prato.',
    ],
    evitar: ['Deixar o nível da água baixar abaixo das raízes.'],
    fontes: [
      {
        titulo: 'Clemson HGIC — How to grow and care for lucky bamboo',
        url: 'https://hgic.clemson.edu/how-to-grow-and-care-for-lucky-bamboo-dracaena-sanderiana/',
      },
    ],
  },

  'rosa-do-deserto': {
    resumo: 'Com tudo seco, sem encharcar',
    quanto: ATE_ESCORRER,
    quantoPelaRegraGeral: true,
    passos: [
      'Espere o substrato secar por completo.',
      'Regue até começar a escorrer: o vaso precisa drenar.',
      'Esvazie o prato.',
    ],
    evitar: ['Água demais: leva à podridão da raiz.'],
    noFrio:
      'A fonte suspende a rega por 3 a 4 meses no inverno frio, para a planta descansar, e retoma ' +
      'quando esquenta. Veja o aviso sobre o clima brasileiro na ficha da espécie.',
    fontes: [
      {
        titulo: 'UF/IFAS — Adenium (EP474)',
        url: 'https://ask.ifas.ufl.edu/publication/EP474',
      },
      {
        titulo: 'UF/IFAS Gardening Solutions — Desert rose',
        url: 'https://gardeningsolutions.ifas.ufl.edu/plants/ornamentals/desert-rose/',
      },
      GUIA_RHS_VASOS,
    ],
  },
}

/** O bloco da espécie, ou a regra geral quando não há espécie do catálogo. */
export function comoRegar(slug: string | null): { rega: ComoRegar; geral: boolean } {
  const rega = slug ? COMO_REGAR[slug] : undefined
  return rega ? { rega, geral: false } : { rega: REGA_GERAL, geral: true }
}
