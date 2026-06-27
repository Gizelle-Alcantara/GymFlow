const DB_NAME = 'GymFlowDB';
const DB_VERSION = 1;
const DB_STORE_STATE = 'app_state';
const DB_STORE_EXERCISES = 'custom_exercises';

let dbPromise = null;

function openGymFlowDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(DB_STORE_STATE)) {
        db.createObjectStore(DB_STORE_STATE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(DB_STORE_EXERCISES)) {
        db.createObjectStore(DB_STORE_EXERCISES, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });

  return dbPromise;
}

async function initDatabase() {
  if (!('indexedDB' in window)) {
    console.warn('IndexedDB não disponível; usando LocalStorage apenas.');
    return null;
  }

  try {
    return await openGymFlowDB();
  } catch (error) {
    console.warn('Falha ao abrir IndexedDB, fallback para LocalStorage:', error);
    dbPromise = null;
    return null;
  }
}

async function saveStateToDB(state) {
  if (!('indexedDB' in window)) return;

  try {
    const db = await openGymFlowDB();
    const tx = db.transaction(DB_STORE_STATE, 'readwrite');
    const store = tx.objectStore(DB_STORE_STATE);
    store.put({ id: 'state', data: state });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Erro ao salvar estado no IndexedDB:', error);
  }
}

async function loadStateFromDB() {
  if (!('indexedDB' in window)) return null;

  try {
    const db = await openGymFlowDB();
    const tx = db.transaction(DB_STORE_STATE, 'readonly');
    const store = tx.objectStore(DB_STORE_STATE);
    const request = store.get('state');

    return await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.data ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Erro ao carregar estado do IndexedDB:', error);
    return null;
  }
}

async function migrateLocalStorageState() {
  if (!('indexedDB' in window)) return;

  try {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (!localData) return;

    const parsed = JSON.parse(localData);
    if (!parsed) return;
    await saveStateToDB(parsed);
  } catch (error) {
    console.warn('Falha na migração do LocalStorage para IndexedDB:', error);
  }
}

window.gymflowDatabase = {
  initDatabase,
  saveStateToDB,
  loadStateFromDB,
  migrateLocalStorageState
};
