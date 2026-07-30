// Home: carrega sem bloquear o catálogo local e, em seguida, incorpora o Drive.
(async function () {
  const destaques = document.getElementById("destaques");
  const gradeCategorias = document.getElementById("grade-categorias");
  const vazio = document.getElementById("vazio");

  function renderizar(materiais, carregandoDrive) {
    destaques.replaceChildren(); gradeCategorias.replaceChildren(); vazio.hidden = materiais.length > 0;
    materiais.filter(function (m) { return m.destaque; })
      .forEach(function (m, i) { destaques.appendChild(cartaoMaterial(m, i)); });
    const categorias = [];
    materiais.filter(function (m) { return !m.destaque; }).forEach(function (m) {
      const c = m.categoria || "Outros";
      let existente = categorias.find(function (x) { return x.nome === c; });
      if (!existente) { existente = { nome: c, qtd: 0, colecoes: [], avulsos: 0 }; categorias.push(existente); }
      existente.qtd++;
      if (m.colecao) {
        if (existente.colecoes.indexOf(m.colecao) === -1) existente.colecoes.push(m.colecao);
      } else existente.avulsos++;
    });
    CATEGORIAS_FIXAS.forEach(function (nome) {
      if (!categorias.find(function (x) { return x.nome === nome; })) categorias.push({ nome: nome, qtd: 0 });
    });
    categorias.forEach(function (c, i) {
      const cor = CORES_CATEGORIA[c.nome] || CORES_PADRAO[i % CORES_PADRAO.length];
      const el = document.createElement(c.qtd > 0 ? "a" : "div");
      el.className = "card-categoria" + (c.qtd === 0 ? (carregandoDrive ? " carregando" : " embreve") : "");
      el.style.setProperty("--cor", cor);
      if (c.qtd > 0) el.href = "categoria.html?cat=" + encodeURIComponent(c.nome) +
        (c.colecoes && c.colecoes.length === 1 && c.avulsos === 0 ? "&colecao=" + encodeURIComponent(c.colecoes[0]) : "");
      el.innerHTML = '<span class="cat-icone">' + (ICONES_CATEGORIA[c.nome] || "📚") + "</span><h3>" + escaparHtml(c.nome) + "</h3>" +
        (c.qtd === 0
          ? '<span class="cat-qtd">' + (carregandoDrive ? "⏳ Carregando..." : "🌱 Em breve!") + "</span>"
          : '<span class="cat-qtd">' + c.qtd + (c.qtd > 1 ? " atividades" : " atividade") + "</span>");
      gradeCategorias.appendChild(el);
    });
  }

  renderizar(CatalogoDrive.carregarCache(MATERIAIS), true);
  renderizar(await CatalogoDrive.carregar(MATERIAIS), false);
})();
