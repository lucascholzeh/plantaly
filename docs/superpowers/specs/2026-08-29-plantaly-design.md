# Plantaly — Documento de Design

**Data:** 2026-08-29
**Status:** Design aprovado, aguardando plano de implementação
**Idioma do projeto:** português (interface, catálogo e documentação)

---

## 1. Resumo

Aplicação web responsiva (mobile-first) para cuidado de plantas de casa, com foco em flores. Registra regas e adubações, prevê a próxima rega considerando espécie, estação do ano e ambiente da casa, e avisa por notificação no celular. Inclui um catálogo curado de espécies com fotos, critérios de identificação e orientação de cuidado.

Usuários: duas pessoas (o autor e sua namorada), **cada uma com sua própria conta e suas próprias plantas**. Não é uma lista compartilhada. Ambas usam iPhone.

---

## 2. Contexto e objetivo

O problema real é lembrar quando cada planta foi regada pela última vez e quando precisa ser regada de novo, com informação de cuidado específica da espécie e confiável. Um problema secundário, mas explicitamente citado: **saber qual espécie se tem de fato** — plantas são compradas como "Orquídea", sem identificação.

Critérios de sucesso:

- O histórico de regas nunca se perde (troca de aparelho, limpeza de navegador).
- Abrir o app de manhã responde em segundos "o que eu faço hoje".
- A recomendação de rega considera a realidade daquela planta, não uma média genérica.
- O catálogo diz a verdade ou não diz nada.

---

## 3. Escopo

### v1

- Contas separadas, com login e dados isolados por usuário.
- Cadastro de plantas: apelido, espécie (do catálogo ou livre), ambiente da casa.
- Registro de rega, com data editável (registro retroativo).
- Adubação **opcional por planta**, desligada por padrão, ligável/desligável depois.
- Registro pontual de floração.
- Previsão da próxima rega com sazonalidade e ambiente.
- Ajuste sugerido a partir do comportamento real do usuário.
- Orientação de recuperação para plantas em atraso grave.
- Catálogo de espécies com fotos, identificação visual e cuidado.
- Calendário mensal com histórico e previsão.
- Notificação push diária no iPhone.

### Fase 2

- Assistente que gera ficha de espécie fora do catálogo a partir de busca na internet ou de um link fornecido pelo usuário.

### Explicitamente fora de escopo

| Item | Motivo |
|---|---|
| Fotos das plantas do próprio usuário | Exige armazenamento de arquivos, redimensionamento e custo; pouco valor imediato. Acrescentável depois sem refazer nada. |
| Tamanho e material do vaso | Influencia de verdade, mas alonga o cadastro para um chute só um pouco melhor. O aprendizado por histórico captura o efeito. |
| Ar-condicionado e umidade do ar declarados | Mesmo motivo. |
| Toxicidade para animais | Não há animais na casa. |
| Lista compartilhada entre os dois usuários | Cada um tem suas próprias plantas. |
| E-mail de lembrete | Redundante com o push. |
| Fila de sincronização offline completa | Complexidade alta para um app usado em casa no wi-fi. |
| Replantio como tarefa recorrente | Raro demais; fica como anotação/evento pontual. |

---

## 4. Arquitetura

**Abordagem escolhida:** frontend estático (SPA React + Vite) e Supabase como backend único.

- **Frontend:** SPA React, mobile-first, PWA (manifest + service worker). Sem renderização no servidor — o app inteiro fica atrás de login e não tem nada a indexar.
- **Banco:** Postgres no Supabase, com Row Level Security.
- **Autenticação:** Supabase Auth.
- **Agendamento:** `pg_cron` dentro do Postgres, acionando uma Edge Function de hora em hora.
- **Push:** Web Push (VAPID) a partir da Edge Function.
- **Catálogo:** arquivo versionado no repositório, **não** no banco.

**Por que não Next.js/Vercel:** o cron do plano gratuito da Vercel tem horário aproximado e execução diária limitada, e a renderização no servidor não serve a um app privado. `pg_cron` dá controle exato do horário.

