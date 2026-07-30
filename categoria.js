// Página de assunto/coleção (categoria.html).
// ?cat=Assunto            → mostra as coleções (subpastas) e materiais avulsos
// ?cat=Assunto&colecao=X  → mostra os PDFs da coleção X
(async function () {
  const params = new URLSearchParams(location.search);
  const cat = params.get("cat");
  const colecao = params.get("colecao");

  const lista = document.getElementById("lista-materiais");
  const titulo = document.getElementById("titulo-pagina");
  const sub = document.getElementById("sub-pagina");
  const voltar = document.getElementById("btn-voltar");

  if (!cat) { location.href = "index.html#materiais"; return; }

  function tituloPagina(texto) {
    const cor = CORES_CATEGORIA[cat] || "#4A6FA5";
    const icone = ICONES_CATEGORIA[cat] || "📚";
    titulo.innerHTML = '<span class="rabisco" style="background:' + cor + '"></span>' + icone + " " + texto;
    document.title = texto + " — LUMI Materiais Pedagógicos";
  }

  function renderizar(materiais, carregando) {
    lista.replaceChildren();
    const cor = CORES_CATEGORIA[cat] || "#4A6FA5";
    const doAssunto = materiais.filter(function (m) {
      return !m.destaque && (m.categoria || "Outros") === cat;
    });
  if (colecao) {
    // ----- PDFs de uma coleção -----
    tituloPagina(colecao);
    const daColecao = doAssunto.filter(function (m) { return m.colecao === colecao; });
    sub.innerHTML = daColecao.length === 0
      ? (carregando
        ? "⏳ Carregando os materiais de <strong>" + escaparHtml(cat) + "</strong>..."
        : "🌱 Esta coleção está vazia no momento. Volte em breve.")
      : "Coleção de <strong>" + escaparHtml(cat) + "</strong> — clique para visualizar, baixar ou imprimir. Tudo gratuito!";
    // Se esta é a única coleção do assunto (sem avulsos), a pessoa veio
    // direto da home — o voltar leva de volta aos assuntos.
    const outras = doAssunto.filter(function (m) { return m.colecao !== colecao; });
    if (outras.length === 0) {
      voltar.textContent = "← Voltar aos assuntos";
      voltar.href = "index.html#assuntos";
    } else {
      voltar.textContent = "← Voltar para " + cat;
      voltar.href = "categoria.html?cat=" + encodeURIComponent(cat);
    }
    daColecao
      .forEach(function (m, i) { lista.appendChild(cartaoMaterial(m, i)); });
  } else {
    // ----- Coleções (subpastas) + materiais avulsos do assunto -----
    tituloPagina(cat);

    const colecoes = [];
    doAssunto.forEach(function (m) {
      if (!m.colecao) return;
      const ex = colecoes.find(function (x) { return x.nome === m.colecao; });
      if (ex) ex.itens.push(m);
      else colecoes.push({ nome: m.colecao, itens: [m] });
    });
    const avulsos = doAssunto.filter(function (m) { return !m.colecao; });

    colecoes.forEach(function (col) {
      const a = document.createElement("a");
      a.className = "card-colecao";
      a.style.setProperty("--cor", cor);
      a.href = "categoria.html?cat=" + encodeURIComponent(cat) + "&colecao=" + encodeURIComponent(col.nome);
      a.innerHTML =
        '<img class="colecao-capa" src="' + capaDe(col.itens[0]) + '" alt="" loading="lazy">' +
        '<div class="colecao-info">' +
        '<span class="colecao-pasta">📁 Coleção</span>' +
        "<h3>" + col.nome + "</h3>" +
        '<span class="cat-qtd">' + col.itens.length + (col.itens.length > 1 ? " atividades" : " atividade") + "</span>" +
        "</div>";
      lista.appendChild(a);
    });
    avulsos.forEach(function (m, i) { lista.appendChild(cartaoMaterial(m, i)); });

    if (colecoes.length === 0 && avulsos.length === 0) {
      sub.innerHTML = carregando
        ? "⏳ Carregando os materiais de <strong>" + escaparHtml(cat) + "</strong>..."
        : "🌱 As atividades de <strong>" + escaparHtml(cat) + "</strong> estão chegando! Volte em breve.";
    } else if (colecoes.length > 0) {
      sub.innerHTML = "Escolha uma coleção para ver as atividades — tudo gratuito para baixar e imprimir.";
    } else {
      sub.innerHTML = "Clique para visualizar, baixar ou imprimir — tudo gratuito!";
    }
  }
  }

  renderizar(CatalogoDrive.carregarCache(MATERIAIS), true);
  renderizar(await CatalogoDrive.carregar(MATERIAIS), false);
})();
