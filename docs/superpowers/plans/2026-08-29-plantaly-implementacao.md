# Plantaly — Plano de Implementação

**Data:** 2026-08-29
**Design de referência:** [`../specs/2026-08-29-plantaly-design.md`](../specs/2026-08-29-plantaly-design.md)

Este plano quebra o design em etapas executáveis. Cada etapa tem uma branch própria, criada **no momento em que o trabalho começa** — não antecipadamente — e termina em estado utilizável e testado.

---

## Convenções

**Branches:** `feat/<assunto>` para funcionalidade, `chore/<assunto>` para infraestrutura, `fix/<assunto>` para correção. Uma branch por etapa deste plano, criada a partir de `main` atualizada, integrada em `main` ao terminar.

**Commits:** mensagem em português, sem trailers de co-autoria.

**Definição de pronto** (vale para toda etapa):
1. Testes da etapa passando.
2. Nenhuma regressão nos testes anteriores.
3. Funciona no iPhone real, não só no navegador de mesa.
4. Nada de valor fixo no código que devesse ser token de cor ou constante de regra.

**Ordem de teste:** as regras de cálculo e o isolamento entre contas são escritos **antes** da interface que os consome. O resto segue o fluxo normal.

---

## Etapa 0 — Fundação

**Branch:** `chore/fundacao`
**Depende de:** nada
**Entrega:** projeto que roda, banco que existe, e a garantia de que uma conta não enxerga a outra.

1. **Andaime do projeto** — Vite + React + TypeScript. TypeScript não é preferência estética aqui: o app inteiro gira em torno de datas e uniões de estado (`alta | media | baixa`, tipos de evento), que é exatamente onde o tipo paga o próprio custo.
2. **Qualidade** — linter, formatador, runner de teste (Vitest). Configurados agora, quando custam dez minutos.
3. **Projeto Supabase** — criação, chaves em `.env` (já ignorado pelo Git), `.env.example` versionado.
4. **Migrações iniciais** — `profiles`, `plants`, `care_events`, `push_subscriptions`, conforme a seção 5 do design. Migrações versionadas no repositório desde a primeira, nunca alterações feitas à mão no painel.
5. **RLS em todas as tabelas** — política `user_id = auth.uid()` para leitura e escrita.
6. **Autenticação** — cadastro e login por e-mail, tela mínima e sem estilo ainda.

**Testes desta etapa** (escritos antes da interface):
- Conta A cria planta; conta B consulta e recebe vazio. Repetido para `care_events` e `push_subscriptions`.
- Escrita cruzada (conta B tentando inserir evento na planta de A) é recusada pelo banco.
- Usuário não autenticado não lê nada.

**Ponto a verificar antes de seguir** (seção 15 do design): confirmar o comportamento atual do plano gratuito do Supabase quanto a pausa por inatividade e disponibilidade de `pg_cron`. Se `pg_cron` não estiver disponível no plano, a Etapa 7 muda de forma — melhor descobrir agora que depois de construir o app inteiro em cima da suposição.

---

## Etapa 1 — Sistema visual

**Branch:** `feat/sistema-visual`
**Depende de:** Etapa 0
**Entrega:** os tokens e os componentes de base, antes de qualquer tela real.

Vem cedo de propósito: retrofitar cor e espaçamento depois de cinco telas prontas é retrabalho garantido.

1. **Tokens de cor** conforme a seção 9 do design — verdes estruturais, acentos florais, cores de estado. Definidos como variáveis CSS desde o início, já preparados para tema escuro futuro, mesmo sem implementá-lo.
2. **Verificação de contraste** de cada par texto/fundo e de cada cor de estado. Combinação que não passa em AA é corrigida agora, não depois.
3. **Escala de superfícies** — fundo, card, card elevado, com a diferença mínima de luminosidade e as bordas em tom da própria cor. É o que impede o "tudo parecido".
4. **Componentes base** — botão, card, campo de formulário, seletor, aviso, estado vazio.
5. **Motivos florais** — o conjunto de traços em SVG, com as regras de uso da seção 9 codificadas no próprio componente (opacidade, posicionamento), para que usar errado seja difícil.
6. **Layout mobile-first** com a barra de navegação inferior de quatro abas, ainda apontando para telas vazias.

**Testes:** verificação automatizada de contraste dos pares de cor definidos. O resto é conferência visual.

---

## Etapa 2 — Regras de cálculo

**Branch:** `feat/regras-calculo`
**Depende de:** Etapa 0
**Entrega:** o coração do app, como funções puras, sem nenhuma interface.

É a etapa mais importante do projeto e a mais barata de testar. Nada aqui toca banco ou tela.

