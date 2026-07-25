// Página de assunto/coleção (categoria.html).
// ?cat=Assunto            → mostra as coleções (subpastas) e materiais avulsos
// ?cat=Assunto&colecao=X  → mostra os PDFs da coleção X
(function () {
  const params = new URLSearchParams(location.search);
  const cat = params.get("cat");
  const colecao = params.get("colecao");

  const lista = document.getElementById("lista-materiais");
  const titulo = document.getElementById("titulo-pagina");
  const sub = document.getElementById("sub-pagina");
  const voltar = document.getElementById("btn-voltar");

  if (!cat) { location.href = "index.html#materiais"; return; }

  const cor = CORES_CATEGORIA[cat] || "#4A6FA5";
  const icone = ICONES_CATEGORIA[cat] || "📚";
  const doAssunto = MATERIAIS.filter(function (m) {
    return !m.destaque && (m.categoria || "Outros") === cat;
  });

  function tituloPagina(texto) {
    titulo.innerHTML = '<span class="rabisco" style="background:' + cor + '"></span>' + icone + " " + texto;
    document.title = texto + " — LUMI Materiais Pedagógicos";
  }

  if (colecao) {
    // ----- PDFs de uma coleção -----
    tituloPagina(colecao);
    sub.innerHTML = "Coleção de <strong>" + cat + "</strong> — clique para visualizar, baixar ou imprimir. Tudo gratuito!";
    voltar.textContent = "← Voltar para " + cat;
    voltar.href = "categoria.html?cat=" + encodeURIComponent(cat);
    doAssunto
      .filter(function (m) { return m.colecao === colecao; })
      .forEach(function (m, i) { lista.appendChild(cartaoMaterial(m, i)); });
  } else {
    // ----- Coleções (subpastas) + materiais avulsos do assunto -----
    tituloPagina(cat);
    sub.innerHTML = "Escolha uma coleção para ver as atividades — tudo gratuito para baixar e imprimir.";

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
      sub.innerHTML = "🌱 As atividades de <strong>" + cat + "</strong> estão chegando! Volte em breve.";
    }
  }
})();
