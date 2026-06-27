// GymFlow - Main Application Script

// ==================== STATE MANAGEMENT ====================
let state = {
  userProfile: {
    name: "Atleta GymFlow",
    weight: 78.5,
    height: 178,
    goal: "gain", // gain, lose, maintain
    caloriesTarget: 2500,
    waterTarget: 3000,
    macrosTarget: {
      protein: 150, // grams
      carb: 280,
      fat: 75
    },
    gender: "male",
    age: 25,
    activityLevel: "1.375",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  workouts: [], // Templates
  workoutHistory: [], // Log of completed workouts
  nutritionLogs: {}, // Key: YYYY-MM-DD -> { meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }, water: 0 }
  weightLogs: [], // Array of { date: 'YYYY-MM-DD', weight: Number }
  teamRole: "athlete", // athlete, personal
  currentUserEmail: null,
  userAccounts: [],
  linkedPersonal: null, // { name, cref }
  athleteMessages: [], // Messages received by the Athlete
  myAthletes: [], // List of athletes managed by the Personal Trainer
  customExercises: [], // Exercises adicionados pelo usuário
  simulatedInboxes: {} // Simulated mailboxes keyed by Athlete ID
};

let dynamicExerciseDatabase = [];
let currentWorkoutEditingId = null;
let shareCardSummary = null;
let shareModalPhotoData = null;
let lastFocusedModalTrigger = null;
let confirmDialogResolver = null;
let finishWorkoutConfirmPending = false;
let finishWorkoutConfirmTimeout = null;

// Global variables for active workout player
let activeSession = null;
let activeSessionTimer = null;
let restTimerInterval = null;
let restTimerSeconds = 60;
let restTimerActive = false;

// Global chart instance
let weightChart = null;

// Food suggestions database
const FOOD_SUGGESTIONS = [
  { name: "Ovo Cozido (1 un)", cal: 78, prot: 6, carb: 0.6, fat: 5 },
  { name: "Peito de Frango (100g)", cal: 165, prot: 31, carb: 0, fat: 3.6 },
  { name: "Arroz Integral (100g)", cal: 111, prot: 2.6, carb: 23, fat: 0.9 },
  { name: "Banana Prata (1 un)", cal: 98, prot: 1.3, carb: 26, fat: 0.3 },
  { name: "Aveia em Flocos (30g)", cal: 118, prot: 4.3, carb: 17, fat: 2.2 },
  { name: "Whey Protein (30g)", cal: 120, prot: 24, carb: 3, fat: 1.5 },
  { name: "Batata Doce Cozida (100g)", cal: 86, prot: 1.6, carb: 20, fat: 0.1 },
  { name: "Azeite de Oliva (1 colher)", cal: 119, prot: 0, carb: 0, fat: 13.5 },
  { name: "Pão de Forma Integral (2 fatias)", cal: 120, prot: 6, carb: 22, fat: 1.5 },
  { name: "Patinho Moído (100g)", cal: 219, prot: 35, carb: 0, fat: 7.3 }
];

// Initial default routines if storage is empty
const DEFAULT_WORKOUT_ROUTINES = [
  {
    id: "treino_a_superior",
    name: "Treino A - Peito & Tríceps",
    exercises: ["supino_reto", "supino_inclinado_halteres", "peck_deck", "triceps_polia_corda", "triceps_testa_halteres"]
  },
  {
    id: "treino_b_costas",
    name: "Treino B - Costas & Bíceps",
    exercises: ["puxada_pulley", "remada_baixa_sentada", "barra_fixa", "rosca_direta_barra_w", "rosca_alternada", "abdominal_supra"]
  },
  {
    id: "treino_c_pernas",
    name: "Treino C - Pernas & Ombros",
    exercises: ["agachamento_livre", "leg_press_45", "cadeira_extensora", "mesa_flexora", "desenvolvimento_halteres", "elevacao_lateral", "prancha_isometrica"]
  }
];

// Default weight log data
const DEFAULT_WEIGHT_LOGS = [
  { date: "2026-06-20", weight: 80.0 },
  { date: "2026-06-21", weight: 79.8 },
  { date: "2026-06-22", weight: 79.5 },
  { date: "2026-06-23", weight: 79.1 },
  { date: "2026-06-24", weight: 78.9 },
  { date: "2026-06-25", weight: 78.7 },
  { date: "2026-06-26", weight: 78.5 }
];

// ==================== LOCAL STORAGE PERSISTENCE ====================
const STORAGE_KEY = "gymflow_state_data_v1";

async function saveAppState() {
  if (window.gymflowDatabase && window.gymflowDatabase.saveStateToDB) {
    await window.gymflowDatabase.saveStateToDB(state);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function loadAppState() {
  let loadedState = null;
  if (window.gymflowDatabase && window.gymflowDatabase.loadStateFromDB) {
    loadedState = await window.gymflowDatabase.loadStateFromDB();
  }

  if (loadedState) {
    state = loadedState;
  } else {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        state = JSON.parse(localData);
      } catch (e) {
        console.error("Erro ao carregar dados do LocalStorage, reiniciando.", e);
        initializeDefaultState();
        return;
      }
    } else {
      initializeDefaultState();
      return;
    }
  }

  try {
    if (!state.userProfile) state.userProfile = {};
    if (!state.userProfile.gender) state.userProfile.gender = "male";
    if (!state.userProfile.age) state.userProfile.age = 25;
    if (!state.userProfile.activityLevel) state.userProfile.activityLevel = "1.375";
    if (!state.userProfile.photo) state.userProfile.photo = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
    if (!state.workouts || state.workouts.length === 0) state.workouts = DEFAULT_WORKOUT_ROUTINES;
    if (!state.weightLogs || state.weightLogs.length === 0) state.weightLogs = DEFAULT_WEIGHT_LOGS;
    if (!state.customExercises) state.customExercises = [];
    dynamicExerciseDatabase = [...EXERCISE_DATABASE, ...state.customExercises];
    if (!state.nutritionLogs) state.nutritionLogs = {};
    if (!state.workoutHistory) state.workoutHistory = [];
    if (!state.teamRole) state.teamRole = "athlete";
    if (!state.userAccounts) state.userAccounts = [];
    if (state.currentUserEmail === undefined) state.currentUserEmail = null;
    if (state.linkedPersonal === undefined) state.linkedPersonal = null;
    if (!state.athleteMessages) state.athleteMessages = [];
    if (!state.myAthletes || state.myAthletes.length === 0) state.myAthletes = [];
    if (!state.simulatedInboxes) state.simulatedInboxes = {};
  } catch (e) {
    console.error("Erro ao carregar dados do IndexedDB/LocalStorage, reiniciando.", e);
    initializeDefaultState();
  }
}
function initializeDefaultState() {
  state.workouts = DEFAULT_WORKOUT_ROUTINES;
  state.weightLogs = DEFAULT_WEIGHT_LOGS;
  state.customExercises = [];
  state.userAccounts = [
    { name: "Atleta Demo", email: "aluno@gymflow.com", password: "123456", role: "athlete" },
    { name: "Personal Demo", email: "personal@gymflow.com", password: "123456", role: "personal" }
  ];
  state.currentUserEmail = null;
  dynamicExerciseDatabase = [...EXERCISE_DATABASE];
  state.workoutHistory = [
    {
      id: "hist_1",
      date: "2026-06-23",
      workoutName: "Treino B - Costas & Bíceps",
      duration: "00:48:15",
      exercisesCount: 5,
      totalWeight: "980 kg",
      calories: "285 kcal"
    },
    {
      id: "hist_2",
      date: "2026-06-25",
      workoutName: "Treino A - Peito & Tríceps",
      duration: "00:52:10",
      exercisesCount: 5,
      totalWeight: "1120 kg",
      calories: "340 kcal"
    }
  ];
  
  // Set default initial nutrition log for today
  const today = getTodayDateString();
  state.nutritionLogs[today] = {
    meals: {
      breakfast: [
        { name: "Ovo Cozido (2 un)", cal: 156, prot: 12, carb: 1, fat: 10 },
        { name: "Banana Prata (1 un)", cal: 98, prot: 1.3, carb: 26, fat: 0.3 }
      ],
      lunch: [
        { name: "Peito de Frango (150g)", cal: 247, prot: 46.5, carb: 0, fat: 5.4 },
        { name: "Arroz Integral (150g)", cal: 166, prot: 3.9, carb: 34.5, fat: 1.3 }
      ],
      dinner: [],
      snacks: [
        { name: "Whey Protein (30g)", cal: 120, prot: 24, carb: 3, fat: 1.5 }
      ]
    },
    water: 1250
  };

  state.teamRole = "athlete";
  state.linkedPersonal = { name: "Prof. Roberto Costa", cref: "CREF 098765-G/SP", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" };
  state.athleteMessages = [
    {
      date: "26/06/2026",
      sender: "Prof. Roberto Costa",
      text: "Olá! Acabei de carregar uma nova rotina focada em peitoral e tríceps no seu aplicativo. Siga a ordem e as cargas progressivas. Qualquer dúvida me mande aqui!"
    }
  ];
  state.myAthletes = [
    {
      id: "athlete_mariana",
      name: "Mariana Rodrigues",
      email: "mariana@email.com",
      weight: 68.4,
      height: 165,
      goal: "lose",
      caloriesTarget: 1850,
      lastActive: "Há 1 dia"
    },
    {
      id: "athlete_joao",
      name: "João Pedro",
      email: "joao@email.com",
      weight: 84.2,
      height: 182,
      goal: "gain",
      caloriesTarget: 3100,
      lastActive: "Hoje"
    }
  ];
  state.simulatedInboxes = {};
  
  saveAppState();
}

// Helper: format YYYY-MM-DD
function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==================== TABS CONTROLLER ====================
function switchTab(tabId) {
  // Update nav item active state
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    }
  });

  // Hide all screens & show selected
  document.querySelectorAll('.app-screen').forEach(screen => {
    screen.classList.remove('active');
  });

  let activeScreenId = `screen-${tabId}`;
  if (tabId === 'dashboard' && state.teamRole === 'personal') {
    activeScreenId = 'screen-personal-dashboard';
  }

  const activeScreen = document.getElementById(activeScreenId);
  if (activeScreen) {
    activeScreen.classList.add('active');
  }

  // Trigger specific tab loads
  if (tabId === 'dashboard') {
    updateDashboard();
  } else if (tabId === 'workouts') {
    renderWorkoutsList();
  } else if (tabId === 'team') {
    updateTeamTab();
  } else if (tabId === 'nutrition') {
    updateNutritionTab();
  } else if (tabId === 'progress') {
    updateProgressTab();
  }
}

