/**
 * Teste de isolamento entre contas.
 *
 * É o teste mais importante do projeto e roda antes de existir qualquer tela.
 * A chave anônima é pública por design — vai dentro do bundle que roda no
 * navegador. O que impede a conta do Lucas de enxergar as plantas da namorada
 * (e vice-versa) não é o segredo da chave, é o RLS de `0002_rls.sql`.
 *
 * Se este arquivo falhar, nada mais importa.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const URL = import.meta.env.VITE_SUPABASE_URL
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

const CONTAS = {
  a: {
    email: import.meta.env.TESTE_USUARIO_A_EMAIL,
    senha: import.meta.env.TESTE_USUARIO_A_SENHA,
  },
  b: {
    email: import.meta.env.TESTE_USUARIO_B_EMAIL,
    senha: import.meta.env.TESTE_USUARIO_B_SENHA,
  },
}

function novoCliente(): SupabaseClient {
  // Sessões separadas por cliente: sem isso, entrar como B derrubaria A.
  return createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function entrar(cliente: SupabaseClient, email: string, senha: string) {
  const login = await cliente.auth.signInWithPassword({ email, password: senha })
  if (!login.error) return login.data.user!

  const cadastro = await cliente.auth.signUp({ email, password: senha })
  if (cadastro.error) {
    throw new Error(`Nao foi possivel cadastrar ${email}: ${cadastro.error.message}`)
  }
  if (!cadastro.data.session) {
    throw new Error(
      `A conta ${email} foi criada mas exige confirmacao por e-mail, entao o teste ` +
        'nao consegue entrar. No painel do Supabase: Authentication -> Sign In / Providers -> ' +
        'Email -> desligue "Confirm email" enquanto o projeto esta em desenvolvimento.',
    )
  }
  return cadastro.data.user!
}

const configurado =
  URL && ANON && CONTAS.a.email && CONTAS.a.senha && CONTAS.b.email && CONTAS.b.senha

describe('isolamento entre contas (RLS)', () => {
  let clienteA: SupabaseClient
  let clienteB: SupabaseClient
  let clienteAnonimo: SupabaseClient
  let usuarioA: string
  let usuarioB: string
  let plantaDeA: string

  beforeAll(async () => {
    // Falha ruidosa de propósito: um teste de segurança que se ignora em
    // silêncio é pior que teste nenhum.
    if (!configurado) {
      throw new Error(
        'Credenciais de teste ausentes. Preencha no .env: TESTE_USUARIO_A_EMAIL, ' +
          'TESTE_USUARIO_A_SENHA, TESTE_USUARIO_B_EMAIL, TESTE_USUARIO_B_SENHA. ' +
          'Veja .env.example.',
      )
    }

    clienteA = novoCliente()
    clienteB = novoCliente()
    clienteAnonimo = novoCliente()

    usuarioA = (await entrar(clienteA, CONTAS.a.email, CONTAS.a.senha)).id
    usuarioB = (await entrar(clienteB, CONTAS.b.email, CONTAS.b.senha)).id

    expect(usuarioA).not.toBe(usuarioB)

    const criada = await clienteA
      .from('plants')
      .insert({
        user_id: usuarioA,
        nickname: 'Orquidea de teste',
        species_label: 'Phalaenopsis',
        water_interval_warm: 8,
        water_interval_cold: 15,
      })
      .select('id')
      .single()

    if (criada.error)
      throw new Error(`A conta A nao conseguiu criar planta: ${criada.error.message}`)
    plantaDeA = criada.data.id

    const evento = await clienteA
      .from('care_events')
      .insert({ plant_id: plantaDeA, user_id: usuarioA, type: 'rega' })
    if (evento.error)
      throw new Error(`A conta A nao conseguiu registrar rega: ${evento.error.message}`)
  })

  afterAll(async () => {
    if (plantaDeA) await clienteA.from('plants').delete().eq('id', plantaDeA)
    await clienteA?.auth.signOut()
    await clienteB?.auth.signOut()
  })

  describe('leitura', () => {
    it('a conta B nao enxerga as plantas da conta A', async () => {
      const { data, error } = await clienteB.from('plants').select('id')
      expect(error).toBeNull()
      expect(data).not.toBeNull()
      expect(data!.some((linha) => linha.id === plantaDeA)).toBe(false)
    })

    it('a conta B nao enxerga o historico da conta A', async () => {
      const { data, error } = await clienteB.from('care_events').select('id, plant_id')
      expect(error).toBeNull()
      expect(data!.some((linha) => linha.plant_id === plantaDeA)).toBe(false)
    })

    it('a conta B nao enxerga o perfil da conta A', async () => {
      const { data } = await clienteB.from('profiles').select('id')
      expect(data!.some((linha) => linha.id === usuarioA)).toBe(false)
    })

    it('a conta B nao enxerga as inscricoes de push da conta A', async () => {
      const { data } = await clienteB.from('push_subscriptions').select('id, user_id')
      expect(data!.some((linha) => linha.user_id === usuarioA)).toBe(false)
    })

    it('buscar a planta de A pelo id exato tambem devolve vazio para B', async () => {
      const { data } = await clienteB.from('plants').select('id').eq('id', plantaDeA)
      expect(data).toEqual([])
    })
  })

  describe('escrita cruzada', () => {
    it('a conta B nao consegue pendurar evento na planta da conta A', async () => {
      const { error } = await clienteB
        .from('care_events')
        .insert({ plant_id: plantaDeA, user_id: usuarioB, type: 'rega' })
      expect(error).not.toBeNull()
    })

    it('a conta B nao consegue forjar planta em nome da conta A', async () => {
      const { error } = await clienteB.from('plants').insert({
        user_id: usuarioA,
        nickname: 'Planta forjada',
        species_label: 'Teste',
        water_interval_warm: 7,
        water_interval_cold: 14,
      })
      expect(error).not.toBeNull()
    })

    it('a conta B nao consegue alterar a planta da conta A', async () => {
      const { data } = await clienteB
        .from('plants')
        .update({ nickname: 'Sequestrada' })
        .eq('id', plantaDeA)
        .select('id')
      expect(data).toEqual([])
    })

    it('a conta B nao consegue excluir a planta da conta A', async () => {
      await clienteB.from('plants').delete().eq('id', plantaDeA)
      const { data } = await clienteA.from('plants').select('id').eq('id', plantaDeA)
      expect(data).toHaveLength(1)
    })
  })

  describe('sem autenticacao', () => {
    it('nao le planta nenhuma', async () => {
      const { data } = await clienteAnonimo.from('plants').select('id')
      expect(data ?? []).toEqual([])
    })

    it('nao le historico nenhum', async () => {
      const { data } = await clienteAnonimo.from('care_events').select('id')
      expect(data ?? []).toEqual([])
    })

    it('nao consegue inserir planta', async () => {
      const { error } = await clienteAnonimo.from('plants').insert({
        user_id: usuarioA,
        nickname: 'Anonima',
        species_label: 'Teste',
        water_interval_warm: 7,
        water_interval_cold: 14,
      })
      expect(error).not.toBeNull()
    })
  })

  describe('coerencia do proprio dono', () => {
    it('a conta A nao consegue criar evento com user_id de outra pessoa', async () => {
      const { error } = await clienteA
        .from('care_events')
        .insert({ plant_id: plantaDeA, user_id: usuarioB, type: 'rega' })
      expect(error).not.toBeNull()
    })
  })
})
