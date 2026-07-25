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

  // Contagem por assunto
  const categorias = [];
  MATERIAIS.filter(function (m) { return !m.destaque; }).forEach(function (m) {
    const c = m.categoria || "Outros";
    const existente = categorias.find(function (x) { return x.nome === c; });
    if (existente) existente.qtd++;
    else categorias.push({ nome: c, qtd: 1 });
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
    if (c.qtd > 0) el.href = "categoria.html?cat=" + encodeURIComponent(c.nome);
    el.innerHTML =
      '<span class="cat-icone">' + (ICONES_CATEGORIA[c.nome] || "📚") + "</span>" +
      "<h3>" + c.nome + "</h3>" +
      (c.qtd === 0
        ? '<span class="cat-qtd">🌱 Em breve!</span>'
        : '<span class="cat-qtd">' + c.qtd + (c.qtd > 1 ? " atividades" : " atividade") + "</span>");
    gradeCategorias.appendChild(el);
  });
})();