// ==================== MODAL HELPERS ====================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  lastFocusedModalTrigger = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  const dialog = modal.querySelector('.modal-card');
  if (dialog) {
    if (!dialog.hasAttribute('tabindex')) {
      dialog.setAttribute('tabindex', '-1');
    }
    dialog.focus();
  }
}

function closeModal(modalId, confirmResult = null) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');

  if (modalId === 'modal-confirm-dialog' && typeof confirmDialogResolver === 'function') {
    confirmDialogResolver(confirmResult === true);
    confirmDialogResolver = null;
  }

  if (lastFocusedModalTrigger && typeof lastFocusedModalTrigger.focus === 'function') {
    lastFocusedModalTrigger.focus();
  }
  lastFocusedModalTrigger = null;
}

function showConfirmDialog(message) {
  return new Promise(resolve => {
    confirmDialogResolver = resolve;
    const messageEl = document.getElementById('confirm-dialog-message');
    if (messageEl) messageEl.innerText = message;
    openModal('modal-confirm-dialog');
    const yesButton = document.getElementById('btn-confirm-yes');
    if (yesButton) yesButton.focus();
  });
}

function closeConfirmDialog(result) {
  closeModal('modal-confirm-dialog', result);
}

function showAppToast(message, type = 'info') {
  const toastRoot = document.getElementById('app-toast-container');
  if (!toastRoot) {
    console.log(`[GymFlow Notification]: ${message}`);
    return;
  }

  const toast = document.createElement('div');
  toast.className = `app-toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  toastRoot.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, { once: true });
  }, 3200);

  const badge = document.querySelector('#btn-notifications .badge');
  if (badge && type !== 'error') {
    badge.style.display = 'block';
  }
}

function showPlayerStatusBanner(message, type = 'info') {
  const banner = document.getElementById('player-status-banner');
  if (!banner) return;
  banner.textContent = message;
  banner.className = `player-status-banner ${type}`;
  banner.style.display = 'flex';

  if (type === 'success') {
    setTimeout(() => {
      banner.style.opacity = '0';
      setTimeout(() => { banner.style.display = 'none'; banner.style.opacity = '1'; }, 300);
    }, 4200);
  }
}

function clearPlayerStatusBanner() {
  const banner = document.getElementById('player-status-banner');
  if (!banner) return;
  banner.style.display = 'none';
  banner.textContent = '';
  banner.className = 'player-status-banner';
}

function showMiniStatusBadge(message, type = 'info') {
  const badge = document.getElementById('mini-status-badge');
  if (!badge) return;

  badge.textContent = message;
  badge.className = `mini-status-badge ${type}`;
  badge.style.opacity = '1';
  badge.style.pointerEvents = 'auto';

  if (badge.timeoutId) {
    clearTimeout(badge.timeoutId);
  }

  badge.timeoutId = setTimeout(() => {
    badge.style.opacity = '0';
    badge.style.pointerEvents = 'none';
    badge.timeoutId = null;
  }, 4200);
}

// ==================== DASHBOARD POPULATION ====================
function updateDashboard() {
  // Update name & biometrics
  document.getElementById('span-user-name').innerText = state.userProfile.name;
  document.getElementById('user-avatar').src = state.userProfile.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  
  // Streak counter (dummy mock update or calculated from history)
  document.getElementById('stat-streak').innerText = state.workoutHistory.length + 3;

  // Hydration summary
  const today = getTodayDateString();
  const dayLog = state.nutritionLogs[today] || { meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }, water: 0 };
  document.getElementById('stat-water').innerText = `${dayLog.water}ml`;

  // Featured Daily Workout
  const featuredTitle = document.getElementById('featured-workout-title');
  const featuredDesc = document.getElementById('featured-workout-desc');
  if (state.workouts.length > 0) {
    const todayIndex = new Date().getDay() % state.workouts.length;
    const routine = state.workouts[todayIndex];
    featuredTitle.innerText = routine.name;
    featuredDesc.innerText = `${routine.exercises.length} exercícios programados para hoje.`;
  } else {
    featuredTitle.innerText = "Nenhum treino criado";
    featuredDesc.innerText = "Vá na aba Treinos para criar sua rotina.";
  }

  // Nutrition Rings on Dashboard
  const { totalCal, totalProt, totalCarb, totalFat } = calculateDailyNutritionTotals(dayLog);
  document.getElementById('dash-cal-consumed').innerText = Math.round(totalCal);
  document.getElementById('dash-cal-target').innerText = state.userProfile.caloriesTarget;

  // Update SVG Ring
  const ringCircle = document.getElementById('dash-cal-ring');
  const radius = ringCircle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  ringCircle.style.strokeDasharray = `${circumference} ${circumference}`;
  
  const progressPercent = Math.min(totalCal / state.userProfile.caloriesTarget, 1);
  const offset = circumference - progressPercent * circumference;
  ringCircle.style.strokeDashoffset = offset;

  // Dashboard Macro Bars
  document.getElementById('dash-p-val').innerText = `${Math.round(totalProt)}g / ${state.userProfile.macrosTarget.protein}g`;
  const protPct = Math.min((totalProt / state.userProfile.macrosTarget.protein) * 100, 100);
  document.getElementById('dash-p-fill').style.width = `${protPct}%`;

  document.getElementById('dash-c-val').innerText = `${Math.round(totalCarb)}g / ${state.userProfile.macrosTarget.carb}g`;
  const carbPct = Math.min((totalCarb / state.userProfile.macrosTarget.carb) * 100, 100);
  document.getElementById('dash-c-fill').style.width = `${carbPct}%`;

  document.getElementById('dash-f-val').innerText = `${Math.round(totalFat)}g / ${state.userProfile.macrosTarget.fat}g`;
  const fatPct = Math.min((totalFat / state.userProfile.macrosTarget.fat) * 100, 100);
  document.getElementById('dash-f-fill').style.width = `${fatPct}%`;

  // Render weekly frequency summary
  renderWeeklyCalendar();
}

function showAppMain() {
  document.getElementById('screen-auth').classList.remove('active');
  document.getElementById('app-shell').classList.remove('hidden');
}

function hideAppMain() {
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('screen-auth').classList.add('active');
}

function loginUser() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!email || !password) {
    showAppToast('Preencha email e senha para continuar.', 'error');
    return;
  }

  const user = state.userAccounts.find(u => u.email === email && u.password === password);
  if (!user) {
    showAppToast('Email ou senha incorretos. Tente novamente.', 'error');
    return;
  }

  state.currentUserEmail = user.email;
  state.teamRole = user.role;
  state.userProfile.name = user.name;
  state.userProfile.email = user.email;
  saveAppState();

  showAppMain();
  updateDashboard();
  updateTeamTab();
  switchTab('dashboard');
  showAppToast(`Bem-vindo de volta, ${user.name}!`, 'success');
}

function logoutUser() {
  state.currentUserEmail = null;
  state.teamRole = 'athlete';
  saveAppState();
  hideAppMain();
  switchTab('dashboard');
  showAppToast('Sessão encerrada. Faça login novamente.', 'info');
}

function registerUser() {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value.trim();
  const role = document.getElementById('register-role').value;

  if (!name || !email || !password) {
    showAppToast('Preencha todos os campos para criar sua conta.', 'error');
    return;
  }

  if (state.userAccounts.some(u => u.email === email)) {
    showAppToast('Este email já está cadastrado. Use outro ou faça login.', 'error');
    return;
  }

  state.userAccounts.push({ name, email, password, role });
  saveAppState();
  showAppToast('Conta criada com sucesso! Faça login para continuar.', 'success');
  document.getElementById('register-name').value = '';
  document.getElementById('register-email').value = '';
  document.getElementById('register-password').value = '';
  document.getElementById('register-role').value = 'athlete';
}

function renderPersonalDashboard() {
  const headerTitle = document.querySelector('#screen-personal-dashboard .welcome-text');
  const subtitle = document.querySelector('#screen-personal-dashboard .subtitle-text');
  const metrics = document.getElementById('personal-dashboard-metrics');
  const actionPanel = document.getElementById('personal-dashboard-actions');
  const athleteList = document.getElementById('personal-athlete-summary');

  if (headerTitle) headerTitle.innerHTML = `Olá, <span id="span-user-name">${state.userProfile.name}</span>! 👋`;
  if (subtitle) subtitle.innerText = 'Dashboard do Personal Trainer para gerenciar alunos, treinos e avaliações.';

  metrics.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon-wrapper purple"><i class="fa-solid fa-users"></i></div>
      <div class="stat-info">
        <span class="stat-value">${state.myAthletes.length}</span>
        <span class="stat-label">Alunos</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon-wrapper green"><i class="fa-solid fa-dumbbell"></i></div>
      <div class="stat-info">
        <span class="stat-value">${state.workouts.length}</span>
        <span class="stat-label">Treinos ativos</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon-wrapper blue"><i class="fa-solid fa-scale-balanced"></i></div>
      <div class="stat-info">
        <span class="stat-value">${state.myAthletes.reduce((sum, ath) => sum + (ath.assessments?.length || 0), 0)}</span>
        <span class="stat-label">Avaliações pendentes</span>
      </div>
    </div>
  `;

  actionPanel.innerHTML = `
    <button class="btn btn-primary btn-sm" onclick="switchTab('workouts')"><i class="fa-solid fa-dumbbell"></i> Gerenciar Treinos</button>
    <button class="btn btn-secondary btn-sm" onclick="switchTab('team')"><i class="fa-solid fa-users"></i> Ver Alunos</button>
    <button class="btn btn-secondary btn-sm" onclick="switchTab('progress')"><i class="fa-solid fa-scale"></i> Avaliação Física</button>
  `;

  athleteList.innerHTML = state.myAthletes.length === 0 ? `
    <div class="no-history-placeholder" style="padding: 32px 16px;">
      <i class="fa-solid fa-user-doctor" style="font-size: 2rem;"></i>
      <p>Você ainda não cadastrou alunos. Use a aba Equipe para começar.</p>
    </div>
  ` : state.myAthletes.slice(0, 4).map(ath => `
    <div class="personal-athlete-card">
      <strong>${ath.name}</strong>
      <span>${ath.email}</span>
      <small>${ath.weight}kg • ${ath.height}cm • ${ath.caloriesTarget} kcal</small>
    </div>
  `).join('');
}

