/**
 * Paridade entre a view do banco e as funções de `src/dominio/`.
 *
 * A regra de "quem está atrasado" existe em dois lugares: na view
 * `plant_status`, que o agendador da Etapa 7 vai consultar, e em
 * `src/dominio/rega.ts`, que a tela usa para responder na hora. Duas
 * implementações da mesma regra divergem com o tempo — é o risco nomeado na
 * seção 13 do design.
 *
 * Este teste roda os mesmos dados pelos dois caminhos e falha se
 * discordarem. **A view é a verdade**; quando divergirem, o domínio é que
 * está errado.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { hoje as hojeDe, somarDias } from '../src/dominio/datas'
import { estadoDaRega } from '../src/dominio/rega'
import type { PlantaCalculo, ToleranciaSeca } from '../src/dominio/tipos'

const URL = import.meta.env.VITE_SUPABASE_URL
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY
const EMAIL = import.meta.env.TESTE_USUARIO_A_EMAIL
const SENHA = import.meta.env.TESTE_USUARIO_A_SENHA

const FUSO = 'America/Sao_Paulo'
const MARCA = `paridade-${Date.now()}`

interface Caso {
  nome: string
  intervaloQuente: number
  intervaloFrio: number
  tolerancia: ToleranciaSeca
  /** Dias atrás em que a planta foi regada. Nulo = nunca regada. */
  regadaHa: number | null
}

/**
 * Casos escolhidos para cair exatamente nas fronteiras.
 *
 * Fronteira é onde duas implementações da mesma regra discordam: um usa
 * `>` e o outro `>=` e ninguém percebe até a planta errada aparecer na
 * notificação.
 */
const CASOS: Caso[] = [
  { nome: 'regada hoje', intervaloQuente: 8, intervaloFrio: 15, tolerancia: 'media', regadaHa: 0 },
  { nome: 'em dia', intervaloQuente: 8, intervaloFrio: 15, tolerancia: 'media', regadaHa: 3 },
  {
    nome: 'vence hoje (quente)',
    intervaloQuente: 8,
    intervaloFrio: 15,
    tolerancia: 'media',
    regadaHa: 8,
  },
  {
    nome: 'vence hoje (frio)',
    intervaloQuente: 8,
    intervaloFrio: 15,
    tolerancia: 'media',
    regadaHa: 15,
  },
  {
    nome: 'um dia de atraso',
    intervaloQuente: 8,
    intervaloFrio: 15,
    tolerancia: 'media',
    regadaHa: 9,
  },
  {
    nome: 'media na fronteira do limiar',
    intervaloQuente: 8,
    intervaloFrio: 15,
    tolerancia: 'media',
    regadaHa: 12,
  },
  {
    nome: 'media logo acima do limiar',
    intervaloQuente: 8,
    intervaloFrio: 15,
    tolerancia: 'media',
    regadaHa: 13,
  },
  {
    nome: 'alta na fronteira',
    intervaloQuente: 21,
    intervaloFrio: 30,
    tolerancia: 'alta',
    regadaHa: 42,
  },
  { nome: 'alta acima', intervaloQuente: 21, intervaloFrio: 30, tolerancia: 'alta', regadaHa: 43 },
  {
    nome: 'baixa na fronteira',
    intervaloQuente: 4,
    intervaloFrio: 8,
    tolerancia: 'baixa',
    regadaHa: 5,
  },
  { nome: 'baixa acima', intervaloQuente: 4, intervaloFrio: 8, tolerancia: 'baixa', regadaHa: 6 },
  {
    nome: 'atraso enorme',
    intervaloQuente: 8,
    intervaloFrio: 15,
    tolerancia: 'media',
    regadaHa: 90,
  },
  {
    nome: 'sem historico',
    intervaloQuente: 8,
    intervaloFrio: 15,
    tolerancia: 'media',
    regadaHa: null,
  },
]

