/**
 * Cria as duas contas descartáveis usadas pelo teste de isolamento e grava
 * as credenciais no `.env`.
 *
 * Reexecutável: se as contas do `.env` já existirem e entrarem, não cria
 * outras. Só use em projeto de desenvolvimento — ele cadastra usuários de
 * verdade no Supabase.
 *
 * Exige "Confirm email" desligado no painel, senão o cadastro não devolve
 * sessão e o teste não consegue entrar.
 */
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const CAMINHO_ENV = '.env'

function lerEnv() {
  const texto = readFileSync(CAMINHO_ENV, 'utf8')
  const valores = {}
  for (const linha of texto.split(/\r?\n/)) {
    const achado = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(linha)
    if (achado) valores[achado[1]] = achado[2]
  }
  return { texto, valores }
}

function gravarEnv(texto, novos) {
  let saida = texto
  for (const [chave, valor] of Object.entries(novos)) {
    const padrao = new RegExp(`^\\s*${chave}\\s*=.*$`, 'm')
    saida = padrao.test(saida)
      ? saida.replace(padrao, `${chave}=${valor}`)
      : `${saida}\n${chave}=${valor}`
  }
  writeFileSync(CAMINHO_ENV, saida)
}

const { texto, valores } = lerEnv()
const url = valores.VITE_SUPABASE_URL
const anon = valores.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.')
  process.exit(1)
}

const cliente = () =>
  createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })

/** Entra se já existir; cadastra se não. Devolve as credenciais em uso. */
async function garantirConta(rotulo, emailExistente, senhaExistente) {
  if (emailExistente && senhaExistente) {
    const { data, error } = await cliente().auth.signInWithPassword({
      email: emailExistente,
      password: senhaExistente,
    })
    if (!error) {
      console.log(`  ${rotulo}: conta existente reaproveitada (${emailExistente})`)
      return { email: emailExistente, senha: senhaExistente, id: data.user.id }
    }
  }

  const email = `plantaly-teste-${rotulo}-${randomBytes(4).toString('hex')}@example.com`
  const senha = randomBytes(16).toString('base64url')

  const { data, error } = await cliente().auth.signUp({ email, password: senha })
  if (error) throw new Error(`Cadastro de ${rotulo} falhou: ${error.message}`)
  if (!data.session) {
    throw new Error(
      `A conta ${rotulo} foi criada mas exige confirmação por e-mail. ` +
        'No painel: Authentication -> Sign In / Providers -> Email -> desligue "Confirm email".',
    )
  }

  console.log(`  ${rotulo}: conta criada (${email})`)
  return { email, senha, id: data.user.id }
}

console.log('Criando contas de teste...')
const a = await garantirConta('a', valores.TESTE_USUARIO_A_EMAIL, valores.TESTE_USUARIO_A_SENHA)
const b = await garantirConta('b', valores.TESTE_USUARIO_B_EMAIL, valores.TESTE_USUARIO_B_SENHA)

if (a.id === b.id) throw new Error('As duas contas apontam para o mesmo usuário.')

// Confere o gatilho de perfil da migração 0003: sem perfil, o agendador da
// Etapa 7 não sabe o fuso nem a hora da notificação.
console.log('\nConferindo o gatilho de perfil...')
for (const [rotulo, conta] of [
  ['a', a],
  ['b', b],
]) {
  const c = cliente()
  await c.auth.signInWithPassword({ email: conta.email, password: conta.senha })
  const { data, error } = await c.from('profiles').select('id, time_zone, notification_hour')
  if (error) throw new Error(`Não consegui ler o perfil de ${rotulo}: ${error.message}`)
  if (data.length !== 1 || data[0].id !== conta.id) {
    throw new Error(
      `A conta ${rotulo} deveria enxergar exatamente 1 perfil (o dela), mas viu ${data.length}. ` +
        'Verifique se as migrações 0002 (RLS) e 0003 (gatilho) foram aplicadas.',
    )
  }
  console.log(`  ${rotulo}: perfil ok (${data[0].time_zone}, ${data[0].notification_hour}h)`)
  await c.auth.signOut()
}

gravarEnv(texto, {
  TESTE_USUARIO_A_EMAIL: a.email,
  TESTE_USUARIO_A_SENHA: a.senha,
  TESTE_USUARIO_B_EMAIL: b.email,
  TESTE_USUARIO_B_SENHA: b.senha,
})

console.log('\nCredenciais gravadas no .env. Rode `npm test`.')
