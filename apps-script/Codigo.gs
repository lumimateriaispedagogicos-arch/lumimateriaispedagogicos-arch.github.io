/**
 * Ponte pública LUMI para arquivos que permanecem privados no Google Drive.
 * O Web App deve executar como a proprietária; nenhuma credencial é publicada.
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

function pastaUnicaAutorizada_(arquivo, pastaEsperadaId) {
  if (arquivo.getMimeType() !== MimeType.PDF) return false;
  const pais = arquivo.getParents();
  if (!pais.hasNext()) return false;
  const primeiroId = pais.next().getId();
  if (pais.hasNext() || primeiroId !== pastaEsperadaId) return false;
  return PASTAS_LUMI.some(function (pasta) { return pasta.id === primeiroId; });
}

function materialPublico_(arquivo, pasta) {
  return {
    id: arquivo.getId(),
    titulo: tituloDoArquivo_(arquivo.getName()),
    categoria: pasta.categoria,
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
          const arquivo = arquivos.next();
          if (pastaUnicaAutorizada_(arquivo, pasta.id)) materiais.push(materialPublico_(arquivo, pasta));
        } catch (erroArquivo) {
          erros.push({ categoria: pasta.categoria, mensagem: 'Um PDF não pôde ser lido.' });
        }
      }
    } catch (erroPasta) {
      erros.push({ categoria: pasta.categoria, mensagem: 'A pasta não pôde ser consultada.' });
    }
  });
  const ordem = PASTAS_LUMI.map(function (pasta) { return pasta.categoria; });
  materiais.sort(function (a, b) {
    return ordem.indexOf(a.categoria) - ordem.indexOf(b.categoria) ||
      a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' }) || a.id.localeCompare(b.id);
  });
  return { sucesso: true, geradoEm: new Date().toISOString(), materiais: materiais, erros: erros };
}

/**
 * Procura o ID somente dentro das oito pastas. Deliberadamente não usa
 * DriveApp.getFileById(id), evitando transformar um ID arbitrário em acesso.
 */
function localizarPdfAutorizado_(id) {
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(String(id || ''))) return null;
  for (let i = 0; i < PASTAS_LUMI.length; i++) {
    const pasta = PASTAS_LUMI[i];
    const arquivos = DriveApp.getFolderById(pasta.id).getFilesByType(MimeType.PDF);
    while (arquivos.hasNext()) {
      const arquivo = arquivos.next();
      if (arquivo.getId() === id && pastaUnicaAutorizada_(arquivo, pasta.id)) {
        return { arquivo: arquivo, pasta: pasta };
      }
    }
  }
  return null;
}

function respostaJson_(dados) {
  return ContentService.createTextOutput(JSON.stringify(dados)).setMimeType(ContentService.MimeType.JSON);
}

function entregarPdf_(id) {
  const encontrado = localizarPdfAutorizado_(id);
  if (!encontrado) return { sucesso: false, codigo: 'NAO_AUTORIZADO', mensagem: 'Arquivo não encontrado ou não autorizado.' };
  const blob = encontrado.arquivo.getBlob();
  if (blob.getContentType() !== MimeType.PDF) {
    return { sucesso: false, codigo: 'TIPO_INVALIDO', mensagem: 'O arquivo solicitado não é PDF.' };
  }
  return {
    sucesso: true,
    id: encontrado.arquivo.getId(),
    titulo: tituloDoArquivo_(encontrado.arquivo.getName()),
    categoria: encontrado.pasta.categoria,
    nome: tituloDoArquivo_(encontrado.arquivo.getName()) + '.pdf',
    mimeType: MimeType.PDF,
    base64: Utilities.base64Encode(blob.getBytes())
  };
}

/** GET: sem ação lista o catálogo; action=pdf entrega somente um PDF autorizado. */
function doGet(e) {
  try {
    const parametros = e && e.parameter ? e.parameter : {};
    return respostaJson_(parametros.action === 'pdf' ? entregarPdf_(parametros.id) : montarCatalogo_());
  } catch (erro) {
    return respostaJson_({ sucesso: false, codigo: 'ERRO_INTERNO', mensagem: 'Não foi possível atender à solicitação.' });
  }
}
