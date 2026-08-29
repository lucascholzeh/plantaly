/**
 * Gera os ícones do PWA a partir de um SVG.
 *
 * Rodado sob demanda, não na build: os PNGs ficam versionados. Regerar só é
 * necessário quando a marca mudar.
 *
 * Uso: node scripts/gerar-icones.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const SAIDA = 'public'
const VERDE = '#356B41'
const CLARO = '#E9EFE4'

/**
 * A marca: uma flor de cinco pétalas com um ramo, no mesmo traço dos motivos
 * do sistema visual. Traço, não preenchimento — combina com o resto do app.
 */
function marca({ fundo, tinta, padding }) {
  const escala = 1 - padding * 2
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${fundo}"/>
  <g transform="translate(${512 * padding} ${512 * padding}) scale(${escala})"
     fill="none" stroke="${tinta}" stroke-width="24"
     stroke-linecap="round" stroke-linejoin="round">

    <!-- Flor no topo. As pétalas param em y=80; nada de folha entra aqui. -->
    <g transform="translate(256 170)">
      ${[0, 72, 144, 216, 288]
        .map((grau) => `<path d="M0 -26 C -46 -92, 46 -92, 0 -26 Z" transform="rotate(${grau})"/>`)
        .join('')}
      <circle cx="0" cy="0" r="20"/>
    </g>

    <!-- Haste, começando abaixo da flor. -->
    <path d="M256 250 L256 452"/>

    <!-- Folhas laterais, bem separadas da flor. -->
    <path d="M256 372 C 186 366, 146 326, 138 268 C 202 274, 244 316, 256 372 Z"/>
    <path d="M256 318 C 326 312, 366 272, 374 214 C 310 220, 268 262, 256 318 Z"/>
  </g>
</svg>`
}

mkdirSync(SAIDA, { recursive: true })

/** Ícone comum: marca clara sobre o verde da identidade. */
const comum = Buffer.from(marca({ fundo: VERDE, tinta: CLARO, padding: 0.12 }))

/**
 * Ícone maskable: o Android recorta em círculo, e a área segura é só os 80%
 * centrais. Padding maior evita a marca ser decepada.
 */
const mascarado = Buffer.from(marca({ fundo: VERDE, tinta: CLARO, padding: 0.22 }))

const tarefas = [
  { entrada: comum, nome: 'icone-192.png', tamanho: 192 },
  { entrada: comum, nome: 'icone-512.png', tamanho: 512 },
  { entrada: mascarado, nome: 'icone-mascarado-512.png', tamanho: 512 },
  // O iOS ignora o manifest para o ícone da tela de início e usa este.
  // Também não respeita transparência, por isso o fundo é sólido.
  { entrada: comum, nome: 'apple-touch-icon.png', tamanho: 180 },
]

for (const tarefa of tarefas) {
  const png = await sharp(tarefa.entrada)
    .resize(tarefa.tamanho, tarefa.tamanho)
    .png({ compressionLevel: 9 })
    .toBuffer()
  writeFileSync(`${SAIDA}/${tarefa.nome}`, png)
  console.log(`${tarefa.nome}  ${tarefa.tamanho}px  ${Math.round(png.length / 1024)} kB`)
}

writeFileSync(`${SAIDA}/favicon.svg`, marca({ fundo: VERDE, tinta: CLARO, padding: 0.12 }))
console.log('favicon.svg')
