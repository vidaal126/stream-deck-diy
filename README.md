# 📱 DIY Stream Deck (Celular na Horizontal)

Este é um projeto para transformar qualquer celular antigo (posicionado na horizontal) em um **Stream Deck / Macro Pad** personalizado para controlar o seu computador via Wi-Fi.

---

## ✨ Recursos

- **Visual Premium**: Layout responsivo em modo paisagem (horizontal) com design moderno em *dark mode* e efeito de vidro fosco (glassmorphism).
- **Monitoramento de Hardware**: Gráficos em tempo real no topo da tela mostrando o uso de **CPU** e **RAM** do seu computador.
- **Perfis Múltiplos**: Troca rápida de abas laterais (Mídia & Geral, Atalhos Web, Ferramentas de Dev, etc.).
- **Editor Visual Integrado**: Clique no botão de edição (ícone de lápis) para customizar rótulos, escolher ícones (via biblioteca Lucide), cores e configurar comandos ou teclas de atalho diretamente do celular.
- **Resposta Tátil**: Vibração (haptic feedback) integrada ao tocar nos botões (compatível com navegadores mobile).
- **Simulação de Teclado Real**: Integração nativa com `xdotool` para acionar qualquer combinação de teclas no computador.

---

## 🚀 Como Iniciar

### 1. Pré-requisitos
Certifique-se de que o seu celular e o seu computador estão conectados na **mesma rede Wi-Fi**.

### 2. Iniciar o Servidor
O servidor já está configurado no seu espaço de trabalho. Para iniciar manualmente no futuro:

```bash
cd /home/arthur/stream-deck
npm install
npm start
```

### 3. Acessar no Celular
Tem duas formas de usar, escolha uma:

**Opção A — Navegador (mais simples, funciona em qualquer celular)**
Abra o navegador de internet (Chrome, Safari, Firefox, etc.), coloque o celular na horizontal e digite o endereço de rede correspondente ao seu computador.

**Opção B — App nativo Android (tela cheia, sem barra do navegador)**
Veja a seção [App Android](#-app-android) abaixo.

O servidor identifica automaticamente as URLs de acesso no terminal ao iniciar:
- **No Computador**: [http://localhost:3000](http://localhost:3000)
- **No Celular**: **`http://<ip-do-seu-computador>:3000`** (ex: `http://192.168.1.100:3000` — o log do servidor mostra o IP real da sua rede)

---

## 📲 App Android

Além de acessar pelo navegador, existe um app Android nativo em [`android-app/`](android-app/) — um wrapper WebView em tela cheia que carrega o mesmo servidor, sem precisar instalar nada na Play Store.

### Gerar o APK
```bash
cd android-app
./gradlew assembleDebug
```
O APK fica em `android-app/app/build/outputs/apk/debug/app-debug.apk`.

### Instalar no celular
Sem custo, sem Play Store — é só instalar direto (sideload):
1. Copie o APK para `public/stream-deck.apk` (fica acessível em `http://<ip-do-pc>:3000/stream-deck.apk` enquanto o servidor estiver rodando).
2. No celular (mesma rede Wi-Fi), abra essa URL no navegador e baixe o arquivo.
3. Autorize "instalar apps de fontes desconhecidas" para esse arquivo quando o Android pedir.
4. Abra o app instalado.

Alternativa via cabo USB, com o celular em modo desenvolvedor/depuração USB:
```bash
adb install android-app/app/build/outputs/apk/debug/app-debug.apk
```

### Trocar o IP do servidor depois de instalado
O app vem com um endereço de exemplo (`192.168.1.100:3000`) só de placeholder — na primeira vez, **toque e segure** em qualquer lugar da tela pra digitar o IP real do seu PC (o mesmo que aparece no log do servidor). O mesmo gesto serve pra trocar depois, caso o roteador reatribua outro IP por DHCP.

---

## 🛠️ Como Personalizar os Botões

1. Toque no ícone de **Lápis (Editar)** no canto superior direito.
2. O deck entrará no **Modo de Edição** (os botões vão balançar levemente e os espaços vazios mostrarão um botão `+ Adicionar`).
3. Toque em qualquer botão (ou no `+`) para abrir o painel de configuração.
4. Escolha:
   - **Texto**: O rótulo visível no botão.
   - **Ícone**: O símbolo gráfico (Lucide Icons).
   - **Cor**: A cor temática do botão.
   - **Tipo de Ação**:
     - *Simular Tecla*: Pressione atalhos como `ctrl+alt+t` (para abrir terminal), `super+d` (mostrar área de trabalho), etc.
     - *Executar Comando*: Rode scripts, programas ou abra URLs (ex: `xdg-open https://google.com` ou `code .`).
     - *Volume / Mídia*: Ajuste volume (Up/Down/Mute) ou controle reproduções (Play/Pause/Next/Prev) nativamente.
5. Toque em **Salvar**. A alteração é instantânea e salva no arquivo `config.json` do seu servidor!

---

## 🖥️ Dependências do Sistema (Linux)
Este projeto usa a ferramenta `xdotool` para emular o teclado no Linux. Ela já foi instalada e configurada no ambiente. Se precisar em outra máquina Linux:
```bash
sudo apt install xdotool
```
No Windows ou macOS, o servidor executa comandos de shell equivalentes normalmente.

---

## 📁 Estrutura do Projeto

```
stream-deck/
├── server.js          # Servidor Express + WebSocket, executa as ações no PC
├── config.json         # Perfis e botões (editável pelo app ou manualmente)
├── public/              # Cliente web (HTML/CSS/JS) servido pelo Express
└── android-app/        # App Android nativo (Kotlin + Jetpack Compose), wrapper WebView
```
