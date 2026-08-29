-- Agendamento dos lembretes.
--
-- ANTES DE RODAR, substitua <SEGREDO> pelo valor de SEGREDO_AGENDADOR do
-- seu .env, e confirme que a função `enviar-lembretes` já foi publicada.
--
-- Roda de hora em hora, não uma vez por dia: cada execução envia apenas
-- para quem configurou aquele horário. É assim que fusos diferentes e
-- preferências diferentes convivem sem múltiplos agendamentos.

-- O segredo fica no Vault, não no corpo do agendamento: `cron.job` é
-- legível por quem tem acesso ao banco, e um segredo em texto plano ali
-- teria a mesma força de nenhum segredo.
select vault.create_secret('<SEGREDO>', 'plantaly_agendador', 'Autoriza o cron a chamar a função de lembretes');

select cron.schedule(
  'plantaly-lembretes',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://liyinztcybkzzfloyozh.supabase.co/functions/v1/enviar-lembretes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-agendador', (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'plantaly_agendador'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
  $$
);

-- Conferir depois:  select * from cron.job;
-- Histórico:        select * from cron.job_run_details order by start_time desc limit 20;
-- Cancelar:         select cron.unschedule('plantaly-lembretes');
