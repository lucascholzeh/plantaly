import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Cadastro e login por e-mail.
 *
 * Sem estilo de propósito: o sistema visual é a Etapa 1. O que precisa estar
 * certo aqui é o comportamento — erro visível, botão que não deixa clicar
 * duas vezes, e o aviso de confirmação de e-mail quando o projeto exige.
 */
export function TelaAutenticacao() {
  const [modo, setModo] = useState<'entrar' | 'cadastrar'>('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setEnviando(true)
    setErro(null)
    setAviso(null)

    if (modo === 'entrar') {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) setErro(error.message)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password: senha })
      if (error) {
        setErro(error.message)
      } else if (!data.session) {
        setAviso('Conta criada. Confirme o e-mail que enviamos antes de entrar.')
      }
    }

    setEnviando(false)
  }

  return (
    <main style={{ maxWidth: 360, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>Plantaly</h1>

      <form onSubmit={aoEnviar}>
        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ display: 'block', width: '100%' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={8}
            autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            style={{ display: 'block', width: '100%' }}
          />
        </label>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Aguarde...' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>

      {erro && <p role="alert">{erro}</p>}
      {aviso && <p role="status">{aviso}</p>}

      <button
        type="button"
        onClick={() => {
          setModo(modo === 'entrar' ? 'cadastrar' : 'entrar')
          setErro(null)
          setAviso(null)
        }}
        style={{ marginTop: '1rem' }}
      >
        {modo === 'entrar' ? 'Ainda nao tenho conta' : 'Ja tenho conta'}
      </button>
    </main>
  )
}
