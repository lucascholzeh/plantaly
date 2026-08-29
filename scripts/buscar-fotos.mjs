/**
 * Busca fotos candidatas no Wikimedia Commons e baixa para conferência.
 *
 * O script NÃO decide nada: ele traz candidatas para um diretório de
 * triagem. A escolha exige alguém olhar cada imagem e comparar com os
 * traços de identificação da ficha — acervo aberto contém foto identificada
 * errada, e metadado não conserta isso.
 *
 * Uso: node scripts/buscar-fotos.mjs <termo de busca> <prefixo> [quantidade]
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [termo, prefixo, quantidade = '4'] = process.argv.slice(2)

if (!termo || !prefixo) {
  console.error('Uso: node scripts/buscar-fotos.mjs <termo> <prefixo> [quantidade]')
  process.exit(1)
}

const TRIAGEM = 'fotos-triagem'
const AGENTE = 'Plantaly/0.1 (projeto pessoal; catalogo de plantas)'

mkdirSync(TRIAGEM, { recursive: true })

const busca = new URL('https://commons.wikimedia.org/w/api.php')
busca.search = new URLSearchParams({
  action: 'query',
  format: 'json',
  generator: 'search',
  gsrsearch: termo,
  gsrnamespace: '6',
  gsrlimit: quantidade,
  prop: 'imageinfo',
  iiprop: 'url|extmetadata',
  iiurlwidth: '1000',
}).toString()

const resposta = await fetch(busca, { headers: { 'User-Agent': AGENTE } })
const dados = await resposta.json()
const paginas = Object.values(dados.query?.pages ?? {})

if (paginas.length === 0) {
  console.error(`Nenhuma foto encontrada para "${termo}"`)
  process.exit(1)
}

const semTags = (html) =>
  (html ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Baixa uma imagem, conferindo que é mesmo imagem.
 *
 * O Wikimedia responde com uma pagina HTML de erro quando limita a taxa, e
 * gravar isso como .jpg produz um arquivo que parece foto ate alguem tentar
 * abrir. Verificar o content-type é o que impede lixo de entrar no catalogo.
 */
async function baixar(...urls) {
  for (const url of urls) {
    if (!url) continue
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      const resposta = await fetch(url, { headers: { 'User-Agent': AGENTE } })
      const tipo = resposta.headers.get('content-type') ?? ''

      if (resposta.ok && tipo.startsWith('image/')) {
        return Buffer.from(await resposta.arrayBuffer())
      }
      // Limite de taxa: esperar cresce a cada tentativa.
      await espera(1500 * (tentativa + 1))
    }
  }
  return null
}

const catalogo = []

for (const [indice, pagina] of paginas.entries()) {
  const info = pagina.imageinfo[0]
  const meta = info.extmetadata ?? {}
  const nome = `${prefixo}-${indice + 1}.jpg`

  const bytes = await baixar(info.thumburl, info.url)
  if (!bytes) {
    console.log(`${nome}  PULADA (o servidor nao devolveu imagem)`)
    continue
  }
  writeFileSync(join(TRIAGEM, nome), bytes)

  const registro = {
    arquivo: nome,
    titulo: pagina.title.replace(/^File:/, ''),
    autor: semTags(meta.Artist?.value) || 'desconhecido',
    licenca: semTags(meta.LicenseShortName?.value) || 'ver origem',
    origem: info.descriptionurl,
    kb: Math.round(bytes.length / 1024),
  }
  catalogo.push(registro)

  console.log(`${nome}  ${registro.kb} kB  ${registro.licenca}`)
  console.log(`   ${registro.titulo}`)
  console.log(`   ${registro.autor}`)

  // O Wikimedia limita rajadas; um respiro entre downloads evita o bloqueio.
  await espera(800)
}

writeFileSync(join(TRIAGEM, `${prefixo}.json`), JSON.stringify(catalogo, null, 2))
