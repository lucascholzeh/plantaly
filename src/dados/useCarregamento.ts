import { useCallback, useEffect, useState } from 'react'

interface Estado<T> {
  dados: T | null
  carregando: boolean
  erro: string | null
  recarregar: () => void
}

/**
 * Carregamento assíncrono com erro visível.
 *
 * O ponto principal é o `erro`: a seção 12 do design exige que falha vire
 * mensagem clara com ação de repetir, nunca tela branca nem silêncio.
 */
export function useCarregamento<T>(buscar: () => Promise<T>, chaves: unknown[] = []): Estado<T> {
  const [dados, setDados] = useState<T | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [versao, setVersao] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const executar = useCallback(buscar, chaves)

  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    setErro(null)

    executar()
      .then((resultado) => {
        // Sem esta guarda, uma resposta lenta de uma tela já abandonada
        // sobrescreve o estado da tela atual.
        if (!cancelado) setDados(resultado)
      })
      .catch((e: unknown) => {
        if (!cancelado) setErro(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => {
      cancelado = true
    }
  }, [executar, versao])

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])

  return { dados, carregando, erro, recarregar }
}
