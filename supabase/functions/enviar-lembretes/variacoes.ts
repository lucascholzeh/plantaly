/**
 * As 40 variações de texto da notificação diária.
 *
 * Uma é sorteada por envio. O objetivo é que a notificação não vire ruído:
 * o mesmo texto toda manhã às 8h deixa de ser lido em duas semanas, e
 * notificação que ninguém lê é notificação que alguém desliga.
 *
 * Três regras valem para todas:
 *
 * 1. **O nome da planta aparece inteiro, e só no corpo.** Os apelidos são
 *    compostos ("Orquídea do Buba"), e no iPhone o título trunca por volta
 *    de 40 caracteres enquanto o corpo tem duas linhas. Nome no título
 *    viraria "Orquídea do…" na Tela de Bloqueio.
 *
 * 2. **Cada variação declara o que exige.** Um texto que cita dias de
 *    atraso só é elegível quando existe atraso de verdade; um que separa
 *    adubação só entra quando há adubação pendente. Sem isso o sorteio
 *    escreveria "3 dias sem água" para uma planta regada ontem — e um
 *    número errado uma vez custa a confiança em todos os outros.
 *
 * 3. **Nada de string fixa.** Singular e plural, "e mais 1" e "e mais 2",
 *    tudo varia com a quantidade. Por isso cada variação é função.
 */

export interface Pendencia {
  nickname: string
  situacao_rega: string
  situacao_adubacao: string | null
  dias_de_atraso_rega: number
}

export interface Mensagem {
  titulo: string
  corpo: string
}

export interface Variacao {
  /** Identidade estável, guardada no perfil. Reordenar a lista não pode mudar o significado. */
  nome: string
  tom: 'carinhosa' | 'direta' | 'normal' | 'engracada'
  /** Só é sorteada quando há pelo menos uma planta com atraso de 1+ dia. */
  precisaDeAtraso?: boolean
  /** Só é sorteada quando há adubação pendente e rega pendente ao mesmo tempo. */
  precisaDeAdubacao?: boolean
  /** Só é sorteada com pelo menos esta quantidade de plantas. */
  minimoDePlantas?: number
  texto: (c: Contexto) => Mensagem
}

/**
 * O que as variações têm à disposição, já calculado.
 *
 * Calcular uma vez aqui evita que 40 funções repitam a mesma contagem — e
 * evita que duas delas discordem sobre o que é "atrasada".
 */
export interface Contexto {
  /** Todas as pendências do dia, rega e adubação. */
  pendencias: Pendencia[]
  quantidade: number
  /** Nomes, na ordem em que vieram do banco. */
  nomes: string[]
  /** Plantas cuja pendência é rega. */
  nomesRega: string[]
  /** Plantas cuja pendência é adubação (só quando a rega está em dia). */
  nomesAdubacao: string[]
  /** A planta com maior atraso, quando existe alguma atrasada. */
  maisAtrasada: Pendencia | null
  /** Dias de atraso da mais atrasada. Zero quando ninguém está atrasado. */
  maiorAtraso: number
}