function updateDashboard() {
  if (state.teamRole === 'personal') {
    renderPersonalDashboard();
    return;
  }

  // Update name & biometrics
  document.getElementById('span-user-name').innerText = state.userProfile.name;
  document.getElementById('user-avatar').src = state.userProfile.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  
  // Streak counter (dummy mock update or calculated from history)
  document.getElementById('stat-streak').innerText = state.workoutHistory.length + 3;

  // Hydration summary
  const today = getTodayDateString();
  const dayLog = state.nutritionLogs[today] || { meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }, water: 0 };
  document.getElementById('stat-water').innerText = `${dayLog.water}ml`;

  // Featured Daily Workout
  const featuredTitle = document.getElementById('featured-workout-title');
  const featuredDesc = document.getElementById('featured-workout-desc');
  if (state.workouts.length > 0) {
    const todayIndex = new Date().getDay() % state.workouts.length;
    const routine = state.workouts[todayIndex];
    featuredTitle.innerText = routine.name;
    featuredDesc.innerText = `${routine.exercises.length} exercícios programados para hoje.`;
  } else {
    featuredTitle.innerText = "Nenhum treino criado";
    featuredDesc.innerText = "Vá na aba Treinos para criar sua rotina.";
  }

  // Nutrition Rings on Dashboard
  const { totalCal, totalProt, totalCarb, totalFat } = calculateDailyNutritionTotals(dayLog);
  document.getElementById('dash-cal-consumed').innerText = Math.round(totalCal);
  document.getElementById('dash-cal-target').innerText = state.userProfile.caloriesTarget;

  // Update SVG Ring
  const ringCircle = document.getElementById('dash-cal-ring');
  const radius = ringCircle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  ringCircle.style.strokeDasharray = `${circumference} ${circumference}`;
  
  const progressPercent = Math.min(totalCal / state.userProfile.caloriesTarget, 1);
  const offset = circumference - progressPercent * circumference;
  ringCircle.style.strokeDashoffset = offset;

  // Dashboard Macro Bars
  document.getElementById('dash-p-val').innerText = `${Math.round(totalProt)}g / ${state.userProfile.macrosTarget.protein}g`;
  const protPct = Math.min((totalProt / state.userProfile.macrosTarget.protein) * 100, 100);
  document.getElementById('dash-p-fill').style.width = `${protPct}%`;

  document.getElementById('dash-c-val').innerText = `${Math.round(totalCarb)}g / ${state.userProfile.macrosTarget.carb}g`;
  const carbPct = Math.min((totalCarb / state.userProfile.macrosTarget.carb) * 100, 100);
  document.getElementById('dash-c-fill').style.width = `${carbPct}%`;

  document.getElementById('dash-f-val').innerText = `${Math.round(totalFat)}g / ${state.userProfile.macrosTarget.fat}g`;
  const fatPct = Math.min((totalFat / state.userProfile.macrosTarget.fat) * 100, 100);
  document.getElementById('dash-f-fill').style.width = `${fatPct}%`;

  // Render weekly frequency summary
  renderWeeklyCalendar();
}

function calculateDailyNutritionTotals(dayLog) {
  let totalCal = 0, totalProt = 0, totalCarb = 0, totalFat = 0;
  
  if (dayLog && dayLog.meals) {
    Object.values(dayLog.meals).forEach(mealArray => {
      mealArray.forEach(item => {
        totalCal += Number(item.cal) || 0;
        totalProt += Number(item.prot) || 0;
        totalCarb += Number(item.carb) || 0;
        totalFat += Number(item.fat) || 0;
      });
    });
  }

  return { totalCal, totalProt, totalCarb, totalFat };
}

function renderWeeklyCalendar() {
  const container = document.getElementById('week-calendar-container');
  container.innerHTML = '';
  
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  
  // Create 7 days leading/centering to today
  for (let i = 6; i >= 0; i--) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() - i);
    
    const dayLabel = daysOfWeek[checkDate.getDay()];
    const dayNum = checkDate.getDate();
    
    // Check if workout was completed on this date
    const dateStr = checkDate.toISOString().split('T')[0];
    const isCompleted = state.workoutHistory.some(hist => hist.date === dateStr);
    const isCurrent = i === 0;

    const dayBtn = document.createElement('div');
    dayBtn.className = `calendar-day-btn ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`;
    
    dayBtn.innerHTML = `
      <span class="day-lbl">${dayLabel}</span>
      <span class="day-num">${dayNum}</span>
      <div class="dot-status"></div>
    `;
    
    container.appendChild(dayBtn);
  }
}

// ==================== WORKOUTS LIST & CREATOR ====================
function renderWorkoutsList() {
  const container = document.getElementById('workouts-list-container');
  container.innerHTML = '';

  if (state.workouts.length === 0) {
    container.innerHTML = `
      <div class="no-history-placeholder">
        <i class="fa-solid fa-folder-open" style="font-size: 2rem;"></i>
        <p>Você não possui fichas de treino. Crie uma nova agora!</p>
      </div>
    `;
    return;
  }

  state.workouts.forEach(workout => {
    const card = document.createElement('div');
    card.className = 'workout-routine-card';
    card.innerHTML = `
      <div class="routine-info">
        <span class="routine-name">${workout.name}</span>
        <span class="routine-count">${workout.exercises.length} Exercícios</span>
      </div>
      <div class="routine-actions">
        <button class="btn-routine-start" onclick="startWorkoutSession('${workout.id}')" title="Iniciar">
          <i class="fa-solid fa-play"></i>
        </button>
        <button class="btn-routine-edit" onclick="openWorkoutCreator('${workout.id}')" title="Editar">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-routine-delete" onclick="deleteWorkoutRoutine('${workout.id}')" title="Excluir">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function deleteWorkoutRoutine(id) {
  showConfirmDialog("Tem certeza que deseja excluir esta ficha de treino?")
    .then(confirmed => {
      if (!confirmed) return;
      state.workouts = state.workouts.filter(w => w.id !== id);
      saveAppState();
      renderWorkoutsList();
    });
}

function openWorkoutCreator(workoutId = null) {
  currentWorkoutEditingId = workoutId;
  const title = document.getElementById('workout-creator-title');
  const saveBtn = document.getElementById('btn-save-custom-workout');
  const nameInput = document.getElementById('workout-name-input');

  populateCreatorExercisesList();

  if (workoutId) {
    const workout = state.workouts.find(w => w.id === workoutId);
    if (workout) {
      title.innerText = 'Editar Treino';
      saveBtn.innerText = 'Atualizar Treino';
      nameInput.value = workout.name;
      workout.exercises.forEach(exId => {
        const checkbox = document.querySelector(`#creator-exercise-list input[value="${exId}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }
  } else {
    title.innerText = 'Criar Novo Treino Personalizado';
    saveBtn.innerText = 'Salvar Treino';
    nameInput.value = '';
  }

  openModal('modal-workout-creator');
}

// Initialize Workout Creator Modal Checkboxes
function populateCreatorExercisesList() {
  const listContainer = document.getElementById('creator-exercise-list');
  listContainer.innerHTML = '';

  // Sort exercises by muscle group category
  const sorted = [...dynamicExerciseDatabase].sort((a, b) => a.category.localeCompare(b.category));
  
  sorted.forEach(ex => {
    const item = document.createElement('div');
    item.className = 'creator-ex-item';
    item.innerHTML = `
      <input type="checkbox" id="chk-creator-${ex.id}" value="${ex.id}">
      <div class="creator-ex-item-info">
        <span class="creator-ex-item-name">${ex.name}</span>
        <span class="creator-ex-item-muscle">${ex.primaryMuscle} (${ex.category.toUpperCase()})</span>
      </div>
    `;
    // Toggle checkbox on row click
    item.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        const chk = item.querySelector('input');
        chk.checked = !chk.checked;
      }
    });
    listContainer.appendChild(item);
  });
}

function saveCustomWorkout() {
  const nameInput = document.getElementById('workout-name-input');
  const name = nameInput.value.trim();
  
  if (!name) {
    showAppToast("Por favor, digite um nome para o treino.", 'error');
    return;
  }

  // Get checked values
  const checkedExercises = [];
  document.querySelectorAll('#creator-exercise-list input[type="checkbox"]:checked').forEach(chk => {
    checkedExercises.push(chk.value);
  });

  if (checkedExercises.length === 0) {
    showAppToast("Por favor, selecione ao menos 1 exercício para o treino.", 'error');
    return;
  }

  const selectedWorkoutId = currentWorkoutEditingId;
  const workoutData = {
    id: selectedWorkoutId || 'workout_' + Date.now(),
    name: name,
    exercises: checkedExercises
  };

  if (selectedWorkoutId) {
    state.workouts = state.workouts.map(w => w.id === selectedWorkoutId ? workoutData : w);
    showAppToast("Treino atualizado com sucesso!");
  } else {
    state.workouts.push(workoutData);
    showAppToast("Ficha de treino criada com sucesso!");
  }

  saveAppState();
  
  // Reset form
  nameInput.value = '';
  currentWorkoutEditingId = null;
  document.getElementById('workout-creator-title').innerText = 'Criar Novo Treino Personalizado';
  document.getElementById('btn-save-custom-workout').innerText = 'Salvar Treino';
  document.querySelectorAll('#creator-exercise-list input[type="checkbox"]').forEach(chk => chk.checked = false);
  
  closeModal('modal-workout-creator');
  renderWorkoutsList();
}

// ==================== EXERCISE LIBRARY ====================
function renderExerciseLibrary(searchQuery = '', filterCategory = 'all') {
  const container = document.getElementById('exercise-library-container');
  container.innerHTML = '';

  const filtered = dynamicExerciseDatabase.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || ex.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-history-placeholder">
        <i class="fa-solid fa-magnifying-glass-minus"></i>
        <p>Nenhum exercício encontrado com esses filtros.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'exercise-item-card';
    card.addEventListener('click', () => showExerciseDetailModal(ex.id));
    
    card.innerHTML = `
      <div class="ex-info-block">
        <span class="ex-name">${ex.name}</span>
        <span class="ex-sub">${ex.primaryMuscle} • <span class="badge-ex-muscle">${ex.difficulty}</span></span>
      </div>
      <div class="btn-ex-view"><i class="fa-solid fa-chevron-right"></i></div>
    `;
    container.appendChild(card);
  });
}

