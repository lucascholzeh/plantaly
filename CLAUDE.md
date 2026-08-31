# Plantaly

App web mobile-first para cuidado de plantas de casa, com foco em flores.

## Documentos de referência — leia antes de qualquer alteração

- **Design:** `docs/superpowers/specs/2026-08-29-plantaly-design.md` — fonte de verdade do produto. A seção 3 diz o que ficou **explicitamente fora de escopo e por quê**; a seção 15 lista os riscos conhecidos. Não reintroduza algo que está na tabela de fora de escopo sem falar com o Lucas.
- **Plano:** `docs/superpowers/plans/2026-08-29-plantaly-implementacao.md` — 9 etapas, com critérios de pronto e testes.

## Estado atual

**Etapas 0 a 3 e 5 a 7 feitas. Etapa 4 (catálogo) na onda 2**, com 10 espécies de ~30 previstas, todas com foto conferida. A Etapa 8 (assistente) fica para depois, por decisão do Lucas.

**Foto da planta do usuário (2026-08-30).** Estava na tabela de fora de escopo da seção 3 do design; o Lucas pediu e decidiu por Supabase Storage. Bucket privado `fotos-plantas`, uma pasta por conta, caminho `<user_id>/<planta_id>.jpg` gravado em `plants.photo_path`. **A foto acompanha o apelido, nunca o substitui** — sem foto, o balão mostra a inicial. Migração 0007 aplicada e conferida ponta a ponta: enviar, exibir na lista e remover. A redução no navegador levou uma foto de 871 kB para 256 kB.

**Próxima rega no balão: sempre em dias, nunca em data.** `proximaRegaEmLinha` já mostrou "Regar 7 de outubro" e o Lucas recusou em 2026-08-30 — a data obriga a abrir o calendário para descobrir se é longe. Só "hoje" e "amanhã" escapam da contagem, por serem mais curtos que ela. A data por extenso continua na ficha da planta.

**Frase do dia (2026-08-30).** Frases existencialistas de livro, uma por manhã, no box abaixo das pendências da aba "Hoje" e em notificação própria. **São duas notificações por manhã agora:** a da rega — que passou a ser enviada também em dia calmo, dizendo que não há o que regar — e a da frase. **A escolha da frase é determinística** (`src/frases/escolha.ts`): sai de um hash do dia local + id do usuário, sem tabela nem estado, e é isso que faz o box e a notificação mostrarem a mesma frase sem se falarem. Migração 0009 aplicada em 2026-08-30.

**Ao acrescentar frase:** confira a atribuição numa fonte antes de escrever, e preencha `fonte` com a URL — mesma disciplina do catálogo. O cabeçalho de `src/frases/frases.ts` registra duas atribuições que já foram **reprovadas** na conferência; não as reintroduza. Cuidado especial com a frase famosa que "todo mundo sabe de quem é": "quem tem um porquê enfrenta qualquer como" é de Nietzsche, não de Frankl, e a mais citada de Marco Aurélio na internet não existe nas Meditações.

**As frases vivem em dois lugares** — `src/frases/` (navegador) e `supabase/functions/enviar-lembretes/` (Deno, que não alcança `src/`). São cópias literais, e `testes/frases-paridade.test.ts` falha se divergirem. **Ao mexer num, copie para o outro** — inclusive depois de `npm run format`, que reformata os dois e desfaz a igualdade byte a byte.

**Tag da notificação vem do servidor.** Notificação nova com a mesma `tag` substitui a anterior na tela: com as duas da manhã usando `plantaly-lembrete`, a frase apagaria o lembrete de rega. `plantaly-rega` e `plantaly-frase` mantêm as duas visíveis.

**Pendente:** republicar a Edge Function (a migração 0009 já foi aplicada) e instalar o PWA nos dois iPhones para ativar os lembretes — único passo que exige aparelho real. Migrações 0001-0009 aplicadas; segredos enviados; Edge Function `enviar-lembretes` ACTIVE e respondendo 200.

