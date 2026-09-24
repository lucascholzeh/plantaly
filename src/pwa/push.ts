import { supabase } from '../lib/supabase'
import { estaInstalado } from './instalacao'
import { decidirReconciliacao } from './reconciliacao'

/**
 * Inscrição de push.
 *
 * No iOS isto só funciona com o app instalado na Tela de Início — e mesmo
 * assim é a parte mais frágil do projeto. O app inteiro continua correto
 * sem push: a aba "Hoje" é a rede de segurança.
 */

const CHAVE_PUBLICA = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

/**
 * A chave VAPID trafega em base64url; a API do navegador exige bytes.
 *
 * Devolve `ArrayBuffer` e não `Uint8Array` de propósito: `applicationServerKey`
 * pede `BufferSource`, e desde o TypeScript 5.7 um `Uint8Array` genérico não
 * satisfaz esse tipo.
 */
function paraBytes(base64url: string): ArrayBuffer {
  const preenchimento = '='.repeat((4 - (base64url.length % 4)) % 4)
  const base64 = (base64url + preenchimento).replace(/-/g, '+').replace(/_/g, '/')
  const binario = window.atob(base64)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return bytes.buffer
}

export type EstadoDoPush =
  | 'indisponivel'
  | 'precisa-instalar'
  | 'sem-chave'
  | 'sem-worker'
  | 'negado'
  | 'desativado'
  | 'ativo'

/**
 * Chave do "Agora não" do convite. Mora aqui, e não no convite, porque a
 * reconciliação também precisa apagá-la — ver `reconciliarInscricao`.
 */
export const CHAVE_CONVITE_DISPENSADO = 'plantaly:convite-push-dispensado'

function suportaPush(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/**
 * `serviceWorker.ready` nunca rejeita: se nenhum worker assumir o controle,
 * ela fica pendurada para sempre e a tela trava em "Verificando…". O limite
 * transforma esse silêncio numa resposta.
 */
function registroComLimite(): Promise<ServiceWorkerRegistration | null> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
  ])
}

/** Reconciliação da abertura, enquanto não termina. Ver `estadoDoPush`. */
let reconciliacaoEmCurso: Promise<void> | null = null

export async function estadoDoPush(): Promise<EstadoDoPush> {
  if (!suportaPush()) return 'indisponivel'
  // No iOS a API existe mas falha fora da Tela de Início. Melhor dizer o que
  // falta do que deixar a pessoa tocar num botão que não funciona.
  if (!estaInstalado()) return 'precisa-instalar'
  if (!CHAVE_PUBLICA) return 'sem-chave'
  if (Notification.permission === 'denied') return 'negado'

  // A reconciliação da abertura pode estar trocando a inscrição agora mesmo.
  // Ler antes dela terminar mostraria "ativo" para uma inscrição que está
  // prestes a ser descartada.
  if (reconciliacaoEmCurso) await reconciliacaoEmCurso

  const registro = await registroComLimite()
  if (!registro) return 'sem-worker'

  const assinatura = await registro.pushManager.getSubscription()
  return assinatura ? 'ativo' : 'desativado'
}

/**
 * Grava a inscrição do aparelho no banco.
 *
 * `endpoint` é único: reinscrever o mesmo aparelho atualiza em vez de
 * duplicar, e uma pessoa com iPhone e iPad tem duas linhas legítimas.
 */
async function gravarInscricao(assinatura: PushSubscription): Promise<void> {
  const dados = assinatura.toJSON()
  const { data: sessao } = await supabase.auth.getUser()
  if (!sessao.user) throw new Error('Sem sessão ativa')

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: sessao.user.id,
      endpoint: assinatura.endpoint,
      p256dh: dados.keys!.p256dh,
      auth_key: dados.keys!.auth,
      failure_count: 0,
    },
    { onConflict: 'endpoint' },
  )
  if (error) throw new Error(`Não consegui salvar a inscrição: ${error.message}`)
}

function inscrever(registro: ServiceWorkerRegistration): Promise<PushSubscription> {
  return registro.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: paraBytes(CHAVE_PUBLICA!),
  })
}

/**
 * Pede permissão e grava a inscrição.
 *
 * Só deve ser chamada a partir de um toque do usuário e depois de haver ao
 * menos uma planta: pedir permissão numa tela vazia é o caminho mais curto
 * para um "Não permitir" que o iOS não deixa reverter com facilidade.
 */
export async function ativarPush(): Promise<EstadoDoPush> {
  if (!CHAVE_PUBLICA) return 'sem-chave'

  const permissao = await Notification.requestPermission()
  if (permissao !== 'granted') return permissao === 'denied' ? 'negado' : 'desativado'

  const registro = await navigator.serviceWorker.ready
  await gravarInscricao(await inscrever(registro))
  return 'ativo'
}

export async function desativarPush(): Promise<void> {
  const registro = await navigator.serviceWorker.ready
  const assinatura = await registro.pushManager.getSubscription()
  if (!assinatura) return

  await supabase.from('push_subscriptions').delete().eq('endpoint', assinatura.endpoint)
  await assinatura.unsubscribe()
}

/**
 * Reconcilia o que o aparelho tem com o que o banco tem. Roda a cada
 * abertura do app — ver `App.tsx`.
 *
 * Inscrição pode morrer sem avisar: a Apple responde 404/410, a Edge Function
 * apaga a linha, e o aparelho continua guardando a inscrição morta. Antes
 * desta função o app seguia mostrando "ativo" e a pessoa simplesmente parava
 * de receber — foi o que aconteceu com uma das contas em setembro de 2026.
 *
 * Aqui a inscrição morta é descartada e uma nova é criada e gravada, sem
 * pedir nada a ninguém. Se o iPhone recusar criar a nova fora de um toque, o
 * "Agora não" do convite é esquecido: a pessoa já tinha escolhido receber, e
 * o convite na aba "Hoje" é o jeito de ela religar com um toque.
 */
export function reconciliarInscricao(): Promise<void> {
  reconciliacaoEmCurso ??= reconciliar().finally(() => {
    reconciliacaoEmCurso = null
  })
  return reconciliacaoEmCurso
}

async function reconciliar(): Promise<void> {
  if (!suportaPush() || !estaInstalado() || !CHAVE_PUBLICA) return

  const registro = await registroComLimite()
  if (!registro) return
  const antiga = await registro.pushManager.getSubscription()

  let temNoBanco: boolean | null = null
  if (antiga) {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', antiga.endpoint)
      .maybeSingle()
    temNoBanco = error ? null : data !== null
  }

  const decisao = decidirReconciliacao({
    permissao: Notification.permission,
    temNoAparelho: antiga !== null,
    temNoBanco,
  })
  if (decisao === 'nada' || !antiga) return

  // Descartar antes de criar: com a antiga ainda presa ao worker, o
  // `subscribe` devolveria o mesmo endpoint morto.
  await antiga.unsubscribe()
  try {
    await gravarInscricao(await inscrever(registro))
  } catch {
    try {
      window.localStorage.removeItem(CHAVE_CONVITE_DISPENSADO)
    } catch {
      // Sem armazenamento o convite já aparece de qualquer jeito.
    }
  }
}
