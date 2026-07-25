// Navegação por categorias: a home mostra cartões de assunto;
// clicar num assunto abre a lista de PDFs daquela categoria.
(function () {
  const destaques = document.getElementById("destaques");
  const gradeCategorias = document.getElementById("grade-categorias");
  const visaoCategoria = document.getElementById("visao-categoria");
  const lista = document.getElementById("lista-materiais");
  const btnVoltar = document.getElementById("btn-voltar");
  const subTitulo = document.getElementById("sub-materiais");
  const vazio = document.getElementById("vazio");
  document.getElementById("ano").textContent = new Date().getFullYear();

  if (!Array.isArray(MATERIAIS) || MATERIAIS.length === 0) {
    vazio.hidden = false;
    return;
  }

  const CORES_PADRAO = ["#4A6FA5", "#F2B33D", "#7C9A6D", "#D96A5A", "#7D62B8", "#086B8E"];

  // Ícone e cor de cada assunto (categorias novas ganham o padrão 📚)
  const ICONES = {
    "Alfabetização": "🔤",
    "Consciência Fonológica": "🗣️",
    "Desenhos para Colorir": "🎨",
    "Matemática": "🔢",
    "Raciocínio Lógico": "🧩",
    "Interpretação de Texto": "📖",
    "Inteligência Emocional": "💛",
    "Coordenação Motora": "✏️",
    "Datas Especiais": "🎉",
  };
  const CORES_CATEGORIA = {
    "Consciência Fonológica": "#4A6FA5",
    "Desenhos para Colorir": "#D96A5A",
    "Matemática": "#7C9A6D",
    "Raciocínio Lógico": "#7D62B8",
    "Interpretação de Texto": "#086B8E",
    "Inteligência Emocional": "#F2B33D",
  };

  function cartaoMaterial(m, i) {
    const cor = m.cor || CORES_PADRAO[i % CORES_PADRAO.length];
    const meta = [m.idade, m.paginas ? m.paginas + " página" + (m.paginas > 1 ? "s" : "") : null]
      .filter(Boolean).join(" · ");
    const capa = m.capa || m.arquivo.replace("materiais/", "img/capas/").replace(".pdf", ".jpg");
    const el = document.createElement("article");
    el.className = "card-material" + (m.destaque ? " card-destaque" : "");
    el.style.setProperty("--cor", cor);
    el.innerHTML =
      (m.destaque ? '<span class="selo-destaque">⭐ Destaque</span>' : "") +
      '<a class="capa-link" href="' + m.arquivo + '" target="_blank" rel="noopener" title="Visualizar ' + m.titulo + '">' +
      '<img class="capa" src="' + capa + '" alt="Prévia: ' + m.titulo + '" loading="lazy"></a>' +
      '<div class="card-corpo">' +
      '<span class="cat">' + (m.categoria || "Atividade") + "</span>" +
      "<h3>" + m.titulo + "</h3>" +
      '<p class="desc">' + (m.descricao || "") + "</p>" +
      (meta ? '<p class="meta">' + meta + "</p>" : "") +
      '<div class="card-acoes">' +
      '<a class="acao-ver" href="' + m.arquivo + '" target="_blank" rel="noopener">👀 Visualizar</a>' +
      '<a class="acao-baixar" href="' + m.arquivo + '" download>⬇️ Baixar</a>' +
      '<button class="acao-imprimir" data-pdf="' + m.arquivo + '">🖨️ Imprimir</button>' +
      "</div></div>";
    return el;
  }

  // Destaques ficam sempre visíveis no topo (ex.: Alfabeto Sonoro)
  const emDestaque = MATERIAIS.filter(function (m) { return m.destaque; });
  const comuns = MATERIAIS.filter(function (m) { return !m.destaque; });
  emDestaque.forEach(function (m, i) { destaques.appendChild(cartaoMaterial(m, i)); });

  // Monta os cartões de assunto com a contagem de atividades
  const categorias = [];
  comuns.forEach(function (m) {
    const c = m.categoria || "Outros";
    const existente = categorias.find(function (x) { return x.nome === c; });
    if (existente) existente.qtd++;
    else categorias.push({ nome: c, qtd: 1 });
  });

  categorias.forEach(function (c, i) {
    const cor = CORES_CATEGORIA[c.nome] || CORES_PADRAO[i % CORES_PADRAO.length];
    const b = document.createElement("button");
    b.className = "card-categoria";
    b.style.setProperty("--cor", cor);
    b.innerHTML =
      '<span class="cat-icone">' + (ICONES[c.nome] || "📚") + "</span>" +
      "<h3>" + c.nome + "</h3>" +
      '<span class="cat-qtd">' + c.qtd + (c.qtd > 1 ? " atividades" : " atividade") + "</span>";
    b.addEventListener("click", function () { abrirCategoria(c.nome); });
    gradeCategorias.appendChild(b);
  });

  function abrirCategoria(nome) {
    lista.innerHTML = "";
    comuns
      .filter(function (m) { return (m.categoria || "Outros") === nome; })
      .forEach(function (m, i) { lista.appendChild(cartaoMaterial(m, i)); });
    gradeCategorias.hidden = true;
    destaques.hidden = true;
    visaoCategoria.hidden = false;
    subTitulo.innerHTML = "Atividades de <strong>" + nome + "</strong> — clique para visualizar, baixar ou imprimir.";
    document.getElementById("materiais").scrollIntoView({ behavior: "smooth" });
  }

  function voltarCategorias() {
    visaoCategoria.hidden = true;
    gradeCategorias.hidden = false;
    destaques.hidden = false;
    subTitulo.innerHTML = "Escolha um assunto para ver as atividades. Tudo gratuito: é só <strong>visualizar</strong>, <strong>baixar</strong> ou <strong>imprimir</strong>.";
  }
  btnVoltar.addEventListener("click", voltarCategorias);

  // Imprimir: abre o PDF num iframe oculto e chama a impressão;
  // se o navegador bloquear, abre o PDF em nova aba.
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".acao-imprimir");
    if (!btn) return;
    const url = btn.dataset.pdf;
    const frame = document.createElement("iframe");
    frame.style.display = "none";
    frame.src = url;
    frame.onload = function () {
      frame.dataset.ok = "1";
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch (_) {
        window.open(url, "_blank");
      }
    };
    document.body.appendChild(frame);
    setTimeout(function () {
      if (!frame.dataset.ok) window.open(url, "_blank");
    }, 4000);
  });
})();
