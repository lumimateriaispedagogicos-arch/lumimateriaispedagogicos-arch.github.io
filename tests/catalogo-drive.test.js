const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function ambiente(fetchImpl, cacheInicial) {
  const memoria = new Map(cacheInicial ? [["lumi.catalogoDrive.v2", JSON.stringify(cacheInicial)]] : []);
  const window = {};
  const contexto = vm.createContext({
    window, console: { warn() {} }, fetch: fetchImpl, AbortController, setTimeout, clearTimeout,
    URL, Blob, Uint8Array, atob,
    localStorage: { getItem: (k) => memoria.get(k) || null, setItem: (k, v) => memoria.set(k, v) }
  });
  ["drive-config.js", "catalogo-drive.js"].forEach((arquivo) =>
    vm.runInContext(fs.readFileSync(arquivo, "utf8"), contexto, { filename: arquivo }));
  return window;
}

function item(sobrescrever = {}) {
  return Object.assign({ id: "arquivoPermitido123", titulo: "Atividade matemática",
    categoria: "Matemática", atualizadoEm: "2026-07-30T00:00:00.000Z" }, sobrescrever);
}

(async function () {
  const semEndpoint = ambiente(() => { throw new Error("fetch não deveria ser chamado"); });
  assert.deepEqual(await semEndpoint.CatalogoDrive.carregar([{ titulo: "Local" }]), [{ titulo: "Local" }]);
  assert.equal(semEndpoint.LUMI_DRIVE_CONFIG.categorias.length, 8);

  const cacheVencido = { salvoEm: 1, materiais: [item({ id: "arquivoEmCache123", titulo: "Material do cache" })] };
  let consultasComCache = 0;
  const comCache = ambiente(async () => {
    consultasComCache++;
    return { ok: true, json: async () => ({ sucesso: true, materiais: [item({ id: "arquivoAtualizado12", titulo: "Material atualizado" })] }) };
  }, cacheVencido);
  comCache.LUMI_DRIVE_CONFIG = Object.assign({}, comCache.LUMI_DRIVE_CONFIG, { endpoint: "https://example.test/exec" });
  const imediato = comCache.CatalogoDrive.carregarCache([]);
  assert.equal(imediato[0].titulo, "Material do cache");
  assert.equal(consultasComCache, 0);
  const atualizado = await comCache.CatalogoDrive.carregar([]);
  assert.equal(consultasComCache, 1);
  assert.equal(atualizado[0].titulo, "Material atualizado");

  const requisicoes = [];
  const valido = ambiente(async (url) => {
    requisicoes.push(String(url));
    if (String(url).includes("action=pdf")) return { ok: true, json: async () => ({
      sucesso: true, id: "arquivoPermitido123", nome: "Atividade.pdf", mimeType: "application/pdf", base64: "JVBERi0="
    }) };
    return { ok: true, json: async () => ({ sucesso: true, materiais: [item()] }) };
  });
  valido.LUMI_DRIVE_CONFIG = Object.assign({}, valido.LUMI_DRIVE_CONFIG, { endpoint: "https://example.test/exec" });
  const mesclado = await valido.CatalogoDrive.carregar([{ titulo: "Local", categoria: "Temáticos", arquivo: "materiais/local.pdf" }]);
  assert.equal(mesclado.length, 2);
  assert.equal(mesclado[1].remoto, true);
  assert.equal("arquivo" in mesclado[1], false);

  const pdf = await valido.CatalogoDrive.obterPdf("arquivoPermitido123");
  assert.equal(pdf.blob.type, "application/pdf");
  assert.equal(pdf.blob.size, 5);
  assert.match(requisicoes.at(-1), /action=pdf/);
  assert.match(requisicoes.at(-1), /id=arquivoPermitido123/);
  assert.ok(requisicoes.some((url) => /[?&]_=[0-9]+/.test(url)));

  const negado = ambiente(async () => ({ ok: true, json: async () => ({
    sucesso: false, codigo: "NAO_AUTORIZADO", mensagem: "Arquivo não autorizado."
  }) }));
  negado.LUMI_DRIVE_CONFIG = Object.assign({}, negado.LUMI_DRIVE_CONFIG, { endpoint: "https://example.test/exec" });
  await assert.rejects(() => negado.CatalogoDrive.obterPdf("arquivoForaDaLista12"), /não autorizado/i);

  const duplicado = valido.CatalogoDrive.mesclar(
    [{ titulo: "Atividade matemática", categoria: "Matemática", arquivo: "materiais/atividade-matematica.pdf" }],
    [valido.CatalogoDrive.converter(item(), 0, valido.LUMI_DRIVE_CONFIG)]
  );
  assert.equal(duplicado.length, 1);

  for (const falha of [
    async () => { throw new Error("rede indisponível"); },
    async () => ({ ok: true, json: async () => ({ inesperado: true }) })
  ]) {
    const app = ambiente(falha);
    app.LUMI_DRIVE_CONFIG = Object.assign({}, app.LUMI_DRIVE_CONFIG, { endpoint: "https://example.test/exec" });
    assert.equal((await app.CatalogoDrive.carregar([{ titulo: "Local" }])).length, 1);
  }

  const cacheValido = { salvoEm: Date.now(), materiais: [item({ id: "arquivoContingencia1", titulo: "Cache de contingência" })] };
  const falhaComCache = ambiente(async () => { throw new Error("rede indisponível"); }, cacheValido);
  falhaComCache.LUMI_DRIVE_CONFIG = Object.assign({}, falhaComCache.LUMI_DRIVE_CONFIG, { endpoint: "https://example.test/exec" });
  assert.equal((await falhaComCache.CatalogoDrive.carregar([]))[0].titulo, "Cache de contingência");

  valido.LUMI_DRIVE_CONFIG.categorias.forEach((categoria, indice) => {
    assert.ok(valido.CatalogoDrive.converter(item({ id: "arquivoPermitido" + indice, categoria: categoria.nome }), indice, valido.LUMI_DRIVE_CONFIG));
  });
  assert.equal(valido.CatalogoDrive.converter(item({ categoria: "Categoria não autorizada" }), 0, valido.LUMI_DRIVE_CONFIG), null);
  console.log("Todos os testes do frontend passaram.");
})().catch((erro) => { console.error(erro); process.exitCode = 1; });
