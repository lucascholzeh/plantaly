/**
 * Envia os lembretes diários.
 *
 * Chamada de hora em hora pelo `pg_cron` (migração 0006). A cada execução
 * seleciona os usuários cuja hora local configurada bate com o momento,
 * consulta a view `plant_status` e envia **uma notificação por pessoa** —
 * não uma por planta. Três notificações seguidas às 8h da manhã é o caminho
 * mais curto para alguém desligar as notificações do app.
 *
 * Nada vencendo, nada enviado. Nenhum "tudo em dia!" diário.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

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

interface Pendencia {
  nickname: string
  situacao_rega: string
  situacao_adubacao: string | null
}

function montarMensagem(pendencias: Pendencia[]): { titulo: string; corpo: string } {
  const nomes = pendencias.map((p) => p.nickname)
  const quantidade = nomes.length

  const titulo =
    quantidade === 1
      ? '1 planta precisa de você hoje'
      : `${quantidade} plantas precisam de você hoje`

  // Lista até três nomes; além disso a notificação vira parágrafo e o iOS
  // trunca do mesmo jeito.
  const corpo =
    quantidade <= 3 ? nomes.join(', ') : `${nomes.slice(0, 3).join(', ')} e mais ${quantidade - 3}`

  return { titulo, corpo }
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
    .select('id, time_zone, notification_hour')

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

  const relatorio = { candidatos: naHora.length, enviados: 0, semPendencia: 0, removidos: 0 }

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

    if (pendencias.length === 0) {
      relatorio.semPendencia++
      continue
    }

    const { data: inscricoes } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth_key')
      .eq('user_id', perfil.id)

    const { titulo, corpo } = montarMensagem(pendencias as Pendencia[])
    const carga = JSON.stringify({ titulo, corpo, url: '/#/hoje' })

    for (const inscricao of inscricoes ?? []) {
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

  return Response.json(relatorio)
})
