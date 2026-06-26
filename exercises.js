// Database of exercises for the gym application
const EXERCISE_DATABASE = [
  // PEITO (CHEST)
  {
    id: "supino_reto",
    name: "Supino Reto com Barra",
    category: "peito",
    primaryMuscle: "Peitoral Maior",
    secondaryMuscles: ["Tríceps", "Deltoide Anterior"],
    instructions: [
      "Deite-se no banco plano com os pés firmes no chão.",
      "Segure a barra com as mãos ligeiramente mais afastadas que a largura dos ombros.",
      "Retire a barra do suporte e desça-a controladamente até tocar o peito.",
      "Empurre a barra para cima, estendendo os braços (sem travar os cotovelos)."
    ],
    difficulty: "Intermediário",
    equipment: "Barra e Banco",
    met: 6.0
  },
  {
    id: "supino_inclinado_halteres",
    name: "Supino Inclinado com Halteres",
    category: "peito",
    primaryMuscle: "Peitoral Superior",
    secondaryMuscles: ["Tríceps", "Deltoide Anterior"],
    instructions: [
      "Ajuste o banco para uma inclinação de 30º a 45º.",
      "Deite-se e segure os halteres na altura do peito, palmas viradas para a frente.",
      "Empurre os halteres para cima em linha reta.",
      "Desça lentamente até sentir o alongamento no peitoral."
    ],
    difficulty: "Iniciante",
    equipment: "Halteres",
    met: 6.0
  },
  {
    id: "peck_deck",
    name: "Peck Deck (Voador)",
    category: "peito",
    primaryMuscle: "Peitoral Maior",
    secondaryMuscles: ["Deltoide Anterior"],
    instructions: [
      "Sente-se no aparelho com as costas apoiadas.",
      "Segure as alças com os cotovelos ligeiramente dobrados.",
      "Aproxime as mãos no centro, contraindo o peitoral.",
      "Retorne lentamente à posição inicial, sentindo o peito alongar."
    ],
    difficulty: "Iniciante",
    equipment: "Máquina",
    met: 5.0
  },
  {
    id: "crossover_cabos",
    name: "Crossover (Cabos)",
    category: "peito",
    primaryMuscle: "Peitoral Inferior / Médio",
    secondaryMuscles: ["Deltoide Anterior"],
    instructions: [
      "Posicione as polias na altura desejada (geralmente alta) e selecione a carga.",
      "Segure os puxadores, dê um passo à frente e incline levemente o tronco.",
      "Com os cotovelos semi-flexionados, puxe os cabos para frente e para baixo até as mãos se encontrarem.",
      "Retorne controlando o peso até a linha dos ombros."
    ],
    difficulty: "Intermediário",
    equipment: "Polia",
    met: 5.5
  },
  {
    id: "flexao_braco",
    name: "Flexão de Braço",
    category: "peito",
    primaryMuscle: "Peitoral Maior",
    secondaryMuscles: ["Tríceps", "Core", "Deltoide Anterior"],
    instructions: [
      "Fique na posição de prancha, mãos alinhadas com os ombros e pés juntos.",
      "Mantenha o corpo reto como uma prancha durante todo o movimento.",
      "Desça o corpo dobrando os cotovelos até o peito quase tocar o chão.",
      "Empurre-se de volta à posição inicial."
    ],
    difficulty: "Iniciante",
    equipment: "Peso Corporal",
    met: 8.0
  },

  // COSTAS (BACK)
  {
    id: "puxada_pulley",
    name: "Puxada Frontal na Polia Alta",
    category: "costas",
    primaryMuscle: "Latíssimo do Dorso (Asa)",
    secondaryMuscles: ["Bíceps", "Braquiorradial", "Redondo Maior"],
    instructions: [
      "Sente-se no aparelho e ajuste o rolo para prender as coxas.",
      "Segure a barra com pegada pronada (palmas para frente) bem aberta.",
      "Incline o tronco levemente para trás e puxe a barra em direção ao peito.",
      "Retorne lentamente controlando o peso."
    ],
    difficulty: "Iniciante",
    equipment: "Polia",
    met: 5.0
  },
  {
    id: "remada_curvada",
    name: "Remada Curvada com Barra",
    category: "costas",
    primaryMuscle: "Dorso / Miolo das Costas",
    secondaryMuscles: ["Bíceps", "Deltoide Posterior", "Lombar"],
    instructions: [
      "Em pé, segure a barra com pegada pronada e afaste os pés na largura dos ombros.",
      "Flexione levemente os joelhos e incline o tronco à frente (cerca de 45º), mantendo a coluna reta.",
      "Puxe a barra em direção à linha do abdômen, mantendo os cotovelos próximos ao corpo.",
      "Desça a barra de forma controlada até esticar os braços."
    ],
    difficulty: "Avançado",
    equipment: "Barra",
    met: 6.0
  },
  {
    id: "remada_baixa_sentada",
    name: "Remada Sentada (Polia Baixa)",
    category: "costas",
    primaryMuscle: "Trapézio / Romboides",
    secondaryMuscles: ["Bíceps", "Latíssimo do Dorso"],
    instructions: [
      "Sente-se no aparelho com os pés apoiados nas plataformas e joelhos levemente flexionados.",
      "Segure o pegador (triângulo), mantenha as costas eretas.",
      "Puxe o pegador em direção ao abdômen inferior, espremendo as escápulas.",
      "Retorne estendendo os braços sem deixar o tronco curvar à frente."
    ],
    difficulty: "Iniciante",
    equipment: "Polia",
    met: 5.0
  },
  {
    id: "levantamento_terra",
    name: "Levantamento Terra",
    category: "costas",
    primaryMuscle: "Eretores da Espinha / Lombar",
    secondaryMuscles: ["Glúteos", "Posteriores de Coxa", "Quadríceps", "Trapézio"],
    instructions: [
      "Fique em pé com os pés na largura dos quadris, barra posicionada sobre o meio dos pés.",
      "Agache, segure a barra e mantenha a coluna totalmente reta/neutra.",
      "Suba estendendo os quadris e joelhos simultaneamente até ficar ereto.",
      "Desça a barra empurrando o quadril para trás e dobrando os joelhos de forma controlada."
    ],
    difficulty: "Avançado",
    equipment: "Barra",
    met: 8.0
  },
  {
    id: "barra_fixa",
    name: "Barra Fixa (Pull-Up)",
    category: "costas",
    primaryMuscle: "Latíssimo do Dorso",
    secondaryMuscles: ["Bíceps", "Romboides", "Core"],
    instructions: [
      "Pendure-se em uma barra fixa com pegada pronada aberta.",
      "Puxe o seu corpo para cima até o queixo passar a linha da barra.",
      "Mantenha o abdômen contraído e evite balançar as pernas.",
      "Desça lentamente até estender os braços completamente."
    ],
    difficulty: "Avançado",
    equipment: "Peso Corporal",
    met: 8.0
  },

  // PERNAS (LEGS)
  {
    id: "agachamento_livre",
    name: "Agachamento Livre com Barra",
    category: "pernas",
    primaryMuscle: "Quadríceps",
    secondaryMuscles: ["Glúteos", "Posteriores de Coxa", "Core"],
    instructions: [
      "Posicione a barra sobre a musculatura do trapézio (costas superior).",
      "Afaste os pés na largura dos ombros, pontas levemente apontadas para fora.",
      "Inicie o movimento empurrando o quadril para trás e dobrando os joelhos.",
      "Agache até que as coxas fiquem pelo menos paralelas ao chão, mantendo a coluna ereta.",
      "Suba empurrando o chão até voltar à posição inicial."
    ],
    difficulty: "Avançado",
    equipment: "Barra",
    met: 7.0
  },
  {
    id: "leg_press_45",
    name: "Leg Press 45º",
    category: "pernas",
    primaryMuscle: "Quadríceps / Glúteos",
    secondaryMuscles: ["Posteriores de Coxa", "Panturrilhas"],
    instructions: [
      "Sente-se no aparelho e posicione os pés na plataforma na largura dos quadris.",
      "Destrave a plataforma de segurança com cuidado.",
      "Dobre os joelhos controladamente até formar um ângulo de 90º (sem tirar a lombar do encosto).",
      "Empurre a plataforma para cima, estendendo as pernas sem travar os joelhos."
    ],
    difficulty: "Intermediário",
    equipment: "Máquina",
    met: 6.0
  },
  {
    id: "cadeira_extensora",
    name: "Cadeira Extensora",
    category: "pernas",
    primaryMuscle: "Quadríceps",
    secondaryMuscles: [],
    instructions: [
      "Sente-se no aparelho ajustando o encosto para que o joelho fique no ponto de articulação.",
      "Posicione o rolo de espuma sobre a parte inferior da perna (tornozelo).",
      "Estenda os joelhos completamente, contraindo o quadríceps no topo.",
      "Desça o peso lentamente voltando ao ângulo inicial."
    ],
    difficulty: "Iniciante",
    equipment: "Máquina",
    met: 4.5
  },
  {
    id: "mesa_flexora",
    name: "Mesa Flexora",
    category: "pernas",
    primaryMuscle: "Posteriores de Coxa",
    secondaryMuscles: ["Glúteos"],
    instructions: [
      "Deite-se de bruços na mesa flexora, alinhando os joelhos com o eixo de rotação do aparelho.",
      "Ajuste o rolo de espuma logo acima do tendão de Aquiles.",
      "Flexione os joelhos puxando os calcanhares em direção aos glúteos.",
      "Retorne lentamente controlando o peso."
    ],
    difficulty: "Iniciante",
    equipment: "Máquina",
    met: 4.5
  },
  {
    id: "elevacao_panturrilha_em_pe",
    name: "Elevação de Gêmeos em Pé (Panturrilhas)",
    category: "pernas",
    primaryMuscle: "Gastrocnêmio (Panturrilha)",
    secondaryMuscles: ["Solear"],
    instructions: [
      "Fique em pé na borda de um degrau ou na plataforma da máquina de panturrilha.",
      "Deixe os calcanhares livres para descer abaixo da linha horizontal.",
      "Empurre a ponta dos pés o máximo possível, elevando todo o corpo.",
      "Desça lentamente até sentir o alongamento máximo na panturrilha."
    ],
    difficulty: "Iniciante",
    equipment: "Peso Corporal ou Máquina",
    met: 4.0
  },

  // OMBROS (SHOULDERS)
  {
    id: "desenvolvimento_halteres",
    name: "Desenvolvimento com Halteres",
    category: "ombros",
    primaryMuscle: "Deltoide Anterior / Lateral",
    secondaryMuscles: ["Tríceps", "Trapézio"],
    instructions: [
      "Sente-se em um banco com encosto vertical ou levemente inclinado.",
      "Segure os halteres na altura dos ombros, palmas viradas para frente.",
      "Empurre os halteres para cima em arco até estender os braços.",
      "Desça os pesos com controle até a linha dos ombros."
    ],
    difficulty: "Iniciante",
    equipment: "Halteres",
    met: 5.0
  },
  {
    id: "elevacao_lateral",
    name: "Elevação Lateral com Halteres",
    category: "ombros",
    primaryMuscle: "Deltoide Lateral (Ombro Médio)",
    secondaryMuscles: ["Trapézio"],
    instructions: [
      "Fique em pé, pés na largura dos quadris, segurando um halter em cada mão nas laterais do corpo.",
      "Incline ligeiramente o tronco à frente e dobre os cotovelos de forma sutil.",
      "Eleve os braços para os lados até ficarem paralelos ao chão (altura dos ombros).",
      "Retorne lentamente os halteres à posição inicial."
    ],
    difficulty: "Iniciante",
    equipment: "Halteres",
    met: 4.0
  },
  {
    id: "crucifixo_invertido",
    name: "Crucifixo Invertido com Halteres",
    category: "ombros",
    primaryMuscle: "Deltoide Posterior (Ombro Traseiro)",
    secondaryMuscles: ["Romboides", "Trapézio"],
    instructions: [
      "Incline o tronco à frente a partir dos quadris, mantendo as costas eretas e joelhos levemente flexionados.",
      "Deixe os halteres pendendo sob o peito com as palmas voltadas uma para a outra.",
      "Eleve os braços para os lados, abrindo-os como asas, até ficarem alinhados com o tronco.",
      "Desça os halteres de volta ao centro de forma controlada."
    ],
    difficulty: "Intermediário",
    equipment: "Halteres",
    met: 4.0
  },

  // BRAÇOS (ARMS - BICEPS/TRICEPS)
  {
    id: "rosca_direta_barra_w",
    name: "Rosca Direta com Barra W",
    category: "bracos",
    primaryMuscle: "Bíceps Braquial",
    secondaryMuscles: ["Braquial", "Braquiorradial", "Antebraço"],
    instructions: [
      "Fique em pé com as pernas na largura dos ombros, segurando a barra W na pegada supinada (palmas para cima).",
      "Mantenha os cotovelos colados ao tronco durante todo o movimento.",
      "Flexione os braços trazendo a barra em direção aos ombros, contraindo o bíceps.",
      "Estenda os braços lentamente retornando o peso."
    ],
    difficulty: "Iniciante",
    equipment: "Barra W",
    met: 4.5
  },
  {
    id: "rosca_alternada",
    name: "Rosca Alternada com Halteres",
    category: "bracos",
    primaryMuscle: "Bíceps Braquial",
    secondaryMuscles: ["Braquial", "Antebraço"],
    instructions: [
      "Em pé ou sentado, segure halteres ao lado do corpo, palmas viradas para dentro.",
      "Eleve um halter girando o punho para fora (supinação) para que a palma termine voltada para você no topo.",
      "Contraia o bíceps por 1 segundo e desça controladamente.",
      "Repita o movimento com o outro braço, alternando."
    ],
    difficulty: "Iniciante",
    equipment: "Halteres",
    met: 4.5
  },
  {
    id: "triceps_polia_corda",
    name: "Tríceps na Polia com Corda",
    category: "bracos",
    primaryMuscle: "Tríceps Braquial",
    secondaryMuscles: ["Deltoide Posterior"],
    instructions: [
      "Prenda a corda na polia alta do aparelho.",
      "Segure os pegadores da corda, dê um pequeno passo atrás e incline o tronco de forma sutil.",
      "Mantendo os cotovelos fixos ao lado do corpo, empurre a corda para baixo estendendo os braços.",
      "No final do movimento, afaste as pontas da corda para maior contração do tríceps.",
      "Retorne controladamente subindo as mãos até a altura do peito."
    ],
    difficulty: "Iniciante",
    equipment: "Polia",
    met: 4.5
  },
  {
    id: "triceps_testa_halteres",
    name: "Tríceps Testa com Halteres",
    category: "bracos",
    primaryMuscle: "Tríceps (Cabeça Longa)",
    secondaryMuscles: [],
    instructions: [
      "Deite-se no banco plano segurando os halteres com os braços esticados para o teto.",
      "Incline os braços ligeiramente para trás (cerca de 10º a 15º) para manter a tensão constante.",
      "Flexione apenas os cotovelos, descendo os halteres em direção às laterais da testa/orelhas.",
      "Empurre de volta mantendo a posição do cotovelo fixa."
    ],
    difficulty: "Intermediário",
    equipment: "Halteres e Banco",
    met: 4.5
  },

  // ABDÔMEN (CORE)
  {
    id: "abdominal_supra",
    name: "Abdominal Supra",
    category: "abdomen",
    primaryMuscle: "Reto Abdominal (Superior)",
    secondaryMuscles: [],
    instructions: [
      "Deite-se de costas com joelhos dobrados e pés apoiados no chão.",
      "Coloque as mãos atrás da cabeça ou cruzadas sobre o peito.",
      "Eleve os ombros do chão contraindo o abdômen, sem puxar o pescoço.",
      "Desça lentamente mantendo o abdômen ativo."
    ],
    difficulty: "Iniciante",
    equipment: "Peso Corporal",
    met: 3.8
  },
  {
    id: "prancha_isometrica",
    name: "Prancha Isométrica",
    category: "abdomen",
    primaryMuscle: "Core (Transverso do Abdômen)",
    secondaryMuscles: ["Glúteos", "Ombros", "Lombar"],
    instructions: [
      "Apoie os antebraços no chão, alinhando os cotovelos sob os ombros.",
      "Estenda as pernas para trás apoiando-se na ponta dos pés, mantendo o corpo reto.",
      "Contraia o abdômen e glúteos fortemente para não deixar o quadril cair.",
      "Mantenha a posição respirando de forma controlada pelo tempo estipulado."
    ],
    difficulty: "Iniciante",
    equipment: "Peso Corporal",
    met: 3.8
  },
  {
    id: "abdominal_infra_elevacao_pernas",
    name: "Elevação de Pernas (Abdominal Infra)",
    category: "abdomen",
    primaryMuscle: "Reto Abdominal (Inferior)",
    secondaryMuscles: ["Flexores do Quadril"],
    instructions: [
      "Deite-se de costas no colchonete, mãos sob os glúteos para proteção da lombar.",
      "Estique as pernas e eleve-as juntas em direção ao teto até formar um ângulo de 90º.",
      "Desça as pernas lentamente quase tocando o chão.",
      "Não deixe a lombar arquear/descolar do chão durante a descida."
    ],
    difficulty: "Intermediário",
    equipment: "Peso Corporal",
    met: 3.8
  }
];

if (typeof module !== 'undefined') {
  module.exports = { EXERCISE_DATABASE };
}
