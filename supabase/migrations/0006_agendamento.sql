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
--
-- Cria ou atualiza, para o arquivo poder ser rodado de novo sem erro.
do $bloco$
declare
  -- ÚNICO lugar a editar neste arquivo.
  segredo text := '<SEGREDO>';
  id_existente uuid;
begin
  -- Compara o formato, não o texto: assim o guard sobrevive a um
  -- "substituir tudo", que trocaria a própria comparação se ela citasse o
  -- marcador literalmente.
  if segredo like '<%>' or length(segredo) < 16 then
    raise exception 'Cole o valor de SEGREDO_AGENDADOR (do .env) na linha do segredo antes de rodar.';
  end if;

  select id into id_existente from vault.secrets where name = 'plantaly_agendador';

  if id_existente is null then
    perform vault.create_secret(
      segredo,
      'plantaly_agendador',
      'Autoriza o cron a chamar a função de lembretes'
    );
  else
    perform vault.update_secret(id_existente, segredo);
  end if;
end
$bloco$;

-- `cron.schedule` com o mesmo nome substitui o agendamento anterior, então
-- rodar de novo é seguro.
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
