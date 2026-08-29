# Plantaly

App web mobile-first para cuidado de plantas de casa, com foco em flores.

## Documentos de referência — leia antes de qualquer alteração

- **Design:** `docs/superpowers/specs/2026-08-29-plantaly-design.md` — fonte de verdade do produto. A seção 3 diz o que ficou **explicitamente fora de escopo e por quê**; a seção 15 lista os riscos conhecidos. Não reintroduza algo que está na tabela de fora de escopo sem falar com o Lucas.
- **Plano:** `docs/superpowers/plans/2026-08-29-plantaly-implementacao.md` — 9 etapas, com critérios de pronto e testes.

## Estado atual

**Etapas 0 a 3 feitas.** O app já é usável: dá para cadastrar planta, registrar rega e ver a próxima data. Etapas 4 a 8 não iniciadas. Próxima: Etapa 4 (catálogo de espécies).

Etapa 0: andaime Vite + React 19 + TypeScript, oxlint, Prettier, Vitest, cliente Supabase, autenticação por e-mail, migrações em `supabase/migrations/`, teste de isolamento em `testes/isolamento.test.ts`.

Etapa 1: paleta em `src/visual/tokens.ts` + `tokens.css` (duas cópias, com teste de paridade), componentes base em `src/visual/componentes/`, barra de quatro abas em `src/navegacao/`, telas vazias em `src/telas/`. 76 testes de contraste, separação de superfícies e paridade.

Etapa 2: regras de cálculo em `src/dominio/`, todas funções puras, sem banco nem tela — datas em dia local, estação, ambiente, estado da rega, gravidade do atraso, supressão de adubação e aprendizado por histórico. 74 testes.

Etapa 3: view `plant_status` no banco, camada de dados em `src/dados/`, telas reais em `src/telas/` e rotas de ficha e cadastro. 15 testes de paridade.

**Ao mexer no cálculo:** a regra de "quem está atrasado" vive em dois lugares — a view `plant_status` (que o agendador da Etapa 7 vai consultar) e `src/dominio/rega.ts` (que a tela usa). **A view é a verdade.** `testes/paridade.test.ts` roda os mesmos dados nos dois caminhos e falha se discordarem; mudar um lado sem o outro quebra a suíte de propósito.

**Ao criar view nova:** sempre `with (security_invoker = true)`. Sem isso a view roda com os privilégios do dono e ignora o RLS de quem consulta.

**Galeria do sistema visual:** `npm run dev` e abrir `#/galeria` — só em desenvolvimento. Mostra todos os componentes e todos os estados juntos.

**Confirmado em 2026-08-29:** `pg_cron` 1.6.4 e `pg_net` 0.20.4 habilitados no Supabase. O agendamento da Etapa 7 é viável como desenhado.

**Banco aplicado em 2026-08-29.** Migrações rodadas, confirmação de e-mail desligada, contas de teste criadas. `npm test` passa: 89 testes, sendo 13 de isolamento entre contas.

## Comandos

- `npm run verificar` — lint + formatação + tipos + testes. É o portão de cada etapa.
- `npm run dev` — servidor local; `#/galeria` mostra o sistema visual.
- `npm run contas:teste` — recria as contas de teste no `.env` (se o banco for resetado).
- `npm run migracoes:juntar` — gera `supabase/aplicar-tudo.sql` para colar no SQL Editor.

## Restrições que não dá para inferir do código

- **Dois usuários — o Lucas e a namorada — com contas e plantas separadas.** Não é lista compartilhada.
- **Ambos usam iPhone.** É isso que obriga o push a depender de PWA instalado na Tela de Início, e o agendamento a ser server-side.
- **Foco em flores** (orquídeas, lírios, violeta, kalanchoe), não em folhagens.
- **Não há animais na casa** — o campo de toxicidade foi recusado deliberadamente.

## Princípios do projeto

1. **Dado concreto ou nenhum dado.** O catálogo usa faixas com fonte citada. Espécie sem base confiável não entra — vai para o genérico. Não invente intervalo de rega.
2. **O histórico nunca se perde.** Arquivar preserva; desligar adubação preserva. Exclusão real só com confirmação explícita.
3. **Nada é calculado em dois lugares sem teste de paridade.** A view do banco é a verdade sobre "quem está atrasado".
4. **O app tem que funcionar sem o push.** A aba "Hoje" é a rede de segurança.

## Convenções

- **Idioma:** português na interface, no catálogo, na documentação e nas mensagens de commit.
- **Commits:** sem trailers de co-autoria. Apenas no nome do autor.
- **Branches:** `feat/`, `chore/`, `fix/`. Criadas **quando o trabalho começa**, nunca em lote antecipadamente.
- **Segredos:** `.env` nunca versionado. A chave `service_role` do Supabase nunca vai para o frontend nem para o repositório.
