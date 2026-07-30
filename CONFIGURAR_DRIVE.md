# Como conectar o Drive privado ao site LUMI

As pastas e os PDFs **devem permanecer privados e acessíveis somente à proprietária**. O aplicativo da Web é uma ponte: ele executa como a proprietária, publica apenas o catálogo mínimo e entrega somente PDFs encontrados diretamente nas oito pastas autorizadas.

1. Entre em [script.google.com](https://script.google.com/) com a conta proprietária das pastas.
2. Clique em **Novo projeto** e dê um nome, por exemplo, **Ponte privada LUMI**.
3. Abra `apps-script/Codigo.gs` neste repositório, copie todo o conteúdo e cole no arquivo `Código.gs` do projeto. Salve.
4. Clique em **Implantar** → **Nova implantação** e selecione **Aplicativo da Web**.
5. Em **Executar como**, escolha **Eu**. Essa opção é indispensável: o script usa a autorização da proprietária para ler as pastas privadas.
6. Em **Quem pode acessar**, escolha **Qualquer pessoa**. Isso torna somente a URL do aplicativo acessível aos visitantes; **não muda o compartilhamento do Drive**. O código limita essa URL ao catálogo e aos PDFs validados nas oito pastas.
7. Clique em **Implantar**, revise as permissões solicitadas pelo Google e copie a URL terminada em `/exec` — nunca use a URL `/dev` no site.
8. Em `drive-config.js`, mantenha ou cole essa URL entre as aspas de `endpoint`. Nunca coloque senha, token ou chave nesse arquivo.
9. Abra a URL `/exec` em uma janela anônima. O JSON deve conter `"sucesso":true`; cada item apresenta apenas identificador, título, categoria e data, sem link privado do Drive.
10. Adicione um PDF diretamente em uma das oito pastas, aguarde alguns instantes e atualize o endpoint e a categoria no site. O navegador pode manter o último catálogo válido por até 30 minutos.

## Compartilhamento correto do Google Drive

1. Na pasta principal, nas oito subpastas e em cada PDF, abra **Compartilhar**.
2. Em **Acesso geral**, mantenha **Restrito**.
3. Confirme que somente a proprietária tem acesso. **Não use “Qualquer pessoa com o link”.**
4. Não mova um PDF publicado para outra pasta nem adicione um segundo local/pasta pai. O script rejeita arquivos fora das oito pastas ou associados a outro local.

Os visitantes não recebem links do Drive e não podem navegar ou listar as pastas. Ao clicar em visualizar, baixar ou imprimir, o navegador pede o PDF ao Apps Script; o script procura o identificador exclusivamente dentro das oito pastas, revalida tipo e pasta e devolve o conteúdo em base64. A capa padrão LUMI é usada porque miniaturas privadas do Drive não são expostas.

## Atualizar uma implantação existente

1. Cole e salve a nova versão de `Codigo.gs` no projeto.
2. Vá a **Implantar** → **Gerenciar implantações**.
3. Selecione a implantação, clique em **Editar**, escolha **Nova versão** e clique em **Implantar**.
4. Preserve a mesma URL `/exec`; não será necessário alterar novamente o site.

## Segurança, disponibilidade e limite gratuito

- **Nunca compartilhe senhas, tokens, chaves ou credenciais.** O código não precisa desses dados.
- O endpoint público dá acesso somente ao catálogo e ao conteúdo dos PDFs que a proprietária decidiu colocar diretamente nas oito pastas autorizadas. Os demais arquivos da conta não podem ser consultados por ID.
- O Apps Script e o Drive têm cotas e limites gratuitos. Como base64 aumenta o tamanho transferido, prefira PDFs otimizados. Arquivos muito grandes podem ultrapassar o limite de resposta ou tempo do Apps Script; nesse caso, reduza/comprima o PDF. Servir arquivos privados maiores de forma confiável exigiria outra infraestrutura autenticada, possivelmente paga.
- Se o endpoint estiver vazio, lento ou indisponível, o catálogo local continua aparecendo. O último catálogo remoto válido também pode ser usado durante o prazo do cache; o conteúdo do PDF não é guardado permanentemente.
