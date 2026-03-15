# QA Checklist & Testing

Este documento detalha os critérios de aceitação e como validá-los.

## Critérios de Aceitação

- [x] **A tela de configuração mostra/oculta campos conforme o `contentType` selecionado.**
  - *Como testar:* Selecione "Filme". Apenas "ID" deve aparecer. Selecione "Série". "Temporada" e "Episódio" devem aparecer. Selecione "Anime (Série)". "Episódio" e a opção "Versão Dublada" devem aparecer.

- [x] **Montagem da URL: exemplos correspondem ao padrão e query params aparecem quando selecionados.**
  - *Como testar (Exemplo 1):* Selecione "Série", ID "500", Temporada "1", Episódio "2", Cor "00ff00", marque "Overlay Ativo" e "Botão Próximo". Clique em "Assistir Agora". Inspecione o DOM (F12) e verifique o `src` do iframe. Deve ser: `https://player.videasy.net/tv/500/1/2?color=00ff00&overlay=true&nextEpisode=true`.
  - *Como testar (Exemplo 2):* Selecione "Anime (Série)", ID "900", Episódio "6", marque "Versão Dublada". Clique em "Assistir Agora". O `src` do iframe deve ser: `https://player.videasy.net/anime/900/6?dub=true`.

- [x] **Ao clicar em "Assistir Agora", iframe carrega a URL final; tela de configuração é escondida; player ocupa a viewport inteira; botão Voltar limpa `iframe.src`.**
  - *Como testar:* Preencha os dados obrigatórios e clique em "Assistir Agora". A tela deve mudar completamente para o player (fundo preto, iframe ocupando 100%). Clique em "Voltar". A tela de configuração deve reaparecer e o estado do player deve ser resetado.

- [x] **`postMessage` JSON do iframe atualiza o log de progresso (progress com 2 casas decimais).**
  - *Como testar:* Siga as instruções no `README.md` na seção "Simulando o Log de Progresso". Verifique se a UI exibe a porcentagem corretamente formatada (ex: 0.4567 -> 45.67%).

- [x] **Em ambiente simulando Cordova/deviceready, `window.open` é inofensivo/desabilitado.**
  - *Como testar:* Abra o Console do navegador (F12) e digite `window.open('https://google.com')`. O console deve exibir um aviso "Blocked popup attempt by window.open" e a nova aba/janela não deve abrir.

- [x] **CSP documentada e não impede o carregamento do iframe do player.**
  - *Como testar:* Verifique a tag `<meta http-equiv="Content-Security-Policy">` no `index.html`. Ela contém `frame-src 'self' https://player.videasy.net;`. O player deve carregar sem erros de CSP no console.

- [x] **Responsividade: funciona em celular e desktop; botão Voltar evita notch.**
  - *Como testar:* Use o modo de design responsivo do navegador (F12 -> Toggle Device Toolbar). Verifique se o layout se adapta bem em telas pequenas. O botão "Voltar" no player usa a classe `pt-safe` (padding-top: env(safe-area-inset-top)) para evitar notches em iOS/Android modernos.

- [x] **Código legível; README com comandos de execução presente.**
  - *Como testar:* Verifique a estrutura do código em `src/App.tsx` e `src/utils/urlBuilder.ts`. Leia o `README.md` para confirmar a presença das instruções.
