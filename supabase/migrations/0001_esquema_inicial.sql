-- Esquema inicial do Plantaly.
-- Referência: docs/superpowers/specs/2026-08-29-plantaly-design.md, seção 5.
--
-- Identificadores de tabela e coluna em inglês (como na spec); valores de
-- domínio em português, porque são vocabulário do produto.

-- ---------------------------------------------------------------- tipos

create type public.tipo_evento as enum (
  'rega',
  'adubacao',
  'floracao',
  'replantio',
  'nota'
);

-- Seção 6 do design: ambiente é escolha fechada, nunca texto livre.
create type public.ambiente as enum (
  'sol_direto',    -- varanda ou janela com sol direto: seca bem mais rápido
  'janela_clara',  -- janela clara sem sol direto: referência do catálogo
  'interior',      -- longe da janela: seca mais devagar
  'umido'          -- banheiro ou cozinha: seca mais devagar ainda
);

create type public.tolerancia_seca as enum ('alta', 'media', 'baixa');

create type public.origem_especie as enum ('catalogo', 'manual', 'assistente');

-- ------------------------------------------------------------- profiles

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  time_zone text not null default 'America/Sao_Paulo',
  notification_hour smallint not null default 8
    check (notification_hour between 0 and 23),
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Preferências do usuário. Uma linha por conta, criada automaticamente no cadastro.';

-- --------------------------------------------------------------- plants

create table public.plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  nickname text not null check (length(btrim(nickname)) > 0),

  -- Espécie: do catálogo (slug) ou livre (label). Ao menos uma das duas.
  species_slug text,
  species_label text,
  species_source public.origem_especie not null default 'manual',
  species_sources_url text[] not null default '{}',

  environment public.ambiente not null default 'janela_clara',

  -- Intervalos efetivos, copiados do catálogo no cadastro e editáveis.
  -- Decisão estrutural 1 da seção 5: o servidor não precisa do catálogo.
  water_interval_warm smallint not null check (water_interval_warm between 1 and 365),
  water_interval_cold smallint not null check (water_interval_cold between 1 and 365),

  -- Nulos = adubação desligada. Padrão de cadastro: desligada.
  fertilize_interval_warm smallint check (fertilize_interval_warm between 1 and 365),
  fertilize_interval_cold smallint check (fertilize_interval_cold between 1 and 365),

  drought_tolerance public.tolerancia_seca not null default 'media',

  -- Arquivamento suave: o histórico nunca se perde (princípio 2).
  archived_at timestamptz,
  created_at timestamptz not null default now(),

  constraint especie_identificada
    check (species_slug is not null or species_label is not null),

  -- Adubação é ligada ou desligada por inteiro, nunca meio ligada.
  constraint adubacao_coerente
    check (
      (fertilize_interval_warm is null and fertilize_interval_cold is null)
      or (fertilize_interval_warm is not null and fertilize_interval_cold is not null)
    )
);

create index plants_user_idx on public.plants (user_id) where archived_at is null;

comment on column public.plants.species_sources_url is
  'Links de origem quando a ficha veio do assistente (fase 2). Vazio nos demais casos.';

-- ---------------------------------------------------------- care_events

create table public.care_events (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants (id) on delete cascade,

  -- Desnormalizado de propósito: simplifica o RLS e as consultas do agendador.
  -- A coerência com plants.user_id é garantida pela policy de escrita (0002).
  user_id uuid not null references auth.users (id) on delete cascade,

  type public.tipo_evento not null,

  -- Editável: registro retroativo é caso de primeira classe (seção 11).
  occurred_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now()
);

create index care_events_plant_idx
  on public.care_events (plant_id, type, occurred_at desc);

create index care_events_user_idx
  on public.care_events (user_id, occurred_at desc);

comment on table public.care_events is
  'Histórico único, não uma tabela por tipo de tarefa (decisão estrutural 3).';

-- --------------------------------------------------- push_subscriptions

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Um aparelho por linha: cada pessoa pode ter iPhone e iPad.
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,

  failure_count smallint not null default 0,
  last_success_at timestamptz,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);
