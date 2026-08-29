-- Cria o perfil junto com a conta, para que nenhum usuário exista sem
-- preferências (fuso horário e hora da notificação são lidos pelo agendador
-- da Etapa 7 e não podem faltar).
--
-- `security definer` porque roda no contexto do cadastro, antes de haver
-- sessão; `set search_path = ''` porque função definer sem search_path fixo
-- é um vetor conhecido de escalonamento de privilégio.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
