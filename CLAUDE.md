# Plantaly

App web mobile-first para cuidado de plantas de casa, com foco em flores.

## Documentos de referência — leia antes de qualquer alteração

- **Design:** `docs/superpowers/specs/2026-08-29-plantaly-design.md` — fonte de verdade do produto. A seção 3 diz o que ficou **explicitamente fora de escopo e por quê**; a seção 15 lista os riscos conhecidos. Não reintroduza algo que está na tabela de fora de escopo sem falar com o Lucas.
- **Plano:** `docs/superpowers/plans/2026-08-29-plantaly-implementacao.md` — 9 etapas, com critérios de pronto e testes.

## Estado atual

Etapas 0 a 8 **não iniciadas**. O repositório contém apenas os dois documentos. Nada de código ainda.

Bloqueio da Etapa 0: confirmar `pg_cron` e `pg_net` no projeto Supabase, e obter URL + chave anônima.

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
