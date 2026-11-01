// Enlaces promocionales (ej. https://royalgames.lat/?promo=FACEBOOK en un posteo): al entrar se
// guarda el código y, en cuanto hay sesión (recién registrado), se cobra (PromoCodesService en el
// backend decide si corresponde: cuentas nuevas, una vez por cuenta y por conexión).

const KEY = "royal_pending_promo";
/** El código guardado vale una semana (por si se registra unos días después de entrar por el enlace). */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Lee ?promo= de la URL, lo guarda y lo saca de la barra de direcciones. Devuelve el código o null. */
export function capturePromoFromUrl() {
  try {
    const url = new URL(window.location.href);
    const code = (url.searchParams.get("promo") || "").trim().toUpperCase();
    if (!code || !/^[A-Z0-9_-]{3,50}$/.test(code)) return null;
    localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
    url.searchParams.delete("promo");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    return code;
  } catch {
    return null;
  }
}

export function getPendingPromo() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!raw?.code || Date.now() - raw.at > MAX_AGE_MS) return null;
    return raw.code;
  } catch {
    return null;
  }
}

export function clearPendingPromo() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // sin storage: nada que borrar
  }
}
