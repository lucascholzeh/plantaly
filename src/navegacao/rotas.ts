import { useEffect, useState } from 'react'
import { ABAS, type Aba } from './abas'

/**
 * Rotas do app, sobre o hash da URL.
 *
 * Continua sem biblioteca de rotas: são cinco formatos, e o hash já dá o
 * endereço de que a Etapa 7 precisa para a notificação abrir direto na aba
 * "Hoje". Se um dia surgirem rotas aninhadas ou parâmetros de verdade, aí
 * sim vale trocar.
 */
export type Rota =
  { tipo: 'aba'; aba: Aba } | { tipo: 'nova-planta' } | { tipo: 'planta'; id: string }

export function rotaDaUrl(hash: string = window.location.hash): Rota {
  const caminho = hash.replace(/^#\/?/, '')

  if (caminho === 'plantas/nova') return { tipo: 'nova-planta' }

  const planta = /^plantas\/(.+)$/.exec(caminho)
  if (planta) return { tipo: 'planta', id: planta[1] }

  return {
    tipo: 'aba',
    aba: (ABAS as readonly string[]).includes(caminho) ? (caminho as Aba) : 'hoje',
  }
}

/** A aba que deve aparecer marcada na barra, para qualquer rota. */
export function abaDaRota(rota: Rota): Aba {
  return rota.tipo === 'aba' ? rota.aba : 'plantas'
}

export function irPara(destino: string): void {
  window.location.hash = `/${destino}`
}

export function voltar(): void {
  window.history.back()
}

export function useRota(): Rota {
  const [rota, setRota] = useState<Rota>(() => rotaDaUrl())

  useEffect(() => {
    const aoMudar = () => setRota(rotaDaUrl())
    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])

  return rota
}
