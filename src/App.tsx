import { AnimatePresence, motion } from 'framer-motion'
import { TelaAutenticacao } from './auth/TelaAutenticacao'
import { useSessao } from './auth/useSessao'
import { BarraNavegacao } from './navegacao/BarraNavegacao'
import { TITULOS, useAba } from './navegacao/abas'
import { Calendario } from './telas/Calendario'
import { Especies } from './telas/Especies'
import { Hoje } from './telas/Hoje'
import { MinhasPlantas } from './telas/MinhasPlantas'
import { Motivo } from './visual/componentes'

const TELAS = {
  hoje: Hoje,
  plantas: MinhasPlantas,
  calendario: Calendario,
  especies: Especies,
}

export default function App() {
  const { sessao, carregando } = useSessao()
  const { aba } = useAba()

  if (carregando) return null
  if (!sessao) return <TelaAutenticacao />

  const Tela = TELAS[aba]

  return (
    <div className="app">
      <header className="app__cabecalho">
        {/* Cabeçalho é um dos quatro lugares onde o motivo floral é permitido. */}
        <Motivo contexto="cabecalho" />
        <h1>{TITULOS[aba]}</h1>
      </header>

      <main className="app__conteudo">
        {/* `mode="wait"` evita as duas telas empilhadas durante a troca. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={aba}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Tela />
          </motion.div>
        </AnimatePresence>
      </main>

      <BarraNavegacao atual={aba} />
    </div>
  )
}
