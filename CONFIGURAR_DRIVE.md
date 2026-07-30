# Como conectar as pastas do Google Drive ao site LUMI

O site já funciona normalmente com os PDFs locais. Siga estes passos uma única vez para que também consulte os PDFs das oito pastas públicas do Drive.

1. Entre em [script.google.com](https://script.google.com/) com a conta que é proprietária das pastas.
2. Clique em **Novo projeto** e dê um nome, por exemplo, **Catálogo público LUMI**.
3. Abra o arquivo `apps-script/Codigo.gs` deste repositório, copie todo o conteúdo e cole no arquivo `Código.gs` do projeto, substituindo o exemplo que aparece ali. Salve.
4. No alto à direita, clique em **Implantar** → **Nova implantação**.
5. Ao lado de **Selecionar tipo**, escolha **Aplicativo da Web**.
6. Em **Executar como**, escolha **Eu**. Assim, o script consegue ler somente as oito pastas identificadas no código, sem colocar senha ou token no site.
7. Em **Quem pode acessar**, escolha a opção pública disponível na sua conta, normalmente **Qualquer pessoa**. Contas escolares/empresariais podem bloquear essa opção; nesse caso, solicite ao administrador ou use uma conta Google que permita publicação pública.
8. Clique em **Implantar**, autorize o acesso ao Drive quando o Google pedir e copie a URL fornecida. Ela precisa terminar em `/exec` (não use a URL `/dev`).
9. No repositório, abra `drive-config.js` e cole essa URL entre as aspas de `endpoint`. Não altere os IDs das pastas.
10. Antes de atualizar o site, abra a URL `/exec` em uma janela anônima. Deve aparecer um JSON com `"sucesso":true` e uma lista chamada `materiais`.
11. Garanta que a pasta principal, as oito subpastas e seus PDFs estejam compartilhados como **Qualquer pessoa com o link — Leitor**. Isso é necessário para visitantes abrirem os arquivos e para as miniaturas aparecerem. Nunca conceda permissão de edição ao público.
12. Adicione um PDF a uma das oito pastas, aguarde alguns instantes e recarregue a URL `/exec`. Confirme que o nome aparece no JSON; depois, abra a categoria correspondente no site. O navegador pode manter o último catálogo válido por até 30 minutos.

## Quando o código do Apps Script precisar ser atualizado

1. Cole e salve a nova versão de `Codigo.gs` no projeto.
2. Vá a **Implantar** → **Gerenciar implantações**.
3. Selecione a implantação atual, clique no lápis (**Editar**), escolha **Nova versão** e clique em **Implantar**.
4. Mantenha a mesma URL `/exec`; assim, não será preciso alterar o site novamente.

## Segurança e funcionamento

- **Nunca compartilhe nem grave no repositório senhas, tokens, chaves ou credenciais.** O código não precisa deles.
- Somente PDFs diretamente dentro das oito pastas configuradas são listados; outros tipos de arquivo e subpastas são ignorados.
- O Google Apps Script fornece a resposta JSON pública adequada ao site estático. Não é necessário servidor pago nem processo de build.
- Se a miniatura do Drive não estiver pronta ou não puder ser carregada, o site mostra automaticamente a capa padrão LUMI.
- Se o endpoint estiver vazio, lento, fora do ar ou devolver dados inválidos, os materiais locais continuam disponíveis. O site também tenta usar no navegador o último catálogo remoto válido ainda dentro do prazo do cache.
