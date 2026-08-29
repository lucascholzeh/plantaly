-- Guarda a última sugestão de intervalo que o usuário dispensou.
--
-- Sem isso o app não teria como cumprir a regra da seção 6: "recusado, não
-- insiste; volta apenas se o desvio mudar de magnitude". Toda abertura da
-- ficha proporia de novo o mesmo número, e a sugestão viraria ruído — que é
-- o caminho mais curto para o usuário parar de ler qualquer aviso do app.

alter table public.plants
  add column rejected_interval smallint
    check (rejected_interval is null or rejected_interval between 1 and 365);

comment on column public.plants.rejected_interval is
  'Último intervalo sugerido pelo aprendizado e recusado pelo usuário. A mesma sugestão não é repetida.';