function showExerciseDetailModal(id) {
  const ex = dynamicExerciseDatabase.find(item => item.id === id);
  if (!ex) return;

  document.getElementById('ex-detail-name').innerText = ex.name;
  document.getElementById('ex-detail-muscle').innerText = ex.primaryMuscle;
  document.getElementById('ex-detail-equip').innerText = ex.equipment;
  document.getElementById('ex-detail-difficulty').innerText = ex.difficulty;
  document.getElementById('ex-detail-secondary').innerText = ex.secondaryMuscles.length > 0 ? ex.secondaryMuscles.join(', ') : 'Nenhum';

  const instructionsList = document.getElementById('ex-detail-instructions');
  instructionsList.innerHTML = '';
  ex.instructions.forEach(step => {
    const li = document.createElement('li');
    li.innerText = step;
    instructionsList.appendChild(li);
  });

  openModal('modal-exercise-detail');
}

function openNewExerciseModal() {
  document.getElementById('new-ex-name').value = '';
  document.getElementById('new-ex-category').value = 'peito';
  document.getElementById('new-ex-equipment').value = '';
  document.getElementById('new-ex-primary-muscle').value = '';
  document.getElementById('new-ex-difficulty').value = 'Iniciante';
  document.getElementById('new-ex-secondary-muscles').value = '';
  document.getElementById('new-ex-instructions').value = '';
  openModal('modal-new-exercise');
}

function saveNewExercise() {
  const name = document.getElementById('new-ex-name').value.trim();
  const category = document.getElementById('new-ex-category').value;
  const equipment = document.getElementById('new-ex-equipment').value.trim() || 'Peso Corporal';
  const primaryMuscle = document.getElementById('new-ex-primary-muscle').value.trim();
  const difficulty = document.getElementById('new-ex-difficulty').value;
  const secondaryInput = document.getElementById('new-ex-secondary-muscles').value.trim();
  const instructionsText = document.getElementById('new-ex-instructions').value.trim();

  if (!name || !primaryMuscle || !instructionsText) {
    showAppToast('Por favor, preencha nome, músculo principal e instruções.', 'error');
    return;
  }

  const secondaryMuscles = secondaryInput ? secondaryInput.split(',').map(part => part.trim()).filter(Boolean) : [];
  const instructions = instructionsText.split(';').map(step => step.trim()).filter(Boolean);

  const newExercise = {
    id: 'custom_ex_' + Date.now(),
    name,
    category,
    primaryMuscle,
    secondaryMuscles,
    instructions,
    difficulty,
    equipment,
    met: 5.0
  };

  state.customExercises.push(newExercise);
  dynamicExerciseDatabase = [...dynamicExerciseDatabase, newExercise];
  saveAppState();

  closeModal('modal-new-exercise');
  renderExerciseLibrary();
  populateCreatorExercisesList();
  showAppToast('Exercício adicionado com sucesso!');
}

// ==================== NUTRITION & FOOD LOGGER ====================
function updateNutritionTab() {
  const today = getTodayDateString();
  const dayLog = state.nutritionLogs[today] || { meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }, water: 0 };
  
  // Calculate Totals
  const { totalCal, totalProt, totalCarb, totalFat } = calculateDailyNutritionTotals(dayLog);
  const targetCal = state.userProfile.caloriesTarget;
  const remainingCal = Math.max(targetCal - totalCal, 0);

  // Set Core text stats
  document.getElementById('nutri-cal-target').innerText = targetCal;
  document.getElementById('nutri-cal-consumed').innerText = Math.round(totalCal);
  // Queimado (burned) is estimated. For now, let's keep it static or update based on logged workouts
  let burnedEst = 0;
  const todayCompletedWorkouts = state.workoutHistory.filter(h => h.date === today);
  todayCompletedWorkouts.forEach(h => {
    burnedEst += parseInt(h.calories) || 0;
  });
  document.getElementById('nutri-cal-exercise').innerText = burnedEst;

  const adjustedRemaining = Math.max((targetCal + burnedEst) - totalCal, 0);
  document.getElementById('nutri-cal-remaining').innerText = Math.round(adjustedRemaining);

  // Set Bar Progress
  const barPercent = Math.min((totalCal / (targetCal + burnedEst)) * 100, 100);
  document.getElementById('nutri-cal-bar').style.width = `${barPercent}%`;

  // Detailed Macro metrics
  document.getElementById('nutri-p-val').innerText = `${Math.round(totalProt)}g / ${state.userProfile.macrosTarget.protein}g`;
  const protPct = Math.min((totalProt / state.userProfile.macrosTarget.protein) * 100, 100);
  document.getElementById('nutri-p-bar').style.width = `${protPct}%`;

  document.getElementById('nutri-c-val').innerText = `${Math.round(totalCarb)}g / ${state.userProfile.macrosTarget.carb}g`;
  const carbPct = Math.min((totalCarb / state.userProfile.macrosTarget.carb) * 100, 100);
  document.getElementById('nutri-c-bar').style.width = `${carbPct}%`;

  document.getElementById('nutri-f-val').innerText = `${Math.round(totalFat)}g / ${state.userProfile.macrosTarget.fat}g`;
  const fatPct = Math.min((totalFat / state.userProfile.macrosTarget.fat) * 100, 100);
  document.getElementById('nutri-f-bar').style.width = `${fatPct}%`;

  // Water Display
  document.getElementById('water-log-text').innerText = `${dayLog.water} ml`;
  document.getElementById('water-target-text').innerText = state.userProfile.waterTarget;
  const waterPct = Math.min((dayLog.water / state.userProfile.waterTarget) * 100, 100);
  document.getElementById('water-visual-fill').style.height = `${waterPct}%`;

  // Food logs rendering
  renderMealGroupList('breakfast', dayLog.meals.breakfast);
  renderMealGroupList('lunch', dayLog.meals.lunch);
  renderMealGroupList('dinner', dayLog.meals.dinner);
  renderMealGroupList('snacks', dayLog.meals.snacks);
}

function renderMealGroupList(mealKey, items) {
  const container = document.getElementById(`meal-${mealKey}-items`);
  const sumLabel = document.getElementById(`meal-cal-${mealKey}`);
  
  container.innerHTML = '';
  let sumCal = 0;

  if (!items || items.length === 0) {
    container.innerHTML = `<div class="no-foods-placeholder">Nenhum alimento registrado.</div>`;
    sumLabel.innerText = "0 kcal";
    return;
  }

  items.forEach((item, idx) => {
    sumCal += item.cal;
    const row = document.createElement('div');
    row.className = 'meal-item-row';
    row.innerHTML = `
      <div class="meal-item-details">
        <span class="meal-item-name">${item.name}</span>
        <span class="meal-item-macros">P: ${item.prot}g | C: ${item.carb}g | G: ${item.fat}g</span>
      </div>
      <div style="display: flex; align-items: center;">
        <span class="meal-item-kcal">${item.cal} kcal</span>
        <button class="btn-delete-food" onclick="deleteFoodLogItem('${mealKey}', ${idx})">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `;
    container.appendChild(row);
  });

  sumLabel.innerText = `${Math.round(sumCal)} kcal`;
}

function toggleMealGroup(containerId) {
  const container = document.getElementById(containerId);
  const card = container.parentElement;
  
  if (card.classList.contains('open')) {
    card.classList.remove('open');
  } else {
    card.classList.add('open');
  }
}

function addWater(amount) {
  const today = getTodayDateString();
  if (!state.nutritionLogs[today]) {
    state.nutritionLogs[today] = { meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }, water: 0 };
  }
  
  state.nutritionLogs[today].water += amount;
  saveAppState();
  updateNutritionTab();
}

function resetWater() {
  const today = getTodayDateString();
  if (state.nutritionLogs[today]) {
    state.nutritionLogs[today].water = 0;
    saveAppState();
    updateNutritionTab();
  }
}

function openAddFoodModal(mealKey) {
  document.getElementById('food-target-meal').value = mealKey;
  
  // Clear inputs
  document.getElementById('food-name-input').value = '';
  document.getElementById('food-cal-input').value = '';
  document.getElementById('food-prot-input').value = '';
  document.getElementById('food-carb-input').value = '';
  document.getElementById('food-fat-input').value = '';

  // Render suggestion pills
  const suggestionsContainer = document.getElementById('food-suggestions');
  suggestionsContainer.innerHTML = '';
  FOOD_SUGGESTIONS.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'food-pill-btn';
    btn.innerText = s.name;
    btn.addEventListener('click', () => {
      document.getElementById('food-name-input').value = s.name;
      document.getElementById('food-cal-input').value = s.cal;
      document.getElementById('food-prot-input').value = s.prot;
      document.getElementById('food-carb-input').value = s.carb;
      document.getElementById('food-fat-input').value = s.fat;
    });
    suggestionsContainer.appendChild(btn);
  });

  openModal('modal-add-food');
}

function saveFoodLog() {
  const mealKey = document.getElementById('food-target-meal').value;
  const name = document.getElementById('food-name-input').value.trim();
  const cal = Number(document.getElementById('food-cal-input').value);
  const prot = Number(document.getElementById('food-prot-input').value);
  const carb = Number(document.getElementById('food-carb-input').value);
  const fat = Number(document.getElementById('food-fat-input').value);

  if (!name || isNaN(cal)) {
    showAppToast("Nome e Calorias são campos obrigatórios.", 'error');
    return;
  }

  const today = getTodayDateString();
  if (!state.nutritionLogs[today]) {
    state.nutritionLogs[today] = { meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }, water: 0 };
  }

  const newFoodItem = { name, cal, prot, carb, fat };
  state.nutritionLogs[today].meals[mealKey].push(newFoodItem);
  
  saveAppState();
  closeModal('modal-add-food');
  updateNutritionTab();
  
  // Expand the card where food was added
  const groupCard = document.getElementById(`meal-${mealKey}-items`).parentElement;
  groupCard.classList.add('open');
}

function deleteFoodLogItem(mealKey, index) {
  const today = getTodayDateString();
  if (state.nutritionLogs[today] && state.nutritionLogs[today].meals[mealKey]) {
    state.nutritionLogs[today].meals[mealKey].splice(index, 1);
    saveAppState();
    updateNutritionTab();
  }
}