1. **Estação vigente** a partir de uma data (hemisfério sul: outubro a março = quente).
2. **Intervalo vigente** de uma planta, escolhendo entre quente e frio pelo mês de **hoje**.
3. **Próxima rega** = última rega + intervalo vigente.
4. **Situação da planta** — sem histórico, em dia, vence hoje, atrasada, atenção.
5. **Gravidade do atraso** — atraso relativo ponderado pelos limiares de tolerância à seca (100% / 50% / 25%).
6. **Fator de ambiente** aplicado sobre o intervalo do catálogo para produzir a sugestão inicial.
7. **Supressão de adubação** enquanto houver rega atrasada, com retorno um ciclo depois da rega de recuperação.
8. **Detecção de desvio** para a sugestão de ajuste de intervalo.

**Testes — o bloco mais pesado do projeto:**
- Cada função acima, incluindo os limites exatos de cada faixa.
- Virada de estação no meio do ciclo, nos dois sentidos (abril e outubro).
- Rega registrada retroativamente recalcula a previsão.
- Planta sem histórico nunca aparece como atrasada.
- Fuso horário: rega às 23h conta no dia local correto; a fronteira do dia é a do usuário, não UTC.
- Gravidade: samambaia de intervalo 3 entra em atenção antes de Echeveria de intervalo 21, com o mesmo número de dias de atraso.
- Adubação suprimida e restaurada nos momentos certos.
- Desvio: quatro regas consistentemente mais curtas disparam a sugestão; uma rega fora do ritmo não dispara.

---

## Etapa 3 — Núcleo: plantas e rega

**Branch:** `feat/nucleo-rega`
**Depende de:** Etapas 1 e 2
**Entrega:** o app já é útil. A partir daqui vocês conseguem usar de verdade.

1. **Cadastro de planta** — apelido, espécie (por enquanto só nome livre; o catálogo entra na Etapa 4), ambiente, e a pergunta opcional pela última rega, com a opção "não sei".
2. **Aba "Hoje"** — atrasadas, depois vence hoje, depois próximos dias. Botão "Reguei" na própria linha, com "desfazer" por alguns segundos.
3. **Aba "Minhas plantas"** — lista com apelido, espécie e última rega.
4. **Ficha da planta** — próxima rega, intervalo em vigor (com a estação nomeada), histórico cronológico, edição, arquivar e excluir.
5. **Registro de rega com data editável.**
6. **View de status no banco**, replicando a regra da Etapa 2, e o **teste de paridade** entre as duas implementações — o risco nomeado na seção 13 do design.
7. **Registro otimista** com aviso visível quando a gravação falhar.

**Testes:**
- Paridade view do banco × funções da Etapa 2, sobre o mesmo conjunto de dados.
- Fluxo completo: cadastrar, regar, ver a próxima data mudar.
- Registro duplicado no mesmo dia gera pergunta, não duplicata.
- Arquivar preserva o histórico; excluir pede confirmação.
- Falha de gravação mostra erro em vez de fingir sucesso.

**Marco:** aqui o app entra em uso real, com as plantas de vocês. O que for aprendido nesse uso deve influenciar as etapas seguintes — é por isso que as branches não são criadas antes.

---

## Etapa 4 — Catálogo de espécies

**Branch:** `feat/catalogo-especies`
**Depende de:** Etapa 3
**Entrega:** a aba Espécies e o cadastro que preenche os intervalos sozinho.

A parte mais demorada não é o código: é a curadoria.

1. **Formato da ficha** em TypeScript, com todos os campos da seção 7 do design, incluindo tolerância à seca, "como identificar", "confundida com" e fontes.
2. **Validação na build** — espécie sem campo obrigatório, sem foto ou sem fonte quebra a build.
3. **Curadoria do conteúdo**, em ondas, priorizando o que vocês têm em casa:
   - Onda 1: as espécies das plantas já cadastradas na Etapa 3.
   - Onda 2: orquídeas e lírios (incluindo a desambiguação de lírio-da-paz, copo-de-leite e amarílis).
   - Onda 3: demais floríferas.
   - Onda 4: suculentas, folhagens e os genéricos de segurança.
4. **Fotos** — obtenção em acervo de licença livre, otimização, página de créditos, carregamento sob demanda.
5. **Aba Espécies** — navegação, busca e ficha completa.
6. **Integração com o cadastro** — escolher a espécie preenche intervalos e tolerância, com a origem marcada e o texto deixando claro que é sugestão editável.
7. **Migração das plantas existentes** para as espécies do catálogo, preservando qualquer intervalo já ajustado à mão.

**Testes:** integridade do catálogo; cadastro por espécie copia os valores corretos; ajuste manual sobrevive à migração.

**Regra que não se negocia:** espécie sem base confiável não entra — vai para o genérico. Um catálogo menor e verdadeiro é o produto; um catálogo grande e chutado é o contrário do que este app se propõe a ser.

