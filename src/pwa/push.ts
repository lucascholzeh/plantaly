import { supabase } from '../lib/supabase'
import { estaInstalado } from './instalacao'

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
  'indisponivel' | 'precisa-instalar' | 'sem-chave' | 'negado' | 'desativado' | 'ativo'

export async function estadoDoPush(): Promise<EstadoDoPush> {
  if (
    !('serviceWorker' in navigator) ||
    !('PushManager' in window) ||
    !('Notification' in window)
  ) {
    return 'indisponivel'
  }
  // No iOS a API existe mas falha fora da Tela de Início. Melhor dizer o que
  // falta do que deixar a pessoa tocar num botão que não funciona.
  if (!estaInstalado()) return 'precisa-instalar'
  if (!CHAVE_PUBLICA) return 'sem-chave'
  if (Notification.permission === 'denied') return 'negado'

  const registro = await navigator.serviceWorker.ready
  const assinatura = await registro.pushManager.getSubscription()
  return assinatura ? 'ativo' : 'desativado'
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
  const assinatura = await registro.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: paraBytes(CHAVE_PUBLICA),
  })

  const dados = assinatura.toJSON()
  const { data: sessao } = await supabase.auth.getUser()
  if (!sessao.user) throw new Error('Sem sessão ativa')

  // `endpoint` é único: reinscrever o mesmo aparelho atualiza em vez de
  // duplicar, e uma pessoa com iPhone e iPad tem duas linhas legítimas.
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
 * Reconcilia o que o navegador tem com o que o banco tem.
 *
 * Inscrição pode morrer sem avisar — o ícone foi apagado, o aparelho trocou.
 * Quando isso acontece o servidor remove a linha, e aqui o app percebe na
 * abertura seguinte e reoferece.
 */
export async function inscricaoRegistrada(): Promise<boolean> {
  const registro = await navigator.serviceWorker.ready
  const assinatura = await registro.pushManager.getSubscription()
  if (!assinatura) return false

  const { data } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('endpoint', assinatura.endpoint)
    .maybeSingle()

  return data !== null
}
