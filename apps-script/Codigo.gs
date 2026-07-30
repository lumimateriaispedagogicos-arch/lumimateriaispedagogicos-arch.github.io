/**
 * Catálogo público LUMI para Google Apps Script.
 * Não há credenciais neste código: o Web App executa com a conta da proprietária.
 */
const PASTAS_LUMI = Object.freeze([
  { categoria: 'Consciência Fonológica', id: '1FkePrTiuFTPPBNZW_DpC6BZNE0LtFUfu' },
  { categoria: 'Desenhos para Colorir', id: '1jECY4J5vAsU1P7XTBNf4LG4ktg-QFUEf' },
  { categoria: 'Matemática', id: '1-WaSc-s3EY_l6FUn1foVaeg7WHdDZKkl' },
  { categoria: 'Raciocínio Lógico', id: '17G1UwgGJUUqsUVfBC1_Xrbp7A8oJxIlj' },
  { categoria: 'Interpretação de Texto', id: '1UAfizimqHxSDbwJ4W1jBU3kr_fvtqK-c' },
  { categoria: 'Inteligência Emocional', id: '1RIs2MAuVtmAU3bf0xUc_CVPEP7UgKZqt' },
  { categoria: 'Datas Comemorativas', id: '17FkqrHYUIs80laoonopwvDu1-1mZm_XM' },
  { categoria: 'Temáticos', id: '1onVktRTk-zLn7NIOYAjqVC9UzhC1iay0' }
]);

function tituloDoArquivo_(nome) {
  const titulo = String(nome || '').replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ')
    .replace(/^lumi\s+/i, '')
    .replace(/\s*[\[(](?:id|cod(?:igo)?|vers(?:ao)?|v)?[\s_-]*[a-z0-9-]{4,}[\])]\s*/gi, ' ')
    .replace(/\s+v\d+(?:\.\d+)*$/i, '')
    .replace(/\s+(?:id|cod(?:igo)?)[\s_-]*[a-z0-9-]{4,}$/i, '').replace(/\s{2,}/g, ' ').trim();
  return titulo || 'Material pedagógico';
}

function materialDoArquivo_(arquivo, categoria) {
  const id = arquivo.getId();
  const nome = arquivo.getName();
  return {
    id: id,
    nome: nome,
    titulo: tituloDoArquivo_(nome),
    categoria: categoria,
    urlVisualizacao: 'https://drive.google.com/file/d/' + encodeURIComponent(id) + '/view',
    urlDownload: 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(id),
    urlMiniatura: 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w800',
    atualizadoEm: arquivo.getLastUpdated().toISOString()
  };
}

function montarCatalogo_() {
  const materiais = [];
  const erros = [];
  PASTAS_LUMI.forEach(function (pasta) {
    try {
      const arquivos = DriveApp.getFolderById(pasta.id).getFilesByType(MimeType.PDF);
      while (arquivos.hasNext()) {
        try {
          materiais.push(materialDoArquivo_(arquivos.next(), pasta.categoria));
        } catch (erroArquivo) {
          erros.push({ categoria: pasta.categoria, mensagem: 'Um PDF não pôde ser lido.' });
        }
      }
    } catch (erroPasta) {
      erros.push({ categoria: pasta.categoria, mensagem: 'A pasta não pôde ser consultada.' });
    }
  });
  const ordem = PASTAS_LUMI.map(function (p) { return p.categoria; });
  materiais.sort(function (a, b) {
    return ordem.indexOf(a.categoria) - ordem.indexOf(b.categoria) ||
      a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' }) || a.id.localeCompare(b.id);
  });
  return { sucesso: true, geradoEm: new Date().toISOString(), materiais: materiais, erros: erros };
}

/** GET público. ContentService fornece JSON UTF-8 e os cabeçalhos CORS do Web App. */
function doGet() {
  try {
    return ContentService.createTextOutput(JSON.stringify(montarCatalogo_()))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (erro) {
    return ContentService.createTextOutput(JSON.stringify({ sucesso: false, materiais: [], mensagem: 'Não foi possível gerar o catálogo.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
