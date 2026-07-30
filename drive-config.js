// Configuração pública da integração com o Google Drive.
// Cole somente a URL pública terminada em /exec. Nunca coloque credenciais aqui.
window.LUMI_DRIVE_CONFIG = Object.freeze({
  endpoint: "https://script.google.com/macros/s/AKfycbzpay84vPDuwm9SNVZnrcSOYIchu9dyhUKFM_XBlNJXYcyE1VJES-WFkpOqSn4p8pC3TQ/exec",
  timeoutMs: 8000,
  // Cache válido para contingência. A consulta ao Drive continua sendo feita
  // em toda visita e substitui o cache assim que termina.
  cacheMs: 5 * 60 * 1000,
  categorias: Object.freeze([
    { nome: "Consciência Fonológica", pastaId: "1FkePrTiuFTPPBNZW_DpC6BZNE0LtFUfu" },
    { nome: "Desenhos para Colorir", pastaId: "1jECY4J5vAsU1P7XTBNf4LG4ktg-QFUEf" },
    { nome: "Matemática", pastaId: "1-WaSc-s3EY_l6FUn1foVaeg7WHdDZKkl" },
    { nome: "Raciocínio Lógico", pastaId: "17G1UwgGJUUqsUVfBC1_Xrbp7A8oJxIlj" },
    { nome: "Interpretação de Texto", pastaId: "1UAfizimqHxSDbwJ4W1jBU3kr_fvtqK-c" },
    { nome: "Inteligência Emocional", pastaId: "1RIs2MAuVtmAU3bf0xUc_CVPEP7UgKZqt" },
    { nome: "Datas Comemorativas", pastaId: "17FkqrHYUIs80laoonopwvDu1-1mZm_XM" },
    { nome: "Temáticos", pastaId: "1onVktRTk-zLn7NIOYAjqVC9UzhC1iay0" }
  ])
});