// ==================== WORKOUT PLAYER (SESSION CONTROL) ====================
function startWorkoutSession(routineId) {
  const routine = state.workouts.find(w => w.id === routineId);
  if (!routine) return;

  // Initialize active session object
  activeSession = {
    routineId: routineId,
    name: routine.name,
    startTimestamp: Date.now(),
    secondsElapsed: 0,
    exercises: [], // { id, name, category, sets: [{ weight, reps, logged }] }
    currentExerciseIndex: 0
  };

  // Compile exercises from routine template
  routine.exercises.forEach(exId => {
    const exDb = EXERCISE_DATABASE.find(item => item.id === exId);
    if (exDb) {
      activeSession.exercises.push({
        id: exDb.id,
        name: exDb.name,
        category: exDb.category,
        primaryMuscle: exDb.primaryMuscle,
        instructions: exDb.instructions,
        met: exDb.met,
        sets: [
          { setNum: 1, weight: 10, reps: 10, logged: false },
          { setNum: 2, weight: 10, reps: 10, logged: false },
          { setNum: 3, weight: 10, reps: 10, logged: false }
        ]
      });
    }
  });

  if (activeSession.exercises.length === 0) {
    showAppToast("Este treino não possui exercícios cadastrados.", 'error');
    return;
  }

  // Open Workout player overlay
  document.getElementById('overlay-workout-player').classList.add('open');
  
  // Timer setup
  clearInterval(activeSessionTimer);
  activeSessionTimer = setInterval(() => {
    activeSession.secondsElapsed++;
    updatePlayerTimerUI();
  }, 1000);

  // Render the current active exercise
  renderPlayerCurrentExercise();
}

function updatePlayerTimerUI() {
  const totalSeconds = activeSession.secondsElapsed;
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  document.getElementById('player-timer').innerText = `${hrs}:${mins}:${secs}`;
}

function renderPlayerCurrentExercise() {
  const exIndex = activeSession.currentExerciseIndex;
  const ex = activeSession.exercises[exIndex];

  document.getElementById('player-workout-name').innerText = activeSession.name;
  document.getElementById('player-ex-index').innerText = `Exercício ${exIndex + 1} de ${activeSession.exercises.length}`;
  document.getElementById('player-ex-name').innerText = ex.name;
  document.getElementById('player-ex-muscle').innerText = ex.primaryMuscle;

  // Instructions
  const instructionsList = document.getElementById('player-ex-instructions');
  instructionsList.innerHTML = '';
  ex.instructions.forEach(step => {
    const li = document.createElement('li');
    li.innerText = step;
    instructionsList.appendChild(li);
  });

  // Sets Table
  renderPlayerSetsRows(ex);
  updateVolumeAndCalories();
}

function renderPlayerSetsRows(exercise) {
  const container = document.getElementById('player-sets-container');
  container.innerHTML = '';

  exercise.sets.forEach((set, idx) => {
    const row = document.createElement('div');
    row.className = `set-row ${set.logged ? 'logged' : ''}`;
    
    row.innerHTML = `
      <span class="num">${set.setNum}</span>
      <input type="number" class="set-weight-input" value="${set.weight}" ${set.logged ? 'disabled' : ''}>
      <input type="number" class="set-reps-input" value="${set.reps}" ${set.logged ? 'disabled' : ''}>
      <button class="btn-check-set" onclick="toggleSetLogged(${idx})">
        <i class="fa-solid fa-check"></i>
      </button>
    `;
    
    // Auto-update values in object on inputs focus-out
    const wInput = row.querySelector('.set-weight-input');
    const rInput = row.querySelector('.set-reps-input');
    wInput.addEventListener('change', () => set.weight = Number(wInput.value));
    rInput.addEventListener('change', () => set.reps = Number(rInput.value));
    
    container.appendChild(row);
  });
}

function toggleSetLogged(setIdx) {
  const exIndex = activeSession.currentExerciseIndex;
  const exercise = activeSession.exercises[exIndex];
  const set = exercise.sets[setIdx];
  
  if (set.logged) {
    // Un-log
    set.logged = false;
  } else {
    // Log
    set.logged = true;
    
    // Start Rest Timer if not the last set
    triggerRestTimer(60);
  }

  renderPlayerSetsRows(exercise);
  updateVolumeAndCalories();
}

function triggerRestTimer(seconds) {
  restTimerSeconds = seconds;
  document.getElementById('rest-timer-countdown').innerText = restTimerSeconds;
  document.getElementById('rest-timer-box').style.display = 'block';

  clearInterval(restTimerInterval);
  restTimerActive = true;
  document.getElementById('btn-rest-toggle').innerHTML = '<i class="fa-solid fa-pause"></i>';

  restTimerInterval = setInterval(() => {
    if (restTimerActive) {
      restTimerSeconds--;
      document.getElementById('rest-timer-countdown').innerText = restTimerSeconds;
      
      if (restTimerSeconds <= 0) {
        clearInterval(restTimerInterval);
        document.getElementById('rest-timer-box').style.display = 'none';
        
        // Play Chime
        const chime = document.getElementById('timer-chime');
        if (chime) {
          chime.currentTime = 0;
          chime.play().catch(e => console.log('Chime playback error', e));
        }
        
        // Vibration if API is available
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    }
  }, 1000);
}

function addSetToPlayerExercise() {
  const exIndex = activeSession.currentExerciseIndex;
  const exercise = activeSession.exercises[exIndex];
  
  const lastSet = exercise.sets[exercise.sets.length - 1];
  const nextSetNum = exercise.sets.length + 1;
  const nextWeight = lastSet ? lastSet.weight : 10;
  const nextReps = lastSet ? lastSet.reps : 10;

  exercise.sets.push({
    setNum: nextSetNum,
    weight: nextWeight,
    reps: nextReps,
    logged: false
  });

  renderPlayerSetsRows(exercise);
}

function playerNextExercise() {
  if (activeSession.currentExerciseIndex < activeSession.exercises.length - 1) {
    activeSession.currentExerciseIndex++;
    renderPlayerCurrentExercise();
  }
}

function playerPrevExercise() {
  if (activeSession.currentExerciseIndex > 0) {
    activeSession.currentExerciseIndex--;
    renderPlayerCurrentExercise();
  }
}

function updateVolumeAndCalories() {
  let totalVolume = 0;
  let totalSetsCount = 0;
  let totalMetSum = 0;

  activeSession.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      if (set.logged) {
        totalVolume += (set.weight * set.reps);
        totalSetsCount++;
      }
    });
    totalMetSum += (ex.met || 5.0);
  });

  // Calculate Average MET
  const avgMet = activeSession.exercises.length > 0 ? (totalMetSum / activeSession.exercises.length) : 5.0;
  
  // MET Calories calculation formula: Calories = MET * BodyWeight(kg) * Time(mins) / 60
  const durationMins = activeSession.secondsElapsed / 60;
  const bodyWeight = state.userProfile.weight || 75;
  const caloriesBurned = Math.round(avgMet * bodyWeight * (durationMins || 1) / 60);

  document.getElementById('player-total-volume').innerText = `${totalVolume} kg`;
  document.getElementById('player-est-calories').innerText = `${caloriesBurned} kcal`;

  return { totalVolume, totalSetsCount, caloriesBurned };
}

async function finishActiveWorkout() {
  // Confirm if session is in progress
  const hasLoggedSets = activeSession.exercises.some(ex => ex.sets.some(s => s.logged));
  if (!hasLoggedSets) {
    if (!finishWorkoutConfirmPending) {
      finishWorkoutConfirmPending = true;
      showPlayerStatusBanner('Nenhuma série registrada ainda. Toque em Finalizar novamente para encerrar o treino.', 'warning');
      finishWorkoutConfirmTimeout = setTimeout(() => {
        finishWorkoutConfirmPending = false;
        clearPlayerStatusBanner();
      }, 8000);
      return;
    }
    finishWorkoutConfirmPending = false;
    clearTimeout(finishWorkoutConfirmTimeout);
    clearPlayerStatusBanner();
  }

  // Calculate final metrics
  const { totalVolume, totalSetsCount, caloriesBurned } = updateVolumeAndCalories();
  
  // Stop Timer
  clearInterval(activeSessionTimer);
  clearInterval(restTimerInterval);
  document.getElementById('rest-timer-box').style.display = 'none';

  // Format Duration
  const totalSeconds = activeSession.secondsElapsed;
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const durationStr = hrs > 0 ? `${hrs}h ${mins}min` : `${mins} min`;

  // Create Log Entry
  const today = getTodayDateString();
  const logId = 'log_' + Date.now();
  const logEntry = {
    id: logId,
    date: today,
    workoutName: activeSession.name,
    duration: durationStr,
    exercisesCount: activeSession.exercises.length,
    totalWeight: `${totalVolume} kg`,
    calories: `${caloriesBurned} kcal`
  };

  // Add to state
  state.workoutHistory.unshift(logEntry);
  saveAppState();

  // Close player
  document.getElementById('overlay-workout-player').classList.remove('open');

  // Trigger celebration effects (Confetti)
  triggerConfettiExplosion();

  // Open sharing modal with canvas card
  openWorkoutSharingModal(logEntry);

  // Update tabs views
  updateDashboard();
}

function triggerConfettiExplosion() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
}

// ==================== SHARING MODAL & CANVAS ====================
function openWorkoutSharingModal(logEntry) {
  const canvas = document.getElementById('share-card-canvas');
  
  // Create summary object matching share-card expectations
  const summary = {
    workoutName: logEntry.workoutName,
    athleteName: state.userProfile.name || 'Atleta GymFlow',
    duration: logEntry.duration,
    exercisesCount: logEntry.exercisesCount,
    totalWeight: logEntry.totalWeight,
    calories: logEntry.calories,
    dateString: new Date().toLocaleDateString('pt-BR')
  };

  // Generate canvas rendering
  generateShareCard(canvas, summary);

  shareCardSummary = summary;
  shareModalPhotoData = null;
  const photoPreview = document.getElementById('share-photo-preview');
  if (photoPreview) {
    photoPreview.src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=150&auto=format&fit=crop&q=80';
  }

  openModal('modal-share-workout');
}

function handleSharePhotoInput(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showAppToast('Por favor, selecione um arquivo de imagem.', 'error');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    shareModalPhotoData = reader.result;
    if (shareCardSummary) {
      shareCardSummary.photoData = shareModalPhotoData;
    }
    const preview = document.getElementById('share-photo-preview');
    if (preview) preview.src = reader.result;

    const canvas = document.getElementById('share-card-canvas');
    if (canvas && shareCardSummary) {
      generateShareCard(canvas, shareCardSummary);
    }
  };
  reader.readAsDataURL(file);
}

function removeSharePhoto() {
  shareModalPhotoData = null;
  if (shareCardSummary) {
    delete shareCardSummary.photoData;
  }
  const input = document.getElementById('share-photo-input');
  if (input) input.value = '';
  const preview = document.getElementById('share-photo-preview');
  if (preview) preview.src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=150&auto=format&fit=crop&q=80';
  const canvas = document.getElementById('share-card-canvas');
  if (canvas && shareCardSummary) {
    generateShareCard(canvas, shareCardSummary);
  }
}

