/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, NetworkOnly } from 'workbox-strategies'

/**
 * Service worker do Plantaly.
 *
 * Escrito à mão (estratégia `injectManifest`) em vez de gerado, porque o
 * gerador não permite acrescentar o tratamento de `push` — e sem ele a
 * notificação chega ao aparelho e não aparece na tela.
 */

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

/**
 * Assume o controle assim que a versão nova instala.
 *
 * O modo `injectManifest` não injeta isto sozinho — só o `generateSW` faz. Sem
 * as duas chamadas o worker novo instala e fica parado em `waiting` para
 * sempre, esperando todas as abas fecharem. No app da Tela de Início do
 * iPhone isso praticamente nunca acontece: fechar por gesto não encerra o
 * cliente. O resultado era um deploy que nunca chegava ao aparelho, e o
 * `registerType: 'autoUpdate'` esperando por um `activated` que não vinha.
 */
self.skipWaiting()
clientsClaim()

// Dados: rede primeiro, cache como rede de segurança. O contrário mostraria
// a rega de ontem como se fosse de hoje.
registerRoute(
  ({ url }) => url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/rest/v1/'),
  new NetworkFirst({
    cacheName: 'dados-plantaly',
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 })],
  }),
)

// Autenticação nunca vem do cache: token vencido em cache produz sessão
// fantasma, que é pior que erro de rede.
registerRoute(
  ({ url }) => url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/auth/'),
  new NetworkOnly(),
)

interface CargaDeLembrete {
  titulo: string
  corpo: string
  url: string
}

self.addEventListener('push', (evento) => {
  if (!evento.data) return

  let carga: CargaDeLembrete
  try {
    carga = evento.data.json()
  } catch {
    // Notificação sem corpo legível não pode virar silêncio: o iOS revoga a
    // permissão de quem recebe push e não mostra nada.
    carga = { titulo: 'Plantaly', corpo: 'Suas plantas precisam de você.', url: '/#/hoje' }
  }

  evento.waitUntil(
    self.registration.showNotification(carga.titulo, {
      body: carga.corpo,
      icon: '/icone-192.png',
      badge: '/icone-192.png',
      data: { url: carga.url },
      // Uma notificação por dia substitui a anterior em vez de empilhar.
      tag: 'plantaly-lembrete',
      renotify: true,
    } as NotificationOptions),
  )
})

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  const destino = (evento.notification.data?.url as string | undefined) ?? '/#/hoje'

  evento.waitUntil(
    (async () => {
      const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      // Se o app já está aberto, foca em vez de abrir uma segunda instância.
      for (const janela of janelas) {
        if ('focus' in janela) {
          await janela.focus()
          await janela.navigate(destino).catch(() => {})
          return
        }
      }
      await self.clients.openWindow(destino)
    })(),
  )
})

self.addEventListener('message', (evento) => {
  if (evento.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
