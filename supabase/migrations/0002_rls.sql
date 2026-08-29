-- Row Level Security.
--
-- Este arquivo é a garantia de que a conta do Lucas e a da namorada nunca se
-- enxergam. A chave anônima é pública por design — vai no bundle do navegador —
-- então o que protege os dados é exclusivamente o que está aqui.
--
-- `(select auth.uid())` em vez de `auth.uid()` direto: o planejador avalia uma
-- vez por consulta em vez de uma vez por linha.

alter table public.profiles enable row level security;
alter table public.plants enable row level security;
alter table public.care_events enable row level security;
alter table public.push_subscriptions enable row level security;

-- ------------------------------------------------------------- profiles

create policy "perfil proprio: ler"
  on public.profiles for select
  using (id = (select auth.uid()));

create policy "perfil proprio: atualizar"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Inserção fica a cargo do gatilho de cadastro (0003), que roda como definer.

-- --------------------------------------------------------------- plants

create policy "plantas proprias: ler"
  on public.plants for select
  using (user_id = (select auth.uid()));

create policy "plantas proprias: inserir"
  on public.plants for insert
  with check (user_id = (select auth.uid()));

create policy "plantas proprias: atualizar"
  on public.plants for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "plantas proprias: excluir"
  on public.plants for delete
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------- care_events
--
-- Além de exigir que o evento seja seu, exige que a planta também seja.
-- Sem a segunda metade, uma conta poderia pendurar eventos na planta da outra.

create policy "eventos proprios: ler"
  on public.care_events for select
  using (user_id = (select auth.uid()));

create policy "eventos proprios: inserir"
  on public.care_events for insert
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.plants p
      where p.id = plant_id and p.user_id = (select auth.uid())
    )
  );

create policy "eventos proprios: atualizar"
  on public.care_events for update
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.plants p
      where p.id = plant_id and p.user_id = (select auth.uid())
    )
  );

create policy "eventos proprios: excluir"
  on public.care_events for delete
  using (user_id = (select auth.uid()));

-- --------------------------------------------------- push_subscriptions

create policy "inscricoes proprias: ler"
  on public.push_subscriptions for select
  using (user_id = (select auth.uid()));

create policy "inscricoes proprias: inserir"
  on public.push_subscriptions for insert
  with check (user_id = (select auth.uid()));

create policy "inscricoes proprias: atualizar"
  on public.push_subscriptions for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "inscricoes proprias: excluir"
  on public.push_subscriptions for delete
  using (user_id = (select auth.uid()));
