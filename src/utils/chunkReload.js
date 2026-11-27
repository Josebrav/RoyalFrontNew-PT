// Despues de publicar una version nueva, una pestaña abierta con la version vieja busca archivos
// (assets/xxx-HASH.js) que ya no existen y aparece "Failed to fetch dynamically imported module".
// En ese caso se recarga la pagina UNA vez (si vuelve a fallar dentro de 30 s, se muestra el error).

const KEY = "chunkReloadAt";

export function isChunkLoadError(err) {
  const msg = String(err?.message || err || "");
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Loading chunk \d+ failed/i.test(msg);
}

/** Recarga si no se recargo recien por lo mismo. Devuelve true si va a recargar. */
export function reloadOnceForNewVersion() {
  let last = 0;
  try { last = Number(sessionStorage.getItem(KEY) || 0); } catch { /* sin sessionStorage */ }
  if (Date.now() - last < 30000) return false;
  try { sessionStorage.setItem(KEY, String(Date.now())); } catch { /* sin sessionStorage */ }
  window.location.reload();
  return true;
}
