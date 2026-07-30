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
  "Desenhos para Colorir",
  "Matemática",
  "Raciocínio Lógico",
  "Interpretação de Texto",
  "Inteligência Emocional",
  "Datas Comemorativas",
  "Temáticos",
];

function capaDe(m) {
  return m.remoto ? "img/capas/capa-padrao.svg" : (m.capa || m.arquivo.replace("materiais/", "img/capas/").replace(".pdf", ".jpg"));
}

function escaparHtml(valor) {
  return String(valor || "").replace(/[&<>"']/g, function (caractere) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[caractere];
  });
}

function cartaoMaterial(m, i) {
  const cor = m.cor || CORES_PADRAO[i % CORES_PADRAO.length];
  // Desenhos para colorir têm card compacto: só prévia, título e botões
  const simples = m.categoria === "Desenhos para Colorir";
  const meta = [m.idade, m.paginas ? m.paginas + " página" + (m.paginas > 1 ? "s" : "") : null]
    .filter(Boolean).join(" · ");
  const el = document.createElement("article");
  const arquivo = escaparHtml(m.arquivo);
  const titulo = escaparHtml(m.titulo);
  el.className = "card-material" + (m.destaque ? " card-destaque" : "") + (simples ? " card-simples" : "");
  el.style.setProperty("--cor", cor);
  el.innerHTML =
    (m.destaque ? '<span class="selo-destaque">⭐ Destaque</span>' : "") +
    (m.remoto
      ? '<button class="capa-link capa-link-botao acao-pdf-remoto" type="button" data-acao="visualizar" data-drive-id="' + escaparHtml(m.driveId) + '" title="Visualizar ' + titulo + '">'
      : '<a class="capa-link" href="' + arquivo + '" target="_blank" rel="noopener" title="Visualizar ' + titulo + '">') +
    '<img class="capa" src="' + escaparHtml(capaDe(m)) + '" alt="Prévia: ' + titulo + '" loading="lazy" data-capa-padrao="img/capas/capa-padrao.svg">' +
    (m.remoto ? "</button>" : "</a>") +
    '<div class="card-corpo">' +
    (simples ? "" : '<span class="cat">' + escaparHtml(m.categoria || "Atividade") + "</span>") +
    "<h3>" + titulo + "</h3>" +
    (simples ? "" :
      '<p class="desc">' + escaparHtml(m.descricao || "") + "</p>" +
      (meta ? '<p class="meta">' + meta + "</p>" : "")) +
    '<div class="card-acoes">' +
    (m.remoto
      ? '<button class="acao-ver acao-pdf-remoto" data-acao="visualizar" data-drive-id="' + escaparHtml(m.driveId) + '">👀 Visualizar</button>' +
        '<button class="acao-baixar acao-pdf-remoto" data-acao="baixar" data-drive-id="' + escaparHtml(m.driveId) + '">⬇️ Baixar</button>' +
        '<button class="acao-imprimir acao-pdf-remoto" data-acao="imprimir" data-drive-id="' + escaparHtml(m.driveId) + '">🖨️ Imprimir</button>'
      : '<a class="acao-ver" href="' + arquivo + '" target="_blank" rel="noopener">👀 Visualizar</a>' +
        '<a class="acao-baixar" href="' + arquivo + '" download>⬇️ Baixar</a>' +
        '<button class="acao-imprimir" data-pdf="' + arquivo + '">🖨️ Imprimir</button>') +
    "</div></div>";
  return el;
}

// Imprimir: abre o PDF num iframe oculto e chama a impressão;
// se o navegador bloquear, abre o PDF em nova aba.
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".acao-imprimir");
  if (!btn || btn.classList.contains("acao-pdf-remoto")) return;
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

// PDFs privados são recebidos pelo Apps Script e transformados em Blob local.
document.addEventListener("click", async function (e) {
  const btn = e.target.closest(".acao-pdf-remoto");
  if (!btn || btn.disabled) return;
  const acao = btn.dataset.acao;
  const janela = acao === "visualizar" ? window.open("", "_blank") : null;
  btn.disabled = true;
  try {
    const pdf = await CatalogoDrive.obterPdf(btn.dataset.driveId);
    const url = URL.createObjectURL(pdf.blob);
    if (acao === "baixar") {
      const link = document.createElement("a");
      link.href = url; link.download = pdf.nome; document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    } else if (acao === "imprimir") {
      imprimirPdf(url, function () { URL.revokeObjectURL(url); });
    } else if (janela) {
      janela.location.href = url;
      setTimeout(function () { URL.revokeObjectURL(url); }, 5 * 60 * 1000);
    } else {
      window.open(url, "_blank");
    }
  } catch (erro) {
    if (janela) janela.close();
    alert("Não foi possível abrir este material agora. Tente novamente em instantes.");
    console.warn("LUMI: falha ao obter PDF privado.", erro);
  } finally { btn.disabled = false; }
});

function imprimirPdf(url, concluir) {
  const frame = document.createElement("iframe");
  frame.style.display = "none"; frame.src = url;
  frame.onload = function () {
    try { frame.contentWindow.focus(); frame.contentWindow.print(); }
    finally { setTimeout(function () { frame.remove(); concluir(); }, 1000); }
  };
  document.body.appendChild(frame);
}

document.addEventListener("error", function (e) {
  if (e.target.matches && e.target.matches("img[data-capa-padrao]") && !e.target.dataset.usandoPadrao) {
    e.target.dataset.usandoPadrao = "1";
    e.target.src = e.target.dataset.capaPadrao;
  }
}, true);

// Rodapé: ano atual
(function () {
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
