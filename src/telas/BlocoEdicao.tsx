import { useState, type FormEvent } from 'react'
import { ESPECIES, buscarEspecie, valoresParaCadastro } from '../catalogo'
import { atualizarPlanta, type CamposEditaveis } from '../dados/plantas'
import type { PlantaLinha } from '../dados/tipos'
import { ROTULOS_AMBIENTE, sugerirPorMudancaDeAmbiente } from '../dominio/ambiente'
import type { Ambiente, ToleranciaSeca } from '../dominio/tipos'
import { Aviso, Botao, Campo, Cartao, Seletor } from '../visual/componentes'

const TOLERANCIAS: Record<ToleranciaSeca, string> = {
  baixa: 'Baixa — sofre rápido se atrasar (samambaia, lírio-da-paz)',
  media: 'Média — o caso mais comum',
  alta: 'Alta — aguanta bem (suculenta, cacto, zamioculca)',
}

/**
 * Editar os dados da planta.
 *
 * Até aqui a ficha só registrava eventos: corrigir um apelido errado ou um
 * intervalo obrigava a excluir e cadastrar de novo — e a exclusão leva o
 * histórico junto, que é justamente o que o princípio 2 promete não perder.
 *
 * Fechado por padrão, como Arquivar e Excluir logo abaixo: a ficha é para
 * ver e registrar, e um formulário aberto o tempo todo empurraria o
 * histórico para fora da tela.
 *
 * Adubação e foto não entram aqui — cada uma já tem seu bloco na ficha.
 */
