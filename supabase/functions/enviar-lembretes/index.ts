/**
 * Envia os lembretes diários.
 *
 * Chamada de hora em hora pelo `pg_cron` (migração 0006). A cada execução
 * seleciona os usuários cuja hora local configurada bate com o momento,
 * consulta a view `plant_status` e envia **uma notificação por pessoa** —
 * não uma por planta. Três notificações seguidas às 8h da manhã é o caminho
 * mais curto para alguém desligar as notificações do app.
 *
 * Duas notificações por manhã, por decisão do Lucas em 2026-08-30:
 *
 * 1. **A da rega.** Com pendência, uma das 40 variações; sem pendência, uma
 *    das variações calmas ("nada para regar hoje"). Ao contrário de antes,
 *    dia calmo agora também notifica.
 * 2. **A da frase.** Uma frase existencialista de livro, a mesma que o box
 *    da aba "Hoje" mostra naquele dia — ver `escolha.ts`.
 *
 * As duas levam `tag` diferente. Com a mesma tag a segunda substituiria a
 * primeira na tela do iPhone, e só uma seria lida.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'
import { montarMensagem, montarMensagemCalma, type Pendencia } from './variacoes.ts'
import { escolherFrase } from './escolha.ts'

const URL_SUPABASE = Deno.env.get('SUPABASE_URL')!
const CHAVE_SERVICO = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLICA = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVADA = Deno.env.get('VAPID_PRIVATE_KEY')!
const CONTATO = Deno.env.get('VAPID_CONTATO') ?? 'mailto:plantaly@example.com'

webpush.setVapidDetails(CONTATO, VAPID_PUBLICA, VAPID_PRIVADA)

// A chave de serviço ignora o RLS. É legítimo aqui — o agendador precisa
// enxergar todas as contas — e é por isso que esta chave nunca sai do
// ambiente da função.
const supabase = createClient(URL_SUPABASE, CHAVE_SERVICO, {
  auth: { persistSession: false },
})

/** Hora atual (0-23) no fuso informado. */
function horaLocal(fuso: string): number {
  const formatada = new Intl.DateTimeFormat('en-GB', {
    timeZone: fuso,
    hour: '2-digit',
    hour12: false,
  }).format(new Date())
  return Number(formatada)
}

interface Inscricao {
  id: string
  endpoint: string
  p256dh: string
  auth_key: string
}

/**
 * Envia uma notificação para todos os aparelhos de uma pessoa.
 *
 * Extraído porque agora há duas por manhã e o tratamento de inscrição morta
 * é idêntico nas duas — duplicá-lo era a forma mais provável de as duas
 * divergirem no tratamento de erro.
 *
 * `tag` separa as notificações na tela: com a mesma tag, a segunda substitui
 * a primeira e a pessoa só vê uma.
 */
async function enviarPara(
  inscricoes: Inscricao[],
  mensagem: { titulo: string; corpo: string },
  tag: string,
  relatorio: { enviados: number; removidos: number },
): Promise<void> {
  const carga = JSON.stringify({ ...mensagem, url: '/#/hoje', tag })

  for (const inscricao of inscricoes) {
    try {
      await webpush.sendNotification(
        {
          endpoint: inscricao.endpoint,
          keys: { p256dh: inscricao.p256dh, auth: inscricao.auth_key },
        },
        carga,
      )
      await supabase
        .from('push_subscriptions')
        .update({ last_success_at: new Date().toISOString(), failure_count: 0 })
        .eq('id', inscricao.id)
      relatorio.enviados++
    } catch (erro) {
      const codigo = (erro as { statusCode?: number }).statusCode
      // 404 e 410 significam inscrição morta: o ícone foi apagado ou o
      // aparelho trocou. Guardar não adianta — o app reoferece na próxima
      // abertura.
      if (codigo === 404 || codigo === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', inscricao.id)
        relatorio.removidos++
      } else {
        // Falha temporária: conta e tenta de novo amanhã. Sem fila de
        // reenvio — lembrete de rega atrasado em horas não tem valor.
        const { data: atual } = await supabase
          .from('push_subscriptions')
          .select('failure_count')
          .eq('id', inscricao.id)
          .single()
        await supabase
          .from('push_subscriptions')
          .update({ failure_count: (atual?.failure_count ?? 0) + 1 })
          .eq('id', inscricao.id)
      }
    }
  }
}

