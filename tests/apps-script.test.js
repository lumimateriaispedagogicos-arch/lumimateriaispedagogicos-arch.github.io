const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const IDs = ["1FkePrTiuFTPPBNZW_DpC6BZNE0LtFUfu", "1jECY4J5vAsU1P7XTBNf4LG4ktg-QFUEf",
  "1-WaSc-s3EY_l6FUn1foVaeg7WHdDZKkl", "17G1UwgGJUUqsUVfBC1_Xrbp7A8oJxIlj",
  "1UAfizimqHxSDbwJ4W1jBU3kr_fvtqK-c", "1RIs2MAuVtmAU3bf0xUc_CVPEP7UgKZqt",
  "17FkqrHYUIs80laoonopwvDu1-1mZm_XM", "1onVktRTk-zLn7NIOYAjqVC9UzhC1iay0"];

function iterador(itens) { let i = 0; return { hasNext: () => i < itens.length, next: () => itens[i++] }; }
function arquivo(id, tipo, pais, temMiniatura = true) {
  return { getId: () => id, getName: () => id + ".pdf", getMimeType: () => tipo,
    getParents: () => iterador(pais.map((p) => ({ getId: () => p }))),
    getLastUpdated: () => new Date("2026-07-30T00:00:00Z"),
    getThumbnail: () => temMiniatura ? ({ getContentType: () => "image/png", getBytes: () => [137, 80, 78, 71] }) : null,
    getBlob: () => ({ getContentType: () => tipo, getBytes: () => [37, 80, 68, 70] }) };
}

const permitido = arquivo("arquivoPermitido123", "application/pdf", [IDs[0]]);
const semCapa = arquivo("arquivoSemMiniatura1", "application/pdf", [IDs[1]], false);
const outraPasta = arquivo("arquivoForaDaLista12", "application/pdf", ["pastaNaoAutorizada"]);
const naoPdf = arquivo("arquivoTextoPrivado1", "text/plain", [IDs[0]]);
const doisPais = arquivo("arquivoComDoisPais1", "application/pdf", [IDs[0], "outraPasta"]);
const porPasta = Object.fromEntries(IDs.map((id) => [id, []]));
porPasta[IDs[0]] = [permitido, naoPdf, doisPais];
porPasta[IDs[1]] = [semCapa];

const contexto = vm.createContext({
  MimeType: { PDF: "application/pdf" },
  CacheService: {
    getScriptCache: () => {
      const memoria = new Map();
      return {
        get: (chave) => memoria.get(chave) || null,
        put: (chave, valor) => memoria.set(chave, valor)
      };
    }
  },
  DriveApp: {
    getFolderById: (id) => ({ getFilesByType: () => iterador(porPasta[id] || []) }),
    getFileById: () => { throw new Error("getFileById nunca deve ser usado"); }
  },
  Utilities: { base64Encode: (bytes) => Buffer.from(bytes).toString("base64") },
  ContentService: {
    MimeType: { JSON: "application/json" },
    createTextOutput: (texto) => ({ texto, setMimeType() { return this; } })
  }
});
vm.runInContext(fs.readFileSync("apps-script/Codigo.gs", "utf8"), contexto, { filename: "Codigo.gs" });

assert.equal(contexto.pastaUnicaAutorizada_(permitido, IDs[0]), true);
assert.equal(contexto.pastaUnicaAutorizada_(naoPdf, IDs[0]), false);
assert.equal(contexto.pastaUnicaAutorizada_(doisPais, IDs[0]), false);
assert.equal(contexto.pastaUnicaAutorizada_(outraPasta, "pastaNaoAutorizada"), false);
assert.equal(contexto.localizarPdfAutorizado_("arquivoForaDaLista12"), null);

const respostaPermitida = JSON.parse(contexto.doGet({ parameter: { action: "pdf", id: "arquivoPermitido123" } }).texto);
assert.equal(respostaPermitida.sucesso, true);
assert.equal(respostaPermitida.mimeType, "application/pdf");
assert.equal(respostaPermitida.base64, "JVBERg==");
const capaPermitida = JSON.parse(contexto.doGet({ parameter: { action: "capa", id: "arquivoPermitido123" } }).texto);
assert.equal(capaPermitida.sucesso, true);
assert.equal(capaPermitida.mimeType, "image/png");
assert.equal(capaPermitida.base64, "iVBORw==");
const respostaNegada = JSON.parse(contexto.doGet({ parameter: { action: "pdf", id: "arquivoForaDaLista12" } }).texto);
assert.equal(respostaNegada.sucesso, false);
assert.equal(respostaNegada.codigo, "NAO_AUTORIZADO");
const capaNegada = JSON.parse(contexto.doGet({ parameter: { action: "capa", id: "arquivoForaDaLista12" } }).texto);
assert.equal(capaNegada.codigo, "NAO_AUTORIZADO");
const capaIndisponivel = JSON.parse(contexto.doGet({ parameter: { action: "capa", id: "arquivoSemMiniatura1" } }).texto);
assert.equal(capaIndisponivel.codigo, "CAPA_INDISPONIVEL");
const respostaNaoPdf = JSON.parse(contexto.doGet({ parameter: { action: "pdf", id: "arquivoTextoPrivado1" } }).texto);
assert.equal(respostaNaoPdf.sucesso, false);
assert.equal(respostaNaoPdf.codigo, "NAO_AUTORIZADO");
const catalogo = JSON.parse(contexto.doGet({ parameter: {} }).texto);
assert.equal(catalogo.materiais.length, 2);
assert.deepEqual(Object.keys(catalogo.materiais[0]).sort(), ["atualizadoEm", "categoria", "id", "titulo"]);
console.log("Todos os testes de segurança do Apps Script passaram.");
