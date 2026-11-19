import { useState } from 'react'
import { BarraNavegacao } from '../navegacao/BarraNavegacao'
import { type Aba } from '../navegacao/abas'
import {
  Aviso,
  Botao,
  Campo,
  Cartao,
  EstadoVazio,
  Etiqueta,
  FotoDaPlanta,
  FraseDoDia,
  Motivo,
  Seletor,
} from './componentes'
import { estados } from './tokens'
import { FRASES } from '../frases/frases'

/**
 * Galeria do sistema visual.
 *
 * Só existe em desenvolvimento (`#/galeria`). Serve para ver todos os
 * componentes e todos os estados lado a lado — inclusive os que raramente
 * aparecem juntos no app real, como "atrasada" ao lado de "atenção", que é
 * justamente onde erro de contraste se esconde.
 */
function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--espaco-sm)' }}>
      <h2 style={{ fontSize: 'var(--texto-sm)', color: 'var(--texto-suave)' }}>{titulo}</h2>
      {children}
    </section>
  )
}

export function Galeria() {
  const [aba, setAba] = useState<Aba>('hoje')

  return (
    <div className="app">
      <header className="app__cabecalho">
        <Motivo contexto="cabecalho" />
        <h1>Sistema visual</h1>
      </header>

      <main className="app__conteudo">
        <Secao titulo="Botões">
          <div style={{ display: 'flex', gap: 'var(--espaco-sm)', flexWrap: 'wrap' }}>
            <Botao>Reguei</Botao>
            <Botao variante="secundario">Adiar</Botao>
            <Botao variante="discreto">Desfazer</Botao>
            <Botao disabled>Enviando…</Botao>
          </div>
        </Secao>

        <Secao titulo="Estados da planta">
          <Cartao>
            <div style={{ display: 'flex', gap: 'var(--espaco-sm)', flexWrap: 'wrap' }}>
              {(Object.keys(estados) as (keyof typeof estados)[]).map((chave) => (
                <Etiqueta key={chave} estado={chave} />
              ))}
            </div>
          </Cartao>
          <Cartao>
            <Etiqueta estado="atrasada" detalhe="há 3 dias" />{' '}
            <Etiqueta estado="atencao" detalhe="há 12 dias" />
          </Cartao>
        </Secao>

        <Secao titulo="Balão da planta">
          {/* Sem caminho, o balão cai na inicial do apelido — que é o estado
              que a lista mostra enquanto ninguém fotografou nada. A foto real
              exige sessão e Storage, e por isso não aparece aqui. */}
          <Cartao className="planta">
            <FotoDaPlanta caminho={null} apelido="Vitória" />
            <div className="planta__texto">
              <a className="planta__nome" href="#/galeria">
                Vitória
              </a>
              <p className="planta__especie">Orquídea Phalaenopsis</p>
              <p className="planta__rega">Regada há 6 dias</p>
              <p className="planta__proxima">Regar amanhã</p>
              <Etiqueta estado="emDia" />
            </div>
          </Cartao>

          <Cartao className="item">
            <FotoDaPlanta caminho={null} apelido="Zé" />
            <a className="item__nome" href="#/galeria">
              Zé
            </a>
            <Etiqueta estado="atrasada" detalhe="há 3 dias" />
            <Botao>Reguei</Botao>
          </Cartao>

          <Cartao>
            {/* Os dois tamanhos lado a lado: lista e ficha. */}
            <div style={{ display: 'flex', gap: 'var(--espaco-md)', alignItems: 'center' }}>
              <FotoDaPlanta caminho={null} apelido="Ângela" />
              <FotoDaPlanta caminho={null} apelido="ângela" tamanho="ficha" />
              <FotoDaPlanta caminho={null} apelido="🌵 cacto" tamanho="ficha" />
            </div>
          </Cartao>
        </Secao>

        <Secao titulo="Frase do dia">
          {/* A mais longa e a mais curta juntas: é onde a caixa quebra, se
              quebrar. */}
          <FraseDoDia frase={[...FRASES].sort((a, b) => b.texto.length - a.texto.length)[0]} />
          <FraseDoDia frase={[...FRASES].sort((a, b) => a.texto.length - b.texto.length)[0]} />
        </Secao>

        <Secao titulo="Superfícies">
          <Cartao>Cartão sobre o fundo</Cartao>
          <Cartao elevado>Cartão elevado — o único branco puro</Cartao>
        </Secao>

        <Secao titulo="Campos">
          <Cartao elevado>
            <div style={{ display: 'grid', gap: 'var(--espaco-md)' }}>
              <Campo rotulo="Apelido da planta" defaultValue="Orquídea da sala" />
              <Seletor rotulo="Ambiente" ajuda="Afeta o intervalo de rega sugerido.">
                <option>Varanda ou janela com sol direto</option>
                <option>Janela clara, sem sol direto</option>
                <option>Interior, longe da janela</option>
                <option>Banheiro ou cozinha</option>
              </Seletor>
              <Campo
                rotulo="Intervalo (dias)"
                defaultValue="0"
                erro="Precisa ser ao menos 1 dia."
              />
            </div>
          </Cartao>
        </Secao>

        <Secao titulo="Avisos">
          <Aviso tom="informacao">Adubação desligada nesta planta.</Aviso>
          <Aviso tom="atencao">Substrato muito seco: regue por imersão, sem aumentar a água.</Aviso>
          <Aviso tom="erro">Não foi possível salvar. Sem conexão.</Aviso>
        </Secao>

        <Secao titulo="Estado vazio">
          <Cartao>
            <EstadoVazio
              titulo="Nenhuma planta ainda"
              texto="Cadastre a primeira e o Plantaly começa a acompanhar as regas."
              acao={<Botao>Cadastrar planta</Botao>}
            />
          </Cartao>
        </Secao>

        <Secao titulo="Motivos florais">
          <Cartao style={{ minHeight: 120 }}>
            <Motivo contexto="cartao-especie" />
            <span style={{ fontSize: 'var(--texto-sm)' }}>Canto do cartão de espécie</span>
          </Cartao>
          <Cartao>
            <span style={{ fontSize: 'var(--texto-sm)' }}>Floração — o único mais expressivo</span>
            <div>
              <Motivo contexto="floracao" />
            </div>
          </Cartao>
        </Secao>
      </main>

      <BarraNavegacao atual={aba} aoTrocar={setAba} />
    </div>
  )
}
