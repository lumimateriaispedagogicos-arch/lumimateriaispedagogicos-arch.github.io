// Renderiza o catálogo de materiais e os filtros por categoria.
(function () {
  const lista = document.getElementById("lista-materiais");
  const vazio = document.getElementById("vazio");
  const filtros = document.getElementById("filtros");
  document.getElementById("ano").textContent = new Date().getFullYear();

  if (!Array.isArray(MATERIAIS) || MATERIAIS.length === 0) {
    vazio.hidden = false;
    return;
  }

  const CORES_PADRAO = ["#4A6FA5", "#F2B33D", "#7C9A6D", "#D96A5A", "#7D62B8", "#086B8E"];

  function cartao(m, i) {
    const cor = m.cor || CORES_PADRAO[i % CORES_PADRAO.length];
    const meta = [m.idade, m.paginas ? m.paginas + " página" + (m.paginas > 1 ? "s" : "") : null]
      .filter(Boolean).join(" · ");
    const el = document.createElement("article");
    el.className = "card-material" + (m.destaque ? " card-destaque" : "");
    el.style.setProperty("--cor", cor);
    el.dataset.cat = m.categoria || "Outros";
    // Capa: primeira página do PDF, gerada em img/capas/ com o mesmo nome do arquivo
    const capa = m.capa || m.arquivo.replace("materiais/", "img/capas/").replace(".pdf", ".jpg");
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

  MATERIAIS.forEach(function (m, i) { lista.appendChild(cartao(m, i)); });

  // Filtros por categoria (só aparecem se houver mais de uma)
  const cats = Array.from(new Set(MATERIAIS.map(function (m) { return m.categoria || "Outros"; })));
  if (cats.length > 1) {
    filtros.hidden = false;
    cats.forEach(function (c) {
      const b = document.createElement("button");
      b.className = "filtro";
      b.dataset.cat = c;
      b.textContent = c;
      filtros.appendChild(b);
    });
    filtros.addEventListener("click", function (e) {
      const btn = e.target.closest(".filtro");
      if (!btn) return;
      filtros.querySelectorAll(".filtro").forEach(function (f) { f.classList.remove("ativo"); });
      btn.classList.add("ativo");
      const cat = btn.dataset.cat;
      lista.querySelectorAll(".card-material").forEach(function (card) {
        card.style.display = (cat === "todos" || card.dataset.cat === cat) ? "" : "none";
      });
    });
  }

  // Imprimir: abre o PDF num iframe oculto e chama a impressão.
  // Se o navegador bloquear, abre o PDF em nova aba como alternativa.
  lista.addEventListener("click", function (e) {
    const btn = e.target.closest(".acao-imprimir");
    if (!btn) return;
    const url = btn.dataset.pdf;
    const frame = document.createElement("iframe");
    frame.style.display = "none";
    frame.src = url;
    frame.onload = function () {
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
    frame.addEventListener("load", function () { frame.dataset.ok = "1"; });
  });
})();