**Por que não Firebase:** Firestore é o modelo errado para histórico de eventos e para a pergunta "quem está atrasado"; funções agendadas exigem plano com cartão vinculado.

---

## 5. Modelo de dados

### `profiles`

Fuso horário e hora escolhida para a notificação (padrão 8h).

### `plants`

Uma linha por planta do usuário.

| Campo | Observação |
|---|---|
| `user_id` | Dono. Base do RLS. |
| `nickname` | Apelido dado pelo usuário. |
| `species_slug` | Referência ao catálogo em código. Nulo se for espécie livre. |
| `species_label` | Nome digitado, quando fora do catálogo. |
| `species_source` | `catalogo` \| `manual` \| `assistente` (fase 2). |
| `species_sources_url` | Links de origem, quando gerada pelo assistente. |
| `environment` | Ambiente da casa (ver seção 6). |
| `water_interval_warm` / `water_interval_cold` | Intervalo efetivo, em dias. |
| `fertilize_interval_warm` / `fertilize_interval_cold` | Nulos = adubação desligada. Padrão de cadastro: desligada. |
| `drought_tolerance` | `alta` \| `media` \| `baixa`. Copiada do catálogo, como os intervalos. Espécie livre entra como `media`. |
| `archived_at` | Arquivamento suave. |

### `care_events`

O histórico. Uma linha por evento: `rega`, `adubacao`, `floracao`, `replantio`, `nota`. Cada uma com `occurred_at` (editável) e observação opcional.

### `push_subscriptions`

Uma linha por aparelho inscrito, com contador de falhas.

### Decisões estruturais

1. **O catálogo é fonte de sugestão, não verdade em tempo real.** Ao cadastrar, os intervalos são copiados do catálogo para dentro da planta e passam a ser editáveis. Consequência importante: a rotina do servidor não precisa conhecer o catálogo, só a tabela de plantas.
2. **Sazonalidade em dois campos**, não um. O app escolhe pelo mês corrente (hemisfério sul: outubro a março = estação quente).
3. **Um histórico único**, não uma tabela por tipo de tarefa. Calendário e ficha fazem a mesma pergunta: "tudo que aconteceu, em ordem".
4. **"Próxima rega" é calculada, nunca armazenada.** Vive numa view do banco. Campo salvo dessincroniza quando se registra uma rega retroativa.
5. **Isolamento por RLS** (`user_id = auth.uid()`) em todas as tabelas — garantia no banco, não no código do app.
6. **Nada é apagado por acaso.** Arquivar preserva o histórico; desligar adubação preserva os registros antigos.

---

## 6. Regras de cálculo

### Próxima rega

```
proxima_rega     = ultima_rega + intervalo_vigente
intervalo_vigente = intervalo_quente ou intervalo_frio, conforme o mês de HOJE
```

O intervalo usado é o vigente **hoje**, não o vigente na data da última rega. Isso é correto e tem efeito visível na virada de estação: em abril plantas ganham folga, em outubro algumas ficam atrasadas de uma vez. A ficha mostra qual intervalo está em vigor, para não parecer defeito.

### Ambiente

O ambiente é escolhido no cadastro (não é texto livre) e ajusta a sugestão inicial:

| Ambiente | Efeito |
|---|---|
| Varanda / janela com sol direto | seca bem mais rápido |
| Janela clara, sem sol direto | referência do catálogo |
| Interior, longe da janela | seca mais devagar |
| Banheiro / cozinha | seca mais devagar ainda |

**Honestidade sobre esse dado:** que luz e circulação de ar mudam a velocidade de secagem é fato horticultural estabelecido; o fator numérico exato de uma varanda específica não é conhecível. A interface apresenta o valor como sugestão ("sugerido para orquídea em varanda ensolarada"), editável, nunca como verdade.

Mudar o ambiente depois recomputa a sugestão e pergunta se aplica. Histórico intacto.

### Aprendizado por histórico

Se o intervalo real observado divergir de forma consistente do configurado, o app **sugere** o ajuste na ficha da planta.