function shareCardNative() {
  const canvas = document.getElementById('share-card-canvas');
  if (!canvas) return;

  canvas.toBlob(blob => {
    const file = new File([blob], 'meu-treino-gymflow.png', { type: 'image/png' });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: 'GymFlow - Treino Concluído!',
        text: `Treino de hoje finalizado no GymFlow! Esforço gerando resultados.`
      }).catch(err => {
        console.log('Share canceled or error', err);
      });
    } else {
      // Fallback copy info
      navigator.clipboard.writeText(`Treino Finalizado no GymFlow! 🏋️‍♂️\nFicha: ${activeSession ? activeSession.name : 'Meu Treino'}\nConfira meu progresso de hoje!`);
      showAppToast("A API de compartilhamento nativo não é suportada neste navegador. Os dados do treino foram copiados para a sua área de transferência!", 'info');
    }
  }, 'image/png');
}

function downloadCardImage() {
  const canvas = document.getElementById('share-card-canvas');
  if (!canvas) return;

  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `gymflow-treino-${getTodayDateString()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ==================== PROGRESS & WEIGHT CHARTS ====================
function updateProgressTab() {
  // Render completed workout history list
  renderWorkoutHistoryList();

  // Render / Update Chart.js weight progress
  renderWeightChart();
}

function renderWorkoutHistoryList() {
  const container = document.getElementById('workout-history-list');
  container.innerHTML = '';

  if (state.workoutHistory.length === 0) {
    container.innerHTML = `
      <div class="no-history-placeholder">
        <i class="fa-solid fa-calendar-xmark"></i>
        <p>Nenhum treino concluído ainda. Comece hoje!</p>
      </div>
    `;
    return;
  }

  state.workoutHistory.forEach(log => {
    const card = document.createElement('div');
    card.className = 'history-card';
    
    // Format date beautifully
    let formattedDate = log.date;
    try {
      const dParts = log.date.split('-');
      formattedDate = `${dParts[2]}/${dParts[1]}/${dParts[0]}`;
    } catch(e){}

    card.innerHTML = `
      <div class="history-header">
        <span class="history-name">${log.workoutName}</span>
        <span class="history-date">${formattedDate}</span>
      </div>
      <div class="history-stats-row">
        <span><i class="fa-regular fa-clock"></i> ${log.duration}</span>
        <span><i class="fa-solid fa-dumbbell"></i> ${log.totalWeight}</span>
        <span><i class="fa-solid fa-fire-flame-curved"></i> ${log.calories}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderWeightChart() {
  const ctx = document.getElementById('weightHistoryChart').getContext('2d');
  
  // Sort logs by date ascending
  const sortedLogs = [...state.weightLogs].sort((a, b) => a.date.localeCompare(b.date));
  
  const labels = sortedLogs.map(l => {
    const parts = l.date.split('-');
    return `${parts[2]}/${parts[1]}`; // DD/MM
  });
  const data = sortedLogs.map(l => l.weight);

  if (weightChart) {
    weightChart.destroy();
  }

  // Draw customized premium chart styling
  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Peso Corporal (kg)',
        data: data,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
        pointRadius: 4,
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.04)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.5)',
            font: {
              family: 'Outfit'
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.04)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.5)',
            font: {
              family: 'Outfit'
            }
          }
        }
      }
    }
  });
}

function saveWeightLog() {
  const weightInput = document.getElementById('weight-log-input');
  const weight = Number(weightInput.value);

  if (isNaN(weight) || weight <= 0) {
    showAppToast("Por favor, digite um peso válido.", 'error');
    return;
  }

  const today = getTodayDateString();
  const existingLogIndex = state.weightLogs.findIndex(l => l.date === today);

  if (existingLogIndex !== -1) {
    state.weightLogs[existingLogIndex].weight = weight;
  } else {
    state.weightLogs.push({ date: today, weight: weight });
  }

  // Update profile weight as well
  state.userProfile.weight = weight;
  
  saveAppState();
  closeModal('modal-weight-logger');
  
  // Refresh Chart & views
  updateProgressTab();
  updateDashboard();
  showAppToast("Peso corporal registrado com sucesso!");
}

// ==================== PROFILE CONFS ====================
function openUserProfileModal() {
  document.getElementById('profile-name').value = state.userProfile.name;
  document.getElementById('profile-weight').value = state.userProfile.weight;
  document.getElementById('profile-height').value = state.userProfile.height;
  document.getElementById('profile-gender').value = state.userProfile.gender || "male";
  document.getElementById('profile-photo-preview').src = state.userProfile.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  document.getElementById('profile-photo-input').value = '';
  document.getElementById('profile-age').value = state.userProfile.age || 25;
  document.getElementById('profile-activity').value = state.userProfile.activityLevel || "1.375";
  document.getElementById('profile-goal').value = state.userProfile.goal;
  
  document.getElementById('profile-calories').value = state.userProfile.caloriesTarget;
  document.getElementById('profile-water-target').value = state.userProfile.waterTarget;
  
  document.getElementById('profile-prot').value = state.userProfile.macrosTarget.protein;
  document.getElementById('profile-carb').value = state.userProfile.macrosTarget.carb;
  document.getElementById('profile-fat').value = state.userProfile.macrosTarget.fat;

  openModal('modal-user-profile');
}

// Recalculates default targets on biometrics change (Mifflin-St Jeor)
function triggerAutoMacrosUpdate() {
  const w = Number(document.getElementById('profile-weight').value) || 70;
  const h = Number(document.getElementById('profile-height').value) || 170;
  const age = Number(document.getElementById('profile-age').value) || 25;
  const gender = document.getElementById('profile-gender').value;
  const activityFactor = Number(document.getElementById('profile-activity').value) || 1.375;
  const goal = document.getElementById('profile-goal').value;

  // Mifflin-St Jeor Formula
  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * w + 6.25 * h - 5 * age + 5;
  } else {
    bmr = 10 * w + 6.25 * h - 5 * age - 161;
  }

  // TDEE (Total Daily Energy Expenditure)
  const tdee = bmr * activityFactor;

  // Adjust for Goal
  let targetCal = Math.round(tdee);
  let p = 2.0 * w; // 2g/kg protein default
  let f = 0.9 * w; // 0.9g/kg fats

  if (goal === 'gain') {
    targetCal = Math.round(tdee + 350); // Surplus
  } else if (goal === 'lose') {
    targetCal = Math.max(Math.round(tdee - 500), 1200); // Deficit with safety floor of 1200 kcal
    p = 2.2 * w; // Higher protein in deficit
  }

  // Carb is remaining calories
  const carbCal = targetCal - (p * 4) - (f * 9);
  let c = Math.max(Math.round(carbCal / 4), 0);

  document.getElementById('profile-calories').value = targetCal;
  document.getElementById('profile-prot').value = Math.round(p);
  document.getElementById('profile-carb').value = Math.round(c);
  document.getElementById('profile-fat').value = Math.round(f);
  document.getElementById('profile-water-target').value = Math.round(w * 35);
}

function saveUserProfile() {
  const name = document.getElementById('profile-name').value.trim() || "Atleta";
  const weight = Number(document.getElementById('profile-weight').value);
  const height = Number(document.getElementById('profile-height').value);
  const gender = document.getElementById('profile-gender').value;
  const age = Number(document.getElementById('profile-age').value) || 25;
  const activityLevel = document.getElementById('profile-activity').value;
  const goal = document.getElementById('profile-goal').value;

  const calories = Number(document.getElementById('profile-calories').value);
  const water = Number(document.getElementById('profile-water-target').value);
  
  const prot = Number(document.getElementById('profile-prot').value);
  const carb = Number(document.getElementById('profile-carb').value);
  const fat = Number(document.getElementById('profile-fat').value);

  const photoUrl = document.getElementById('profile-photo-preview').src;

  // Update State
  state.userProfile = {
    name,
    weight,
    height,
    gender,
    age,
    activityLevel,
    goal,
    caloriesTarget: calories,
    waterTarget: water,
    macrosTarget: {
      protein: prot,
      carb: carb,
      fat: fat
    },
    photo: photoUrl
  };

  // Add new weight log if weight changed
  const today = getTodayDateString();
  const existingLogIndex = state.weightLogs.findIndex(l => l.date === today);
  if (existingLogIndex !== -1) {
    state.weightLogs[existingLogIndex].weight = weight;
  } else {
    state.weightLogs.push({ date: today, weight: weight });
  }

  saveAppState();
  closeModal('modal-user-profile');
  updateDashboard();
  showAppToast("Perfil e metas atualizados com sucesso!");
}

