import { useRef, useState, useEffect, useMemo } from "react";
import { Box, Spinner, Center } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import axios from "axios";
import API_URL from "../../../api/rutaApi";
import { authService } from "../../../services/authService";

const TAB_ID_KEY = "rg_tab_id";

// Identificador de esta pestaña, estable al recargarla (sessionStorage) y distinto en cada
// pestaña. El juego lo manda al servidor para que un bono le pertenezca a la pestaña que lo
// disparó: el mismo jugador con el juego abierto en dos pantallas no ve el bono de una en la otra.
let fallbackTabId = null;

function getTabId() {
  try {
    let id = sessionStorage.getItem(TAB_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(TAB_ID_KEY, id);
    }
    return id;
  } catch {
    // Sin sessionStorage (bloqueado): id fijo mientras viva la página, así no cambia la URL del
    // juego entre renders. Solo se pierde el "retomar al recargar".
    if (!fallbackTabId) fallbackTabId = crypto.randomUUID();
    return fallbackTabId;
  }
}

/** 12 h: el token dura 24 h, así que un juego abierto mucho tiempo recibe uno nuevo antes de que venza. */
const GAME_TOKEN_REFRESH_MS = 12 * 60 * 60 * 1000;

/** Token de juego (POST games/session-token): el servidor identifica al jugador por este token y no
 *  por el jugadorID de la URL, que cualquiera puede cambiar. Sin sesión, el juego abre sin token. */
async function fetchGameToken() {
  if (!authService.getToken()) return "";
  try {
    const { data } = await axios.post(`${API_URL}/games/session-token`, {});
    return data?.token || "";
  } catch (error) {
    console.error("No se pudo obtener el token de juego:", error);
    return "";
  }
}

function withGameToken(src, token) {
  if (!src || !token) return src;
  return `${src}${src.includes("?") ? "&" : "?"}gameToken=${encodeURIComponent(token)}`;
}

function frameOrigin(src) {
  try {
    return new URL(src).origin;
  } catch {
    return null;
  }
}

function withTabId(src) {
  if (!src) return src;
  return `${src}${src.includes("?") ? "&" : "?"}tabId=${encodeURIComponent(getTabId())}`;
}

const HEARTBEAT_MS = 15 * 1000;
// Pestañas en segundo plano reciben timers como mucho una vez por minuto, y el celular puede
// pausarlas unos minutos sin que pase nada raro — por eso el umbral es holgado: un hueco así
// solo se explica por una suspensión real (compu dormida, celular bloqueado mucho rato).
const SUSPEND_GAP_MS = 30 * 60 * 1000;
const STALE_AFTER_MS = 6 * 60 * 60 * 1000;
const LONG_AWAY_MS = 30 * 60 * 1000;