- Só depois de ~4-5 regas registradas.
- Só se o desvio for consistente, não por uma rega fora do ritmo.
- **Nunca altera sozinho.**
- Recusado, não insiste; volta apenas se o desvio mudar de magnitude.

É esse mecanismo, e não o fator de ambiente, que resolve de verdade "a minha varanda seca mais rápido que a sala dela".

### Atraso e recuperação

O app reage à **proporção** do atraso, não a dias absolutos: uma semana de atraso é irrelevante numa suculenta de intervalo 21 e é emergência numa samambaia de intervalo 3.

```
atraso_relativo = dias_de_atraso / intervalo_vigente
```

O limiar de **atenção** depende da tolerância à seca da planta:

| Tolerância à seca | Entra em atenção quando o atraso passa de |
|---|---|
| Alta (suculenta, cacto, zamioculca) | 100% do intervalo |
| Média (padrão) | 50% do intervalo |
| Baixa (samambaia, lírio-da-paz, ciclame) | 25% do intervalo |

Exemplo: samambaia de intervalo 3 dias entra em atenção com menos de 1 dia de atraso; Echeveria de intervalo 21 dias só depois de 21 dias de atraso. É calibração inicial, ajustável conforme o uso.

Ao cruzar o limiar de **atenção**, a ficha exibe o bloco de recuperação:

1. **Não aumente a quantidade de água.** O volume é sempre o mesmo: regar até escorrer pelo furo e descartar o excesso do prato. Encharcar raiz que passou por seca apodrece a planta.
2. **Use imersão.** Substrato muito seco fica hidrofóbico e a água desce pelas beiradas sem molhar o torrão. Vaso numa bacia com água por 10-20 minutos, até a superfície ficar úmida.
3. **Não adube agora.** Adubo em raiz seca queima a raiz.
4. **Não aumente a luz** para "acelerar a recuperação" — piora.
5. **Espere perder folhas velhas**, que amarelam e caem.
6. **Flores e botões podem cair** — a planta abandona a floração antes da folhagem.

Mais a nota específica da espécie, quando houver (orquídea: raiz prateada volta a verde ao hidratar; suculenta: "isso ainda não é atraso").

**Regra cruzada:** a adubação é suprimida automaticamente enquanto a rega estiver atrasada, e só volta um ciclo de rega depois da rega de recuperação. O app nunca sugere adubar planta com sede.

---

## 7. Catálogo de espécies

### Granularidade

"Suculenta" e "orquídea" não são espécies. Phalaenopsis e Cattleya querem regas diferentes; Haworthia apodrece no ritmo que Echeveria tolera. O catálogo vai no nível em que o cuidado efetivamente muda — que costuma coincidir com o nome pelo qual a planta é vendida.

### Campos de cada ficha

- Nome popular, nome científico, apelidos regionais.
- **Critério de rega** (como saber que chegou a hora: dedo no substrato, peso do vaso, raiz prateada) — vem antes de qualquer número, porque é mais confiável que calendário.
- Faixa de dias na estação quente e na fria.
- Luz, adubação e demais condições relevantes.
- **Tolerância à seca** (alta / média / baixa) — alimenta o cálculo de gravidade.
- **Nota de recuperação** específica, opcional.
- **Como identificar**: dois ou três traços estruturais decisivos.
- **Costuma ser confundida com**: qual a diferença prática.
- **Sinais de problema**: folha amarelando, murcha, ponta seca — o que cada um indica.
- **Fotos** de referência (tipicamente flor + planta inteira/folha).
- **Fontes.**

### Identificação visual

A cor da flor **não** identifica espécie — Phalaenopsis existe branca, rosa, amarela, malhada, com o mesmo cuidado. O que identifica é estrutura: presença de pseudobulbo, espessura e formato da folha, raízes aéreas prateadas, formato e porte da flor, disposição da inflorescência. É esse o conteúdo do campo "como identificar".

### Lista preliminar

Ênfase em flores, que são o uso principal.

