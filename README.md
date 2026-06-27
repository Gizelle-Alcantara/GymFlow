# 🏋️‍♂️ GymFlow - Treinos & Nutrição Personalizada

GymFlow é um aplicativo mobile-first desenvolvido em HTML5, CSS3 e Vanilla JavaScript, estruturado como uma Single Page Application (SPA) responsiva. O aplicativo possui um visual moderno em modo escuro com efeitos de glassmorfismo, sombras brilhantes e transições suaves de abas.

## 🚀 Funcionalidades Principais

1. **Acompanhamento de Treinos Personalizados**:
   - Três fichas de treinos iniciais prontas para uso (Treino A, B e C).
   - Criador de treinos customizados onde você seleciona o nome e escolhe quais exercícios farão parte da rotina diretamente do banco de dados do app.
   - Cronômetro ativo de treino integrado.
   - Calculador de volume total de carga levantada durante a sessão.
   - Estimador de gasto calórico baseado no tempo de treino e nos exercícios executados (valores MET).
   - Cronômetro de descanso interativo acionado automaticamente ao marcar uma série como concluída, contendo alertas sonoros e de vibração.

2. **Acompanhamento Nutricional Completo**:
   - Dashboard de calorias diárias que exibe o consumo vs meta e calorias restantes em tempo real.
   - Gráfico de macronutrientes (Proteínas, Carboidratos e Gorduras) com barras de progresso dinâmicas.
   - Diário alimentar dividido em 4 refeições principais: Café da Manhã, Almoço, Jantar e Lanches.
   - Adicionador de alimentos com um banco de sugestões rápidas ou preenchimento manual completo.
   - Rastreador de água com copo dinâmico animado (com bolhas e movimento de água) e botões de atalho rápido (+250ml, +500ml).

3. **Biblioteca de Exercícios Integrada**:
   - Grande variedade de exercícios (+20) categorizados por grupos musculares (Peito, Costas, Pernas, Ombros, Braços e Abdômen).
   - Filtro por busca de texto e por categoria muscular.
   - Janela modal com guia passo a passo de execução, equipamentos recomendados, nível de dificuldade e músculos secundários envolvidos.

4. **Histórico e Evolução**:
   - Registro de histórico de sessões finalizadas com data, duração e volume de carga.
   - Rastreador de peso corporal com gráfico de linha dinâmico (Chart.js) interativo.
   - Calendário semanal na página inicial que destaca os dias em que você treinou.

5. **Compartilhamento Pós-Treino Avançado**:
   - Ao finalizar o treino, o aplicativo gera automaticamente um **card de conquista personalizado** usando a API Canvas 2D do HTML5.
   - O card apresenta um gradiente vibrante, o nome do atleta, os detalhes da sessão (duração, exercícios concluídos, carga acumulada e calorias gastas), ícones customizados desenhados no canvas e frases motivacionais.
   - Suporte a compartilhamento nativo através da Web Share API (para compartilhar no Instagram, WhatsApp, etc.) ou download do card em formato PNG para o dispositivo.

---

## 📂 Estrutura de Arquivos do Projeto

- **[index.html](file:///home/gizelle/Projetos/gymflow/index.html)**: Contém o esqueleto HTML da SPA, modais de diálogo (perfil, pesos, alimentos) e folha de importação das bibliotecas CDN (FontAwesome, Chart.js, Confetti).
- **[style.css](file:///home/gizelle/Projetos/gymflow/style.css)**: Folha de estilos premium em CSS vanilla otimizada para aparelhos celulares e emulação de celular no desktop.
- **[app.js](file:///home/gizelle/Projetos/gymflow/app.js)**: Controla toda a lógica de estado, cronômetros de treino e descanso, lógica de alimentação/água e persistência no `LocalStorage` (para não perder os dados salvos).
- **[exercises.js](file:///home/gizelle/Projetos/gymflow/exercises.js)**: Banco de dados estruturado dos exercícios.
- **[share-card.js](file:///home/gizelle/Projetos/gymflow/share-card.js)**: Gerenciador de desenho vetorial do card de compartilhamento pós-treino no Canvas.

---

## 💻 Como Rodar o Aplicativo Localmente

Este projeto é uma aplicação web estática, então não precisa de backend ou instalação de dependências.

1. Abra a pasta do projeto no terminal.
2. Inicie um servidor web local a partir da raiz do projeto:
   ```bash
   python3 -m http.server 8080
   ```
3. No navegador, acesse:
   👉 `http://localhost:8080`

> Importante: o PWA e o Service Worker só funcionam quando o app é servido via HTTP/HTTPS, não pelo `file://`.

## 📱 Como Usar no Mobile / PWA

O GymFlow agora inclui recursos de Progressive Web App (PWA) com suporte a instalação e cache offline.

1. Abra o app no navegador do seu celular em `http://<seu-ip-local>:8080` ou no desktop em `http://localhost:8080`.
2. Aguarde o carregamento inicial para que o Service Worker seja registrado.
3. Para instalar como app:
   - No Chrome/Edge: use o menu do navegador e escolha "Instalar aplicativo" ou "Adicionar à área de trabalho".
   - No Safari iOS: toque em "Compartilhar" e selecione "Adicionar à Tela de Início".
4. Após a instalação, o aplicativo abrirá em modo standalone, com barra de endereço oculta e visual de app nativo.

## 🌐 Arquivos PWA Incluídos

- `manifest.json` — define nome, cores, ícones e comportamento de inicialização.
- `sw.js` — service worker que faz cache dos arquivos principais para funcionamento offline.
- `icons/icon-192.png` e `icons/icon-512.png` — ícones para instalação no dispositivo.

## 🧪 Como Testar o Offline

1. Abra o app no navegador com o servidor local rodando.
2. Acesse pelo menos uma vez para que o cache seja populado.
3. Desconecte a internet e recarregue a página.
4. Mesmo sem rede, o app deve continuar disponível graças ao Service Worker.

## 🚀 Deploy no GitHub Pages

Para publicar o GymFlow na web rapidamente usando GitHub Pages:

1. Crie um repositório no GitHub e envie todos os arquivos do projeto para ele.
2. No repositório, vá em `Settings` > `Pages`.
3. Em `Source`, escolha a branch `main` ou `master` e selecione a pasta raiz (`/`).
4. Salve e aguarde alguns segundos.
5. O GitHub Pages fornecerá a URL onde o app estará disponível.

> O app é totalmente estático, então não precisa de backend nem de servidor adicional. Basta servir os arquivos HTML/CSS/JS.
