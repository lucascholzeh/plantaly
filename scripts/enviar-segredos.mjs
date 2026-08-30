/**
 * Envia os segredos da Edge Function para o Supabase.
 *
 * Lê do `.env` e chama a CLI, para os valores não precisarem ser copiados à
 * mão nem aparecerem em terminal, histórico ou conversa. Envia só os três
 * que a função usa — nada de despejar o `.env` inteiro no servidor.
 *
 * Exige `npx supabase login` e `npx supabase link` feitos antes.
 *
 * Uso: npm run segredos
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

function lerEnv() {
  const valores = {}
  for (const linha of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const achado = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(linha)
    if (achado) valores[achado[1]] = achado[2].trim()
  }
  return valores
}

const env = lerEnv()

/**
 * De onde cada segredo da função sai no `.env`.
 *
 * A chave pública é a mesma que o frontend usa (com prefixo VITE_), mas do
 * lado da função ela se chama sem prefixo — o `VITE_` só existe para o Vite
 * decidir o que entra no bundle.
 */
const MAPA = [
  ['VAPID_PUBLIC_KEY', 'VITE_VAPID_PUBLIC_KEY'],
  ['VAPID_PRIVATE_KEY', 'VAPID_PRIVATE_KEY'],
  ['SEGREDO_AGENDADOR', 'SEGREDO_AGENDADOR'],
]

const faltando = MAPA.filter(([, origem]) => !env[origem]).map(([, origem]) => origem)
if (faltando.length > 0) {
  console.error(`Faltam no .env: ${faltando.join(', ')}`)
  process.exit(1)
}

const pares = MAPA.map(([destino, origem]) => `${destino}=${env[origem]}`)

// O contato VAPID vai no cabeçalho enviado ao serviço de push da Apple.
// Um endereço real ajuda se eles precisarem avisar sobre algum problema.
if (env.VAPID_CONTATO) pares.push(`VAPID_CONTATO=${env.VAPID_CONTATO}`)

console.log('Enviando 3 segredos para a Edge Function…')
for (const [destino] of MAPA) console.log(`  ${destino}`)

try {
  execFileSync('npx', ['supabase', 'secrets', 'set', ...pares], {
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: true,
  })
  console.log('\nPronto. Confira com: npx supabase secrets list')
} catch {
  console.error(
    '\nFalhou. Rode antes, no seu terminal:\n' +
      '  npx supabase login\n' +
      '  npx supabase link --project-ref liyinztcybkzzfloyozh',
  )
  process.exit(1)
}
