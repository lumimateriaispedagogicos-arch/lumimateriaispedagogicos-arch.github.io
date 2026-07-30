const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function ambiente(fetchImpl) {
  const memoria = new Map();
  const respostasCache = new Map();
  const window = {
    location: { origin: "https://lumi.test" },
    caches: {
      open: async () => ({
        match: async (chave) => respostasCache.get(String(chave)) || null,
        put: async (chave, resposta) => respostasCache.set(String(chave), resposta.clone()),
        keys: async () => Array.from(respostasCache.keys()).map((url) => ({ url })),
        delete: async (chave) => respostasCache.delete(typeof chave === "string" ? chave : chave.url)
      })
    }
  };
  const contexto = vm.createContext({
    window, console: { warn() {} }, fetch: fetchImpl, AbortController, setTimeout, clearTimeout,
    URL, Blob, Response, Uint8Array, atob,
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

  const requisicoes = [];
  const valido = ambiente(async (url) => {
    requisicoes.push(String(url));
    if (String(url).includes("action=capa")) return { ok: true, json: async () => ({
      sucesso: true, id: "arquivoPermitido123", mimeType: "image/png", base64: "iVBORw=="
    }) };
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
  const imediato = valido.CatalogoDrive.carregarCache([{ titulo: "Local", categoria: "Temáticos", arquivo: "materiais/local.pdf" }]);
  assert.equal(imediato.length, 2);
  assert.equal(imediato[1].driveId, "arquivoPermitido123");
  assert.match(requisicoes[0], /[?&]_=\d+/);

  const pdf = await valido.CatalogoDrive.obterPdf("arquivoPermitido123", "Matemática");
  assert.equal(pdf.blob.type, "application/pdf");
  assert.equal(pdf.blob.size, 5);
  assert.match(requisicoes.at(-1), /action=pdf/);
  assert.match(requisicoes.at(-1), /id=arquivoPermitido123/);
  assert.match(requisicoes.at(-1), /categoria=Matem%C3%A1tica/);

  const capa = await valido.CatalogoDrive.obterCapa("arquivoPermitido123", "Matemática", "2026-07-30T00:00:00.000Z");
  assert.equal(capa.type, "image/png");
  assert.equal(capa.size, 4);
  assert.match(requisicoes.at(-1), /action=capa/);
  assert.match(requisicoes.at(-1), /categoria=Matem%C3%A1tica/);
  const quantidadeAntesDoCache = requisicoes.length;
  await valido.CatalogoDrive.obterCapa("arquivoPermitido123", "Matemática", "2026-07-30T00:00:00.000Z");
  assert.equal(requisicoes.length, quantidadeAntesDoCache);

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

  let redeDisponivel = true;
  const cacheExpirado = ambiente(async () => {
    if (!redeDisponivel) throw new Error("rede indisponível");
    return { ok: true, json: async () => ({ sucesso: true, materiais: [item()] }) };
  });
  cacheExpirado.LUMI_DRIVE_CONFIG = Object.assign({}, cacheExpirado.LUMI_DRIVE_CONFIG, {
    endpoint: "https://example.test/exec",
    cacheMs: -1
  });
  assert.equal((await cacheExpirado.CatalogoDrive.carregar([{ titulo: "Local" }])).length, 2);
  redeDisponivel = false;
  assert.equal((await cacheExpirado.CatalogoDrive.carregar([{ titulo: "Local" }])).length, 2);

  valido.LUMI_DRIVE_CONFIG.categorias.forEach((categoria, indice) => {
    assert.ok(valido.CatalogoDrive.converter(item({ id: "arquivoPermitido" + indice, categoria: categoria.nome }), indice, valido.LUMI_DRIVE_CONFIG));
  });
  assert.equal(valido.CatalogoDrive.converter(item({ categoria: "Categoria não autorizada" }), 0, valido.LUMI_DRIVE_CONFIG), null);
  console.log("Todos os testes do frontend passaram.");
})().catch((erro) => { console.error(erro); process.exitCode = 1; });
