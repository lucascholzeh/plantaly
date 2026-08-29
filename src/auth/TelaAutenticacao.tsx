import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { Aviso, Botao, Campo, Cartao, Motivo } from '../visual/componentes'

/**
 * Cadastro e login por e-mail.
 *
 * O botão fica desabilitado durante o envio: sem isso, toque duplo em conexão
 * lenta dispara duas tentativas de cadastro.
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
    <main className="entrada">
      <div className="entrada__marca">
        <Motivo contexto="cabecalho" desenho="flor" />
        <h1>Plantaly</h1>
        <p className="entrada__lema">Suas plantas, na hora certa.</p>
      </div>

      <Cartao elevado>
        <form className="entrada__form" onSubmit={aoEnviar}>
          <Campo
            rotulo="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
          />

          <Campo
            rotulo="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={8}
            autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            ajuda={modo === 'cadastrar' ? 'Ao menos 8 caracteres.' : undefined}
          />

          {erro && <Aviso tom="erro">{erro}</Aviso>}
          {aviso && <Aviso tom="informacao">{aviso}</Aviso>}

          <Botao type="submit" largo disabled={enviando}>
            {enviando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </Botao>
        </form>
      </Cartao>

      <Botao
        variante="discreto"
        onClick={() => {
          setModo(modo === 'entrar' ? 'cadastrar' : 'entrar')
          setErro(null)
          setAviso(null)
        }}
      >
        {modo === 'entrar' ? 'Ainda não tenho conta' : 'Já tenho conta'}
      </Botao>
    </main>
  )
}