// ==================== TEAM & CONNECTION DASHBOARD ====================
function previewImageFromInput(inputId, targetImageId) {
  const fileInput = document.getElementById(inputId);
  const imgTarget = document.getElementById(targetImageId);
  if (!fileInput || !imgTarget || !fileInput.files || fileInput.files.length === 0) {
    return;
  }
  const file = fileInput.files[0];
  if (!file.type.startsWith('image/')) {
    showAppToast('Por favor, selecione um arquivo de imagem.', 'error');
    fileInput.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    imgTarget.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function updateTeamTab() {
  // Render active segmented button
  document.getElementById('btn-role-athlete').classList.remove('active');
  document.getElementById('btn-role-personal').classList.remove('active');
  
  if (state.teamRole === 'athlete') {
    document.getElementById('btn-role-athlete').classList.add('active');
    document.getElementById('panel-athlete-role').classList.add('active');
    document.getElementById('panel-personal-role').classList.remove('active');
    renderAthleteView();
  } else {
    document.getElementById('btn-role-personal').classList.add('active');
    document.getElementById('panel-personal-role').classList.add('active');
    document.getElementById('panel-athlete-role').classList.remove('active');
    renderPersonalView();
  }
}

function setTeamRole(role) {
  state.teamRole = role;
  saveAppState();
  updateTeamTab();
}

// --- ATHLETE VIEW LOGIC ---
function renderAthleteView() {
  const unlinkedView = document.getElementById('athlete-unlinked-view');
  const linkedView = document.getElementById('athlete-linked-view');
  const messagesSection = document.getElementById('athlete-messages-section');
  
  if (state.linkedPersonal) {
    unlinkedView.style.display = 'none';
    linkedView.style.display = 'block';
    messagesSection.style.display = 'block';
    
    const badge = document.getElementById('linked-personal-badge');
    badge.innerHTML = `
      <div class="avatar-decor">
        ${state.linkedPersonal.photo ? `<img src="${state.linkedPersonal.photo}" alt="Foto do Personal" class="personal-avatar">` : '<i class="fa-solid fa-user-tie"></i>'}
      </div>
      <div>
        <h3 id="linked-personal-name">${state.linkedPersonal.name}</h3>
        <span class="cref-tag" id="linked-personal-cref">${state.linkedPersonal.cref}</span>
      </div>
    `;
    
    renderAthleteMessages();
  } else {
    unlinkedView.style.display = 'block';
    linkedView.style.display = 'none';
    messagesSection.style.display = 'none';
  }
}

function linkPersonalAction() {
  const name = document.getElementById('input-link-personal-name').value.trim();
  const cref = document.getElementById('input-link-personal-cref').value.trim();
  
  if (!name || !cref) {
    showAppToast("Nome e registro CREF são obrigatórios.", 'error');
    return;
  }
  
  const personalPhoto = document.getElementById('link-personal-photo-preview').src;
  state.linkedPersonal = { name, cref, photo: personalPhoto };
  
  // Appends a welcome message automatically
  state.athleteMessages.unshift({
    date: new Date().toLocaleDateString('pt-BR'),
    sender: name,
    text: `Olá! Fico feliz em ser seu treinador. A partir de agora, analisarei seus treinos concluídos e atualizarei suas metas no diário nutricional.`
  });
  
  saveAppState();
  renderAthleteView();
  showAppToast("Personal vinculado com sucesso!");
}

function unlinkPersonalAction() {
  showConfirmDialog("Deseja mesmo se desvincular do seu Personal Trainer? Suas mensagens anteriores serão limpas.")
    .then(confirmed => {
      if (!confirmed) return;
      state.linkedPersonal = null;
      state.athleteMessages = [];
      saveAppState();
      renderAthleteView();
    });
}

function renderAthleteMessages() {
  const list = document.getElementById('athlete-messages-list');
  list.innerHTML = '';
  
  if (state.athleteMessages.length === 0) {
    list.innerHTML = `<div class="no-foods-placeholder">Nenhuma mensagem do seu treinador.</div>`;
    return;
  }
  
  state.athleteMessages.forEach(msg => {
    const card = document.createElement('div');
    card.className = 'message-bubble-card';
    card.innerHTML = `
      <div class="message-bubble-header">
        <span>De: ${msg.sender}</span>
        <span>${msg.date}</span>
      </div>
      <div class="message-bubble-body">
        ${msg.text}
      </div>
    `;
    list.appendChild(card);
  });
}

// --- PERSONAL TRAINER VIEW LOGIC ---
function renderPersonalView() {
  const container = document.getElementById('managed-athletes-container');
  container.innerHTML = '';
  
  if (state.myAthletes.length === 0) {
    container.innerHTML = `
      <div class="no-history-placeholder" style="padding: 40px 10px;">
        <i class="fa-solid fa-users-slash" style="font-size: 2rem;"></i>
        <p>Você não possui alunos cadastrados. Cadastre um novo!</p>
      </div>
    `;
    return;
  }
  
  state.myAthletes.forEach(ath => {
    const card = document.createElement('div');
    card.className = 'athlete-manage-card';
    
    let goalText = "Manutenção";
    if (ath.goal === 'gain') goalText = "Ganho de Massa";
    if (ath.goal === 'lose') goalText = "Perda de Gordura";
    
    card.innerHTML = `
      <div class="athlete-manage-header">
        <div>
          <span class="athlete-manage-name">${ath.name}</span>
          <span class="athlete-manage-email">${ath.email}</span>
        </div>
        <button class="btn-athlete-remove" onclick="removeAthleteAction('${ath.id}')" title="Excluir aluno">
          <i class="fa-solid fa-user-minus"></i>
        </button>
      </div>
      
      <div class="athlete-stat-pill-row">
        <span class="athlete-stat-pill"><i class="fa-solid fa-weight-scale"></i> ${ath.weight} kg</span>
        <span class="athlete-stat-pill"><i class="fa-solid fa-ruler-vertical"></i> ${ath.height} cm</span>
        <span class="athlete-stat-pill"><i class="fa-solid fa-bullseye"></i> ${goalText}</span>
        <span class="athlete-stat-pill"><i class="fa-solid fa-fire"></i> ${ath.caloriesTarget} kcal</span>
      </div>
      
      <div class="athlete-manage-actions">
        <button class="btn btn-secondary btn-sm" onclick="openSendMessageModal('${ath.id}', '${ath.name}')">
          <i class="fa-regular fa-comment"></i> Orientar
        </button>
        <button class="btn btn-primary btn-sm" onclick="simulateAthleteLogin('${ath.id}')">
          <i class="fa-solid fa-right-to-bracket"></i> Simular Atleta
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function saveNewAthlete() {
  const name = document.getElementById('athlete-name-input').value.trim();
  const email = document.getElementById('athlete-email-input').value.trim();
  const weight = Number(document.getElementById('athlete-weight-input').value);
  const height = Number(document.getElementById('athlete-height-input').value);
  const gender = document.getElementById('athlete-gender-input').value;
  const age = Number(document.getElementById('athlete-age-input').value) || 25;
  const activityLevel = Number(document.getElementById('athlete-activity-input').value) || 1.375;
  const goal = document.getElementById('athlete-goal-input').value;
  
  let caloriesTarget = Number(document.getElementById('athlete-calories-input').value);
  
  if (!name || !email || isNaN(weight) || isNaN(height)) {
    showAppToast("Preencha todos os campos obrigatórios.", 'error');
    return;
  }

  // If calorie target is not manually typed, auto-calculate with Mifflin-St Jeor
  if (!caloriesTarget || isNaN(caloriesTarget) || caloriesTarget <= 0) {
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    const tdee = bmr * activityLevel;
    if (goal === 'gain') {
      caloriesTarget = Math.round(tdee + 350);
    } else if (goal === 'lose') {
      caloriesTarget = Math.max(Math.round(tdee - 500), 1200);
    } else {
      caloriesTarget = Math.round(tdee);
    }
  }
  
  const newAth = {
    id: 'athlete_' + Date.now(),
    name,
    email,
    weight,
    height,
    gender,
    age,
    activityLevel: String(activityLevel),
    goal,
    caloriesTarget,
    lastActive: "Hoje"
  };
  
  state.myAthletes.push(newAth);
  saveAppState();
  closeModal('modal-create-athlete');
  renderPersonalView();
  showAppToast("Aluno cadastrado com sucesso!");
}

function triggerAthleteAutoCaloriesRecalc() {
  const w = Number(document.getElementById('athlete-weight-input').value) || 70;
  const h = Number(document.getElementById('athlete-height-input').value) || 170;
  const age = Number(document.getElementById('athlete-age-input').value) || 25;
  const gender = document.getElementById('athlete-gender-input').value;
  const activity = Number(document.getElementById('athlete-activity-input').value) || 1.375;
  const goal = document.getElementById('athlete-goal-input').value;

  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * w + 6.25 * h - 5 * age + 5;
  } else {
    bmr = 10 * w + 6.25 * h - 5 * age - 161;
  }
  const tdee = bmr * activity;
  
  let targetCal = Math.round(tdee);
  if (goal === 'gain') {
    targetCal = Math.round(tdee + 350);
  } else if (goal === 'lose') {
    targetCal = Math.max(Math.round(tdee - 500), 1200);
  }
  
  document.getElementById('athlete-calories-input').placeholder = `Calculado: ${targetCal} kcal`;
}

function removeAthleteAction(id) {
  showConfirmDialog("Deseja realmente remover este aluno da sua lista de gestão?")
    .then(confirmed => {
      if (!confirmed) return;
      state.myAthletes = state.myAthletes.filter(a => a.id !== id);
      saveAppState();
      renderPersonalView();
    });
}

function openSendMessageModal(athleteId, athleteName) {
  document.getElementById('msg-target-athlete-id').value = athleteId;
  document.getElementById('span-msg-athlete-name').innerText = athleteName;
  document.getElementById('textarea-athlete-feedback').value = '';
  openModal('modal-send-message');
}

function sendFeedbackToAthlete() {
  const athleteId = document.getElementById('msg-target-athlete-id').value;
  const text = document.getElementById('textarea-athlete-feedback').value.trim();
  
  if (!text) {
    showAppToast("Digite uma mensagem de orientação.", 'error');
    return;
  }
  
  // Simulated socket / notification dispatch
  // Find athlete name to log in messages
  const athleteObj = state.myAthletes.find(a => a.id === athleteId);
  if (athleteObj) {
    // If the user simulates this athlete later, they will receive this message!
    // Let's store the message inside a global simulated inbox in the database, keyed by athlete email or ID!
    if (!state.simulatedInboxes) state.simulatedInboxes = {};
    if (!state.simulatedInboxes[athleteId]) state.simulatedInboxes[athleteId] = [];
    
    state.simulatedInboxes[athleteId].unshift({
      date: new Date().toLocaleDateString('pt-BR'),
      sender: "Prof. Roberto Costa (Personal)",
      text: text
    });
  }
  
  saveAppState();
  closeModal('modal-send-message');
  showAppToast("Mensagem enviada com sucesso para o aluno!");
}

async function simulateAthleteLogin(athleteId) {
  const athlete = state.myAthletes.find(a => a.id === athleteId);
  if (!athlete) return;
  
  const confirmed = await showConfirmDialog(`Deseja simular o login como ${athlete.name}? As estatísticas do diário nutricional e do perfil serão atualizadas com os dados dele.`);
  if (!confirmed) return;

  // Modify profile to simulate athlete account login
  state.userProfile.name = athlete.name;
    state.userProfile.weight = athlete.weight;
    state.userProfile.height = athlete.height;
    state.userProfile.goal = athlete.goal;
    state.userProfile.caloriesTarget = athlete.caloriesTarget;
    
    // Recalculate macros targets based on their stats
    state.userProfile.macrosTarget.protein = Math.round(athlete.weight * 2.0);
    state.userProfile.macrosTarget.fat = Math.round(athlete.weight * 1.0);
    state.userProfile.macrosTarget.carb = Math.round((athlete.caloriesTarget - (state.userProfile.macrosTarget.protein * 4) - (state.userProfile.macrosTarget.fat * 9)) / 4);
    
    // Load simulated inbox messages from Personal Trainer if any
    if (state.simulatedInboxes && state.simulatedInboxes[athleteId]) {
      state.athleteMessages = [...state.simulatedInboxes[athleteId]];
    } else {
      state.athleteMessages = [
        {
          date: new Date().toLocaleDateString('pt-BR'),
          sender: "Prof. Roberto (Personal)",
          text: `Olá, ${athlete.name}! Acabei de configurar seu perfil. Fique atento às suas metas de calorias e macros.`
        }
      ];
    }
    
    // Auto-link profile to Personal
    state.linkedPersonal = { name: "Prof. Roberto (Personal)", cref: "CREF 098765-G/SP" };
    state.teamRole = 'athlete';
    
    saveAppState();
    
    // Alert user
    showAppToast(`Simulação iniciada! Agora você está visualizando o app como o atleta: ${athlete.name}.`, 'success');
    
    // Redirect to Dashboard
    switchTab('dashboard');
  }


// ==================== BIND DOM EVENTS ====================
function setupEventListeners() {
  // Navigation trigger
  document.querySelectorAll('.app-nav button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = e.currentTarget.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Action clicks
  document.getElementById('btn-start-today-workout').addEventListener('click', () => {
    // Start first available routine
    if (state.workouts.length > 0) {
      startWorkoutSession(state.workouts[0].id);
    } else {
      switchTab('workouts');
    }
  });

  document.getElementById('btn-create-workout').addEventListener('click', () => {
    openWorkoutCreator();
  });

  document.getElementById('btn-open-creator').addEventListener('click', () => {
    openWorkoutCreator();
  });

  document.getElementById('btn-save-custom-workout').addEventListener('click', saveCustomWorkout);

  // Search input exercise library
  const searchInput = document.getElementById('search-exercise-input');
  searchInput.addEventListener('input', () => {
    const activePill = document.querySelector('#exercise-category-pills .pill.active');
    const category = activePill ? activePill.getAttribute('data-category') : 'all';
    renderExerciseLibrary(searchInput.value, category);
  });

  // Category pills trigger
  document.querySelectorAll('#exercise-category-pills .pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('#exercise-category-pills .pill').forEach(p => p.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      const category = e.currentTarget.getAttribute('data-category');
      const searchVal = document.getElementById('search-exercise-input').value;
      renderExerciseLibrary(searchVal, category);
    });
  });

  // Water click tracking
  document.querySelectorAll('.btn-water-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const amt = Number(e.currentTarget.getAttribute('data-amount'));
      addWater(amt);
    });
  });
  document.getElementById('btn-water-reset').addEventListener('click', resetWater);

  // Meal buttons trigger
  document.querySelectorAll('.btn-add-food-quick').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid folding headers
      const meal = e.currentTarget.getAttribute('data-meal');
      openAddFoodModal(meal);
    });
  });
  document.getElementById('btn-save-food').addEventListener('click', saveFoodLog);

  // Weight logs actions
  document.getElementById('btn-log-weight').addEventListener('click', () => {
    const lastWeight = state.userProfile.weight || 75;
    document.getElementById('weight-log-input').value = lastWeight;
    openModal('modal-weight-logger');
  });
  document.getElementById('btn-save-weight-log').addEventListener('click', saveWeightLog);

  // Profile modal click
  document.getElementById('btn-user-profile').addEventListener('click', openUserProfileModal);
  document.getElementById('btn-save-profile').addEventListener('click', saveUserProfile);
  
  // Recalculations updates inside profile
  document.getElementById('profile-weight').addEventListener('input', triggerAutoMacrosUpdate);
  document.getElementById('profile-height').addEventListener('input', triggerAutoMacrosUpdate);
  document.getElementById('profile-gender').addEventListener('change', triggerAutoMacrosUpdate);
  document.getElementById('profile-age').addEventListener('input', triggerAutoMacrosUpdate);
  document.getElementById('profile-activity').addEventListener('change', triggerAutoMacrosUpdate);
  document.getElementById('profile-goal').addEventListener('change', triggerAutoMacrosUpdate);
  document.getElementById('profile-photo-input').addEventListener('change', () => previewImageFromInput('profile-photo-input', 'profile-photo-preview'));
  document.getElementById('input-link-personal-photo').addEventListener('change', () => previewImageFromInput('input-link-personal-photo', 'link-personal-photo-preview'));
  document.getElementById('profile-photo-input').addEventListener('change', () => previewImageFromInput('profile-photo-input', 'profile-photo-preview'));
  document.getElementById('input-link-personal-photo').addEventListener('change', () => previewImageFromInput('input-link-personal-photo', 'link-personal-photo-preview'));

  // Recalculations updates inside athlete creation
  document.getElementById('athlete-weight-input').addEventListener('input', triggerAthleteAutoCaloriesRecalc);
  document.getElementById('athlete-height-input').addEventListener('input', triggerAthleteAutoCaloriesRecalc);
  document.getElementById('athlete-gender-input').addEventListener('change', triggerAthleteAutoCaloriesRecalc);
  document.getElementById('athlete-age-input').addEventListener('input', triggerAthleteAutoCaloriesRecalc);
  document.getElementById('athlete-activity-input').addEventListener('change', triggerAthleteAutoCaloriesRecalc);
  document.getElementById('athlete-goal-input').addEventListener('change', triggerAthleteAutoCaloriesRecalc);

  // Active workout controllers
  document.getElementById('btn-minimize-workout').addEventListener('click', () => {
    document.getElementById('overlay-workout-player').classList.remove('open');
    showMiniStatusBadge('Treino minimizado. O tempo continua rodando.', 'info');
  });
  document.getElementById('btn-finish-workout').addEventListener('click', finishActiveWorkout);
  document.getElementById('btn-player-next-ex').addEventListener('click', playerNextExercise);
  document.getElementById('btn-player-prev-ex').addEventListener('click', playerPrevExercise);
  document.getElementById('btn-add-set-player').addEventListener('click', addSetToPlayerExercise);

  // Rest Timer inside player
  document.getElementById('btn-close-rest').addEventListener('click', () => {
    clearInterval(restTimerInterval);
    document.getElementById('rest-timer-box').style.display = 'none';
  });
  document.getElementById('btn-rest-add-10').addEventListener('click', () => {
    restTimerSeconds += 10;
    document.getElementById('rest-timer-countdown').innerText = restTimerSeconds;
  });
  document.getElementById('btn-rest-sub-10').addEventListener('click', () => {
    restTimerSeconds = Math.max(restTimerSeconds - 10, 0);
    document.getElementById('rest-timer-countdown').innerText = restTimerSeconds;
  });
  document.getElementById('btn-rest-toggle').addEventListener('click', (e) => {
    restTimerActive = !restTimerActive;
    e.currentTarget.innerHTML = restTimerActive ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
  });

  // Sharing buttons
  document.getElementById('btn-share-card-native').addEventListener('click', shareCardNative);
  document.getElementById('btn-download-card').addEventListener('click', downloadCardImage);
  document.getElementById('share-photo-input').addEventListener('change', handleSharePhotoInput);
  document.getElementById('btn-remove-share-photo').addEventListener('click', removeSharePhoto);

  // Exercise Library triggers
  document.getElementById('btn-open-library').addEventListener('click', () => {
    renderExerciseLibrary();
    document.getElementById('overlay-exercise-library').classList.add('open');
  });

  document.getElementById('btn-open-new-exercise').addEventListener('click', () => {
    openNewExerciseModal();
  });

  document.getElementById('btn-save-new-exercise').addEventListener('click', saveNewExercise);

  document.getElementById('btn-close-library').addEventListener('click', () => {
    document.getElementById('overlay-exercise-library').classList.remove('open');
  });

  // Team Screen Connection Triggers
  document.getElementById('btn-role-athlete').addEventListener('click', () => setTeamRole('athlete'));
  document.getElementById('btn-role-personal').addEventListener('click', () => setTeamRole('personal'));
  document.getElementById('btn-link-personal-action').addEventListener('click', linkPersonalAction);
  
  // Link/Unlink Athlete elements
  const btnUnlink = document.getElementById('btn-unlink-personal-action');
  if (btnUnlink) btnUnlink.addEventListener('click', unlinkPersonalAction);

  document.getElementById('btn-open-create-athlete-modal').addEventListener('click', () => {
    // Clear registration inputs
    document.getElementById('athlete-name-input').value = '';
    document.getElementById('athlete-email-input').value = '';
    document.getElementById('athlete-weight-input').value = '';
    document.getElementById('athlete-height-input').value = '';
    document.getElementById('athlete-calories-input').value = '';
    openModal('modal-create-athlete');
  });

  document.getElementById('btn-save-new-athlete').addEventListener('click', saveNewAthlete);
  document.getElementById('btn-send-message-action').addEventListener('click', sendFeedbackToAthlete);
}

// ==================== APP BOOTSTRAP ====================
window.addEventListener('DOMContentLoaded', async () => {
  // Initialize IndexedDB and migrate existing LocalStorage if needed
  if (window.gymflowDatabase && window.gymflowDatabase.initDatabase) {
    await window.gymflowDatabase.initDatabase();
    if (window.gymflowDatabase.migrateLocalStorageState) {
      await window.gymflowDatabase.migrateLocalStorageState();
    }
  }

  // Load database files, init storage configs
  await loadAppState();
  
  // Set up listeners triggers
  setupEventListeners();

  // Populate first loads
  if (state.currentUserEmail) {
    showAppMain();
    updateDashboard();
    updateTeamTab();
    switchTab('dashboard');
  } else {
    hideAppMain();
  }
  
  // Notifications click listener (just clear dot)
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    if (!modal.hasAttribute('aria-hidden')) {
      modal.setAttribute('aria-hidden', 'true');
    }
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const openModalEl = document.querySelector('.modal-overlay.open');
      if (openModalEl) {
        closeModal(openModalEl.id);
      }
    }
  });

  document.getElementById('btn-notifications').addEventListener('click', () => {
    const badge = document.querySelector('#btn-notifications .badge');
    if (badge) badge.style.display = 'none';
    showAppToast('Você está em dia com todos os treinos da semana! Continue focado.', 'success');
  });

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
  const loginBtn = document.getElementById('btn-login');
  if (loginBtn) loginBtn.addEventListener('click', loginUser);
  const registerBtn = document.getElementById('btn-register');
  if (registerBtn) registerBtn.addEventListener('click', registerUser);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registrado:', reg.scope))
      .catch(err => console.warn('Falha ao registrar Service Worker:', err));
  }
});
