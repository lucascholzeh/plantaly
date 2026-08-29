import { useEffect, useState } from 'react'
import { listarPlantas } from '../dados/plantas'
import { buscarPerfil, salvarPerfil } from '../dados/perfil'
import { useCarregamento } from '../dados/useCarregamento'
import { supabase } from '../lib/supabase'
import { ativarPush, desativarPush, estadoDoPush, type EstadoDoPush } from '../pwa/push'
import { Aviso, Botao, Cartao, Seletor } from '../visual/componentes'

const HORAS = Array.from({ length: 24 }, (_, h) => h)

export function Ajustes() {
  const perfil = useCarregamento(buscarPerfil)
  const plantas = useCarregamento(listarPlantas)
  const [push, setPush] = useState<EstadoDoPush | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    estadoDoPush()
      .then(setPush)
      .catch(() => setPush('indisponivel'))
  }, [])

  const temPlanta = (plantas.dados?.length ?? 0) > 0

  async function alternarPush() {
    setOcupado(true)
    setErro(null)
    try {
      setPush(push === 'ativo' ? (await desativarPush(), 'desativado') : await ativarPush())
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
    } finally {
      setOcupado(false)
    }
  }

  async function mudarHora(hora: number) {
    setErro(null)
    try {
      await salvarPerfil({ notification_hour: hora })
      perfil.recarregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <>
      {erro && <Aviso tom="erro">{erro}</Aviso>}

      <Cartao elevado>
        <h1>Ajustes</h1>
        <p className="formulario__nota">
          Conectado como {perfil.dados?.email ?? '…'}. As plantas de cada conta são separadas.
        </p>
      </Cartao>

      <Cartao>
        <h2 className="lista__titulo">Lembretes</h2>

        {push === null && <p className="formulario__nota">Verificando…</p>}

        {push === 'indisponivel' && (
          <p className="formulario__nota">
            Este navegador não envia notificações. O app continua inteiro — a aba “Hoje” mostra o
            que precisa de você.
          </p>
        )}

        {push === 'precisa-instalar' && (
          <Aviso tom="atencao">
            O iPhone só envia notificação para app adicionado à Tela de Início. Instale primeiro; o
            convite aparece na aba “Hoje”.
          </Aviso>
        )}

        {push === 'sem-chave' && (
          <Aviso tom="atencao">
            As chaves de notificação não estão configuradas neste ambiente.
          </Aviso>
        )}

        {push === 'negado' && (
          <Aviso tom="atencao">
            Você negou as notificações para este app. Para reverter, é preciso mudar em Ajustes do
            iPhone → Notificações → Plantaly.
          </Aviso>
        )}

        {(push === 'desativado' || push === 'ativo') && (
          <>
            {!temPlanta && push === 'desativado' ? (
              <p className="formulario__nota">
                Cadastre a primeira planta antes de ligar os lembretes — sem plantas não haveria o
                que avisar.
              </p>
            ) : (
              <Botao
                variante={push === 'ativo' ? 'discreto' : 'primario'}
                onClick={alternarPush}
                disabled={ocupado}
              >
                {ocupado ? 'Aguarde…' : push === 'ativo' ? 'Desligar lembretes' : 'Ligar lembretes'}
              </Botao>
            )}
          </>
        )}

        {push === 'ativo' && perfil.dados && (
          <div className="formulario__campos">
            <Seletor
              rotulo="Horário do lembrete"
              value={String(perfil.dados.notification_hour)}
              onChange={(e) => mudarHora(Number(e.target.value))}
              ajuda={`No seu fuso (${perfil.dados.time_zone}). Uma notificação por dia, só quando houver algo vencendo.`}
            >
              {HORAS.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, '0')}:00
                </option>
              ))}
            </Seletor>
          </div>
        )}
      </Cartao>

      <Cartao>
        <h2 className="lista__titulo">Conta</h2>
        <Botao variante="secundario" onClick={() => supabase.auth.signOut()}>
          Sair
        </Botao>
      </Cartao>
    </>
  )
}