- **Orquídeas:** Phalaenopsis, Cattleya, Dendrobium, Oncidium (chuva-de-ouro)
- **Lírios e homônimos:** lírio verdadeiro (*Lilium*), copo-de-leite (*Zantedeschia*), amarílis (*Hippeastrum*), lírio-da-paz (*Spathiphyllum*)
- **Outras com flor:** violeta africana, kalanchoe (flor-da-fortuna), begônia, antúrio, bromélia, azaleia, gérbera, prímula, ciclame, hibisco, rosa-do-deserto, orquídea-bambu
- **Suculentas e afins:** Echeveria, Haworthia, Sedum, Crassula (jade), cacto de deserto
- **Folhagens comuns (núcleo menor):** jiboia, costela-de-adão, espada-de-são-jorge, zamioculca, filodendro, peperômia, maranta, samambaia, clorofito
- **Genéricos de segurança:** "orquídea (outra)", "suculenta (outra)", "cacto (outra)", com faixas mais largas e aviso de que são aproximados

**"Lírio" é o caso exemplar da armadilha de nome:** lírio-da-paz, copo-de-leite e amarílis não são lírios e não compartilham cuidado. Cada um entra com o desambiguador.

### Onde vive e por quê

Arquivo versionado no repositório. O histórico do Git vira o registro de auditoria do conteúdo — dá para ver quando um número mudou e por quê. Carrega junto com o app, então a aba Espécies abre instantânea, sem consulta ao banco.

### Compromissos sobre a qualidade do dado

1. **Faixas, não números mágicos.** "7-10 dias no verão, 12-20 no inverno", não "a cada 7 dias".
2. **Fonte por espécie**, auditável.
3. **Sazonalidade explícita** — regar no inverno no ritmo do verão é o erro que mais mata planta de casa.
4. **Espécie sem base confiável não entra.** Melhor um catálogo menor e verdadeiro; o usuário cai no genérico.
5. **Viés climático declarado.** As boas fontes de horticultura (RHS, Missouri Botanical Garden, American Orchid Society, extensões universitárias) são majoritariamente de clima temperado. Onde o clima brasileiro muda a resposta, a ficha diz isso em vez de transpor um número.
6. **Fotos com fonte visível.** Acervos abertos contêm imagens identificadas erradamente; onde a espécie tem sósia, a ficha sinaliza a dúvida em vez de estampar uma imagem confiante.

---

## 8. Navegação e telas

Barra fixa inferior, quatro seções.

**Hoje** — tela inicial e destino do push. Mostra só o que exige ação: atrasadas, depois as de hoje, depois os próximos dias. Botão de resolver no próprio item ("Reguei" / "Adubei"), sem entrar na planta. É a tela dos dez segundos da manhã.

**Minhas plantas** — todas, com apelido, espécie e última rega. Tocar abre a **ficha**: próxima rega e próxima adubação, histórico cronológico, registros de floração, recomendações da espécie, bloco de recuperação quando aplicável, e edição.

**Calendário** — grade mensal. Para trás, o que aconteceu de fato; para frente, o previsto. Tocar num dia detalha.

**Espécies** — catálogo navegável e pesquisável, independente de possuir a planta. É onde se resolve "qual orquídea eu tenho": comparar fotos e ler os traços de identificação. Permite cadastrar direto ("tenho essa").

**Decisão registrada:** "Hoje" e "Minhas plantas" ficam separadas, mesmo custando uma aba e mesmo parecidas quando há poucas plantas. A notificação precisa cair num lugar que responda "o que eu faço agora", não numa lista onde é preciso procurar. Reversível.

---

## 9. Identidade visual

**Direção:** cores leves inspiradas em folhagem e flores. Colorido, em tons claros — mas com separação suficiente entre eles para que superfícies e estados não se confundam. Detalhes florais sutis como decoração, sem virar ruído.

### Paleta

**Estrutura (verdes):** fundo em off-white levemente esverdeado (nunca branco puro), cards em branco quente, verde-folha médio como cor primária de ações e navegação ativa, verde profundo no lugar do preto para texto.

**Acentos florais:** rosa-orquídea, amarelo-gérbera, lilás-violeta e coral/terracota. Cada um carrega significado — não são decoração aleatória:

| Estado | Cor |
|---|---|
| Em dia | verde |
| Vence hoje | amarelo-gérbera |
| Atrasada | coral suave |
| Atenção (recuperação) | terracota, mais saturado |
| Floração | lilás-violeta |

**Sem vermelho de alarme**, coerente com a decisão da seção 11: atraso se comunica sem dramatizar.

### A regra contra o "tudo parecido"

O risco de paleta clara é as superfícies se fundirem. A separação vem de três meios combinados, nunca de matiz sozinho:

1. Diferença mínima garantida de luminosidade entre fundo, card e card elevado.
2. Bordas de 1px em tom da própria cor da superfície, não cinza.
3. O acento colorido carregando o estado, com peso visual suficiente para ser lido de relance.

**Acessibilidade:** contraste mínimo AA para texto. Estado nunca comunicado só por cor — sempre cor + ícone + texto ("Atrasada há 3 dias"), o que também resolve leitura sob sol na varanda.

### Detalhes florais

Um único sistema de motivos: traço fino botânico (pétala, folha), em tinta da própria superfície, opacidade baixa.

**Onde entram:** estados vazios (nenhuma planta cadastrada, mês sem registros), cabeçalho das seções, canto do card de espécie no catálogo, e o registro de floração — o único lugar onde pode ser mais expressivo, porque é o momento de comemoração do app.

**Onde não entram:** nas linhas de ação da aba "Hoje" (tela funcional de dez segundos), atrás de qualquer texto, e na ficha de planta em estado de atenção — não se decora um problema.

**Contenção:** no máximo um elemento decorativo por região visível, e nunca dois motivos diferentes na mesma tela. É essa regra que separa "decorado" de "bagunçado".

### Outras decisões

**Tipografia:** uma família só, com variação de peso. O número de dias é o dado lido de relance e recebe destaque de tamanho.

**Tema escuro:** fora do v1, mas as cores entram como tokens desde o primeiro commit para não exigir reescrita depois.

---

## 10. Notificações

### Cadastro no iPhone

Push no iOS funciona **apenas para web app adicionado à Tela de Início**. Não existe notificação para site aberto no Safari. Implicações aceitas:

- Ritual manual, uma vez por pessoa: Safari → Compartilhar → "Adicionar à Tela de Início" → abrir pelo ícone → aceitar a permissão. Não há como automatizar nem exibir o convite de instalação que o Android exibe.
- Apagar o ícone mata a inscrição; é preciso refazer.
- O iOS não permite que o app agende a própria notificação. O disparo é sempre do servidor.

O app detecta que não está instalado e mostra o passo a passo. A permissão só é pedida **depois do cadastro da primeira planta** — pedir numa tela vazia é o caminho mais rápido para um "Não permitir" difícil de reverter.

### Disparo

Rotina de hora em hora seleciona os usuários cuja hora local configurada bate com o momento, consulta a view de status e junta tudo que está vencido ou vence hoje — rega e adubação no mesmo pacote.

- **Uma notificação por pessoa**, não uma por planta: "3 plantas precisam de você hoje — Orquídea da sala, Jiboia, Zamioculca".
- **Nada vencendo, nada enviado.** Nenhum "tudo em dia!" diário.
- Enquanto continuar atrasada, reaparece **uma vez por dia**, no horário do usuário.
- Tocar abre a aba "Hoje".
- **Sem botões de ação na notificação** — não são confiáveis no iOS.

### Falhas

Inscrição morta (ícone apagado, troca de aparelho) é removida pelo servidor; o app percebe na abertura seguinte e oferece reativar. Falhas temporárias são registradas e tentadas no dia seguinte, sem fila de reenvio — lembrete de rega atrasado em horas não tem valor.

**A rede de segurança é a aba "Hoje".** Mesmo que o push nunca funcione, o app continua inteiro e correto. Por isso o push é a última etapa da implementação.

---

## 11. Casos de borda