/** "A", "A e B", "A, B e C", "A, B, C e mais 2". */
function listar(nomes: string[], maximo = 3): string {
  if (nomes.length === 0) return ''
  if (nomes.length === 1) return nomes[0]
  if (nomes.length <= maximo) {
    return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`
  }
  const restante = nomes.length - maximo
  return `${nomes.slice(0, maximo).join(', ')} e mais ${restante}`
}

/** "1 planta" / "3 plantas". */
function plantas(n: number): string {
  return n === 1 ? '1 planta' : `${n} plantas`
}

/** "1 dia" / "3 dias". */
function dias(n: number): string {
  return n === 1 ? '1 dia' : `${n} dias`
}

export const VARIACOES: Variacao[] = [
  // ---------------------------------------------------------------- carinhosas
  {
    nome: 'carinhosa-bom-dia',
    tom: 'carinhosa',
    texto: (c) => ({
      titulo: 'Bom dia 🌸',
      corpo:
        c.quantidade === 1
          ? `${c.nomes[0]} está com sede. Cinco minutinhos e ela fica feliz.`
          : `${listar(c.nomes)} estão com sede. Cinco minutinhos e elas ficam felizes.`,
    }),
  },
  {
    nome: 'carinhosa-sentiram-falta',
    tom: 'carinhosa',
    minimoDePlantas: 2,
    texto: (c) => ({
      titulo: 'Suas meninas sentiram sua falta',
      corpo: `${listar(c.nomes)} esperando por você hoje.`,
    }),
  },
  {
    nome: 'carinhosa-paciente',
    tom: 'carinhosa',
    precisaDeAtraso: true,
    texto: (c) => ({
      titulo: 'Hora de cuidar 💧',
      corpo: `${c.maisAtrasada!.nickname} te espera desde ontem. Ela é paciente, mas nem tanto.`,
    }),
  },
  {
    nome: 'carinhosa-cafune',
    tom: 'carinhosa',
    texto: (c) => ({
      titulo: 'Um cafuné nas plantas?',
      corpo:
        c.quantidade === 1
          ? `${c.nomes[0]} pede água hoje.`
          : `${listar(c.nomes)} pedem um pouco de atenção hoje.`,
    }),
  },
  {
    nome: 'carinhosa-amores',
    tom: 'carinhosa',
    texto: (c) => ({
      titulo:
        c.quantidade === 1 ? '1 amor precisa de você' : `${c.quantidade} amores precisam de você`,
      corpo: `${listar(c.nomes)}. Nada urgente — só carinho e água.`,
    }),
  },
  {
    nome: 'carinhosa-acordaram',
    tom: 'carinhosa',
    texto: (c) => ({
      titulo: 'Elas acordaram te esperando',
      corpo: `${listar(c.nomes)} na fila do carinho de hoje.`,
    }),
  },
  {
    nome: 'carinhosa-cinco-minutos',
    tom: 'carinhosa',
    texto: (c) => ({
      titulo: 'Cinco minutinhos? 🌱',
      corpo:
        c.quantidade === 1
          ? `É tudo que ${c.nomes[0]} precisa hoje.`
          : `É tudo que ${listar(c.nomes)} precisam hoje.`,
    }),
  },
  {
    nome: 'carinhosa-com-carinho',
    tom: 'carinhosa',
    texto: (c) => ({
      titulo: 'Alguém aqui quer água',
      corpo: `${listar(c.nomes)}, com todo o carinho, ${c.quantidade === 1 ? 'pede' : 'pedem'} a rega de hoje.`,
    }),
  },
  {
    nome: 'carinhosa-cantinho-verde',
    tom: 'carinhosa',
    texto: (c) => ({
      titulo: 'Seu cantinho verde chama',
      corpo: `${listar(c.nomes)} ${c.quantidade === 1 ? 'espera' : 'esperam'} sua visita.`,
    }),
  },
  {
    nome: 'carinhosa-mimo',
    tom: 'carinhosa',
    texto: (c) => ({
      titulo: 'Dia de mimo 🌷',
      corpo: `${listar(c.nomes)} ${c.quantidade === 1 ? 'está pronta' : 'estão prontas'} pra ser ${c.quantidade === 1 ? 'cuidada' : 'cuidadas'}.`,
    }),
  },

  // ------------------------------------------------------------------- diretas
  {
    nome: 'direta-atencao',
    tom: 'direta',
    texto: (c) => ({
      titulo: `${plantas(c.quantidade)} ${c.quantidade === 1 ? 'precisa' : 'precisam'} da sua atenção`,
      corpo: `Dia de rega: ${listar(c.nomes)}.`,
    }),
  },
  {
    nome: 'direta-com-atraso',
    tom: 'direta',
    precisaDeAtraso: true,
    texto: (c) => ({
      titulo: 'Rega pendente',
      corpo: `${c.maisAtrasada!.nickname} (${dias(c.maiorAtraso)} de atraso)${
        c.quantidade > 1 ? ` e mais ${c.quantidade - 1}.` : '.'
      }`,
    }),
  },
  {
    nome: 'direta-rega-e-adubacao',
    tom: 'direta',
    precisaDeAdubacao: true,
    texto: (c) => ({
      titulo: `Rega: ${c.nomesRega.length} · Adubação: ${c.nomesAdubacao.length}`,
      corpo: `Regar: ${listar(c.nomesRega)}. Adubar: ${listar(c.nomesAdubacao)}.`,
    }),
  },
  {
    nome: 'direta-atrasada',
    tom: 'direta',
    precisaDeAtraso: true,
    texto: (c) => ({
      titulo: `${plantas(c.quantidade)} ${c.quantidade === 1 ? 'atrasada' : 'na lista'}`,
      corpo: `${c.maisAtrasada!.nickname} — ${dias(c.maiorAtraso)} sem rega.`,
    }),
  },
  {
    nome: 'direta-checklist-cuidados',
    tom: 'direta',
    precisaDeAdubacao: true,
    texto: (c) => ({
      titulo: 'Cuidados de hoje',
      corpo: `Regar: ${listar(c.nomesRega)}. Adubar: ${listar(c.nomesAdubacao)}.`,
    }),
  },
  {
    nome: 'direta-rega-do-dia',
    tom: 'direta',
    texto: (c) => ({
      titulo: 'Rega do dia',
      corpo: `${listar(c.nomes)}.`,
    }),
  },
  {
    nome: 'direta-passaram-do-ponto',
    tom: 'direta',
    precisaDeAtraso: true,
    minimoDePlantas: 2,
    texto: (c) => ({
      titulo: `Atenção: ${plantas(c.quantidade)}`,
      corpo: `${listar(c.nomes)} passaram do ponto.`,
    }),
  },
  {
    nome: 'direta-checklist',
    tom: 'direta',
    texto: (c) => ({
      titulo: 'Checklist de hoje',
      corpo: `${listar(c.nomes)}.`,
    }),
  },
  {
    nome: 'direta-vence-hoje',
    tom: 'direta',
    texto: (c) => ({
      titulo: 'Vence hoje',
      corpo: `${listar(c.nomes)} ${c.quantidade === 1 ? 'precisa' : 'precisam'} de cuidado ainda hoje.`,
    }),
  },
  {
    nome: 'direta-pendencias',
    tom: 'direta',
    texto: (c) => ({
      titulo: c.quantidade === 1 ? '1 pendência' : `${c.quantidade} pendências`,
      corpo: `${listar(c.nomes)}.`,
    }),
  },

  // -------------------------------------------------------------------- normais
  {
    nome: 'normal-para-hoje',
    tom: 'normal',
    texto: (c) => ({
      titulo: `${plantas(c.quantidade)} para hoje`,
      corpo: `${listar(c.nomes)} ${c.quantidade === 1 ? 'precisa' : 'precisam'} de cuidado.`,
    }),
  },
  {
    nome: 'normal-plantaly-hoje',
    tom: 'normal',
    texto: (c) => ({
      titulo: 'Plantaly · hoje',
      corpo: `${plantas(c.quantidade)} na lista: ${listar(c.nomes)}.`,
    }),
  },
  {
    nome: 'normal-toque-para-ver',
    tom: 'normal',
    texto: (c) => ({
      titulo: `${plantas(c.quantidade)} ${c.quantidade === 1 ? 'precisa' : 'precisam'} de você`,
      corpo: `${listar(c.nomes)}. Toque para ver o que cada uma pede.`,
    }),
  },
  {
    nome: 'normal-sua-rega',
    tom: 'normal',
    texto: (c) => ({
      titulo: 'Sua rega de hoje',
      corpo: `${listar(c.nomes)} esperando.`,
    }),
  },
  {
    nome: 'normal-cuidado-pendente',
    tom: 'normal',
    precisaDeAtraso: true,
    texto: (c) => ({
      titulo: `${plantas(c.quantidade)} com cuidado pendente`,
      corpo: `${c.maisAtrasada!.nickname} está atrasada há ${dias(c.maiorAtraso)}.`,
    }),
  },
  {
    nome: 'normal-lembrete',
    tom: 'normal',
    texto: (c) => ({
      titulo: 'Lembrete de rega',
      corpo: `${listar(c.nomes)} hoje.`,
    }),
  },
  {
    nome: 'normal-hora-das-plantas',
    tom: 'normal',
    texto: (c) => ({
      titulo: 'Hora das plantas',
      corpo: `${listar(c.nomes)}. Toque para ver a lista.`,
    }),
  },
  {
    nome: 'normal-tem-planta-esperando',
    tom: 'normal',
    texto: (c) => ({
      titulo: 'Tem planta esperando',
      corpo: `${listar(c.nomes)} ${c.quantidade === 1 ? 'precisa' : 'precisam'} de cuidado hoje.`,
    }),
  },
  {
    nome: 'normal-aba-hoje',
    tom: 'normal',
    texto: (c) => ({
      titulo: 'Cuidados pendentes',
      corpo: `${listar(c.nomes)} na aba Hoje.`,
    }),
  },
  {
    nome: 'normal-na-fila',
    tom: 'normal',
    texto: (c) => ({
      titulo: `${c.quantidade} na fila de hoje`,
      corpo: `${listar(c.nomes)}.`,
    }),
  },

  // ----------------------------------------------------------------- engraçadas
  {
    nome: 'engracada-julgando',
    tom: 'engracada',
    precisaDeAtraso: true,
    texto: (c) => ({
      titulo: 'Alguém está te julgando',
      corpo: `${c.maisAtrasada!.nickname}, ${dias(c.maiorAtraso)} sem água. Ela não vai esquecer.`,
    }),
  },
  {
    nome: 'engracada-reclamacao',
    tom: 'engracada',
    texto: (c) => ({
      titulo: 'Reclamação formal',
      corpo: `${listar(c.nomes)} ${c.quantidade === 1 ? 'abriu um chamado' : 'abriram um chamado'}. Assunto: sede.`,
    }),
  },
  {
    nome: 'engracada-reuniao',
    tom: 'engracada',
    minimoDePlantas: 2,
    texto: (c) => ({
      titulo: 'Suas plantas fizeram uma reunião',
      corpo: `Pauta única: água. ${listar(c.nomes)} presentes.`,
    }),
  },
  {
    nome: 'engracada-recado-da-janela',
    tom: 'engracada',
    texto: (c) => ({
      titulo: 'Recado da janela',
      corpo: `${c.nomes[0]}: "oi? alguém?"`,
    }),
  },
  {
    nome: 'engracada-boa-e-ruim',
    tom: 'engracada',
    precisaDeAtraso: true,
    texto: (c) => ({
      titulo: 'Notícia boa e notícia ruim',
      corpo: `A boa: só ${plantas(c.quantidade)} hoje. A ruim: ${c.maisAtrasada!.nickname} já está no dia ${c.maiorAtraso}.`,
    }),
  },
  {
    nome: 'engracada-motim',
    tom: 'engracada',
    texto: (c) => ({
      titulo: 'Motim no vaso',
      corpo: `${c.nomes[0]} lidera. Reivindicação: água.`,
    }),
  },
  {
    nome: 'engracada-sequestro',
    tom: 'engracada',
    texto: (c) => ({
      titulo: 'Isso é um sequestro',
      corpo: `${c.nomes[0]} exige uma rega e ninguém se machuca.`,
    }),
  },
  {
    nome: 'engracada-ultima-chamada',
    tom: 'engracada',
    precisaDeAtraso: true,
    texto: (c) => ({
      titulo: 'Última chamada ☎️',
      corpo: `${c.maisAtrasada!.nickname} tentou te ligar ${c.maiorAtraso === 1 ? '1 vez' : `${c.maiorAtraso} vezes`}. Sem sucesso.`,
    }),
  },
  {
    nome: 'engracada-relatorio',
    tom: 'engracada',
    texto: (c) => ({
      titulo: 'Relatório do dia',
      corpo: `${plantas(c.quantidade)} com sede, 0 desculpas aceitas. ${c.nomes[0]} lidera o ranking.`,
    }),
  },
  {
    nome: 'engracada-contando-os-dias',
    tom: 'engracada',
    precisaDeAtraso: true,
    texto: (c) => ({
      titulo: 'Elas estão contando os dias',
      corpo: `${c.maisAtrasada!.nickname} chegou no dia ${c.maiorAtraso} e está anotando.`,
    }),
  },
]

/** Monta o contexto uma vez, para as 40 variações consultarem. */
export function montarContexto(pendencias: Pendencia[]): Contexto {
  const nomesRega: string[] = []
  const nomesAdubacao: string[] = []

  for (const p of pendencias) {
    const regaPendente =
      p.situacao_rega === 'atrasada' ||
      p.situacao_rega === 'atencao' ||
      p.situacao_rega === 'vence-hoje'
    if (regaPendente) nomesRega.push(p.nickname)
    else nomesAdubacao.push(p.nickname)
  }

  // Só rega tem atraso relevante para o texto: adubação atrasada não é
  // urgência, e a view nem calcula nível de atenção para ela.
  const maisAtrasada = pendencias.reduce<Pendencia | null>((maior, p) => {
    if (!nomesRega.includes(p.nickname) || p.dias_de_atraso_rega <= 0) return maior
    return maior === null || p.dias_de_atraso_rega > maior.dias_de_atraso_rega ? p : maior
  }, null)

  return {
    pendencias,
    quantidade: pendencias.length,
    nomes: pendencias.map((p) => p.nickname),
    nomesRega,
    nomesAdubacao,
    maisAtrasada,
    maiorAtraso: maisAtrasada?.dias_de_atraso_rega ?? 0,
  }
}

/** As variações que podem ser usadas com os dados de hoje. */
export function elegiveis(contexto: Contexto): Variacao[] {
  return VARIACOES.filter((v) => {
    if (v.precisaDeAtraso && contexto.maiorAtraso === 0) return false
    if (
      v.precisaDeAdubacao &&
      (contexto.nomesAdubacao.length === 0 || contexto.nomesRega.length === 0)
    )
      return false
    if (v.minimoDePlantas && contexto.quantidade < v.minimoDePlantas) return false
    return true
  })
}

/**
 * Sorteia uma variação, evitando a última enviada.
 *
 * `aleatorio` é injetável para o teste poder cobrir a escolha sem depender
 * de sorte. A exclusão da última só vale quando sobra alternativa: com uma
 * única variação elegível, repetir é melhor que não notificar.
 */
export function sortear(
  contexto: Contexto,
  ultima: string | null,
  aleatorio: () => number = Math.random,
): Variacao {
  const disponiveis = elegiveis(contexto)
  const semRepetir = disponiveis.filter((v) => v.nome !== ultima)
  const conjunto = semRepetir.length > 0 ? semRepetir : disponiveis
  return conjunto[Math.floor(aleatorio() * conjunto.length)]
}

/** Sorteia e escreve a mensagem. Devolve o nome, para o perfil guardar. */
export function montarMensagem(
  pendencias: Pendencia[],
  ultima: string | null = null,
  aleatorio: () => number = Math.random,
): Mensagem & { variacao: string } {
  const contexto = montarContexto(pendencias)
  const escolhida = sortear(contexto, ultima, aleatorio)
  return { ...escolhida.texto(contexto), variacao: escolhida.nome }
}

/**
 * As variações de dia calmo — nenhuma planta pedindo nada.
 *
 * Antes, dia sem pendência era dia sem notificação. Agora a manhã tem
 * notificação sempre, e esta é a versão de quando não há o que fazer. O
 * texto precisa soar como boa notícia, não como aviso vazio: quem recebe
 * "nada para regar hoje" e sente que perdeu tempo abrindo, desliga.
 *
 * Sem interpolação de nomes: não há pendência, logo não há nome a citar. Por
 * isso são strings, e não funções como as outras.
 */
export const VARIACOES_CALMAS: { nome: string; titulo: string; corpo: string }[] = [
  {
    nome: 'calma-tudo-em-dia',
    titulo: 'Tudo em dia 🌿',
    corpo: 'Nenhuma planta precisa de água hoje. Aproveite a manhã.',
  },
  {
    nome: 'calma-nada-hoje',
    titulo: 'Nada para regar hoje',
    corpo: 'Suas plantas estão todas satisfeitas. Só apreciar.',
  },
  {
    nome: 'calma-folga',
    titulo: 'Dia de folga 🌱',
    corpo: 'Ninguém com sede por aqui. Volte amanhã.',
  },
  {
    nome: 'calma-satisfeitas',
    titulo: 'Todas satisfeitas',
    corpo: 'Nenhuma rega pendente hoje — seu jardim está em ordem.',
  },
  {
    nome: 'calma-sem-pendencia',
    titulo: 'Manhã tranquila',
    corpo: 'Nada vencendo hoje. Suas plantas agradecem o cuidado dos outros dias.',
  },
  {
    nome: 'calma-descanso',
    titulo: 'Sem tarefas 🌸',
    corpo: 'Nenhuma planta pede água hoje. Descanse — você está em dia.',
  },
]

/** Sorteia a mensagem de dia calmo, evitando a última enviada. */
export function montarMensagemCalma(
  ultima: string | null = null,
  aleatorio: () => number = Math.random,
): Mensagem & { variacao: string } {
  const semRepetir = VARIACOES_CALMAS.filter((v) => v.nome !== ultima)
  const conjunto = semRepetir.length > 0 ? semRepetir : VARIACOES_CALMAS
  const escolhida = conjunto[Math.floor(aleatorio() * conjunto.length)]
  return { titulo: escolhida.titulo, corpo: escolhida.corpo, variacao: escolhida.nome }
}
