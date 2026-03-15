# CHANGELOG

## [1.0.0] - Lançamento Inicial

### Adicionado
- Interface de usuário moderna inspirada em aplicativos de streaming (modo escuro, tipografia clara, botões proeminentes).
- Formulário de configuração reativo que adapta os campos de entrada (Temporada, Episódio, Dublado) com base no tipo de mídia selecionado.
- Lógica de construção de URL robusta para mapear os inputs do usuário para as rotas e query parameters corretos do `player.videasy.net`.
- Visualizador de Player em tela cheia utilizando `iframe` com botão de retorno seguro para notches em dispositivos móveis.
- Escuta de eventos `message` (postMessage) para capturar e exibir o progresso do vídeo em tempo real na interface.
- Implementação de segurança: sobrescrita de `window.open` para bloquear popups indesejados, simulando defesas necessárias em ambientes como Cordova.
- Configuração de Content Security Policy (CSP) no `index.html` para garantir o carregamento seguro do iframe de terceiros.