// Un juego que quedó abierto de un día para el otro (compu suspendida, pestaña olvidada) suele
// volver roto: socket muerto, sesión vencida, estado a medias. Se recarga la página al volver,
// pero NUNCA mientras la pestaña sigue a la vista y la compu despierta: el juego vive en un
// iframe de otro origen y no podemos ver los clics de adentro, así que "visible y sin
// suspensión" es lo que tomamos como que el usuario puede estar jugando — aunque lleve 6 horas.
function useReloadWhenStale() {
  useEffect(() => {
    const openedAt = Date.now();
    let lastBeat = openedAt;
    let hiddenSince = document.visibilityState === "hidden" ? openedAt : null;
    let reloadPending = false;

    const reload = () => window.location.reload();

    const beat = setInterval(() => {
      const now = Date.now();
      if (now - lastBeat > SUSPEND_GAP_MS) {
        if (document.visibilityState === "visible") return reload();
        reloadPending = true;
      }
      lastBeat = now;
    }, HEARTBEAT_MS);

    const onVisibilityChange = () => {
      const now = Date.now();
      if (document.visibilityState === "hidden") {
        hiddenSince = now;
        return;
      }
      const suspended = now - lastBeat > SUSPEND_GAP_MS;
      const longAwayFromOldGame =
        hiddenSince !== null && now - hiddenSince >= LONG_AWAY_MS && now - openedAt >= STALE_AFTER_MS;
      hiddenSince = null;
      lastBeat = now;
      if (reloadPending || suspended || longAwayFromOldGame) reload();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(beat);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
}

// Shared wrapper for the externally-hosted game iframes (Minas, Royal Joker, Royal Pachinka,
// Bingo). We don't control those games' internal HTML/canvas, so we can't detect or resize their
// real content (different origin — the browser blocks reading cross-origin iframe dimensions).
// When a game's native pixel resolution is known (nativeWidth/nativeHeight), we can still scale
// the iframe *element itself* (a black box from CSS's point of view, no cross-origin read needed)
// with transform: scale() so the whole game always fits without clipping, letterboxed if the
// screen's aspect ratio doesn't match. Games whose native resolution isn't known yet fall back to
// the old 100%/scroll behavior.
// onBack (opcional): muestra un boton arriba a la izquierda para volver (ej. de una slot al lobby
// de Royal Slots, que vive en esta misma pagina).
export default function GameFrame({ src, title, nativeWidth, nativeHeight, onBack, backLabel = "Volver" }) {
  const wrapperRef = useRef(null);
  const scaleContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const hasFixedResolution = !!(nativeWidth && nativeHeight);
  useReloadWhenStale();
  const iframeRef = useRef(null);
  const chips = useSelector((state) => state.currentUser?.chips);
  const userId = useSelector((state) => state.currentUser?.id);

  // El primer token va en la URL; los siguientes se mandan por mensaje (cambiar la URL recargaría el
  // juego en medio de una partida).
  const [gameToken, setGameToken] = useState({ value: "", ready: false });
  // El token renovado más nuevo: si el juego cambia de URL (RoyalSlots al pasar de una tragamonedas a
  // otra) arranca con este y no con el primero, que puede estar por vencer.
  const latestTokenRef = useRef("");
  useEffect(() => {
    latestTokenRef.current = "";
    let cancelled = false;
    setGameToken({ value: "", ready: false });
    fetchGameToken().then((value) => {
      if (!cancelled) setGameToken({ value, ready: true });
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !src) return undefined;
    const origin = frameOrigin(src);
    if (!origin) return undefined;
    const timer = setInterval(async () => {
      const value = await fetchGameToken();
      if (!value) return;
      latestTokenRef.current = value;
      iframeRef.current?.contentWindow?.postMessage({ type: "royal:game-token", token: value }, origin);
    }, GAME_TOKEN_REFRESH_MS);
    return () => clearInterval(timer);
  }, [userId, src]);

  const frameSrc = useMemo(
    () => withGameToken(withTabId(src), latestTokenRef.current || gameToken.value),
    [src, gameToken.value]
  );

  // Saldo nuevo (la página lo vuelve a leer cada pocos segundos mientras se juega, ver App.jsx): se
  // le avisa al juego, que lo aplica cuando no está en medio de una jugada (RoyalChipsBridge en
  // Unity). Así, si alguien entra sin fichas y recarga por fuera, puede seguir jugando sin recargar
  // la página. El saldo no es secreto: se manda sin restringir el origen del juego.
  useEffect(() => {
    if (chips === undefined || chips === null) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "royal:chips", chips: Number(chips) }, "*");
  }, [chips]);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
    };
  }, []);

  // Game pages are meant to fill exactly the available viewport (calc(100vh - nav) or 100dvh in
  // fullscreen) — there's never legitimate content to page-scroll to. But a stray sub-pixel
  // rounding difference anywhere in the surrounding layout is enough to make the document a few
  // px taller than the viewport, which shows a page scrollbar and lets the whole game shift under
  // the nav when scrolled. Locking document scroll for as long as GameFrame is mounted (not just
  // during fullscreen) removes that possibility outright instead of chasing the exact px source.
  useEffect(() => {
    const { documentElement, body } = document;
    const prevHtmlOverflow = documentElement.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      documentElement.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  // Recompute the scale factor whenever the available space changes (window resize, entering/
  // exiting fullscreen, sidebar collapsing, etc.) so the fixed-resolution game always fits exactly.
  // Also re-runs when `src` flips from null to a real URL: the scaled container only exists in the
  // DOM once `src` is truthy (some games, like Minas, resolve it asynchronously after this effect's
  // first run), so without `src` as a dependency the observer would attach to nothing and `scale`
  // would stay stuck at its initial value once the container finally mounts.
  useEffect(() => {
    if (!hasFixedResolution || !src) return;
    const container = scaleContainerRef.current;
    if (!container) return;
    const updateScale = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      setScale(Math.min(clientWidth / nativeWidth, clientHeight / nativeHeight));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [hasFixedResolution, nativeWidth, nativeHeight, isFullscreen, src]);

  return (
    <Box
      ref={wrapperRef}
      w="100%"
      h={isFullscreen ? "100dvh" : "calc(100vh - 80px)"}
      bg="gray.900"
      display="flex"
      flexDirection="column"
    >
      {src && gameToken.ready ? (
        <Box
          ref={scaleContainerRef}
          flex="1"
          position="relative"
          w="100%"
          h="100%"
          bg="gray.800"
          overflow={hasFixedResolution ? "hidden" : "auto"}
        >
          {hasFixedResolution ? (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: nativeWidth,
                height: nativeHeight,
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformOrigin: "center center",
              }}
            >
              <iframe
                ref={iframeRef}
                src={frameSrc}
                title={title}
                scrolling="no"
                style={{ width: "100%", height: "100%", border: "none", display: "block", overflow: "hidden" }}
              />
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={frameSrc}
              title={title}
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            />
          )}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title={backLabel}
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                zIndex: 10,
                height: 36,
                padding: "0 12px 0 8px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.55)",
                color: "#C9A84C",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                arrow_back
              </span>
              {backLabel}
            </button>
          )}
        </Box>
      ) : (
        <Center h="100%">
          <Spinner size={{ base: "md", md: "xl" }} color="teal.300" />
        </Center>
      )}
    </Box>
  );
}
