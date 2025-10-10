// src/utils/favs.js

const PROJECTS_KEY = 'favs';
const SUBSIDIES_KEY = 'favs_subsidios';

// --- Funciones Genéricas ---
function readArray(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeArray(key, arr) {
  localStorage.setItem(key, JSON.stringify([...new Set(arr)])); // Usa Set para evitar duplicados
}

function toggleItem(key, id) {
    const arr = readArray(key);
    const index = arr.findIndex(x => String(x) === String(id));
    if (index >= 0) {
        arr.splice(index, 1);
    } else {
        arr.push(id);
    }
    writeArray(key, arr);
    notifyFavsChanged();
}

// --- Funciones para Proyectos ---
export function getProjectFavs() {
  return new Set(readArray(PROJECTS_KEY));
}
export function toggleProjectFav(id) {
  toggleItem(PROJECTS_KEY, id);
}

// --- Funciones para Subsidios (LAS QUE FALTABAN) ---
export function getSubsidyFavs() {
  return new Set(readArray(SUBSIDIES_KEY));
}
export function toggleSubsidyFav(id) {
  toggleItem(SUBSIDIES_KEY, id);
}

// --- Funciones Generales ---
export function getFavCounts() {
  const p = readArray(PROJECTS_KEY).length;
  const s = readArray(SUBSIDIES_KEY).length;
  return { projects: p, subsidies: s, total: p + s };
}

export function notifyFavsChanged() {
  // Notifica a toda la aplicación que los favoritos cambiaron
  window.dispatchEvent(new CustomEvent('favsChanged'));
}