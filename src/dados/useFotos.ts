import { useEffect, useState } from 'react'
import { urlsDasFotos } from './fotos'
import type { PlantaComStatus } from './tipos'

/**
 * Assina as fotos de uma lista de plantas de uma vez só.
 *
 * O bucket é privado (migração 0007): cada foto precisa de uma URL
 * temporária. Deixar cada balão pedir a sua faria uma ida ao servidor por
 * planta a cada abertura da aba — daí a assinatura em lote, com o resultado
 * entregue pronto para o componente.
 *
 * Devolve um mapa de caminho para URL. Caminho ausente do mapa significa
 * foto que não pôde ser assinada, e o balão cai na inicial do apelido.
 */
export function useFotosAssinadas(plantas: PlantaComStatus[] | null): Map<string, string> {
  const [fotos, setFotos] = useState<Map<string, string>>(new Map())

  // `Boolean` em vez de `!== null`: a coluna chega `undefined` num banco sem
  // a migração 0007, e assinar `undefined` viraria erro na chamada em lote.
  const caminhos = (plantas ?? [])
    .map(({ planta }) => planta.photo_path)
    .filter((caminho): caminho is string => Boolean(caminho))

  /**
   * Depende dos caminhos, não do array.
   *
   * Recarregar a lista devolve objetos novos a cada registro de rega; usar
   * o array como dependência reassinaria todas as fotos toda vez, sem
   * nenhuma delas ter mudado.
   */
  const chave = caminhos.join('|')

  useEffect(() => {
    // Lista sem nenhuma foto não precisa assinar nada, e o mapa vazio já é
    // o estado inicial — zerá-lo aqui seria uma renderização à toa.
    if (chave === '') return

    let ativo = true
    urlsDasFotos(chave.split('|')).then((mapa) => {
      if (ativo) setFotos(mapa)
    })
    return () => {
      ativo = false
    }
  }, [chave])

  return fotos
}
