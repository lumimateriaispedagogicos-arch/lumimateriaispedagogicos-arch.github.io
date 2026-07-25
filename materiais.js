// ============================================================
// CATÁLOGO DE MATERIAIS LUMI
// Para adicionar um material novo:
//   1. Coloque o PDF na pasta  materiais/  (nome sem espaços/acentos)
//   2. Adicione um bloco { ... } na lista abaixo
// "destaque: true" faz o card aparecer grande no topo do catálogo.
// ============================================================

const MATERIAIS = [
  {
    titulo: "Alfabeto Sonoro",
    descricao: "O alfabeto completo, de A a Z! Um cartaz por letra para a criança conhecer o som inicial de cada uma, com as ilustrações oficiais da turma LUMI. Perfeito para decorar a sala, montar um mural ou usar como cartões de apoio.",
    categoria: "Alfabetização",
    idade: "3 a 6 anos",
    paginas: 26,
    arquivo: "materiais/alfabeto-sonoro.pdf",
    cor: "#F2B33D",
    destaque: true
  },
  {
    titulo: "Consciência Fonológica — Letra A",
    descricao: "20 páginas de atividades com a letra A: sons iniciais, sílabas, tracejado e muito mais para começar a alfabetização brincando.",
    categoria: "Consciência Fonológica",
    colecao: "Apostilas das Letras",
    idade: "4 a 6 anos",
    paginas: 20,
    arquivo: "materiais/consciencia-fonologica-letra-a.pdf",
    cor: "#D96A5A"
  },
  {
    titulo: "Consciência Fonológica — Letra B",
    descricao: "20 páginas de atividades com a letra B: reconhecer o som, formar sílabas e treinar o traçado com a turma LUMI.",
    categoria: "Consciência Fonológica",
    colecao: "Apostilas das Letras",
    idade: "4 a 6 anos",
    paginas: 20,
    arquivo: "materiais/consciencia-fonologica-letra-b.pdf",
    cor: "#4A6FA5"
  },
  {
    titulo: "Consciência Fonológica — Letra C",
    descricao: "20 páginas de atividades com a letra C: sons, sílabas e escrita, no mesmo passo a passo das outras letras.",
    categoria: "Consciência Fonológica",
    colecao: "Apostilas das Letras",
    idade: "4 a 6 anos",
    paginas: 20,
    arquivo: "materiais/consciencia-fonologica-letra-c.pdf",
    cor: "#7C9A6D"
  },
  {
    titulo: "Consciência Fonológica — Letra D",
    descricao: "20 páginas de atividades com a letra D para reconhecer sons, montar palavras e treinar o traçado.",
    categoria: "Consciência Fonológica",
    colecao: "Apostilas das Letras",
    idade: "4 a 6 anos",
    paginas: 20,
    arquivo: "materiais/consciencia-fonologica-letra-d.pdf",
    cor: "#7D62B8"
  },
  {
    titulo: "Consciência Fonológica — Letra E",
    descricao: "20 páginas de atividades com a letra E: som inicial, sílabas e escrita com as ilustrações da turma LUMI.",
    categoria: "Consciência Fonológica",
    colecao: "Apostilas das Letras",
    idade: "4 a 6 anos",
    paginas: 20,
    arquivo: "materiais/consciencia-fonologica-letra-e.pdf",
    cor: "#086B8E"
  },
  {
    titulo: "Consciência Fonológica — Letra F",
    descricao: "20 páginas de atividades com a letra F para ouvir, reconhecer e escrever, sempre brincando.",
    categoria: "Consciência Fonológica",
    colecao: "Apostilas das Letras",
    idade: "4 a 6 anos",
    paginas: 20,
    arquivo: "materiais/consciencia-fonologica-letra-f.pdf",
    cor: "#E5A33F"
  },
  {
    titulo: "Consciência Fonológica — Letra G",
    descricao: "20 páginas de atividades com a letra G: sons, sílabas e traçado para completar mais uma etapa da alfabetização.",
    categoria: "Consciência Fonológica",
    colecao: "Apostilas das Letras",
    idade: "4 a 6 anos",
    paginas: 20,
    arquivo: "materiais/consciencia-fonologica-letra-g.pdf",
    cor: "#C0564B"
  },
  {
    titulo: "Lívia no Parquinho",
    descricao: "A Lívia curtindo o dia no parquinho, com escorregador e balanço. Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-livia-parquinho.pdf",
    cor: "#D96A5A"
  },
  {
    titulo: "Lívia Fazendo Coração",
    descricao: "A Lívia mandando um coração com as mãos no parquinho. Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-livia-coracao.pdf",
    cor: "#4A6FA5"
  },
  {
    titulo: "Lívia Sentada no Jardim",
    descricao: "A Lívia sentadinha no jardim, fazendo um coração com as mãos. Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-livia-sentada.pdf",
    cor: "#F2B33D"
  },
  {
    titulo: "Clara Desenhando",
    descricao: "A Clara caprichando num desenho na mesinha da sala. Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-clara-desenhando.pdf",
    cor: "#7C9A6D"
  },
  {
    titulo: "Clara em Casa",
    descricao: "A Clara sentada no sofá com seu laço amarelo e colar de quebra-cabeça. Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-clara-sorrindo.pdf",
    cor: "#7D62B8"
  },
  {
    titulo: "Clara Dançando",
    descricao: "A Clara dançando cheia de alegria na sala de casa. Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-clara-dancando.pdf",
    cor: "#086B8E"
  },
  {
    titulo: "Enzo com o Skate",
    descricao: "O Enzo na pista de skate, pronto para radicalizar. Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-enzo-skate.pdf",
    cor: "#C0564B"
  },
  {
    titulo: "Enzo na Rampa",
    descricao: "O Enzo mandando uma manobra irada na rampa de skate. Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-enzo-manobra.pdf",
    cor: "#E5A33F"
  },
  {
    titulo: "Pedro no Piquenique",
    descricao: "O Pedro fazendo um lanche gostoso no piquenique do parque. Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-pedro-piquenique.pdf",
    cor: "#D96A5A"
  },
  {
    titulo: "Pedro Pulando Corda",
    descricao: "O Pedro se divertindo e pulando corda no parque. Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-pedro-pulando-corda.pdf",
    cor: "#4A6FA5"
  },
  {
    titulo: "Pedro e Bolt",
    descricao: "O Pedro brincando de bolinha com o Bolt, o dálmata da turma. Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-pedro-bolt.pdf",
    cor: "#F2B33D"
  },
  {
    titulo: "Sofia Tomando Sorvete",
    descricao: "A Sofia escolhendo um sorvete delicioso no carrinho de sorvetes. Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-sofia-sorvete.pdf",
    cor: "#7C9A6D"
  },
  {
    titulo: "Sofia na Biblioteca",
    descricao: "A Sofia escolhendo um livro de contos encantados na biblioteca. Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-sofia-biblioteca.pdf",
    cor: "#7D62B8"
  },
  {
    titulo: "Sofia Lendo",
    descricao: "A Sofia lendo na poltrona da biblioteca, porque ler é viajar! Para colorir e se divertir!",
    categoria: "Desenhos para Colorir",
    idade: "2 a 6 anos",
    paginas: 1,
    arquivo: "materiais/colorir-sofia-lendo.pdf",
    cor: "#086B8E"
  },
];