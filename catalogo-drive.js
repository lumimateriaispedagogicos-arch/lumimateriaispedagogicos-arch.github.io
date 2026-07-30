(function () {
  "use strict";

  const CACHE_KEY = "lumi.catalogoDrive.v1";
  const CORES = ["#4A6FA5", "#D96A5A", "#7C9A6D", "#7D62B8", "#086B8E", "#F2B33D", "#C0564B", "#E5A33F"];

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
  function urlHttp(valor) {
    const url = texto(valor);
    return /^https:\/\//i.test(url) ? url : "";
  }
  function categoriasPermitidas(config) {
    return new Set((config.categorias || []).map(function (c) { return c.nome; }));
  }
  function converter(item, indice, config) {
    if (!item || typeof item !== "object") return null;
    const id = texto(item.id);
    const nome = texto(item.nome);
    const categoria = texto(item.categoria);
    const visualizar = urlHttp(item.urlVisualizacao || item.arquivo);
    if (!id || !nome || !categoriasPermitidas(config).has(categoria) || !visualizar) return null;
    return {
      driveId: id,
      nomeDrive: nome,
      titulo: texto(item.titulo) || tituloDoNome(nome),
      descricao: "Material pedagógico gratuito para visualizar, baixar e imprimir.",
      categoria: categoria,
      arquivo: visualizar,
      download: urlHttp(item.urlDownload) || visualizar,
      capa: urlHttp(item.urlMiniatura),
      atualizadoEm: texto(item.atualizadoEm),
      cor: CORES[indice % CORES.length],
      remoto: true
    };
  }
  function listaDaResposta(resposta) {
    if (Array.isArray(resposta)) return resposta;
    if (resposta && resposta.sucesso !== false && Array.isArray(resposta.materiais)) return resposta.materiais;
    throw new Error("Resposta do catálogo em formato inválido.");
  }
  function lerCache(config) {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (!cache || !Array.isArray(cache.materiais) || Date.now() - cache.salvoEm > config.cacheMs) return [];
      return cache.materiais.map(function (m, i) { return converter(m, i, config); }).filter(Boolean);
    } catch (_) { return []; }
  }
  function salvarCache(materiais) {
    try {
      const dados = materiais.map(function (m) {
        return { id: m.driveId, nome: m.nomeDrive, titulo: m.titulo, categoria: m.categoria,
          urlVisualizacao: m.arquivo, urlDownload: m.download, urlMiniatura: m.capa, atualizadoEm: m.atualizadoEm };
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify({ salvoEm: Date.now(), materiais: dados }));
    } catch (_) { /* O navegador pode bloquear armazenamento; o site continua local. */ }
  }
  function chaveMaterial(m) {
    const arquivo = normalizar(m.nomeDrive || (m.arquivo || "").split("/").pop().split("?")[0]);
    return normalizar(m.categoria) + "|" + (arquivo || normalizar(m.titulo));
  }
  function mesclar(locais, remotos) {
    const resultado = locais.slice();
    const ids = new Set();
    const chaves = new Set(locais.map(chaveMaterial));
    remotos.forEach(function (m) {
      const chave = chaveMaterial(m);
      if (!ids.has(m.driveId) && !chaves.has(chave)) {
        ids.add(m.driveId); chaves.add(chave); resultado.push(m);
      }
    });
    return resultado;
  }
  async function buscar(config) {
    if (!texto(config.endpoint)) return [];
    const controlador = new AbortController();
    const temporizador = setTimeout(function () { controlador.abort(); }, config.timeoutMs);
    try {
      const resposta = await fetch(config.endpoint, { method: "GET", signal: controlador.signal, cache: "no-store" });
      if (!resposta.ok) throw new Error("Endpoint respondeu com HTTP " + resposta.status + ".");
      const itens = listaDaResposta(await resposta.json());
      const materiais = itens.map(function (item, i) { return converter(item, i, config); }).filter(Boolean);
      salvarCache(materiais);
      return materiais;
    } finally { clearTimeout(temporizador); }
  }
  async function carregar(locais) {
    const config = window.LUMI_DRIVE_CONFIG || { endpoint: "", timeoutMs: 8000, cacheMs: 1800000, categorias: [] };
    let remotos = lerCache(config);
    try { remotos = await buscar(config); }
    catch (erro) { console.warn("LUMI: catálogo remoto indisponível; usando catálogo local/cache.", erro); }
    return mesclar(Array.isArray(locais) ? locais : [], remotos);
  }

  window.CatalogoDrive = { carregar: carregar, mesclar: mesclar, tituloDoNome: tituloDoNome, converter: converter };
})();
