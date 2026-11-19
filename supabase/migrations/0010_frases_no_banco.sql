-- As frases da manhã passam a morar no banco.
--
-- Até aqui elas viviam no código, em duas cópias (app e Edge Function), e
-- trocar uma frase exigia publicar as duas. Por decisão do Lucas em
-- 2026-11-19, a lista vira a tabela `frases`: editar, acrescentar ou tirar
-- frase passa a ser uma linha no painel do Supabase.
--
-- **A escolha continua determinística e sem estado** (ver `escolha.ts`): o
-- app e a função leem a mesma tabela, ordenam pelo `nome` e andam uma
-- posição por dia. Acrescentar ou tirar frase reembaralha a ordem de cada
-- pessoa uma vez — o mesmo preço de antes.
--
-- **Disciplina de fonte, agora no banco.** As restrições abaixo repetem o
-- que os testes garantiam no código, porque edição pelo painel não passa
-- pelos testes: toda frase tem obra e uma URL de conferência, e nenhuma
-- passa de 180 caracteres — acima disso o iOS corta a notificação no meio.
--
-- Reexecutável: a tabela só é criada se não existir, as políticas são
-- recriadas, e a carga atualiza pelo `nome` sem apagar frase que tenha
-- sido acrescentada pelo painel depois.

create table if not exists public.frases (
  nome text primary key check (nome ~ '^[a-z0-9-]+$'),
  texto text not null check (length(btrim(texto)) between 1 and 180),
  autor text not null check (length(btrim(autor)) > 0),
  obra text not null check (length(btrim(obra)) > 0),
  -- URL onde a atribuição foi conferida. Frase lembrada de cabeça não entra.
  fonte text not null check (fonte like 'https://%'),
  -- O texto é uma entre várias traduções portuguesas possíveis.
  traducao_variavel boolean not null default false,
  criada_em timestamptz not null default now()
);

comment on table public.frases is
  'Frases da manhã. Lidas pelo app (box da aba Hoje) e pela Edge Function enviar-lembretes. A escolha do dia é calculada, não guardada.';

-- Leitura para quem entrou; escrita só pelo painel/SQL Editor, que ignora o
-- RLS. Sem política de escrita, nenhum cliente consegue alterar a lista.
alter table public.frases enable row level security;

drop policy if exists "frases legíveis por quem entrou" on public.frases;
create policy "frases legíveis por quem entrou"
  on public.frases for select
  to authenticated
  using (true);

