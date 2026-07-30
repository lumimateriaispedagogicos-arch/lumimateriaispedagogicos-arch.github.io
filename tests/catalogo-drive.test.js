const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function ambiente(fetchImpl, cacheInicial) {
  const memoria = new Map(cacheInicial ? [["lumi.catalogoDrive.v1", cacheInicial]] : []);
  const window = {};
  const contexto = vm.createContext({
    window, console: { warn() {} }, fetch: fetchImpl, AbortController, setTimeout, clearTimeout,
    localStorage: { getItem: (k) => memoria.get(k) || null, setItem: (k, v) => memoria.set(k, v) }
  });
  ["drive-config.js", "catalogo-drive.js"].forEach((arquivo) =>
    vm.runInContext(fs.readFileSync(arquivo, "utf8"), contexto, { filename: arquivo }));
  return window;
}

function item(sobrescrever = {}) {
  return Object.assign({ id: "drive-1", nome: "LUMI_atividade-matematica_v2.pdf", titulo: "Atividade matemática",
    categoria: "Matemática", urlVisualizacao: "https://drive.google.com/file/d/drive-1/view",
    urlDownload: "https://drive.google.com/uc?id=drive-1", urlMiniatura: "https://drive.google.com/thumbnail?id=drive-1",
    atualizadoEm: "2026-07-29T00:00:00.000Z" }, sobrescrever);
}

(async function () {
  const semEndpoint = ambiente(() => { throw new Error("fetch não deveria ser chamado"); });
  assert.deepEqual(await semEndpoint.CatalogoDrive.carregar([{ titulo: "Local" }]), [{ titulo: "Local" }]);
  assert.equal(semEndpoint.LUMI_DRIVE_CONFIG.categorias.length, 8);

  const valido = ambiente(async () => ({ ok: true, json: async () => ({ sucesso: true, materiais: [item()] }) }));
  valido.LUMI_DRIVE_CONFIG = Object.assign({}, valido.LUMI_DRIVE_CONFIG, { endpoint: "https://example.test/exec" });
  const mesclado = await valido.CatalogoDrive.carregar([{ titulo: "Local", categoria: "Temáticos", arquivo: "materiais/local.pdf" }]);
  assert.equal(mesclado.length, 2);
  assert.equal(mesclado[1].remoto, true);

  const duplicado = valido.CatalogoDrive.mesclar(
    [{ titulo: "Atividade Matemática", categoria: "Matemática", arquivo: "materiais/atividade-matematica.pdf" }],
    [valido.CatalogoDrive.converter(item({ nome: "atividade-matematica.pdf" }), 0, valido.LUMI_DRIVE_CONFIG)]
  );
  assert.equal(duplicado.length, 1);
  assert.equal(valido.CatalogoDrive.tituloDoNome("LUMI__Jogo-das-Cores_codigo-ABCD1234_v3.pdf"), "Jogo das Cores");

  for (const falha of [
    async () => { throw new Error("rede indisponível"); },
    async () => ({ ok: true, json: async () => ({ inesperado: true }) })
  ]) {
    const app = ambiente(falha);
    app.LUMI_DRIVE_CONFIG = Object.assign({}, app.LUMI_DRIVE_CONFIG, { endpoint: "https://example.test/exec" });
    assert.equal((await app.CatalogoDrive.carregar([{ titulo: "Local" }])).length, 1);
  }

  valido.LUMI_DRIVE_CONFIG.categorias.forEach((categoria, indice) => {
    assert.ok(valido.CatalogoDrive.converter(item({ id: "id-" + indice, categoria: categoria.nome }), indice, valido.LUMI_DRIVE_CONFIG));
  });
  assert.equal(valido.CatalogoDrive.converter(item({ categoria: "Categoria não autorizada" }), 0, valido.LUMI_DRIVE_CONFIG), null);
  console.log("Todos os testes do catálogo passaram.");
})().catch((erro) => { console.error(erro); process.exitCode = 1; });
