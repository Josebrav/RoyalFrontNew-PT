import { useEffect, useState } from "react";

const RETRY_MS = 4000;

/**
 * Imagen de avatar sin "avatar por defecto": si no carga, se reintenta una sola vez a los pocos
 * segundos (un 429 o un corte momentáneo se recupera solo) y, si vuelve a fallar, se muestra
 * `fallback` (ej. las iniciales del nick). Nunca reintenta en bucle.
 */
export default function AvatarImg({ src, fallback = null, ...imgProps }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [src]);

  useEffect(() => {
    if (attempt !== 1) return undefined;
    const t = setTimeout(() => setAttempt(2), RETRY_MS);
    return () => clearTimeout(t);
  }, [attempt]);

  if (!src || failed) return fallback;
  if (attempt === 1) return fallback; // esperando el reintento

  const url = attempt === 2 ? `${src}${src.includes("?") ? "&" : "?"}r=1` : src;
  return (
    <img
      {...imgProps}
      src={url}
      onError={() => (attempt === 0 ? setAttempt(1) : setFailed(true))}
    />
  );
}
