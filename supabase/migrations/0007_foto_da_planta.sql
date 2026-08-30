-- Foto da planta do próprio usuário.
--
-- Estava na tabela de fora de escopo da seção 3 do design ("exige
-- armazenamento de arquivos, redimensionamento e custo"), e o próprio design
-- registrava que era "acrescentável depois sem refazer nada". O Lucas pediu
-- em 2026-08-30; é o "depois".
--
-- O caminho, e não a URL, é o que fica gravado: URL assinada expira, e uma
-- URL pública tornaria a foto legível por quem descobrisse o endereço —
-- exatamente o que o RLS do resto do app existe para impedir.

alter table public.plants
  add column if not exists photo_path text;

comment on column public.plants.photo_path is
  'Caminho no bucket `fotos-plantas`, no formato <user_id>/<planta_id>.jpg. Nulo = sem foto. A URL é assinada na hora de exibir.';

-- ---------------------------------------------------------------- bucket
--
-- Privado. Com o bucket público, qualquer pessoa com o endereço veria a foto
-- sem passar por login — e o endereço é derivável do id da planta.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-plantas',
  'fotos-plantas',
  false,
  3 * 1024 * 1024,  -- 3 MB: o app reduz para ~200 kB antes de enviar; a folga é para o inesperado.
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ------------------------------------------------------- políticas do RLS
--
-- A primeira pasta do caminho é o id do dono. `storage.foldername(name)[1]`
-- devolve essa pasta, e comparar com `auth.uid()` é o que mantém a conta do
-- Lucas e a da namorada sem se enxergarem — a mesma garantia que o 0002 dá
-- às tabelas, aplicada aos arquivos.
--
-- `drop ... if exists` antes de criar porque as migrações são coladas à mão
-- no SQL Editor: `create policy` não aceita `if not exists`, e sem isto uma
-- segunda execução abortaria o arquivo inteiro.

drop policy if exists "fotos proprias: ler" on storage.objects;
create policy "fotos proprias: ler"
  on storage.objects for select
  using (
    bucket_id = 'fotos-plantas'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "fotos proprias: enviar" on storage.objects;
create policy "fotos proprias: enviar"
  on storage.objects for insert
  with check (
    bucket_id = 'fotos-plantas'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Trocar a foto sobrescreve o mesmo caminho (upsert), o que é um update.
drop policy if exists "fotos proprias: substituir" on storage.objects;
create policy "fotos proprias: substituir"
  on storage.objects for update
  using (
    bucket_id = 'fotos-plantas'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'fotos-plantas'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "fotos proprias: remover" on storage.objects;
create policy "fotos proprias: remover"
  on storage.objects for delete
  using (
    bucket_id = 'fotos-plantas'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
