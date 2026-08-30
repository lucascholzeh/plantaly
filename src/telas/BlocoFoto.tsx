import { useRef, useState } from 'react'
import { enviarFoto, removerFoto, TAMANHO_MAXIMO, TIPOS_ACEITOS } from '../dados/fotos'
import type { PlantaLinha } from '../dados/tipos'
import { Aviso, Botao, Cartao, FotoDaPlanta } from '../visual/componentes'

/**
 * Foto da planta do usuário.
 *
 * O balão fica ao lado das ações, e não no lugar delas: o objetivo é ver a
 * foto atual enquanto se decide trocá-la.
 *
 * `capture` não é usado de propósito. Ele forçaria a câmera e tiraria a
 * opção de escolher uma foto que já está no rolo — que é o caso mais comum,
 * já que quase sempre a pessoa fotografou a planta antes de abrir o app.
 */
export function BlocoFoto({ planta, aoMudar }: { planta: PlantaLinha; aoMudar: () => void }) {
  const entrada = useRef<HTMLInputElement>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false)

  // Truthiness, e não `!== null`: a coluna chega `undefined` quando a
  // migração 0007 ainda não foi aplicada no banco, e `undefined !== null` é
  // verdadeiro — o que fazia o botão "Remover" aparecer numa planta sem foto.
  const caminho = planta.photo_path || null
  const temFoto = caminho !== null

  async function escolher(arquivo: File | undefined) {
    if (!arquivo) return

    // O bucket recusa arquivo grande demais e tipo não permitido, mas a
    // mensagem que ele devolve é críptica. Conferir aqui troca isso por uma
    // frase que diz o que fazer.
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro('Essa imagem é grande demais. Escolha uma foto comum do celular.')
      return
    }
    if (arquivo.type && !TIPOS_ACEITOS.includes(arquivo.type)) {
      setErro('Formato não aceito. Use uma foto (JPEG, PNG ou WEBP).')
      return
    }

    setOcupado(true)
    setErro(null)
    try {
      await enviarFoto(planta.id, arquivo)
      aoMudar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
    } finally {
      setOcupado(false)
      // Zerar o campo permite reescolher o mesmo arquivo depois de uma
      // falha: sem isto o `change` não dispara, e o botão parece morto.
      if (entrada.current) entrada.current.value = ''
    }
  }

  async function remover() {
    if (!caminho) return
    setOcupado(true)
    setErro(null)
    try {
      await removerFoto(planta.id, caminho)
      setConfirmandoRemocao(false)
      aoMudar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
    } finally {
      setOcupado(false)
    }
  }

  return (
    <Cartao>
      <h2 className="lista__titulo">Foto</h2>

      <div className="foto-bloco">
        <FotoDaPlanta caminho={caminho} apelido={planta.nickname} tamanho="ficha" />

        <div className="foto-bloco__acoes">
          <p className="formulario__nota">
            {temFoto
              ? 'Aparece no balão desta planta em Hoje e em Minhas plantas.'
              : 'Sem foto, o balão mostra a inicial do apelido.'}
          </p>

          <div className="acoes">
            <Botao
              variante="secundario"
              disabled={ocupado}
              onClick={() => entrada.current?.click()}
            >
              {ocupado ? 'Enviando…' : temFoto ? 'Trocar foto' : 'Adicionar foto'}
            </Botao>

            {temFoto && !confirmandoRemocao && (
              <Botao
                variante="discreto"
                disabled={ocupado}
                onClick={() => setConfirmandoRemocao(true)}
              >
                Remover
              </Botao>
            )}
          </div>
        </div>
      </div>

      {/* Fora da tela em vez de `display: none`: escondido de verdade, o
          Safari ignora o clique programático no campo. */}
      <input
        ref={entrada}
        className="foto-bloco__entrada"
        type="file"
        accept="image/*"
        onChange={(e) => escolher(e.target.files?.[0])}
      />

      {/* A foto é o único dado do app que não dá para reconstruir do
          histórico — o princípio 2 do projeto pede confirmação antes de
          apagar de vez. */}
      {confirmandoRemocao && (
        <Cartao elevado role="alert">
          <p>Remover a foto? Ela não volta — seria preciso fotografar de novo.</p>
          <div className="acoes">
            <Botao variante="secundario" onClick={remover} disabled={ocupado}>
              {ocupado ? 'Removendo…' : 'Remover'}
            </Botao>
            <Botao variante="discreto" onClick={() => setConfirmandoRemocao(false)}>
              Cancelar
            </Botao>
          </div>
        </Cartao>
      )}

      {erro && <Aviso tom="erro">{erro}</Aviso>}
    </Cartao>
  )
}
