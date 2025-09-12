export function getFavCounts() {
  let p = 0, s = 0;
  try {
    const arr = JSON.parse(localStorage.getItem("favs") || "[]");
    p = Array.isArray(arr) ? arr.length : 0;
  } catch {}
  try {
    const arr = JSON.parse(localStorage.getItem("favs_subsidios") || "[]");
    s = Array.isArray(arr) ? arr.length : 0;
  } catch {}
  return { projects: p, subsidies: s, total: p + s };
}

export function notifyFavsChanged() {
  // Notifica cambios dentro del mismo tab
  window.dispatchEvent(new CustomEvent("favs:changed"));
}
