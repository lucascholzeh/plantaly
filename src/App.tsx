import { AnimatePresence, motion } from 'framer-motion'
import { TelaAutenticacao } from './auth/TelaAutenticacao'
import { useSessao } from './auth/useSessao'
import { BarraNavegacao } from './navegacao/BarraNavegacao'
import { ConviteInstalacao } from './pwa/ConviteInstalacao'
import { TITULOS } from './navegacao/abas'
import { abaDaRota, useRota, voltar, type Rota } from './navegacao/rotas'
import { Ajustes } from './telas/Ajustes'
import { CadastrarPlanta } from './telas/CadastrarPlanta'
import { Calendario } from './telas/Calendario'
import { Especies } from './telas/Especies'
import { FichaEspecie } from './telas/FichaEspecie'
import { FichaPlanta } from './telas/FichaPlanta'
import { Hoje } from './telas/Hoje'
import { MinhasPlantas } from './telas/MinhasPlantas'
import { Motivo } from './visual/componentes'

const TELAS_DE_ABA = {
  hoje: Hoje,
  plantas: MinhasPlantas,
  calendario: Calendario,
  especies: Especies,
}

/**
 * Título do cabeçalho.
 *
 * Nulo na ficha de planta: quem sabe o nome é a tela, que carregou a
 * planta. Um "Planta" genérico aqui só duplicaria o apelido logo abaixo.
 */
function tituloDe(rota: Rota): string | null {
  if (rota.tipo === 'ajustes') return null
  if (rota.tipo === 'nova-planta') return 'Nova planta'
  if (rota.tipo === 'planta' || rota.tipo === 'especie') return null
  return TITULOS[rota.aba]
}

function conteudoDe(rota: Rota) {
  if (rota.tipo === 'nova-planta') return <CadastrarPlanta especieInicial={rota.especie} />
  if (rota.tipo === 'planta') return <FichaPlanta id={rota.id} />
  if (rota.tipo === 'especie') return <FichaEspecie slug={rota.slug} />
  if (rota.tipo === 'ajustes') return <Ajustes />
  const Tela = TELAS_DE_ABA[rota.aba]
  return <Tela />
}

/** Chave da animação: trocar de planta também precisa animar. */
function chaveDe(rota: Rota): string {
  if (rota.tipo === 'planta') return `planta-${rota.id}`
  if (rota.tipo === 'especie') return `especie-${rota.slug}`
  if (rota.tipo === 'ajustes') return 'ajustes'
  if (rota.tipo === 'nova-planta') return 'nova-planta'
  return rota.aba
}

export default function App() {
  const { sessao, carregando } = useSessao()
  const rota = useRota()

  if (carregando) return null
  if (!sessao) return <TelaAutenticacao />

  const interna = rota.tipo !== 'aba'
  const titulo = tituloDe(rota)

  return (
    <div className="app">
      {/* Pular para o conteúdo. É um botão, não um link com `href="#..."`:
          as rotas do app vivem no hash, e um href trocaria `#/calendario`
          por `#conteudo` — jogando a pessoa de volta para a aba "Hoje". */}
      <button
        type="button"
        className="app__pular"
        onClick={() => document.getElementById('conteudo')?.focus()}
      >
        Pular para o conteúdo
      </button>
      <header className="app__cabecalho">
        {/* Cabeçalho é um dos quatro lugares onde o motivo floral é permitido. */}
        <Motivo contexto="cabecalho" />
        {interna && (
          <button type="button" className="app__voltar" onClick={voltar}>
            ← Voltar
          </button>
        )}
        {titulo && <h1>{titulo}</h1>}
        {!interna && (
          <a className="app__ajustes" href="#/ajustes" aria-label="Ajustes">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3.2" />
              <path
                d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M4.2 16.5l1.9-1.1M17.9 8.6l1.9-1.1"
                strokeLinecap="round"
              />
            </svg>
          </a>
        )}
      </header>

      <main className="app__conteudo" id="conteudo" tabIndex={-1}>
        {/* Só aparece no iPhone, fora da Tela de Início, e some por uma
            semana quando dispensado. */}
        <ConviteInstalacao />

        {/* `mode="wait"` evita as duas telas empilhadas durante a troca. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={chaveDe(rota)}
            className="app__tela"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {conteudoDe(rota)}
          </motion.div>
        </AnimatePresence>
      </main>

      <BarraNavegacao atual={abaDaRota(rota)} />
    </div>
  )
}