describe('paridade view x domínio', () => {
  let cliente: SupabaseClient
  let usuarioId: string
  const criadas: string[] = []
  let linhas: Record<string, unknown>[] = []
  let hojeLocal: string

  beforeAll(async () => {
    if (!URL || !ANON || !EMAIL || !SENHA) {
      throw new Error('Credenciais ausentes no .env. Rode `npm run contas:teste`.')
    }

    cliente = createClient(URL, ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const login = await cliente.auth.signInWithPassword({ email: EMAIL, password: SENHA })
    if (login.error) throw new Error(`Login falhou: ${login.error.message}`)
    usuarioId = login.data.user.id

    hojeLocal = hojeDe(FUSO)

    for (const caso of CASOS) {
      const { data, error } = await cliente
        .from('plants')
        .insert({
          user_id: usuarioId,
          nickname: `${MARCA} ${caso.nome}`,
          species_label: 'Teste',
          environment: 'janela_clara',
          water_interval_warm: caso.intervaloQuente,
          water_interval_cold: caso.intervaloFrio,
          drought_tolerance: caso.tolerancia,
        })
        .select('id')
        .single()

      if (error) throw new Error(`Não criei a planta "${caso.nome}": ${error.message}`)
      criadas.push(data.id)

      if (caso.regadaHa !== null) {
        // Meio-dia local: nenhuma conversão de fuso empurra o registro para
        // o dia vizinho.
        const dia = somarDias(hojeLocal, -caso.regadaHa)
        const { error: erroEvento } = await cliente.from('care_events').insert({
          plant_id: data.id,
          user_id: usuarioId,
          type: 'rega',
          occurred_at: `${dia}T12:00:00-03:00`,
        })
        if (erroEvento) throw new Error(`Não registrei a rega: ${erroEvento.message}`)
      }
    }

    const status = await cliente.from('plant_status').select('*').like('nickname', `${MARCA}%`)
    if (status.error) throw new Error(`Não li a view: ${status.error.message}`)
    linhas = status.data
  })

  afterAll(async () => {
    if (criadas.length > 0) await cliente.from('plants').delete().in('id', criadas)
    await cliente?.auth.signOut()
  })

  it('a view enxerga todas as plantas criadas', () => {
    expect(linhas).toHaveLength(CASOS.length)
  })

  it('o dia da view é o mesmo dia local do domínio', () => {
    // Se isto falhar, o resto do teste está comparando dias diferentes e
    // qualquer acordo seria coincidência.
    for (const linha of linhas) {
      expect(linha.hoje).toBe(hojeLocal)
    }
  })

  for (const caso of CASOS) {
    it(`${caso.nome}: view e domínio concordam`, () => {
      const linha = linhas.find((l) => l.nickname === `${MARCA} ${caso.nome}`)
      expect(linha, `a view não devolveu a planta "${caso.nome}"`).toBeDefined()

      const planta: PlantaCalculo = {
        intervaloQuente: caso.intervaloQuente,
        intervaloFrio: caso.intervaloFrio,
        toleranciaSeca: caso.tolerancia,
      }
      const ultimaRega = caso.regadaHa === null ? null : somarDias(hojeLocal, -caso.regadaHa)
      const doDominio = estadoDaRega(planta, ultimaRega, hojeLocal)

      expect(linha!.situacao_rega, 'situação').toBe(doDominio.situacao)
      expect(linha!.proxima_rega ?? null, 'próxima rega').toBe(doDominio.proxima)
      expect(linha!.intervalo_rega, 'intervalo vigente').toBe(doDominio.intervaloVigente)
      expect(linha!.estacao, 'estação').toBe(doDominio.estacao)
      expect(linha!.dias_de_atraso_rega, 'dias de atraso').toBe(doDominio.diasDeAtraso)
      expect(linha!.ultima_rega ?? null, 'última rega').toBe(ultimaRega)
    })
  }
})
