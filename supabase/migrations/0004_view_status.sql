-- View de status: a verdade do banco sobre "quem está atrasado".
--
-- É ela que o agendador da Etapa 7 vai consultar para decidir quem recebe
-- notificação. Replica as regras de `src/dominio/`, e por isso existe um
-- teste de paridade rodando os mesmos dados nos dois caminhos: duas
-- implementações da mesma regra divergem com o tempo se ninguém vigiar.
--
-- `security_invoker = true` não é detalhe: por padrão uma view no Postgres
-- executa com os privilégios de quem a criou, **ignorando o RLS de quem
-- consulta**. Sem esta linha, esta view entregaria as plantas da namorada
-- para a conta do Lucas e vice-versa. O teste de isolamento cobre isso.

create view public.plant_status
with (security_invoker = true)
as
with contexto as (
  select
    p.id,
    p.user_id,
    p.nickname,
    p.drought_tolerance,
    p.water_interval_warm,
    p.water_interval_cold,
    p.fertilize_interval_warm,
    p.fertilize_interval_cold,
    coalesce(pr.time_zone, 'America/Sao_Paulo') as fuso,
    -- O dia é o dia local do usuário, nunca o de UTC.
    (now() at time zone coalesce(pr.time_zone, 'America/Sao_Paulo'))::date as hoje
  from public.plants p
  left join public.profiles pr on pr.id = p.user_id
  where p.archived_at is null
),
vigente as (
  select
    c.*,
    -- Hemisfério sul: outubro a março é a estação quente.
    (extract(month from c.hoje)::int >= 10 or extract(month from c.hoje)::int <= 3) as quente
  from contexto c
),
intervalos as (
  select
    v.*,
    case when v.quente then 'quente' else 'fria' end as estacao,
    case when v.quente then v.water_interval_warm else v.water_interval_cold end
      as intervalo_rega,
    case when v.quente then v.fertilize_interval_warm else v.fertilize_interval_cold end
      as intervalo_adubacao,
    case v.drought_tolerance
      when 'alta' then 1.0
      when 'media' then 0.5
      else 0.25
    end as limiar_atencao
  from vigente v
),
eventos as (
  select
    i.id,
    max((ce.occurred_at at time zone i.fuso)::date)
      filter (where ce.type = 'rega') as ultima_rega,
    max((ce.occurred_at at time zone i.fuso)::date)
      filter (where ce.type = 'adubacao') as ultima_adubacao,
    max((ce.occurred_at at time zone i.fuso)::date)
      filter (where ce.type = 'floracao') as ultima_floracao
  from intervalos i
  left join public.care_events ce on ce.plant_id = i.id
  group by i.id
)
select
  i.id as plant_id,
  i.user_id,
  i.nickname,
  i.hoje,
  i.estacao,
  i.intervalo_rega,
  i.intervalo_adubacao,
  e.ultima_rega,
  e.ultima_adubacao,
  e.ultima_floracao,

  e.ultima_rega + i.intervalo_rega as proxima_rega,
  coalesce(i.hoje - (e.ultima_rega + i.intervalo_rega), 0) as dias_de_atraso_rega,

  case
    when e.ultima_rega is null then 'sem-historico'
    when i.hoje < e.ultima_rega + i.intervalo_rega then 'em-dia'
    when i.hoje = e.ultima_rega + i.intervalo_rega then 'vence-hoje'
    when (i.hoje - (e.ultima_rega + i.intervalo_rega))::numeric / i.intervalo_rega
         > i.limiar_atencao then 'atencao'
    else 'atrasada'
  end as situacao_rega,

  e.ultima_adubacao + i.intervalo_adubacao as proxima_adubacao,
  coalesce(i.hoje - (e.ultima_adubacao + i.intervalo_adubacao), 0) as dias_de_atraso_adubacao,

  -- Adubação não tem nível de atenção: atrasar adubo não mata planta.
  case
    when i.intervalo_adubacao is null then null
    when e.ultima_adubacao is null then 'sem-historico'
    when i.hoje < e.ultima_adubacao + i.intervalo_adubacao then 'em-dia'
    when i.hoje = e.ultima_adubacao + i.intervalo_adubacao then 'vence-hoje'
    else 'atrasada'
  end as situacao_adubacao

from intervalos i
join eventos e on e.id = i.id;

comment on view public.plant_status is
  'Verdade do banco sobre quem está atrasado. Consumida pela tela e pelo agendador da Etapa 7. Paridade com src/dominio/ garantida por teste.';
