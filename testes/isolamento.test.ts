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

    it('a conta B nao enxerga a planta de A na view de status', async () => {
      // A view precisa ter sido criada com `security_invoker = true`. Sem
      // isso ela roda com os privilegios do dono e ignora o RLS de quem
      // consulta — entregando as plantas de uma conta para a outra.
      const { data, error } = await clienteB.from('plant_status').select('plant_id')
      expect(error).toBeNull()
      expect(data!.some((linha) => linha.plant_id === plantaDeA)).toBe(false)
    })

    it('sem autenticacao a view de status nao devolve nada', async () => {
      const { data } = await clienteAnonimo.from('plant_status').select('plant_id')
      expect(data ?? []).toEqual([])
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

  /**
   * Fotos das plantas (bucket `fotos-plantas`, migracao 0007).
   *
   * O bucket e privado e as politicas comparam a primeira pasta do caminho
   * com o `auth.uid()` de quem consulta. O erro classico aqui e criar o
   * bucket como publico: as tabelas continuariam isoladas e as imagens
   * vazariam mesmo assim, sem nenhum teste de tabela acusar.
   */
  describe('fotos das plantas', () => {
    // Um JPEG minusculo de verdade: o Storage recusa o upload se o
    // content-type nao bater com o conteudo.
    const JPEG = Uint8Array.from([
      0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08,
      0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
      0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00,
      0x3f, 0x00, 0x37, 0xff, 0xd9,
    ])

    const BUCKET = 'fotos-plantas'
    let caminhoDeA: string

    beforeAll(async () => {
      caminhoDeA = `${usuarioA}/${plantaDeA}.jpg`
      const { error } = await clienteA.storage
        .from(BUCKET)
        .upload(caminhoDeA, JPEG, { contentType: 'image/jpeg', upsert: true })

      if (error) {
        throw new Error(
          `A conta A nao conseguiu enviar a foto: ${error.message}. ` +
            'A migracao 0007 foi aplicada no banco?',
        )
      }
    })

    afterAll(async () => {
      if (caminhoDeA) await clienteA.storage.from(BUCKET).remove([caminhoDeA])
    })

    it('a conta B nao consegue baixar a foto da conta A', async () => {
      const { data, error } = await clienteB.storage.from(BUCKET).download(caminhoDeA)
      expect(error).not.toBeNull()
      expect(data).toBeNull()
    })

    it('a conta B nao consegue assinar uma URL para a foto da conta A', async () => {
      // Assinar seria suficiente para vazar: a URL assinada dispensa login.
      const { data, error } = await clienteB.storage.from(BUCKET).createSignedUrl(caminhoDeA, 60)
      expect(error).not.toBeNull()
      expect(data).toBeNull()
    })

    it('a conta B nao enxerga a foto de A ao listar a pasta dela', async () => {
      const { data } = await clienteB.storage.from(BUCKET).list(usuarioA)
      expect(data ?? []).toEqual([])
    })

    it('a conta B nao consegue gravar dentro da pasta da conta A', async () => {
      const { error } = await clienteB.storage
        .from(BUCKET)
        .upload(`${usuarioA}/invasao.jpg`, JPEG, { contentType: 'image/jpeg' })
      expect(error).not.toBeNull()
    })

    it('a conta B nao consegue apagar a foto da conta A', async () => {
      await clienteB.storage.from(BUCKET).remove([caminhoDeA])

      // O `remove` do Storage responde sem erro mesmo quando o RLS filtra
      // tudo — o que prova o isolamento e o arquivo continuar la.
      const { data } = await clienteA.storage.from(BUCKET).download(caminhoDeA)
      expect(data).not.toBeNull()
    })

    it('o anonimo nao consegue baixar a foto', async () => {
      const { data, error } = await clienteAnonimo.storage.from(BUCKET).download(caminhoDeA)
      expect(error).not.toBeNull()
      expect(data).toBeNull()
    })

    it('a propria conta A continua conseguindo baixar a sua foto', async () => {
      // O contrapeso dos testes acima: uma politica que negasse tudo
      // passaria em todos eles e deixaria o app sem foto nenhuma.
      const { data, error } = await clienteA.storage.from(BUCKET).download(caminhoDeA)
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })
  })
})