Etapa 0: andaime Vite + React 19 + TypeScript, oxlint, Prettier, Vitest, cliente Supabase, autenticação por e-mail, migrações em `supabase/migrations/`, teste de isolamento em `testes/isolamento.test.ts`.

Etapa 1: paleta em `src/visual/tokens.ts` + `tokens.css` (duas cópias, com teste de paridade), componentes base em `src/visual/componentes/`, barra de quatro abas em `src/navegacao/`, telas vazias em `src/telas/`. 76 testes de contraste, separação de superfícies e paridade.

Etapa 2: regras de cálculo em `src/dominio/`, todas funções puras, sem banco nem tela — datas em dia local, estação, ambiente, estado da rega, gravidade do atraso, supressão de adubação e aprendizado por histórico. 74 testes.

Etapa 3: view `plant_status` no banco, camada de dados em `src/dados/`, telas reais em `src/telas/` e rotas de ficha e cadastro. 15 testes de paridade.

**Editar a planta (2026-08-30).** Bloco "Dados da planta" na ficha, fechado por padrão: apelido, espécie, ambiente, os dois intervalos e tolerância. Corrigir cadastro errado deixou de exigir excluir e refazer — que levava o histórico junto.

**O ambiente sugere, nunca aplica sozinho.** `ajustarPorAmbiente` roda **uma vez, no cadastro**, e o número guardado já é o efetivo (decisão estrutural 1). Na edição, trocar de ambiente mostra "8 → 11 dias" com botão de aceitar, via `sugerirPorMudancaDeAmbiente` — que **divide pelo fator de origem antes de multiplicar pelo novo**, senão cada troca reaplicaria o ajuste e o intervalo derreteria a cada edição. Aplicar sozinho também sobrescreveria em silêncio o que o aprendizado por histórico já corrigiu.

**Ao mexer no cálculo:** a regra de "quem está atrasado" vive em dois lugares — a view `plant_status` (que o agendador da Etapa 7 vai consultar) e `src/dominio/rega.ts` (que a tela usa). **A view é a verdade.** `testes/paridade.test.ts` roda os mesmos dados nos dois caminhos e falha se discordarem; mudar um lado sem o outro quebra a suíte de propósito.

**Ao escrever migração:** ela precisa ser **reexecutável**. São coladas à mão no SQL Editor, que aborta no primeiro erro — sem `if not exists` (ou equivalente), uma migração já aplicada impede todas as seguintes de rodar no mesmo arquivo.

**Ao criar view nova:** sempre `with (security_invoker = true)`. Sem isso a view roda com os privilégios do dono e ignora o RLS de quem consulta.

**Ao mexer no bucket de fotos:** o isolamento vem de `(storage.foldername(name))[1] = auth.uid()::text` — a primeira pasta do caminho é o id do dono. Mudar o formato do caminho em `src/dados/fotos.ts` sem mudar as políticas do 0007 abre as fotos de uma conta para a outra. `create policy` não aceita `if not exists`, por isso o 0007 faz `drop policy if exists` antes de cada uma. **Bucket privado, nunca público:** com bucket público as tabelas continuariam isoladas e as imagens vazariam mesmo assim, sem nenhum teste de tabela acusar — daí a seção "fotos das plantas" em `testes/isolamento.test.ts`.

**Coluna nova de planta chega `undefined`, não `null`, num banco sem a migração.** `photo_path !== null` dava verdadeiro e fazia o botão "Remover" aparecer em planta sem foto. Use truthiness ao ler coluna recém-criada.

Etapa 4 (em ondas): catálogo em `src/catalogo/`, com validação de integridade na build. 6 espécies na onda 1 — phalaenopsis, lírio-da-paz, violeta-africana, kalanchoe, echeveria, antúrio.

