import { useSessao } from './auth/useSessao'
import { TelaAutenticacao } from './auth/TelaAutenticacao'
import { supabase } from './lib/supabase'

export default function App() {
  const { sessao, carregando } = useSessao()

  if (carregando) return <p style={{ padding: '1rem' }}>Carregando...</p>
  if (!sessao) return <TelaAutenticacao />

  return (
    <main style={{ maxWidth: 480, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>Plantaly</h1>
      <p>Conectado como {sessao.user.email}.</p>
      <p>
        Fundacao pronta. As telas comecam na Etapa 3 — ver{' '}
        <code>docs/superpowers/plans/2026-08-29-plantaly-implementacao.md</code>.
      </p>
      <button type="button" onClick={() => supabase.auth.signOut()}>
        Sair
      </button>
    </main>
  )
}