/** O dia de calendário no fuso informado — o mesmo que o app calcula. */
function diaLocal(fuso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

Deno.serve(async (requisicao) => {
  // Só o agendador chama esta função. Sem esta checagem, qualquer pessoa
  // com a URL dispararia notificações para todo mundo.
  const segredo = Deno.env.get('SEGREDO_AGENDADOR')
  if (segredo && requisicao.headers.get('x-agendador') !== segredo) {
    return new Response('não autorizado', { status: 401 })
  }

  const { data: perfis, error: erroPerfis } = await supabase
    .from('profiles')
    .select('id, time_zone, notification_hour, ultima_variacao, ultima_variacao_calma')

  if (erroPerfis) {
    return Response.json({ erro: erroPerfis.message }, { status: 500 })
  }

  const naHora = (perfis ?? []).filter((perfil) => {
    try {
      return horaLocal(perfil.time_zone) === perfil.notification_hour
    } catch {
      // Fuso inválido no perfil não pode derrubar o envio dos outros.
      return false
    }
  })

  const relatorio = {
    candidatos: naHora.length,
    enviados: 0,
    diasCalmos: 0,
    frasesEnviadas: 0,
    removidos: 0,
  }

  for (const perfil of naHora) {
    const { data: status } = await supabase
      .from('plant_status')
      .select('nickname, situacao_rega, situacao_adubacao, dias_de_atraso_rega')
      .eq('user_id', perfil.id)

    const pendencias = (status ?? []).filter((linha) => {
      const regaPendente =
        linha.situacao_rega === 'atrasada' ||
        linha.situacao_rega === 'atencao' ||
        linha.situacao_rega === 'vence-hoje'

      // Adubação só entra se a rega estiver em dia: a regra cruzada da
      // seção 6 vale também na notificação.
      const adubacaoPendente =
        !regaPendente &&
        (linha.situacao_adubacao === 'atrasada' || linha.situacao_adubacao === 'vence-hoje')

      return regaPendente || adubacaoPendente
    })

    const { data: inscricoes } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth_key')
      .eq('user_id', perfil.id)

    // Sem aparelho inscrito não há o que enviar — e as duas gravações de
    // "última variação" abaixo marcariam textos que ninguém viu, gastando
    // variações à toa.
    if (!inscricoes || inscricoes.length === 0) continue

    // ---------------------------------------------------- 1. a da rega
    if (pendencias.length === 0) {
      // Dia calmo agora também notifica. Antes, era o caso de não enviar
      // nada.
      const calma = montarMensagemCalma(perfil.ultima_variacao_calma ?? null)
      await supabase
        .from('profiles')
        .update({ ultima_variacao_calma: calma.variacao })
        .eq('id', perfil.id)
      await enviarPara(inscricoes, calma, 'plantaly-rega', relatorio)
      relatorio.diasCalmos++
    } else {
      // O sorteio exclui a variação da véspera: ver `variacoes.ts`.
      const mensagem = montarMensagem(pendencias as Pendencia[], perfil.ultima_variacao ?? null)

      // Grava antes de enviar. Se o envio falhar, o pior caso é pular uma
      // variação; se gravasse depois, uma falha parcial repetiria o texto
      // amanhã — que é justamente o que a coluna existe para evitar.
      await supabase
        .from('profiles')
        .update({ ultima_variacao: mensagem.variacao })
        .eq('id', perfil.id)
      await enviarPara(inscricoes, mensagem, 'plantaly-rega', relatorio)
    }

    // --------------------------------------------------- 2. a da frase
    // Nada é gravado aqui: a escolha é determinística a partir do dia e do
    // id, e é exatamente isso que faz o box do app mostrar esta mesma
    // frase. Ver `escolha.ts`.
    let dia: string
    try {
      dia = diaLocal(perfil.time_zone)
    } catch {
      // Fuso inválido já foi filtrado em `naHora`, mas se chegasse aqui a
      // frase não pode derrubar o envio dos outros.
      continue
    }
    const frase = escolherFrase(dia, perfil.id)
    await enviarPara(
      inscricoes,
      { titulo: 'Frase do dia', corpo: `"${frase.texto}" — ${frase.autor}` },
      'plantaly-frase',
      relatorio,
    )
    relatorio.frasesEnviadas++
  }

  return Response.json(relatorio)
})
