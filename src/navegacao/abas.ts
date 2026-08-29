import { useEffect, useState } from 'react'

/**
 * As quatro abas da seção 8 do design.
 *
 * A ordem aqui é a ordem na barra: "Hoje" primeiro porque é a tela inicial e
 * o destino da notificação.
 */
export const ABAS = ['hoje', 'plantas', 'calendario', 'especies'] as const

export type Aba = (typeof ABAS)[number]

export const TITULOS: Record<Aba, string> = {
  hoje: 'Hoje',
  plantas: 'Minhas plantas',
  calendario: 'Calendário',
  especies: 'Espécies',
}

function abaDaUrl(): Aba {
  const alvo = window.location.hash.replace(/^#\/?/, '')
  return (ABAS as readonly string[]).includes(alvo) ? (alvo as Aba) : 'hoje'
}

/**
 * Aba atual, sincronizada com o hash da URL.
 *
 * Hash em vez de biblioteca de rotas porque a Etapa 7 precisa que a
 * notificação abra direto na aba "Hoje" — isso exige um endereço, não estado
 * em memória. Quando a Etapa 3 trouxer ficha de planta com identificador
 * próprio, aí sim vale reavaliar uma biblioteca de verdade.
 */
export function useAba() {
  const [aba, setAba] = useState<Aba>(abaDaUrl)

  useEffect(() => {
    const aoMudar = () => setAba(abaDaUrl())
    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])

  function irPara(destino: Aba) {
    window.location.hash = `/${destino}`
  }

  return { aba, irPara }
}