-- --------------------------------------------------------------- a carga
-- 100 frases, todas conferidas no Wikiquote em 2026-11-19, só em entradas
-- com obra e passagem (nunca em "Disputed", "Misattributed", "Attributed"
-- ou "Quotes about"). As de autores de língua portuguesa estão no original.
--
-- O JSON abaixo, entre os marcadores de dólar, é lido também por `frases.test.ts`,
-- que confere integridade, tamanho e as frases aposentadas.
insert into public.frases (nome, texto, autor, obra, fonte, traducao_variavel)
select nome, texto, autor, obra, fonte, traducao_variavel
from jsonb_to_recordset($frases$
[
  {"nome": "marco-aurelio-vida-feliz", "texto": "Muito pouco é preciso para uma vida feliz.", "autor": "Marco Aurélio", "obra": "Meditações, VII.67", "fonte": "https://en.wikiquote.org/wiki/Marcus_Aurelius", "traducao_variavel": true},
  {"nome": "marco-aurelio-olha-para-dentro", "texto": "Olha para dentro. Dentro está a fonte do bem, e ela brotará sempre, se sempre cavares.", "autor": "Marco Aurélio", "obra": "Meditações, VII.59", "fonte": "https://en.wikiquote.org/wiki/Marcus_Aurelius", "traducao_variavel": true},
  {"nome": "marco-aurelio-algo-novo", "texto": "Dá-te tempo para aprender algo novo e bom, e para de rodopiar.", "autor": "Marco Aurélio", "obra": "Meditações, II.7", "fonte": "https://en.wikiquote.org/wiki/Marcus_Aurelius", "traducao_variavel": true},
  {"nome": "marco-aurelio-o-que-ja-tens", "texto": "Pensa menos no que te falta e mais no que já tens.", "autor": "Marco Aurélio", "obra": "Meditações, VII.27", "fonte": "https://en.wikiquote.org/wiki/Marcus_Aurelius", "traducao_variavel": true},
  {"nome": "marco-aurelio-o-que-me-cabe", "texto": "Faço o que me cabe fazer; o resto não me perturba.", "autor": "Marco Aurélio", "obra": "Meditações, VI.22", "fonte": "https://en.wikiquote.org/wiki/Marcus_Aurelius", "traducao_variavel": true},
  {"nome": "marco-aurelio-so-agora", "texto": "Cada um de nós vive apenas agora, neste breve instante.", "autor": "Marco Aurélio", "obra": "Meditações, III.10", "fonte": "https://en.wikiquote.org/wiki/Marcus_Aurelius", "traducao_variavel": true},

  {"nome": "seneca-pede-trabalho", "texto": "Proíbo-te de ficar abatido ou desanimado. Não basta não fugir do trabalho; pede por ele.", "autor": "Sêneca", "obra": "Cartas a Lucílio, XXXI", "fonte": "https://en.wikiquote.org/wiki/Seneca_the_Younger", "traducao_variavel": true},
  {"nome": "seneca-dia-vida-completa", "texto": "Procuro viver cada dia como se fosse uma vida completa.", "autor": "Sêneca", "obra": "Cartas a Lucílio, LXI", "fonte": "https://en.wikiquote.org/wiki/Seneca_the_Younger", "traducao_variavel": true},
  {"nome": "seneca-prova-com-atos", "texto": "Prova tuas palavras com teus atos.", "autor": "Sêneca", "obra": "Cartas a Lucílio, XX", "fonte": "https://en.wikiquote.org/wiki/Seneca_the_Younger", "traducao_variavel": true},
  {"nome": "seneca-falta-de-fe", "texto": "Não sei se vou progredir; mas prefiro que me falte o sucesso a que me falte a fé.", "autor": "Sêneca", "obra": "Cartas a Lucílio, XXV", "fonte": "https://en.wikiquote.org/wiki/Seneca_the_Younger", "traducao_variavel": true},

  {"nome": "epicteto-uvas-e-figo", "texto": "Nada de grande nasce de repente, assim como um cacho de uvas ou um figo. Deixa primeiro florescer, depois dar fruto, depois amadurecer.", "autor": "Epicteto", "obra": "Discursos, I.15.7", "fonte": "https://en.wikiquote.org/wiki/Epictetus", "traducao_variavel": true},
  {"nome": "epicteto-coisas-pequenas", "texto": "Exercita-te, pelo amor dos céus, nas pequenas coisas; e daí passa às maiores.", "autor": "Epicteto", "obra": "Discursos, I.18.18", "fonte": "https://en.wikiquote.org/wiki/Epictetus", "traducao_variavel": true},
  {"nome": "epicteto-quem-tu-es", "texto": "Sabe primeiro quem és, e então adorna-te de acordo.", "autor": "Epicteto", "obra": "Discursos, III.1.24", "fonte": "https://en.wikiquote.org/wiki/Epictetus", "traducao_variavel": true},
  {"nome": "epicteto-uso-da-vida", "texto": "Embora a vida seja coisa indiferente, o uso que fazes dela não é.", "autor": "Epicteto", "obra": "Discursos, II.6.2", "fonte": "https://en.wikiquote.org/wiki/Epictetus", "traducao_variavel": true},
  {"nome": "epicteto-dificuldades", "texto": "São as dificuldades que mostram o que os homens são.", "autor": "Epicteto", "obra": "Discursos, I.24.1", "fonte": "https://en.wikiquote.org/wiki/Epictetus", "traducao_variavel": true},

  {"nome": "montaigne-uso-do-tempo", "texto": "A utilidade de viver não está na duração dos dias, mas no uso do tempo.", "autor": "Michel de Montaigne", "obra": "Ensaios, I.20", "fonte": "https://en.wikiquote.org/wiki/Michel_de_Montaigne", "traducao_variavel": true},
  {"nome": "montaigne-hoje", "texto": "O que pode ser feito outro dia pode ser feito hoje.", "autor": "Michel de Montaigne", "obra": "Ensaios, I.20", "fonte": "https://en.wikiquote.org/wiki/Michel_de_Montaigne", "traducao_variavel": true},
  {"nome": "montaigne-oficio-viver", "texto": "Meu ofício e minha arte é viver.", "autor": "Michel de Montaigne", "obra": "Ensaios, II.6", "fonte": "https://en.wikiquote.org/wiki/Michel_de_Montaigne", "traducao_variavel": true},
  {"nome": "montaigne-empresta-te", "texto": "Empresta-te aos outros, mas dá-te a ti mesmo.", "autor": "Michel de Montaigne", "obra": "Ensaios, III.10", "fonte": "https://en.wikiquote.org/wiki/Michel_de_Montaigne", "traducao_variavel": true},
  {"nome": "montaigne-ser-nao-parecer", "texto": "A natureza nos forma para nós mesmos, não para os outros; para ser, não para parecer.", "autor": "Michel de Montaigne", "obra": "Ensaios, II.37", "fonte": "https://en.wikiquote.org/wiki/Michel_de_Montaigne", "traducao_variavel": true},
  {"nome": "montaigne-medo", "texto": "O que mais temo é o medo.", "autor": "Michel de Montaigne", "obra": "Ensaios, I.18", "fonte": "https://en.wikiquote.org/wiki/Michel_de_Montaigne", "traducao_variavel": true},

  {"nome": "nietzsche-torna-te", "texto": "O que diz a tua consciência? — «Torna-te quem tu és.»", "autor": "Friedrich Nietzsche", "obra": "A Gaia Ciência, §270", "fonte": "https://en.wikiquote.org/wiki/The_Gay_Science", "traducao_variavel": true},
  {"nome": "nietzsche-nao-me-mata", "texto": "O que não me mata me fortalece.", "autor": "Friedrich Nietzsche", "obra": "Crepúsculo dos Ídolos, \"Máximas e flechas\", 8", "fonte": "https://en.wikiquote.org/wiki/Friedrich_Nietzsche", "traducao_variavel": true},
  {"nome": "nietzsche-poetas-da-vida", "texto": "Queremos ser os poetas da nossa vida — e primeiro nas coisas mais pequenas e cotidianas.", "autor": "Friedrich Nietzsche", "obra": "A Gaia Ciência, §299", "fonte": "https://en.wikiquote.org/wiki/The_Gay_Science", "traducao_variavel": true},
  {"nome": "nietzsche-ponte", "texto": "O que há de grande no homem é ser uma ponte, e não um fim.", "autor": "Friedrich Nietzsche", "obra": "Assim Falou Zaratustra, Prólogo, 4", "fonte": "https://en.wikiquote.org/wiki/Thus_Spoke_Zarathustra", "traducao_variavel": true},
  {"nome": "nietzsche-acostumados-a-amar", "texto": "Amamos a vida não porque estamos acostumados a viver, mas porque estamos acostumados a amar.", "autor": "Friedrich Nietzsche", "obra": "Assim Falou Zaratustra, I, \"Do ler e escrever\"", "fonte": "https://en.wikiquote.org/wiki/Thus_Spoke_Zarathustra", "traducao_variavel": true},
  {"nome": "nietzsche-livre-para-que", "texto": "Livre de quê? Que importa isso a Zaratustra! Mas teus olhos devem me dizer com clareza: livre para quê?", "autor": "Friedrich Nietzsche", "obra": "Assim Falou Zaratustra, I, \"Do caminho do criador\"", "fonte": "https://en.wikiquote.org/wiki/Thus_Spoke_Zarathustra", "traducao_variavel": true},
  {"nome": "nietzsche-grande-astro", "texto": "Ó grande astro, que seria da tua felicidade se não tivesses aqueles a quem iluminas?", "autor": "Friedrich Nietzsche", "obra": "Assim Falou Zaratustra, Prólogo, 1", "fonte": "https://en.wikiquote.org/wiki/Thus_Spoke_Zarathustra", "traducao_variavel": true},
  {"nome": "nietzsche-caminhando", "texto": "Só os pensamentos que nascem caminhando têm valor.", "autor": "Friedrich Nietzsche", "obra": "Crepúsculo dos Ídolos, \"Máximas e flechas\", 34", "fonte": "https://en.wikiquote.org/wiki/Friedrich_Nietzsche", "traducao_variavel": true},

  {"nome": "kierkegaard-certeza-antes", "texto": "Há uma covardia que quer ter certeza antes de começar.", "autor": "Søren Kierkegaard", "obra": "Dezoito Discursos Edificantes", "fonte": "https://en.wikiquote.org/wiki/S%C3%B8ren_Kierkegaard", "traducao_variavel": true},
  {"nome": "kierkegaard-verdade-para-mim", "texto": "Preciso encontrar uma verdade que seja verdadeira para mim.", "autor": "Søren Kierkegaard", "obra": "Diários, Gilleleie, agosto de 1835", "fonte": "https://en.wikiquote.org/wiki/S%C3%B8ren_Kierkegaard", "traducao_variavel": true},
  {"nome": "kierkegaard-amar-a-si", "texto": "Acima de tudo, não esqueças o teu dever de amar a ti mesmo.", "autor": "Søren Kierkegaard", "obra": "Carta ao primo Hans Peter (1848)", "fonte": "https://en.wikiquote.org/wiki/S%C3%B8ren_Kierkegaard", "traducao_variavel": true},

  {"nome": "camus-um-comeco", "texto": "Perceber que a vida é absurda não pode ser um fim, mas apenas um começo.", "autor": "Albert Camus", "obra": "Resenha de \"A Náusea\", Alger Républicain (1938)", "fonte": "https://en.wikiquote.org/wiki/Albert_Camus", "traducao_variavel": true},
  {"nome": "camus-o-que-importa-e-viver", "texto": "O que precede define apenas uma maneira de pensar. Mas o que importa é viver.", "autor": "Albert Camus", "obra": "O Mito de Sísifo (1942)", "fonte": "https://en.wikiquote.org/wiki/Albert_Camus", "traducao_variavel": true},
  {"nome": "camus-amo-a-vida", "texto": "Não vamos fazer rodeios: eu amo a vida — essa é a minha verdadeira fraqueza.", "autor": "Albert Camus", "obra": "A Queda (1956)", "fonte": "https://en.wikiquote.org/wiki/Albert_Camus", "traducao_variavel": true},
  {"nome": "camus-nao-amar", "texto": "Não ser amado é apenas falta de sorte; a desgraça é não amar.", "autor": "Albert Camus", "obra": "\"Retorno a Tipasa\", em O Verão (1954)", "fonte": "https://en.wikiquote.org/wiki/Albert_Camus", "traducao_variavel": true},
  {"nome": "camus-alegria-estranha", "texto": "Nasce então essa estranha alegria que ajuda a viver e a morrer, e que nunca mais adiaremos para depois.", "autor": "Albert Camus", "obra": "O Homem Revoltado (1951)", "fonte": "https://en.wikiquote.org/wiki/Albert_Camus", "traducao_variavel": true},
  {"nome": "camus-algo-para-ser-feliz", "texto": "Mamãe costumava dizer que sempre se encontra alguma coisa para ser feliz.", "autor": "Albert Camus", "obra": "O Estrangeiro (1942)", "fonte": "https://en.wikiquote.org/wiki/Albert_Camus", "traducao_variavel": true},

  {"nome": "sartre-inventar-o-caminho", "texto": "Sou um homem, Júpiter, e cada homem deve inventar o seu caminho.", "autor": "Jean-Paul Sartre", "obra": "As Moscas (1943), ato III", "fonte": "https://en.wikiquote.org/wiki/Jean-Paul_Sartre", "traducao_variavel": true},
  {"nome": "sartre-liberdade-explodiu", "texto": "Quando a liberdade explode na alma de um homem, os deuses já não podem nada contra ele.", "autor": "Jean-Paul Sartre", "obra": "As Moscas (1943), ato II", "fonte": "https://en.wikiquote.org/wiki/Jean-Paul_Sartre", "traducao_variavel": true},
  {"nome": "sartre-o-que-fazemos", "texto": "O que importa não é o que fizeram de nós, mas o que nós mesmos fazemos com o que fizeram de nós.", "autor": "Jean-Paul Sartre", "obra": "Saint Genet, Ator e Mártir (1952)", "fonte": "https://en.wikiquote.org/wiki/Jean-Paul_Sartre", "traducao_variavel": true},
  {"nome": "sartre-melhor-trabalho", "texto": "O melhor trabalho não é o que é mais difícil para você; é o que você faz melhor.", "autor": "Jean-Paul Sartre", "obra": "As Mãos Sujas (1948), ato VI", "fonte": "https://en.wikiquote.org/wiki/Jean-Paul_Sartre", "traducao_variavel": true},
  {"nome": "sartre-recursos", "texto": "Quem pode esgotar um homem? Quem conhece os recursos de um homem?", "autor": "Jean-Paul Sartre", "obra": "A Náusea (1938)", "fonte": "https://en.wikiquote.org/wiki/Jean-Paul_Sartre", "traducao_variavel": true},

  {"nome": "beauvoir-certezas", "texto": "Arranquei-me ao conforto seguro das certezas pelo meu amor à verdade — e a verdade me recompensou.", "autor": "Simone de Beauvoir", "obra": "Balanço Final (1972)", "fonte": "https://en.wikiquote.org/wiki/Simone_de_Beauvoir", "traducao_variavel": true},
  {"nome": "beauvoir-aventura", "texto": "Quero que esta aventura que é a minha vida continue sem fim.", "autor": "Simone de Beauvoir", "obra": "A Velhice (1970)", "fonte": "https://en.wikiquote.org/wiki/Simone_de_Beauvoir", "traducao_variavel": true},
  {"nome": "beauvoir-generosidade", "texto": "É isso que considero a verdadeira generosidade: você dá tudo e, ainda assim, sente como se não lhe custasse nada.", "autor": "Simone de Beauvoir", "obra": "Todos os Homens São Mortais (1946)", "fonte": "https://en.wikiquote.org/wiki/Simone_de_Beauvoir", "traducao_variavel": true},

  {"nome": "jaspers-a-caminho", "texto": "Filosofia significa estar a caminho.", "autor": "Karl Jaspers", "obra": "Introdução ao Pensamento Filosófico, cap. 1", "fonte": "https://en.wikiquote.org/wiki/Karl_Jaspers", "traducao_variavel": true},

  {"nome": "dostoievski-passo-novo", "texto": "Dar um passo novo, dizer uma palavra nova — é disso que as pessoas mais têm medo.", "autor": "Fiódor Dostoiévski", "obra": "Crime e Castigo, parte I, cap. 1", "fonte": "https://en.wikiquote.org/wiki/Crime_and_Punishment", "traducao_variavel": true},
  {"nome": "dostoievski-e-a-vida-que-importa", "texto": "É a vida que importa, nada além da vida — o processo de descobrir, o processo eterno e perpétuo.", "autor": "Fiódor Dostoiévski", "obra": "O Idiota, parte III, cap. 5", "fonte": "https://en.wikiquote.org/wiki/Fyodor_Dostoevsky", "traducao_variavel": true},
  {"nome": "dostoievski-feitos-para-a-felicidade", "texto": "Pois os homens são feitos para a felicidade.", "autor": "Fiódor Dostoiévski", "obra": "Os Irmãos Karamázov, livro II, cap. 4", "fonte": "https://en.wikiquote.org/wiki/Fyodor_Dostoevsky", "traducao_variavel": true},
  {"nome": "dostoievski-amai-as-plantas", "texto": "Amai cada folha, cada raio da luz de Deus. Amai os animais, amai as plantas, amai tudo.", "autor": "Fiódor Dostoiévski", "obra": "Os Irmãos Karamázov, livro VI, cap. 3", "fonte": "https://en.wikiquote.org/wiki/Fyodor_Dostoevsky", "traducao_variavel": true},
  {"nome": "dostoievski-respeitar-a-si", "texto": "Se você quer ser respeitado pelos outros, o grande segredo é respeitar a si mesmo.", "autor": "Fiódor Dostoiévski", "obra": "Humilhados e Ofendidos, parte III, cap. 2", "fonte": "https://en.wikiquote.org/wiki/Fyodor_Dostoevsky", "traducao_variavel": true},

  {"nome": "tolstoi-momentos-de-felicidade", "texto": "Agarre os momentos de felicidade, ame e seja amado! Essa é a única realidade do mundo; todo o resto é tolice.", "autor": "Liev Tolstói", "obra": "Guerra e Paz, livro IV, cap. 11", "fonte": "https://en.wikiquote.org/wiki/Leo_Tolstoy", "traducao_variavel": true},
  {"nome": "tolstoi-saber-esperar", "texto": "Tudo chega a tempo para quem sabe esperar.", "autor": "Liev Tolstói", "obra": "Guerra e Paz, livro X, cap. 16", "fonte": "https://en.wikiquote.org/wiki/Leo_Tolstoy", "traducao_variavel": true},
  {"nome": "tolstoi-vida-e-trabalho", "texto": "A felicidade dos homens está na vida. E a vida está no trabalho.", "autor": "Liev Tolstói", "obra": "O Que Fazer? (1886), cap. 38", "fonte": "https://en.wikiquote.org/wiki/Leo_Tolstoy", "traducao_variavel": true},
  {"nome": "tolstoi-tudo-possivel", "texto": "Para o ser espiritual desperto, tudo era possível.", "autor": "Liev Tolstói", "obra": "Ressurreição, cap. 28", "fonte": "https://en.wikiquote.org/wiki/Leo_Tolstoy", "traducao_variavel": true},

  {"nome": "hesse-encontrar-o-sonho", "texto": "Você precisa encontrar o seu sonho; então o caminho fica fácil.", "autor": "Hermann Hesse", "obra": "Demian (1919)", "fonte": "https://en.wikiquote.org/wiki/Hermann_Hesse", "traducao_variavel": true},
  {"nome": "hesse-a-arvore-espera", "texto": "A árvore não morre. Ela espera.", "autor": "Hermann Hesse", "obra": "Demian (1919)", "fonte": "https://en.wikiquote.org/wiki/Hermann_Hesse", "traducao_variavel": true},
  {"nome": "hesse-magia-do-comeco", "texto": "Em todo começo mora uma força mágica, que nos protege e nos ajuda a viver.", "autor": "Hermann Hesse", "obra": "\"Degraus\", em O Jogo das Contas de Vidro (1943)", "fonte": "https://en.wikiquote.org/wiki/Hermann_Hesse", "traducao_variavel": true},
  {"nome": "hesse-luz-nova", "texto": "Esteja pronto, com coragem e sem remorso, para encontrar a luz nova que os velhos laços não podem dar.", "autor": "Hermann Hesse", "obra": "\"Degraus\", em O Jogo das Contas de Vidro (1943)", "fonte": "https://en.wikiquote.org/wiki/Hermann_Hesse", "traducao_variavel": true},
  {"nome": "hesse-futuro-e-forca", "texto": "Ver o futuro não como um poder estranho e superior, mas como a esperança e o fruto da minha própria força.", "autor": "Hermann Hesse", "obra": "Gertrud (1910)", "fonte": "https://en.wikiquote.org/wiki/Hermann_Hesse", "traducao_variavel": true},
  {"nome": "hesse-santuario", "texto": "Dentro de ti há uma quietude e um santuário para onde podes te recolher a qualquer momento e ser tu mesmo.", "autor": "Hermann Hesse", "obra": "Sidarta (1922)", "fonte": "https://en.wikiquote.org/wiki/Siddhartha_(novel)", "traducao_variavel": true},

  {"nome": "kazantzakis-arvores-sem-pressa", "texto": "Se me amas, tem paciência. Olha as árvores. Elas têm pressa de amadurecer os seus frutos?", "autor": "Níkos Kazantzákis", "obra": "A Última Tentação de Cristo, cap. 17", "fonte": "https://en.wikiquote.org/wiki/Nikos_Kazantzakis", "traducao_variavel": true},
  {"nome": "kazantzakis-ave-domestica", "texto": "A felicidade é uma ave doméstica, que se encontra no nosso próprio quintal.", "autor": "Níkos Kazantzákis", "obra": "Relatório a El Greco, cap. 18", "fonte": "https://en.wikiquote.org/wiki/Nikos_Kazantzakis", "traducao_variavel": true},
  {"nome": "kazantzakis-acreditar-cria", "texto": "Acreditando apaixonadamente em algo que ainda não existe, nós o criamos.", "autor": "Níkos Kazantzákis", "obra": "Relatório a El Greco", "fonte": "https://en.wikiquote.org/wiki/Nikos_Kazantzakis", "traducao_variavel": true},
  {"nome": "kazantzakis-olhos-virgens", "texto": "Volto a ser criança para poder ver o mundo sempre pela primeira vez, com olhos virgens.", "autor": "Níkos Kazantzákis", "obra": "Relatório a El Greco, cap. 4", "fonte": "https://en.wikiquote.org/wiki/Nikos_Kazantzakis", "traducao_variavel": true},
  {"nome": "kazantzakis-coracao-simples", "texto": "Para sentir que a felicidade está aqui e agora, basta um coração simples e frugal.", "autor": "Níkos Kazantzákis", "obra": "Zorba, o Grego, cap. 7", "fonte": "https://en.wikiquote.org/wiki/Nikos_Kazantzakis", "traducao_variavel": true},

  {"nome": "thoreau-coisas-nao-mudam", "texto": "As coisas não mudam; nós mudamos.", "autor": "Henry David Thoreau", "obra": "Walden (1854), \"Conclusão\"", "fonte": "https://en.wikiquote.org/wiki/Walden", "traducao_variavel": true},
  {"nome": "thoreau-direcao-dos-sonhos", "texto": "Se alguém avança confiante na direção dos seus sonhos, e se esforça para viver a vida que imaginou, encontrará um sucesso inesperado nas horas comuns.", "autor": "Henry David Thoreau", "obra": "Walden (1854), \"Conclusão\"", "fonte": "https://en.wikiquote.org/wiki/Walden", "traducao_variavel": true},
  {"nome": "thoreau-aurora-em-mim", "texto": "A manhã é quando estou desperto e há uma aurora em mim.", "autor": "Henry David Thoreau", "obra": "Walden (1854), cap. 2", "fonte": "https://en.wikiquote.org/wiki/Walden", "traducao_variavel": true},
  {"nome": "thoreau-qualidade-do-dia", "texto": "Influir na qualidade do dia: essa é a mais elevada das artes.", "autor": "Henry David Thoreau", "obra": "Walden (1854), cap. 2", "fonte": "https://en.wikiquote.org/wiki/Walden", "traducao_variavel": true},
  {"nome": "thoreau-desperto-e-vivo", "texto": "Estar desperto é estar vivo.", "autor": "Henry David Thoreau", "obra": "Walden (1854), cap. 2", "fonte": "https://en.wikiquote.org/wiki/Walden", "traducao_variavel": true},
  {"nome": "thoreau-mirar-alto", "texto": "No fim das contas, os homens só acertam aquilo para onde miram.", "autor": "Henry David Thoreau", "obra": "Walden (1854), cap. 1", "fonte": "https://en.wikiquote.org/wiki/Walden", "traducao_variavel": true},

  {"nome": "emerson-confia-em-ti", "texto": "Confia em ti mesmo: todo coração vibra com essa corda de ferro.", "autor": "Ralph Waldo Emerson", "obra": "\"Autoconfiança\", em Ensaios (1841)", "fonte": "https://en.wikiquote.org/wiki/Essays_(Emerson)", "traducao_variavel": true},
  {"nome": "emerson-faca-agora", "texto": "Seja como for, faça o certo agora.", "autor": "Ralph Waldo Emerson", "obra": "\"Autoconfiança\", em Ensaios (1841)", "fonte": "https://en.wikiquote.org/wiki/Essays_(Emerson)", "traducao_variavel": true},
  {"nome": "emerson-a-rosa", "texto": "Existe simplesmente a rosa; ela é perfeita em cada instante da sua existência.", "autor": "Ralph Waldo Emerson", "obra": "\"Autoconfiança\", em Ensaios (1841)", "fonte": "https://en.wikiquote.org/wiki/Essays_(Emerson)", "traducao_variavel": true},
  {"nome": "emerson-o-que-teme", "texto": "Ouvi certa vez um conselho elevado, dado a um jovem: «Faça sempre o que você tem medo de fazer.»", "autor": "Ralph Waldo Emerson", "obra": "\"Heroísmo\", em Ensaios (1841)", "fonte": "https://en.wikiquote.org/wiki/Essays_(Emerson)", "traducao_variavel": true},
  {"nome": "emerson-experimento", "texto": "Não seja tímido nem escrupuloso demais com suas ações. Toda a vida é um experimento. Quanto mais experimentos você fizer, melhor.", "autor": "Ralph Waldo Emerson", "obra": "Diários, 11 de novembro de 1842", "fonte": "https://en.wikiquote.org/wiki/Ralph_Waldo_Emerson", "traducao_variavel": true},

  {"nome": "frankl-ultima-liberdade", "texto": "Tudo pode ser tirado de uma pessoa, menos uma coisa: a última das liberdades humanas — escolher a própria atitude diante de qualquer circunstância.", "autor": "Viktor Frankl", "obra": "Em Busca de Sentido (1946)", "fonte": "https://en.wikiquote.org/wiki/Man%27s_Search_for_Meaning", "traducao_variavel": true},
  {"nome": "frankl-meta-digna", "texto": "O que o homem realmente precisa não é de um estado sem tensão, mas de lutar e se empenhar por uma meta digna dele.", "autor": "Viktor Frankl", "obra": "Em Busca de Sentido (1946)", "fonte": "https://en.wikiquote.org/wiki/Man%27s_Search_for_Meaning", "traducao_variavel": true},

  {"nome": "fromm-incerteza", "texto": "A incerteza é a própria condição que impele o homem a desdobrar as suas forças.", "autor": "Erich Fromm", "obra": "Análise do Homem (1947), cap. 3", "fonte": "https://en.wikiquote.org/wiki/Erich_Fromm", "traducao_variavel": true},
  {"nome": "fromm-fe-em-si", "texto": "Só quem tem fé em si mesmo é capaz de ser fiel aos outros.", "autor": "Erich Fromm", "obra": "Análise do Homem (1947), cap. 4", "fonte": "https://en.wikiquote.org/wiki/Erich_Fromm", "traducao_variavel": true},

  {"nome": "james-esforco-diario", "texto": "Mantenha viva em você a faculdade do esforço, com um pequeno exercício gratuito a cada dia.", "autor": "William James", "obra": "Princípios de Psicologia (1890), cap. 4", "fonte": "https://en.wikiquote.org/wiki/William_James", "traducao_variavel": true},
  {"nome": "james-nao-tenha-medo-da-vida", "texto": "Não tenha medo da vida. Acredite que a vida vale a pena, e a sua crença ajudará a criar o fato.", "autor": "William James", "obra": "\"A vida vale a pena?\", em A Vontade de Crer (1897)", "fonte": "https://en.wikiquote.org/wiki/William_James", "traducao_variavel": true},

  {"nome": "ortega-nao-adiar", "texto": "Não podemos adiar a vida até estarmos prontos.", "autor": "José Ortega y Gasset", "obra": "Missão da Universidade (1930)", "fonte": "https://en.wikiquote.org/wiki/Jos%C3%A9_Ortega_y_Gasset", "traducao_variavel": true},
  {"nome": "ortega-minha-circunstancia", "texto": "Eu sou eu e a minha circunstância, e se não a salvo, não salvo a mim mesmo.", "autor": "José Ortega y Gasset", "obra": "Meditações do Quixote (1914)", "fonte": "https://en.wikiquote.org/wiki/Jos%C3%A9_Ortega_y_Gasset", "traducao_variavel": true},

  {"nome": "drummond-dia-novo", "texto": "A vida se renova na esperança de um dia novo.", "autor": "Carlos Drummond de Andrade", "obra": "Poesia Completa (Nova Aguilar, 2002), p. 343", "fonte": "https://pt.wikiquote.org/wiki/Carlos_Drummond_de_Andrade", "traducao_variavel": false},
  {"nome": "drummond-feliz-sem-motivo", "texto": "Ser feliz sem motivo é a mais autêntica forma de felicidade.", "autor": "Carlos Drummond de Andrade", "obra": "O Avesso das Coisas, \"Felicidade\"", "fonte": "https://pt.wikiquote.org/wiki/Carlos_Drummond_de_Andrade", "traducao_variavel": false},
  {"nome": "drummond-lutar-consigo", "texto": "Só é lutador quem sabe lutar consigo mesmo.", "autor": "Carlos Drummond de Andrade", "obra": "O Avesso das Coisas, \"Luta\"", "fonte": "https://pt.wikiquote.org/wiki/Carlos_Drummond_de_Andrade", "traducao_variavel": false},
  {"nome": "drummond-poesia-da-vida", "texto": "Se procurar bem você acaba encontrando / não a explicação (duvidosa) da vida, / mas a poesia (inexplicável) da vida.", "autor": "Carlos Drummond de Andrade", "obra": "\"Lembrete\", em Corpo (1984)", "fonte": "https://pt.wikiquote.org/wiki/Carlos_Drummond_de_Andrade", "traducao_variavel": false},
  {"nome": "drummond-maos-dadas", "texto": "O presente é tão grande, não nos afastemos. / Não nos afastemos muito, vamos de mãos dadas.", "autor": "Carlos Drummond de Andrade", "obra": "\"Mãos dadas\", em Sentimento do Mundo (1940)", "fonte": "https://pt.wikiquote.org/wiki/Carlos_Drummond_de_Andrade", "traducao_variavel": false},

  {"nome": "cecilia-primaveras", "texto": "Aprendi com as primaveras / a deixar-me cortar e a voltar sempre inteira.", "autor": "Cecília Meireles", "obra": "\"Desenho\", em Mar Absoluto (1945)", "fonte": "https://pt.wikiquote.org/wiki/Cec%C3%ADlia_Meireles", "traducao_variavel": false},
  {"nome": "cecilia-primavera-chegara", "texto": "A primavera chegará, mesmo que ninguém mais saiba seu nome, nem acredite no calendário, nem possua jardim para recebê-la.", "autor": "Cecília Meireles", "obra": "\"Primavera\", crônica", "fonte": "https://pt.wikiquote.org/wiki/Cec%C3%ADlia_Meireles", "traducao_variavel": false},

  {"nome": "pessoa-a-obra-nasce", "texto": "Deus quer, o homem sonha, a obra nasce.", "autor": "Fernando Pessoa", "obra": "Mensagem (1934), \"O Infante\"", "fonte": "https://pt.wikiquote.org/wiki/Fernando_Pessoa", "traducao_variavel": false},
  {"nome": "pessoa-bojador", "texto": "Quem quer passar além do Bojador / Tem que passar além da dor.", "autor": "Fernando Pessoa", "obra": "Mensagem (1934), \"Mar Portuguez\"", "fonte": "https://pt.wikiquote.org/wiki/Fernando_Pessoa", "traducao_variavel": false},
  {"nome": "pessoa-cumpri", "texto": "Cumpri contra o Destino o meu dever. / Inutilmente? Não, porque o cumpri.", "autor": "Fernando Pessoa", "obra": "Mensagem (1934), \"D. Duarte\"", "fonte": "https://pt.wikiquote.org/wiki/Fernando_Pessoa", "traducao_variavel": false},
  {"nome": "pessoa-tudo-e-caminho", "texto": "Nunca ninguém se perdeu / Tudo é verdade e caminho.", "autor": "Fernando Pessoa", "obra": "Obra Poética (Aguilar, 1960), p. 93", "fonte": "https://pt.wikiquote.org/wiki/Fernando_Pessoa", "traducao_variavel": false},
  {"nome": "caeiro-todos-os-dias-sao-meus", "texto": "Entre uma e outra todos os dias são meus.", "autor": "Fernando Pessoa (Alberto Caeiro)", "obra": "Poemas Inconjuntos", "fonte": "https://pt.wikiquote.org/wiki/Fernando_Pessoa", "traducao_variavel": false},

  {"nome": "clarice-o-impossivel", "texto": "O que verdadeiramente somos é aquilo que o impossível cria em nós.", "autor": "Clarice Lispector", "obra": "A Maçã no Escuro (1961)", "fonte": "https://pt.wikiquote.org/wiki/Clarice_Lispector", "traducao_variavel": false},
  {"nome": "clarice-ainda-somos-mocos", "texto": "Nós ainda somos moços, podemos perder algum tempo sem perder a vida inteira.", "autor": "Clarice Lispector", "obra": "Uma Aprendizagem ou O Livro dos Prazeres (1969)", "fonte": "https://pt.wikiquote.org/wiki/Clarice_Lispector", "traducao_variavel": false}
]
$frases$::jsonb) as f(nome text, texto text, autor text, obra text, fonte text, traducao_variavel boolean)
on conflict (nome) do update set
  texto = excluded.texto,
  autor = excluded.autor,
  obra = excluded.obra,
  fonte = excluded.fonte,
  traducao_variavel = excluded.traducao_variavel;

-- Conferir depois:  select count(*) from public.frases;   -- 100
