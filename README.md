# StreamPlay (Videasy Custom Player)

Um aplicativo single-page moderno que atua como um configurador e reprodutor para o Videasy Custom Player. Ele permite que os usuários configurem parâmetros de reprodução (tipo de mídia, IDs, cores, opções) e assistam ao conteúdo em uma interface imersiva que remete a aplicativos de streaming.

## Funcionalidades

- **Configuração Dinâmica:** Formulário adaptativo que exibe campos relevantes com base no tipo de conteúdo selecionado (Filme, Série, Anime).
- **Geração de URL:** Constrói automaticamente a URL do player com os parâmetros corretos (`dub`, `color`, `overlay`, etc.).
- **Player Imersivo:** Carrega o player em um iframe de tela cheia, ocultando a interface de configuração.
- **Log de Progresso:** Escuta eventos `postMessage` do iframe para exibir o progresso atual da reprodução (com 2 casas decimais).
- **Segurança e Mobile:** 
  - Política de Segurança de Conteúdo (CSP) configurada para permitir o iframe.
  - Sobrescrita de `window.open` para prevenir popups indesejados em ambientes mobile/container (ex: Cordova).
- **Design Responsivo:** Interface fluida que se adapta a dispositivos móveis e desktops, com considerações para "safe areas" (notches).

## Como Executar

### Pré-requisitos
- Node.js instalado (versão 18+ recomendada)

### Instalação

1. Clone ou baixe o repositório.
2. Navegue até o diretório do projeto:
   ```bash
   cd videasy-player
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```

### Modo de Desenvolvimento

Para rodar o servidor de desenvolvimento localmente:
```bash
npm run dev
```
O aplicativo estará disponível em `http://localhost:3000` (ou outra porta indicada no terminal).

### Build para Produção

Para gerar os arquivos otimizados para produção:
```bash
npm run build
```
Os arquivos serão gerados na pasta `dist/`. Você pode servir esta pasta usando qualquer servidor web estático.

Para testar o build localmente:
```bash
npm run preview
```

## Simulando o Log de Progresso (`postMessage`)

Para testar o recebimento de mensagens de progresso do player, você pode simular o envio de um `postMessage` a partir do console do navegador enquanto o player (iframe) estiver aberto.

1. Preencha o formulário e clique em "Assistir Agora".
2. Abra as Ferramentas de Desenvolvedor do navegador (F12) e vá para a aba **Console**.
3. Cole e execute o seguinte código:

```javascript
window.postMessage(JSON.stringify({
  progress: 0.4567,
  timestamp: 120,
  duration: 260
}), '*');
```

Você verá um indicador verde aparecer no canto superior direito da tela do player mostrando `45.67%`.
