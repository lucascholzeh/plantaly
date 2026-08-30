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
  | { tipo: 'aba'; aba: Aba }
  | { tipo: 'nova-planta'; especie?: string }
  | { tipo: 'planta'; id: string }
  | { tipo: 'especie'; slug: string }
  | { tipo: 'ajustes' }

export function rotaDaUrl(hash: string = window.location.hash): Rota {
  const caminho = hash.replace(/^#\/?/, '')

  // `plantas/nova?especie=phalaenopsis` — a espécie escolhida no catálogo
  // viaja pelo endereço, então o botão "Tenho essa planta" é um link comum.
  const nova = /^plantas\/nova(?:\?(.*))?$/.exec(caminho)
  if (nova) {
    const especie = new URLSearchParams(nova[1] ?? '').get('especie')
    return especie ? { tipo: 'nova-planta', especie } : { tipo: 'nova-planta' }
  }

  const planta = /^plantas\/(.+)$/.exec(caminho)
  if (planta) return { tipo: 'planta', id: planta[1] }

  if (caminho === 'ajustes') return { tipo: 'ajustes' }

  const especie = /^especies\/(.+)$/.exec(caminho)
  if (especie) return { tipo: 'especie', slug: especie[1] }

  return {
    tipo: 'aba',
    aba: (ABAS as readonly string[]).includes(caminho) ? (caminho as Aba) : 'hoje',
  }
}

/** A aba que deve aparecer marcada na barra, para qualquer rota. */
export function abaDaRota(rota: Rota): Aba {
  if (rota.tipo === 'aba') return rota.aba
  return rota.tipo === 'especie' ? 'especies' : 'plantas'
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
    const aoMudar = () => {
      setRota(rotaDaUrl())
      // Tela nova começa no topo. Sem isto, abrir uma ficha a partir de uma
      // lista rolada abre a ficha no meio: o navegador mantém o offset, e
      // como as duas telas são longas ele cabe nas duas. O nome da planta
      // ficava acima da dobra.
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])

  return rota
}
