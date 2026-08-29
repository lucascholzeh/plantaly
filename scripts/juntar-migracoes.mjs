/**
 * Junta as migrações numeradas num único arquivo colável no SQL Editor
 * do Supabase.
 *
 * O arquivo gerado não é versionado: versionado, envelheceria em silêncio
 * e alguém acabaria colando uma versão desatualizada. As migrações
 * numeradas continuam sendo a única verdade.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const PASTA = 'supabase/migrations'
const SAIDA = 'supabase/aplicar-tudo.sql'
const REGUA = '='.repeat(60)

// Argumento opcional: prefixo a partir do qual incluir. `0004` gera só da
// quarta migração em diante — necessário num banco que já foi migrado, onde
// recolar as anteriores daria erro de objeto já existente.
const desde = process.argv[2]

const arquivos = readdirSync(PASTA)
  .filter((nome) => nome.endsWith('.sql'))
  .sort()
  .filter((nome) => !desde || nome >= desde)

if (arquivos.length === 0) {
  console.error(`Nenhuma migração encontrada em ${PASTA}${desde ? ` a partir de ${desde}` : ''}`)
  process.exit(1)
}

const corpo = arquivos
  .map((nome) =>
    [`-- ${REGUA}`, `-- ${nome}`, `-- ${REGUA}`, '', readFileSync(join(PASTA, nome), 'utf8')].join(
      '\n',
    ),
  )
  .join('\n')

const cabecalho = [
  '-- Plantaly: todas as migrações, na ordem.',
  '-- Cole este arquivo inteiro no SQL Editor do Supabase e rode uma vez só.',
  '--',
  '-- Gerado por `npm run migracoes:juntar`. Não edite este arquivo:',
  '-- ele é descartável, as migrações numeradas são a verdade.',
  '',
  '',
].join('\n')

writeFileSync(SAIDA, cabecalho + corpo)
console.log(`${SAIDA} gerado a partir de ${arquivos.length} migrações:`)
for (const nome of arquivos) console.log(`  ${nome}`)