| Caso | Comportamento |
|---|---|
| Registro retroativo | Data do evento editável no registro; a próxima rega recalcula a partir dela. |
| Planta recém-cadastrada | Pergunta opcional pela última rega. Sem resposta, entra como "sem histórico" e **não** aparece atrasada. Não se inventa atraso. |
| Toque duplo | "Desfazer" por alguns segundos; registro do mesmo tipo no mesmo dia gera pergunta, não duplicata. |
| Atraso grande | "Atrasada há 12 dias", sem alarme e sem acumular regas devidas. Uma rega devolve ao ciclo. |
| Virada de estação | Usa o intervalo vigente hoje. A ficha informa qual está em vigor. |
| Mudança de ambiente | Recomputa a sugestão e pergunta se aplica. Histórico intacto. |
| Arquivar × excluir | Arquivar esconde e guarda tudo. Excluir existe para cadastro errado, pede confirmação e leva o histórico junto. |
| Planta morreu | Arquivar, com motivo opcional. |
| Fuso horário | "Hoje" é o dia local do usuário; rega às 23h conta no dia certo. |

---

## 12. Erros e falhas

- **Sem internet / sinal ruim:** o app abre com dados em cache (o service worker já existe por causa do push). Registro otimista: aparece feito na hora e é enviado em seguida; falhando, **o app informa que não salvou** em vez de fingir.
- **Sessão expirada:** novo login, devolvendo o usuário ao ponto em que estava.
- **Erro do banco:** mensagem clara e ação de repetir. Nunca tela branca.

---

## 13. Testes

**Peso principal no cálculo de datas**, que é lógica pura e barata de testar: sazonalidade, virada de estação no meio do ciclo, ambiente, registro retroativo, planta sem histórico, fuso horário, gatilho da sugestão de ajuste, limiar de gravidade do atraso.

**Risco nomeado:** a regra de "quem está atrasado" existe em dois lugares — na view do banco (usada pelo agendador) e no app (para resposta imediata). Duas implementações da mesma regra divergem com o tempo. **A view é a verdade**, e existe um teste que roda os mesmos dados nos dois caminhos e falha se discordarem.

**Teste mais importante:** isolamento. Uma conta tentando ler planta da outra recebe vazio, direto do banco. Escrito antes de qualquer tela.

**Integridade do catálogo:** toda espécie precisa ter campos obrigatórios, faixas coerentes, foto e fonte. Faltando, a build quebra. É o que impede o catálogo de apodrecer.

**Interface:** teste de fumaça nos fluxos principais, sem cobertura exaustiva.

---

## 14. Fases de implementação

1. **Fundação** — projeto, banco, RLS e o teste de isolamento.
2. **Núcleo** — cadastro de plantas, registro de rega, cálculo de próxima rega com sazonalidade e ambiente, aba "Hoje", ficha da planta.
3. **Catálogo** — conteúdo curado, fotos, identificação, integração com o cadastro, aba Espécies.
4. **Complementos** — adubação opcional, floração, calendário, aprendizado por histórico, bloco de recuperação.
5. **Push** — PWA instalável, inscrição, agendamento, disparo. Última, por ser a parte mais frágil; o app já é usável sem ela.
6. **Fase 2** — assistente de espécie fora do catálogo.

---

## 15. Riscos e pontos a verificar

| Ponto | Observação |
|---|---|
| Limites do plano gratuito do Supabase | Pausa por inatividade e limites de `pg_cron` mudam com frequência. Confirmar na implementação; o cron diário deve manter o projeto ativo, mas isso precisa ser verificado, não assumido. |
| Push no iOS | A parte mais frágil do projeto. Inscrições podem morrer silenciosamente. Mitigado por não depender dele. |
| Precisão das fotos do catálogo | Acervos abertos contêm identificações erradas. Fonte visível e sinalização de dúvida onde há sósia. |
| Fator de ambiente | É heurística, não medição. Apresentado como sugestão editável; o aprendizado por histórico é quem converge para a verdade. |
| Custo do assistente (fase 2) | Rompe a propriedade de custo zero: exige chave de API com faturamento. Ficha gerada nasce marcada como **não verificada**, com links de origem, aplicada só à planta do usuário — nunca ao catálogo. |
