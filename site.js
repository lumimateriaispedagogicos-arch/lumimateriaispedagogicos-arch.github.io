// Home: mostra os destaques e os cartões de assunto.
// Cada assunto é um LINK para a sua própria página (categoria.html).
(function () {
  const destaques = document.getElementById("destaques");
  const gradeCategorias = document.getElementById("grade-categorias");
  const vazio = document.getElementById("vazio");

  if (!Array.isArray(MATERIAIS) || MATERIAIS.length === 0) {
    vazio.hidden = false;
    return;
  }

  // Destaques sempre visíveis no topo (ex.: Alfabeto Sonoro)
  MATERIAIS.filter(function (m) { return m.destaque; })
    .forEach(function (m, i) { destaques.appendChild(cartaoMaterial(m, i)); });

  // Contagem por assunto (guardando coleções e avulsos para o link direto)
  const categorias = [];
  MATERIAIS.filter(function (m) { return !m.destaque; }).forEach(function (m) {
    const c = m.categoria || "Outros";
    let existente = categorias.find(function (x) { return x.nome === c; });
    if (!existente) {
      existente = { nome: c, qtd: 0, colecoes: [], avulsos: 0 };
      categorias.push(existente);
    }
    existente.qtd++;
    if (m.colecao) {
      if (existente.colecoes.indexOf(m.colecao) === -1) existente.colecoes.push(m.colecao);
    } else {
      existente.avulsos++;
    }
  });
  CATEGORIAS_FIXAS.forEach(function (nome) {
    if (!categorias.find(function (x) { return x.nome === nome; })) {
      categorias.push({ nome: nome, qtd: 0 });
    }
  });

  categorias.forEach(function (c, i) {
    const cor = CORES_CATEGORIA[c.nome] || CORES_PADRAO[i % CORES_PADRAO.length];
    const el = document.createElement(c.qtd > 0 ? "a" : "div");
    el.className = "card-categoria" + (c.qtd === 0 ? " embreve" : "");
    el.style.setProperty("--cor", cor);
    if (c.qtd > 0) {
      // Assunto com uma única coleção e nada avulso: vai direto para os PDFs
      el.href = "categoria.html?cat=" + encodeURIComponent(c.nome) +
        (c.colecoes && c.colecoes.length === 1 && c.avulsos === 0
          ? "&colecao=" + encodeURIComponent(c.colecoes[0])
          : "");
    }
    el.innerHTML =
      '<span class="cat-icone">' + (ICONES_CATEGORIA[c.nome] || "📚") + "</span>" +
      "<h3>" + c.nome + "</h3>" +
      (c.qtd === 0
        ? '<span class="cat-qtd">🌱 Em breve!</span>'
        : '<span class="cat-qtd">' + c.qtd + (c.qtd > 1 ? " atividades" : " atividade") + "</span>");
    gradeCategorias.appendChild(el);
  });
})();
