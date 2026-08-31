-- Guarda a última variação de "dia calmo" enviada.
--
-- A notificação da manhã passou a ser enviada todo dia, inclusive quando
-- nenhuma planta precisa de água. São 6 textos de dia calmo, e o mesmo
-- raciocínio da 0008 vale aqui: sem memória, o sorteio repete — e com
-- apenas 6 variações a chance de repetir dois dias seguidos é de 1 em 6,
-- alta o bastante para a pessoa notar em uma semana.
--
-- Coluna separada de `ultima_variacao` de propósito: dia calmo e dia com
-- pendência sorteiam de listas diferentes. Uma coluna só faria a variação
-- de um tipo excluir a do outro, sem necessidade.
--
-- A frase do dia NÃO tem coluna: a escolha é determinística a partir do dia
-- local e do id do usuário, e é justamente isso que faz o app e a
-- notificação mostrarem a mesma. Ver `escolha.ts`.
alter table public.profiles
  add column if not exists ultima_variacao_calma text;

comment on column public.profiles.ultima_variacao_calma is
  'Nome da última variação de dia calmo enviada. O sorteio a exclui, para não repetir em dias seguidos.';