export function BlocoEdicao({ planta, aoMudar }: { planta: PlantaLinha; aoMudar: () => void }) {
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [apelido, setApelido] = useState(planta.nickname)
  const [slugEspecie, setSlugEspecie] = useState(planta.species_slug ?? '')
  const [especie, setEspecie] = useState(planta.species_label ?? '')
  const [ambiente, setAmbiente] = useState<Ambiente>(planta.environment)
  const [intervaloQuente, setIntervaloQuente] = useState(planta.water_interval_warm)
  const [intervaloFrio, setIntervaloFrio] = useState(planta.water_interval_cold)
  const [tolerancia, setTolerancia] = useState<ToleranciaSeca>(planta.drought_tolerance)

  /**
   * A sugestão de intervalo por mudança de ambiente.
   *
   * Calculada sobre o ambiente **gravado**, não sobre o anterior do
   * formulário: assim trocar de lugar três vezes antes de salvar continua
   * comparando com o que está no banco, e voltar ao ambiente original faz a
   * sugestão desaparecer em vez de acumular.
   */
  const sugestao =
    ambiente === planta.environment
      ? null
      : {
          quente: sugerirPorMudancaDeAmbiente(
            planta.water_interval_warm,
            planta.environment,
            ambiente,
          ),
          frio: sugerirPorMudancaDeAmbiente(
            planta.water_interval_cold,
            planta.environment,
            ambiente,
          ),
        }

  // Só vale oferecer quando muda algum número de verdade: arredondamento faz
  // 1 dia continuar 1 dia entre ambientes vizinhos, e um botão que não muda
  // nada é pior que nenhum botão.
  const sugestaoUtil =
    sugestao !== null && (sugestao.quente !== intervaloQuente || sugestao.frio !== intervaloFrio)

  function trocarEspecie(slug: string) {
    setSlugEspecie(slug)
    if (slug === '') return

    const escolhida = buscarEspecie(slug)
    if (!escolhida) return

    // Mesma regra do cadastro: escolher a espécie preenche os números, e
    // eles seguem editáveis logo abaixo. Útil para a planta que só foi
    // identificada depois.
    setEspecie(escolhida.nomePopular)
    const valores = valoresParaCadastro(escolhida)
    setIntervaloQuente(valores.intervaloQuente)
    setIntervaloFrio(valores.intervaloFrio)
    setTolerancia(valores.toleranciaSeca)
  }

  function cancelar() {
    // Volta tudo ao que está gravado: sair da edição não pode deixar
    // rascunho pela metade para a próxima abertura.
    setApelido(planta.nickname)
    setSlugEspecie(planta.species_slug ?? '')
    setEspecie(planta.species_label ?? '')
    setAmbiente(planta.environment)
    setIntervaloQuente(planta.water_interval_warm)
    setIntervaloFrio(planta.water_interval_cold)
    setTolerancia(planta.drought_tolerance)
    setErro(null)
    setAberto(false)
  }

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setSalvando(true)
    setErro(null)

    const campos: CamposEditaveis = {
      nickname: apelido.trim(),
      species_slug: slugEspecie || null,
      species_label:
        (slugEspecie ? buscarEspecie(slugEspecie)?.nomePopular : especie.trim()) || null,
      // Acompanha o slug: planta que deixou de ser do catálogo volta a
      // 'manual', senão a origem mente sobre de onde vieram os números.
      species_source: slugEspecie ? 'catalogo' : 'manual',
      environment: ambiente,
      // Sem `ajustarPorAmbiente`: o número destes campos já é o efetivo, e
      // reaplicar o fator aqui o deformaria a cada gravação. O ambiente só
      // entra pela sugestão, que a pessoa aceita ou não.
      water_interval_warm: intervaloQuente,
      water_interval_cold: intervaloFrio,
      drought_tolerance: tolerancia,
    }

    // Mexer no intervalo à mão é uma decisão nova, e apaga a recusa antiga:
    // `rejected_interval` existe para o aprendizado não insistir numa
    // sugestão já dispensada, e mantê-lo aqui suprimiria em silêncio a
    // próxima sugestão que calhasse de bater com aquele número.
    if (
      intervaloQuente !== planta.water_interval_warm ||
      intervaloFrio !== planta.water_interval_cold
    ) {
      campos.rejected_interval = null
    }

    try {
      await atualizarPlanta(planta.id, campos)
      setAberto(false)
      aoMudar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
    } finally {
      setSalvando(false)
    }
  }

  if (!aberto) {
    return (
      <Cartao>
        <h2 className="lista__titulo">Dados da planta</h2>
        <p className="formulario__nota">
          Apelido, espécie, ambiente e os dias entre regas. Corrigir aqui preserva todo o histórico.
        </p>
        <Botao variante="secundario" onClick={() => setAberto(true)}>
          Editar
        </Botao>
      </Cartao>
    )
  }

  const invalido = apelido.trim() === '' || (!slugEspecie && especie.trim() === '')

  return (
    <Cartao>
      <h2 className="lista__titulo">Editar dados</h2>

      <form className="formulario__campos" onSubmit={aoEnviar}>
        <Campo
          rotulo="Apelido"
          value={apelido}
          onChange={(e) => setApelido(e.target.value)}
          required
          maxLength={60}
          ajuda="Como você chama essa planta em casa."
        />

        <Seletor
          rotulo="Espécie do catálogo"
          value={slugEspecie}
          onChange={(e) => trocarEspecie(e.target.value)}
          ajuda="Trocar aqui repreenche os dias e a tolerância, como no cadastro."
        >
          <option value="">Não está na lista</option>
          {ESPECIES.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.nomePopular}
            </option>
          ))}
        </Seletor>

        {slugEspecie === '' && (
          <Campo
            rotulo="Nome da espécie"
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
            required
            ajuda="Se não souber o nome exato, escreva como você a chama."
          />
        )}

        <Seletor
          rotulo="Ambiente"
          value={ambiente}
          onChange={(e) => setAmbiente(e.target.value as Ambiente)}
          ajuda="Onde a planta fica hoje. Mudar aqui sugere um novo intervalo, sem aplicar sozinho."
        >
          {Object.entries(ROTULOS_AMBIENTE).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </Seletor>

        {/* A sugestão mostra o número antes de aplicar. O intervalo é do
            usuário depois do cadastro (decisão estrutural 1), e o
            aprendizado por histórico pode já tê-lo corrigido a partir das
            regas reais — sobrescrever em silêncio apagaria isso. */}
        {sugestaoUtil && sugestao && (
          <Aviso tom="informacao">
            <div className="formulario__campos">
              <span>
                De “{ROTULOS_AMBIENTE[planta.environment]}” para “{ROTULOS_AMBIENTE[ambiente]}”:{' '}
                {intervaloQuente} → {sugestao.quente} dias no calor e {intervaloFrio} →{' '}
                {sugestao.frio} no frio.
              </span>
              <div className="acoes">
                <Botao
                  variante="secundario"
                  onClick={() => {
                    setIntervaloQuente(sugestao.quente)
                    setIntervaloFrio(sugestao.frio)
                  }}
                >
                  Usar esses dias
                </Botao>
              </div>
            </div>
          </Aviso>
        )}

        <Campo
          rotulo="Dias entre regas — outubro a março"
          type="number"
          min={1}
          max={365}
          value={intervaloQuente}
          onChange={(e) => setIntervaloQuente(Number(e.target.value))}
          required
        />

        <Campo
          rotulo="Dias entre regas — abril a setembro"
          type="number"
          min={1}
          max={365}
          value={intervaloFrio}
          onChange={(e) => setIntervaloFrio(Number(e.target.value))}
          required
        />

        <Seletor
          rotulo="Tolerância à seca"
          value={tolerancia}
          onChange={(e) => setTolerancia(e.target.value as ToleranciaSeca)}
          ajuda="Decide a partir de quando um atraso vira motivo de atenção."
        >
          {Object.entries(TOLERANCIAS).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </Seletor>

        {erro && <Aviso tom="erro">Não salvei: {erro}</Aviso>}

        <div className="acoes">
          <Botao type="submit" disabled={salvando || invalido}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </Botao>
          <Botao variante="discreto" onClick={cancelar} disabled={salvando}>
            Cancelar
          </Botao>
        </div>
      </form>
    </Cartao>
  )
}