---

## Etapa 5 — Complementos

**Branch:** uma por funcionalidade, criada quando começar. Sugestão de nomes: `feat/adubacao`, `feat/floracao`, `feat/calendario`, `feat/recuperacao`, `feat/aprendizado-intervalo`.
**Depende de:** Etapa 4
**Entrega:** as cinco funcionalidades independentes entre si.

Ordem sugerida, da mais usada para a menos:

1. **Recuperação** — bloco de orientação quando a planta entra em atenção, com o texto genérico e a nota da espécie; supressão da adubação já implementada na Etapa 2, agora visível na interface.
2. **Calendário** — grade mensal, histórico para trás e previsão para frente, detalhe do dia.
3. **Adubação** — opcional por planta, desligada por padrão, com o texto do catálogo como convite; ligar pergunta a última adubação; desligar preserva o histórico.
4. **Floração** — registro pontual com data e nota, exibido na ficha e no calendário. É onde o motivo floral pode ser mais expressivo.
5. **Aprendizado de intervalo** — sugestão na ficha após desvio consistente, com aceitar e recusar, sem insistência.

**Testes:** cada uma com os seus, mais a verificação de que desligar adubação não afeta nada da rega — a exigência explícita da seção 3.

---

## Etapa 6 — PWA instalável

**Branch:** `feat/pwa`
**Depende de:** Etapa 5
**Entrega:** app na tela de início, funcionando com dados em cache.

Separada do push de propósito: instalação e notificação falham por motivos diferentes, e depurar as duas juntas é bem pior.

1. **Manifest e ícones.**
2. **Service worker** com cache dos dados de leitura.
3. **Tela de instruções de instalação** — detecta que não está instalado e mostra o caminho Compartilhar → Adicionar à Tela de Início, ilustrado. É o passo em que as pessoas desistem; merece cuidado de verdade.

**Testes:** instalar nos dois iPhones e usar por alguns dias antes de seguir.

---

## Etapa 7 — Notificações push

**Branch:** `feat/push-ios`
**Depende de:** Etapa 6
**Entrega:** a notificação diária.

Deliberadamente por último. É a parte mais frágil, e até aqui o app já é completo sem ela.

1. **Chaves VAPID**, guardadas como segredo, nunca no repositório.
2. **Inscrição** — pedida somente depois do cadastro da primeira planta.
3. **Preferência de horário** no perfil, com fuso, padrão 8h.
4. **Edge Function** que consulta a view de status, agrupa por usuário e envia **uma notificação por pessoa**.
5. **Agendamento horário** via `pg_cron`, selecionando quem tem o horário local correspondente.
6. **Silêncio quando não há nada vencendo.**
7. **Higiene de inscrições** — remoção das mortas, reativação oferecida na abertura seguinte.

**Testes:** agrupamento e conteúdo da mensagem; nada a fazer não gera envio; não repete no mesmo dia; inscrição morta é removida. O envio real precisa de verificação manual nos aparelhos.

---

## Etapa 8 — Assistente de espécies (fase 2)

**Branch:** `feat/assistente-especies`
**Depende de:** Etapa 7 e de uma decisão sua

Não começa sem confirmação, porque **rompe a propriedade de custo zero**: exige chave de API com faturamento vinculado.

1. Edge Function que aceita um link ou um termo de busca.
2. Leitura da página e extração da ficha.
3. Tela de revisão, com os links de origem clicáveis.
4. Ficha aplicada **apenas à planta do usuário**, marcada como **não verificada**, nunca ao catálogo compartilhado.

**Testes:** ficha gerada nasce marcada; nunca escreve no catálogo; falha de rede ou de extração degrada para o cadastro manual.

---

## Sequência resumida

```
Etapa 0  Fundação ─────┬─→ Etapa 1  Sistema visual ─┐
                       └─→ Etapa 2  Regras          ─┴─→ Etapa 3  Núcleo
                                                          │
                                    Etapa 4  Catálogo ←───┘
                                          │
                                    Etapa 5  Complementos (5 branches independentes)
                                          │
                                    Etapa 6  PWA → Etapa 7  Push → Etapa 8  Assistente
```

Etapas 1 e 2 são paralelizáveis. As cinco de complementos também. O resto é sequencial.

---

## Decisões que este plano deixa em aberto

| Questão | Quando decidir |
|---|---|
| `pg_cron` disponível no plano contratado do Supabase | Etapa 0, antes de qualquer outra coisa |
| Fator numérico exato de cada ambiente | Etapa 2, como constante ajustável e documentada |
| Quantas espécies entram na primeira onda do catálogo | Etapa 4, guiado pelas plantas reais de vocês |
| Construir ou não o assistente | Depois da Etapa 7, com o app em uso |
