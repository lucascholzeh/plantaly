import { supabase } from '../lib/supabase'

/**
 * Fotos das plantas do usuário.
 *
 * O bucket é privado (migração 0007), então exibir exige URL assinada — não
 * há endereço estável que possa ser guardado em `photo_path`. O que fica no
 * banco é o caminho; a URL nasce aqui, com prazo, e é trocada antes de vencer.
 */

/** Lado maior da imagem depois da redução, em pixels. */
const LADO_MAXIMO = 1200

/**
 * Qualidade do JPEG.
 *
 * 0.85 é onde a foto de celular para de perder detalhe visível e o arquivo
 * ainda cai de ~4 MB para ~200 kB. Acima disso o ganho é imperceptível numa
 * tela de telefone e o upload no 4G fica lento.
 */
const QUALIDADE = 0.85

const HORA = 60 * 60

export const TAMANHO_MAXIMO = 3 * 1024 * 1024

export const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

function erro(contexto: string, mensagem: string): never {
  throw new Error(`${contexto}: ${mensagem}`)
}

/**
 * Reduz e recomprime a imagem antes de enviar.
 *
 * Uma foto do iPhone tem 3 a 5 MB e ~4000 px de lado. Enviar isso para
 * aparecer num balão de 56 px desperdiça o 4G do usuário na subida e a
 * banda dele de novo a cada listagem. `createImageBitmap` decodifica fora da
 * thread principal, o que evita travar a interface com o arquivo grande.
 *
 * O HEIC do iPhone é convertido pelo próprio Safari ao decodificar; o
 * resultado sai JPEG como qualquer outro.
 */
export async function prepararFoto(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo)

  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height))
  const largura = Math.round(bitmap.width * escala)
  const altura = Math.round(bitmap.height * escala)

  const tela = document.createElement('canvas')
  tela.width = largura
  tela.height = altura

  const contexto = tela.getContext('2d')
  if (!contexto) erro('Não consegui preparar a foto', 'o navegador não deu um contexto de canvas')

  contexto.drawImage(bitmap, 0, 0, largura, altura)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolver) =>
    tela.toBlob(resolver, 'image/jpeg', QUALIDADE),
  )
  if (!blob) erro('Não consegui preparar a foto', 'o navegador não gerou a imagem reduzida')

  return blob
}

/**
 * Caminho da foto no bucket.
 *
 * A primeira pasta é o id do dono, e é isso que as políticas do 0007
 * comparam com `auth.uid()`. Mudar este formato sem mudar o RLS junto abre
 * as fotos de uma conta para a outra.
 */
function caminhoDa(userId: string, plantaId: string): string {
  return `${userId}/${plantaId}.jpg`
}

/**
 * Envia a foto e devolve o caminho gravado.
 *
 * `upsert` porque trocar a foto reusa o mesmo caminho: sem isso, cada troca
 * deixaria um arquivo órfão no bucket, e o caminho antigo continuaria válido.
 */
export async function enviarFoto(plantaId: string, arquivo: File): Promise<string> {
  const { data: sessao } = await supabase.auth.getUser()
  if (!sessao.user) erro('Não consegui enviar a foto', 'sem sessão ativa')

  const imagem = await prepararFoto(arquivo)
  const caminho = caminhoDa(sessao.user.id, plantaId)

  const { error } = await supabase.storage
    .from('fotos-plantas')
    .upload(caminho, imagem, { contentType: 'image/jpeg', upsert: true })

  if (error) erro('Não consegui enviar a foto', error.message)

  const { error: erroBanco } = await supabase
    .from('plants')
    .update({ photo_path: caminho })
    .eq('id', plantaId)

  if (erroBanco) erro('A foto subiu, mas não consegui salvá-la na planta', erroBanco.message)

  // A URL assinada do caminho antigo continuaria servindo a imagem anterior
  // até vencer; descartar aqui faz a troca aparecer na hora.
  ASSINADAS.delete(caminho)

  return caminho
}

/**
 * Remove a foto da planta.
 *
 * Apaga o arquivo e limpa a coluna. Se o arquivo já não existir, o `remove`
 * não reclama — o que importa é a coluna terminar nula, senão a tela ficaria
 * tentando assinar um caminho morto.
 */
export async function removerFoto(plantaId: string, caminho: string): Promise<void> {
  const { error } = await supabase.storage.from('fotos-plantas').remove([caminho])
  if (error) erro('Não consegui remover a foto', error.message)

  ASSINADAS.delete(caminho)

  const { error: erroBanco } = await supabase
    .from('plants')
    .update({ photo_path: null })
    .eq('id', plantaId)

  if (erroBanco) erro('A foto foi apagada, mas não consegui atualizar a planta', erroBanco.message)
}

interface Assinada {
  url: string
  expiraEm: number
}

/**
 * Cache das URLs assinadas, por caminho.
 *
 * Sem ele, cada renderização da lista assinaria de novo todas as fotos — uma
 * ida ao servidor por planta, a cada troca de aba. Guardar em memória basta:
 * a URL vence, e persistir uma credencial temporária em disco só criaria
 * chance de vazá-la.
 */
const ASSINADAS = new Map<string, Assinada>()

/** Renova com folga: uma URL prestes a vencer quebraria a imagem na tela. */
const FOLGA = 5 * 60 * 1000

/**
 * URL temporária para exibir a foto de uma planta do usuário.
 *
 * Nome distinto do `urlDaFoto` do catálogo de propósito: aquele resolve uma
 * imagem embutida no bundle e responde na hora; este assina um arquivo
 * privado no Storage e é assíncrono.
 *
 * Devolve nulo em vez de lançar: foto que não carrega degrada para a inicial
 * do apelido, e derrubar a lista inteira por causa de uma imagem seria a
 * troca errada.
 */
export async function urlDaFotoDaPlanta(caminho: string): Promise<string | null> {
  const guardada = ASSINADAS.get(caminho)
  if (guardada && guardada.expiraEm - FOLGA > Date.now()) return guardada.url

  const { data, error } = await supabase.storage
    .from('fotos-plantas')
    .createSignedUrl(caminho, HORA)

  if (error || !data) return null

  ASSINADAS.set(caminho, { url: data.signedUrl, expiraEm: Date.now() + HORA * 1000 })
  return data.signedUrl
}

/**
 * Assina vários caminhos de uma vez.
 *
 * A lista de plantas precisa de todas as URLs juntas; pedir uma a uma faria
 * N idas ao servidor a cada abertura da aba.
 */
export async function urlsDasFotos(caminhos: string[]): Promise<Map<string, string>> {
  const mapa = new Map<string, string>()
  const faltando: string[] = []

  for (const caminho of caminhos) {
    const guardada = ASSINADAS.get(caminho)
    if (guardada && guardada.expiraEm - FOLGA > Date.now()) {
      mapa.set(caminho, guardada.url)
    } else {
      faltando.push(caminho)
    }
  }

  if (faltando.length > 0) {
    const { data } = await supabase.storage.from('fotos-plantas').createSignedUrls(faltando, HORA)

    for (const item of data ?? []) {
      // `path` volta nulo quando aquele caminho específico falhou; os
      // demais continuam válidos, então a falha é por foto, não por lista.
      if (!item.signedUrl || !item.path) continue
      ASSINADAS.set(item.path, { url: item.signedUrl, expiraEm: Date.now() + HORA * 1000 })
      mapa.set(item.path, item.signedUrl)
    }
  }

  return mapa
}
