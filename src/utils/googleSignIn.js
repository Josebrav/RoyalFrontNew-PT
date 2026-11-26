// Botón oficial de Google (Google Identity Services) compartido entre los modales de Entrar y Registrarse.
// GSI se inicializa UNA sola vez por página; la respuesta va al modal que mostró el botón por última vez.

let initialized = false;
let currentHandler = null;

/**
 * Renderiza el botón de Google en `el` (el elemento o una función que lo devuelve: el modal puede no estar armado todavía). El script de Google carga async: reintenta hasta ~5 s.
 * Devuelve una función para cancelar los reintentos (para el cleanup del useEffect).
 */
export function renderGoogleButton(el, onCredential) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error("[GSI] Falta VITE_GOOGLE_CLIENT_ID en el build");
    return () => {};
  }
  let cancelled = false;
  let timer;
  const getEl = typeof el === "function" ? el : () => el;
  const tryRender = (attempt = 0) => {
    if (cancelled) return;
    const gsi = window.google?.accounts?.id;
    const target = getEl();
    if (!gsi || !target) {
      if (attempt < 50) timer = setTimeout(() => tryRender(attempt + 1), 100);
      else console.error("[GSI] El script de Google Identity Services no cargó");
      return;
    }
    currentHandler = onCredential;
    if (!initialized) {
      initialized = true;
      gsi.initialize({
        client_id: clientId,
        use_fedcm_for_prompt: false,
        callback: (response) => currentHandler && currentHandler(response),
      });
    }
    gsi.renderButton(target, {
      theme: "outline",
      size: "large",
      width: target.offsetWidth || 400,
      text: "continue_with",
    });
  };
  tryRender();
  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}
