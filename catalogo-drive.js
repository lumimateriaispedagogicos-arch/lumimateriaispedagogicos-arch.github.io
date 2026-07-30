(function () {
  "use strict";

  const CACHE_KEY = "lumi.catalogoDrive.v2";
  const CORES = ["#4A6FA5", "#D96A5A", "#7C9A6D", "#7D62B8", "#086B8E", "#F2B33D", "#C0564B", "#E5A33F"];
  const capasEmMemoria = new Map();
  function texto(valor) { return typeof valor === "string" ? valor.trim() : ""; }
  function normalizar(valor) {
    return texto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .replace(/\.pdf$/i, "").replace(/[^a-z0-9]+/g, " ").trim();
  }
  function tituloDoNome(nome) {
    let titulo = texto(nome).replace(/\.pdf$/i, "").replace(/[_-]+/g, " ");
    titulo = titulo.replace(/^lumi\s+/i, "")
      .replace(/\s*[\[(](?:id|cod(?:igo)?|vers(?:ao)?|v)?[\s_-]*[a-z0-9-]{4,}[\])]\s*/gi, " ")
      .replace(/\s+v\d+(?:\.\d+)*$/i, "")
      .replace(/\s+(?:id|cod(?:igo)?)[\s_-]*[a-z0-9-]{4,}$/i, "").replace(/\s{2,}/g, " ").trim();
    return titulo || "Material pedagógico";
  }
  function categoriasPermitidas(config) {
    return new Set((config.categorias || []).map(function (categoria) { return categoria.nome; }));
  }
  function converter(item, indice, config) {
    if (!item || typeof item !== "object") return null;
    const id = texto(item.id);
    const titulo = texto(item.titulo);
    const categoria = texto(item.categoria);
    if (!/^[A-Za-z0-9_-]{10,200}$/.test(id) || !titulo || !categoriasPermitidas(config).has(categoria)) return null;
    return {
      driveId: id, titulo: titulo, descricao: "Material pedagógico gratuito para visualizar, baixar e imprimir.",
      categoria: categoria, atualizadoEm: texto(item.atualizadoEm), cor: CORES[indice % CORES.length], remoto: true
    };
  }
  function listaDaResposta(resposta) {
    if (resposta && resposta.sucesso !== false && Array.isArray(resposta.materiais)) return resposta.materiais;
    throw new Error("Resposta do catálogo em formato inválido.");
  }
  function lerCache(config, aceitarExpirado) {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (!cache || !Array.isArray(cache.materiais)) return [];
      if (!aceitarExpirado && Date.now() - cache.salvoEm > config.cacheMs) return [];
      return cache.materiais.map(function (item, i) { return converter(item, i, config); }).filter(Boolean);
    } catch (_) { return []; }
  }
  function salvarCache(materiais) {
    try {
      const dados = materiais.map(function (m) {
        return { id: m.driveId, titulo: m.titulo, categoria: m.categoria, atualizadoEm: m.atualizadoEm };
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify({ salvoEm: Date.now(), materiais: dados }));
    } catch (_) { /* O site continua com o catálogo local se o armazenamento for bloqueado. */ }
  }
  function chaveMaterial(m) {
    const arquivo = m.remoto ? "" : normalizar((m.arquivo || "").split("/").pop().split("?")[0]);
    return normalizar(m.categoria) + "|" + (arquivo || normalizar(m.titulo));
  }
  function mesclar(locais, remotos) {
    const resultado = locais.slice();
    const ids = new Set();
    const chaves = new Set(locais.map(chaveMaterial));
    remotos.forEach(function (material) {
      const chave = chaveMaterial(material);
      if (!ids.has(material.driveId) && !chaves.has(chave)) {
        ids.add(material.driveId); chaves.add(chave); resultado.push(material);
      }
    });
    return resultado;
  }
  function configAtual() {
    return window.LUMI_DRIVE_CONFIG || { endpoint: "", timeoutMs: 8000, cacheMs: 1800000, categorias: [] };
  }
  async function requisitarJson(url, config) {
    const controlador = new AbortController();
    const temporizador = setTimeout(function () { controlador.abort(); }, config.timeoutMs);
    try {
      const resposta = await fetch(url, { method: "GET", signal: controlador.signal, cache: "no-store" });
      if (!resposta.ok) throw new Error("Endpoint respondeu com HTTP " + resposta.status + ".");
      return await resposta.json();
    } finally { clearTimeout(temporizador); }
  }
  async function buscar(config) {
    if (!texto(config.endpoint)) return [];
    const url = new URL(config.endpoint);
    // Impede que navegador ou intermediários reutilizem uma resposta antiga.
    url.searchParams.set("_", String(Date.now()));
    const materiais = listaDaResposta(await requisitarJson(url.toString(), config))
      .map(function (item, i) { return converter(item, i, config); }).filter(Boolean);
    salvarCache(materiais);
    return materiais;
  }
  function carregarCache(locais) {
    const config = configAtual();
    // O cache, mesmo antigo, evita o flash da versão local. Uma consulta nova
    // começa logo em seguida e substitui estes dados.
    return mesclar(Array.isArray(locais) ? locais : [], lerCache(config, true));
  }
  async function carregar(locais) {
    const config = configAtual();
    // Mantém o último catálogo conhecido, mesmo expirado, até que uma
    // resposta nova e válida esteja disponível. Assim uma falha temporária
    // do Apps Script nunca faz categorias já publicadas voltarem a "Em breve".
    let remotos = lerCache(config, true);
    try { remotos = await buscar(config); }
    catch (erro) { console.warn("LUMI: catálogo remoto indisponível; usando catálogo local/cache.", erro); }
    return mesclar(Array.isArray(locais) ? locais : [], remotos);
  }
  function base64ParaBlob(base64, mimeType) {
    const binario = atob(base64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
    return new Blob([bytes], { type: mimeType });
  }
  async function obterPdf(id) {
    const config = configAtual();
    if (!texto(config.endpoint)) throw new Error("A integração com o Drive ainda não foi configurada.");
    if (!/^[A-Za-z0-9_-]{10,200}$/.test(texto(id))) throw new Error("Identificador de material inválido.");
    const url = new URL(config.endpoint);
    url.searchParams.set("action", "pdf"); url.searchParams.set("id", id);
    const resposta = await requisitarJson(url.toString(), config);
    if (!resposta || resposta.sucesso !== true || resposta.id !== id || resposta.mimeType !== "application/pdf" || !texto(resposta.base64)) {
      throw new Error((resposta && resposta.mensagem) || "O PDF não pôde ser obtido.");
    }
    return { blob: base64ParaBlob(resposta.base64, resposta.mimeType), nome: texto(resposta.nome) || "material-lumi.pdf" };
  }

  function obterCapa(id) {
    const identificador = texto(id);
    if (capasEmMemoria.has(identificador)) return capasEmMemoria.get(identificador);
    const promessa = (async function () {
      const config = configAtual();
      if (!texto(config.endpoint)) throw new Error("A integração com o Drive ainda não foi configurada.");
      if (!/^[A-Za-z0-9_-]{10,200}$/.test(identificador)) throw new Error("Identificador de material inválido.");
      const url = new URL(config.endpoint);
      url.searchParams.set("action", "capa"); url.searchParams.set("id", identificador);
      const resposta = await requisitarJson(url.toString(), config);
      if (!resposta || resposta.sucesso !== true || resposta.id !== identificador ||
          !/^image\//.test(texto(resposta.mimeType)) || !texto(resposta.base64)) {
        throw new Error((resposta && resposta.mensagem) || "A capa não pôde ser obtida.");
      }
      return base64ParaBlob(resposta.base64, resposta.mimeType);
    })();
    capasEmMemoria.set(identificador, promessa);
    promessa.catch(function () { capasEmMemoria.delete(identificador); });
    return promessa;
  }

  window.CatalogoDrive = {
    carregar: carregar, carregarCache: carregarCache, obterPdf: obterPdf, obterCapa: obterCapa,
    mesclar: mesclar, tituloDoNome: tituloDoNome, converter: converter
  };
})();
