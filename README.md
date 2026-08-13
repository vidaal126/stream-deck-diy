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
Abra o navegador de internet (Chrome, Safari, Firefox, etc.) no seu celular antigo, coloque-o na horizontal e digite o endereço de rede correspondente ao seu computador. 

O servidor identificou as seguintes URLs de acesso:
- **No Computador**: [http://localhost:3000](http://localhost:3000)
- **No Celular**: **`http://<ip-do-seu-computador>:3000`** (ex: `http://192.168.1.100:3000`)

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