**Ao acrescentar espécie:** consulte a fonte de verdade antes de escrever qualquer número, e preencha `fontes` com a URL. Se a faixa de dias for tradução sua de um critério qualitativo (o caso normal — as fontes dizem "quando secar", não "a cada 8 dias"), marque `numerosDerivados: true`.

**Ao acrescentar foto:** `node scripts/buscar-fotos.mjs "<termo>" <prefixo>` baixa candidatas para `fotos-triagem/`. **Abra cada imagem antes de aceitar.** Boa parte das candidatas volta "PULADA" (o Wikimedia limita rajada) — peça 5 para ficar com 2 ou 3 utilizáveis. Rejeite também a foto tecnicamente correta que não identifica: um macro de estame de violeta não deixa ninguém reconhecer a planta. Acima de ~400 kB, reduza com `sharp` (grave num arquivo temporário e mova; escrever sobre a própria origem dá `UNKNOWN: open`). A busca do Wikimedia devolve arquivos cujo texto menciona a espécie, incluindo livro digitalizado — uma candidata a "violeta africana" era a capa de um catálogo de sementes de 1897. Espécie sem foto conferida precisa preencher `semFotoAinda` dizendo por quê.

**Galeria do sistema visual:** `npm run dev` e abrir `#/galeria` — só em desenvolvimento. Mostra todos os componentes e todos os estados juntos.

**Confirmado em 2026-08-29:** `pg_cron` 1.6.4 e `pg_net` 0.20.4 habilitados no Supabase. O agendamento da Etapa 7 é viável como desenhado.

**Banco aplicado em 2026-08-29.** Migrações rodadas, confirmação de e-mail desligada, contas de teste criadas. `npm test` passa: 89 testes, sendo 13 de isolamento entre contas.

## Publicação

- **App:** Vercel, em `https://plantaly.vercel.app`. A URL longa com hash é específica de um deploy e fica atrás do login do Vercel — a de produção é a curta.
- **Build no Vercel precisa das três variáveis `VITE_*`.** Sem elas o bundle sai sem a URL do Supabase e o app mostra tela branca: o cliente lança erro antes de montar. Conferir com `curl -s https://plantaly.vercel.app/assets/index-*.js | grep -c supabase.co` — zero significa build sem variáveis.
- **O Vercel builda a `main`.** Uma etapa que vive só na branch não existe em produção, e o sintoma engana: em 2026-08-30 a Etapa 7 estava na `feat/push-ios`, o build caía em `generateSW` (descartando o `src/sw.ts` feito à mão) e a chave VAPID não entrava no bundle — porque nenhum código que a lê estava publicado. Passamos rodadas conferindo a variável de ambiente, que estava certa desde o início. **Antes de investigar variável que "não entra no build", confira se o código que a lê está na `main`.** No log do Vercel, `mode generateSW` em vez de `injectManifest` é o sinal.
- **Hash do bundle igual = build sem mudança.** O Vite deriva o nome do conteúdo. Se `assets/index-*.js` não mudou de nome depois de um deploy, nada novo foi compilado — não adianta procurar a causa dentro do bundle.
- **Segredos da Edge Function** (`VAPID_PRIVATE_KEY`, `SEGREDO_AGENDADOR`) nunca vão para o Vercel. Só para o Supabase, via `npm run segredos`.

## Comandos

- `npm run verificar` — lint + formatação + tipos + testes. É o portão de cada etapa.
- `npm run dev` — servidor local; `#/galeria` mostra o sistema visual.
- `npm run contas:teste` — recria as contas de teste no `.env` (se o banco for resetado).
- `npm run migracoes:juntar [0006]` — gera `supabase/aplicar-tudo.sql` para colar no SQL Editor; o argumento inclui só da migração indicada em diante.
- `npm run segredos` — envia os segredos da Edge Function, lendo do `.env`.
- `npm run icones` — regera os ícones do PWA a partir do SVG.

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
