import { useEffect, useState } from 'react'
import { listarPlantas } from '../dados/plantas'
import { buscarPerfil, salvarPerfil } from '../dados/perfil'
import { useCarregamento } from '../dados/useCarregamento'
import { supabase } from '../lib/supabase'
import { ativarPush, desativarPush, estadoDoPush, type EstadoDoPush } from '../pwa/push'
import { Aviso, Botao, Carregando, Cartao, Seletor } from '../visual/componentes'

const HORAS = Array.from({ length: 24 }, (_, h) => h)

/** Horário no formato do idioma, em vez de "00:00" escrito à mão. */
const HORA = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const formatarHora = (h: number) => HORA.format(new Date(2026, 0, 1, h, 0))

export function Ajustes() {
  const perfil = useCarregamento(buscarPerfil)
  const plantas = useCarregamento(listarPlantas)
  const [push, setPush] = useState<EstadoDoPush | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState<string | null>(null)
  const [confirmandoSaida, setConfirmandoSaida] = useState(false)

  useEffect(() => {
    estadoDoPush()
      .then(setPush)
      .catch((e) => {
        // Falha ao consultar não é o mesmo que navegador sem suporte. Dizer
        // "não envia notificações" para um erro de rede mandava a pessoa
        // desistir de algo que funciona.
        setErro(e instanceof Error ? e.message : String(e))
        setPush('sem-worker')
      })
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
    setSalvo(null)
    try {
      await salvarPerfil({ notification_hour: hora })
      perfil.recarregar()
      // Sem confirmação a troca de horário era muda: nada na tela dizia se
      // gravou. O aviso some na próxima troca.
      setSalvo(`Lembretes movidos para ${formatarHora(hora)}.`)
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

        {push === null && <Carregando>Verificando…</Carregando>}

        {salvo && <Aviso tom="informacao">{salvo}</Aviso>}

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

        {push === 'sem-worker' && (
          <Aviso tom="atencao">
            Não consegui preparar as notificações agora. Feche o Plantaly por completo e abra de
            novo pelo ícone da Tela de Início. Se continuar, os lembretes seguem desligados — a aba
            “Hoje” mostra o que precisa de você.
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

        {/* Visível mesmo com o push desligado. O horário não governa só a
            notificação: enquanto o push não estiver ligado — e no iPhone isso
            exige instalar o app na Tela de Início — quem abrir esta tela
            precisa conseguir escolher a hora assim mesmo, em vez de esbarrar
            num seletor que só aparece depois. */}
        {perfil.dados && push !== null && push !== 'indisponivel' && (
          <div className="formulario__campos">
            <Seletor
              rotulo="Horário das notificações"
              value={String(perfil.dados.notification_hour)}
              onChange={(e) => mudarHora(Number(e.target.value))}
              ajuda={
                push === 'ativo'
                  ? `No seu fuso (${perfil.dados.time_zone}). Duas por manhã: o que regar — ou que não há nada — e a frase do dia.`
                  : `No seu fuso (${perfil.dados.time_zone}). Guardado desde já: vale assim que os lembretes forem ligados.`
              }
            >
              {HORAS.map((h) => (
                <option key={h} value={h}>
                  {formatarHora(h)}
                </option>
              ))}
            </Seletor>
          </div>
        )}
      </Cartao>

      <Cartao>
        <h2 className="lista__titulo">Conta</h2>
        {!confirmandoSaida ? (
          <Botao variante="secundario" onClick={() => setConfirmandoSaida(true)}>
            Sair
          </Botao>
        ) : (
          <div className="formulario__campos">
            <Aviso tom="atencao">
              Você vai precisar do e-mail e da senha para entrar de novo. Suas plantas ficam
              guardadas.
            </Aviso>
            <div className="acoes">
              <Botao onClick={() => supabase.auth.signOut()}>Sair da conta</Botao>
              <Botao variante="discreto" onClick={() => setConfirmandoSaida(false)}>
                Cancelar
              </Botao>
            </div>
          </div>
        )}
      </Cartao>
    </>
  )
}
