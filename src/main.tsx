import { MotionConfig } from 'framer-motion'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Galeria } from './visual/Galeria'
import './visual/base.css'
import './visual/componentes/componentes.css'
import './visual/layout.css'

/**
 * A galeria do sistema visual vive fora do App e só em desenvolvimento.
 *
 * A decisão fica aqui, no arranque, e não dentro do App: trocar o hash não
 * remonta o componente, então uma checagem lá dentro só reavaliaria por
 * acidente. Aqui é avaliada uma vez, ao carregar a página.
 */
const galeria = import.meta.env.DEV && window.location.hash.startsWith('#/galeria')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* O @media do CSS desliga transições CSS, mas não as animações que o
        framer-motion roda em JavaScript. `reducedMotion="user"` faz ele
        respeitar a mesma preferência do sistema. */}
    <MotionConfig reducedMotion="user">{galeria ? <Galeria /> : <App />}</MotionConfig>
  </StrictMode>,
)
