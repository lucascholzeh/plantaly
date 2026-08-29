import { AnimatePresence, motion } from 'framer-motion'
import { TelaAutenticacao } from './auth/TelaAutenticacao'
import { useSessao } from './auth/useSessao'
import { BarraNavegacao } from './navegacao/BarraNavegacao'
import { TITULOS } from './navegacao/abas'
import { abaDaRota, useRota, voltar, type Rota } from './navegacao/rotas'
import { CadastrarPlanta } from './telas/CadastrarPlanta'
import { Calendario } from './telas/Calendario'
import { Especies } from './telas/Especies'
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

function tituloDe(rota: Rota): string {
  if (rota.tipo === 'nova-planta') return 'Nova planta'
  if (rota.tipo === 'planta') return 'Planta'
  return TITULOS[rota.aba]
}

function conteudoDe(rota: Rota) {
  if (rota.tipo === 'nova-planta') return <CadastrarPlanta />
  if (rota.tipo === 'planta') return <FichaPlanta id={rota.id} />
  const Tela = TELAS_DE_ABA[rota.aba]
  return <Tela />
}

/** Chave da animação: trocar de planta também precisa animar. */
function chaveDe(rota: Rota): string {
  if (rota.tipo === 'planta') return `planta-${rota.id}`
  if (rota.tipo === 'nova-planta') return 'nova-planta'
  return rota.aba
}

export default function App() {
  const { sessao, carregando } = useSessao()
  const rota = useRota()

  if (carregando) return null
  if (!sessao) return <TelaAutenticacao />

  const interna = rota.tipo !== 'aba'

  return (
    <div className="app">
      <header className="app__cabecalho">
        {/* Cabeçalho é um dos quatro lugares onde o motivo floral é permitido. */}
        <Motivo contexto="cabecalho" />
        {interna && (
          <button type="button" className="app__voltar" onClick={voltar}>
            ← Voltar
          </button>
        )}
        <h1>{tituloDe(rota)}</h1>
      </header>

      <main className="app__conteudo">
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
