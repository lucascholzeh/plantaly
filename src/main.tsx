import { MotionConfig } from 'framer-motion'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import { Galeria } from './visual/Galeria'
import './visual/base.css'
import './visual/componentes/componentes.css'
import './visual/layout.css'

/**
 * Registra o service worker.
 *
 * Sem esta chamada o `vite-plugin-pwa` gera o arquivo mas ninguém o
 * registra: no iPhone o push ainda funciona porque o próprio iOS registra o
 * worker ao abrir o app instalado, mas o `registerType: 'autoUpdate'` fica
 * morto — app instalado nunca recebe versão nova. E `serviceWorker.ready`
 * fica pendurado para sempre no Safari comum, que é o que fazia os Ajustes
 * relatarem "este navegador não envia notificações".
 */
registerSW({ immediate: true })

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
