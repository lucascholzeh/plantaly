-- Guarda qual variação de texto foi a última enviada para cada pessoa.
--
-- Sem isso o sorteio é sem memória, e aleatório sem memória repete: com 40
-- variações, a chance de o mesmo texto sair dois dias seguidos é de 1 em 40
-- por dia — ao longo de um ano isso acontece umas nove vezes. Notificação
-- repetida logo depois da anterior é justamente a que parece defeito.
--
-- Guarda o nome da variação, não o índice: reordenar a lista no código não
-- pode fazer o registro apontar para outro texto.
alter table public.profiles
  add column if not exists ultima_variacao text;

comment on column public.profiles.ultima_variacao is
  'Nome da última variação de mensagem enviada. O sorteio a exclui, para não repetir em dias seguidos.';
