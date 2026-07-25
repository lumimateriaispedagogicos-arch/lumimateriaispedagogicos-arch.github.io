// Funções e constantes compartilhadas entre a home (site.js)
// e as páginas de assunto/coleção (categoria.js).

const CORES_PADRAO = ["#4A6FA5", "#F2B33D", "#7C9A6D", "#D96A5A", "#7D62B8", "#086B8E"];

const ICONES_CATEGORIA = {
  "Alfabetização": "🔤",
  "Consciência Fonológica": "🗣️",
  "Desenhos para Colorir": "🎨",
  "Matemática": "🔢",
  "Raciocínio Lógico": "🧩",
  "Interpretação de Texto": "📖",
  "Inteligência Emocional": "💛",
  "Coordenação Motora": "✏️",
  "Datas Comemorativas": "🎉",
  "Temáticos": "🌈",
};

const CORES_CATEGORIA = {
  "Consciência Fonológica": "#4A6FA5",
  "Desenhos para Colorir": "#D96A5A",
  "Matemática": "#7C9A6D",
  "Raciocínio Lógico": "#7D62B8",
  "Interpretação de Texto": "#086B8E",
  "Inteligência Emocional": "#F2B33D",
  "Datas Comemorativas": "#C0564B",
  "Temáticos": "#E5A33F",
};

// Assuntos que aparecem na home mesmo antes de terem atividades ("Em breve")
const CATEGORIAS_FIXAS = [
  "Matemática",
  "Raciocínio Lógico",
  "Interpretação de Texto",
  "Inteligência Emocional",
  "Datas Comemorativas",
  "Temáticos",
];

function capaDe(m) {
  return m.capa || m.arquivo.replace("materiais/", "img/capas/").replace(".pdf", ".jpg");
}

function cartaoMaterial(m, i) {
  const cor = m.cor || CORES_PADRAO[i % CORES_PADRAO.length];
  const meta = [m.idade, m.paginas ? m.paginas + " página" + (m.paginas > 1 ? "s" : "") : null]
    .filter(Boolean).join(" · ");
  const el = document.createElement("article");
  el.className = "card-material" + (m.destaque ? " card-destaque" : "");
  el.style.setProperty("--cor", cor);
  el.innerHTML =
    (m.destaque ? '<span class="selo-destaque">⭐ Destaque</span>' : "") +
    '<a class="capa-link" href="' + m.arquivo + '" target="_blank" rel="noopener" title="Visualizar ' + m.titulo + '">' +
    '<img class="capa" src="' + capaDe(m) + '" alt="Prévia: ' + m.titulo + '" loading="lazy"></a>' +
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

// Rodapé: ano atual
(function () {
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
