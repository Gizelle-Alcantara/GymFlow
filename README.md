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

O servidor web local já está configurado e rodando em segundo plano na sua máquina.

1. Para acessar o aplicativo, basta abrir o seu navegador de internet e ir para o endereço:
   👉 **[http://localhost:8080](http://localhost:8080)**

2. Se precisar iniciar o servidor manualmente no futuro, abra a pasta do projeto no terminal e execute:
   ```bash
   python3 -m http.server 8080
   ```
   Em seguida, acesse `http://localhost:8080` no navegador.
