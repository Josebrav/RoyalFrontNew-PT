import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { t } from "../../i18n/strings";

/**
 * Tutorial de "NUEVO!" para las misiones.
 *
 * Es un tour por pasos (coach marks) en vez de una tarjeta con botón:
 *  1. Resalta el botón "Misiones" del menú lateral.
 *  2. Ya en /misiones, explica las misiones diarias.
 *  3. Explica las misiones semanales.
 *
 * - Se muestra una sola vez por navegador (localStorage al terminar o saltar).
 * - Solo para jugadores con sesión: /misiones requiere cuenta.
 * - No aparece dentro de los juegos (iframes a pantalla completa).
 * - En mobile no hay menú lateral, así que el paso 1 se muestra centrado y
 *   "Siguiente" lleva directo a /misiones.
 */
const TOUR_KEY = "missions:tour:v1";
const TOUR_DELAY_MS = 2600;
const SPOT_PAD = 8;
const TIP_GAP = 16;
const TIP_MARGIN = 12;

const STEPS = [
  {
    id: "sidebar",
    target: 'aside a[href="/misiones"]',
    icon: "flag",
    accent: "#e6c364",
    title: "missions.tour.step1.title",
    body: "missions.tour.step1.body",
    bodyMobile: "missions.tour.step1.bodyMobile",
    scroll: false,
  },
  {
    id: "daily",
    target: '[data-tour="missions-daily"]',
    icon: "today",
    accent: "#06b6d4",
    title: "missions.tour.step2.title",
    body: "missions.tour.step2.body",
    scroll: true,
  },
  {
    id: "weekly",
    target: '[data-tour="missions-weekly"]',
    icon: "date_range",
    accent: "#a855f7",
    title: "missions.tour.step3.title",
    body: "missions.tour.step3.body",
    scroll: true,
  },
];

const wasTourSeen = () => {
  try {
    return localStorage.getItem(TOUR_KEY) === "1";
  } catch {
    return false;
  }
};

const markTourSeen = () => {
  try {
    localStorage.setItem(TOUR_KEY, "1");
  } catch {
    // sin localStorage (modo privado) el tour puede volver a salir en la próxima visita
  }
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

/** Mediodía: busca el elemento del paso y devuelve su rectángulo en pantalla. */
function useTargetRect(selector, enabled) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    setRect(null);
    if (!enabled || !selector) return undefined;

    let cancelled = false;
    let timer = null;

    const measure = () => {
      const el = document.querySelector(selector);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return false;
      if (cancelled) return true;
      setRect((prev) => {
        const next = {
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
          right: r.right,
          bottom: r.bottom,
        };
        if (
          prev &&
          Math.abs(prev.top - next.top) < 0.5 &&
          Math.abs(prev.left - next.left) < 0.5 &&
          Math.abs(prev.width - next.width) < 0.5 &&
          Math.abs(prev.height - next.height) < 0.5
        ) {
          return prev;
        }
        return next;
      });
      return true;
    };

    // La sección de misiones aparece recién cuando llega la respuesta de la API.
    const startedAt = Date.now();
    const poll = () => {
      if (cancelled) return;
      if (measure()) return;
      if (Date.now() - startedAt < 8000) timer = setTimeout(poll, 120);
    };
    poll();

    const onMove = () => measure();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [selector, enabled]);

  return rect;
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia("(min-width: 768px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (event) => setDesktop(event.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return desktop;
}

/** Ubica el globo al costado del elemento resaltado, o centrado si no hay elemento. */
function computePlacement(rect, tipW, tipH) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (!rect) {
    return {
      left: (vw - tipW) / 2,
      top: clamp(vh / 2 - tipH / 2, TIP_MARGIN, vh - tipH - TIP_MARGIN),
      side: "none",
    };
  }

  const fitsRight = vw - rect.right >= tipW + TIP_GAP + TIP_MARGIN;
  const fitsLeft = rect.left >= tipW + TIP_GAP + TIP_MARGIN;
  const fitsAbove = rect.top >= tipH + TIP_GAP + TIP_MARGIN;
  const fitsBelow = vh - rect.bottom >= tipH + TIP_GAP + TIP_MARGIN;

  // Elementos angostos (el botón del menú lateral): globo al costado.
  if (rect.width < 340) {
    if (fitsRight) {
      return {
        left: rect.right + TIP_GAP,
        top: clamp(rect.top + rect.height / 2 - tipH / 2, TIP_MARGIN, vh - tipH - TIP_MARGIN),
        side: "right",
      };
    }
    if (fitsLeft) {
      return {
        left: rect.left - TIP_GAP - tipW,
        top: clamp(rect.top + rect.height / 2 - tipH / 2, TIP_MARGIN, vh - tipH - TIP_MARGIN),
        side: "left",
      };
    }
  }

  // Secciones anchas (diarias / semanales): arriba o abajo del bloque.
  if (fitsAbove) {
    return {
      left: clamp(rect.left + rect.width / 2 - tipW / 2, TIP_MARGIN, vw - tipW - TIP_MARGIN),
      top: rect.top - TIP_GAP - tipH,
      side: "above",
    };
  }
  if (fitsBelow) {
    return {
      left: clamp(rect.left + rect.width / 2 - tipW / 2, TIP_MARGIN, vw - tipW - TIP_MARGIN),
      top: rect.bottom + TIP_GAP,
      side: "below",
    };
  }

  // Sin espacio libre: se apoya sobre el borde superior del bloque resaltado.
  return {
    left: clamp(rect.left + rect.width / 2 - tipW / 2, TIP_MARGIN, vw - tipW - TIP_MARGIN),
    top: clamp(rect.top + 56, TIP_MARGIN, vh - tipH - TIP_MARGIN),
    side: "none",
  };
}

function arrowStyle(side, rect, position, tipW, tipH) {
  const SIZE = 8;
  const base = { width: 0, height: 0, borderStyle: "solid", borderWidth: SIZE, borderColor: "transparent" };

  if (side === "right" || side === "left") {
    const top = clamp(rect.top + rect.height / 2 - position.top, 18, tipH - 18);
    return side === "right"
      ? { ...base, left: -SIZE, top: top - SIZE, borderRightWidth: 0, borderLeftColor: "#424242" }
      : { ...base, right: -SIZE, top: top - SIZE, borderLeftWidth: 0, borderRightColor: "#424242" };
  }

  if (side === "above" || side === "below") {
    const left = clamp(rect.left + rect.width / 2 - position.left, 18, tipW - 18);
    return side === "above"
      ? { ...base, top: -SIZE, left: left - SIZE, borderTopWidth: 0, borderBottomColor: "#424242" }
      : { ...base, bottom: -SIZE, left: left - SIZE, borderBottomWidth: 0, borderTopColor: "#424242" };
  }

  return null;
}

export default function MissionsTour() {
  const currentUser = useSelector((state) => state.currentUser);
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const startedRef = useRef(false);
  const scrolledStepRef = useRef(null);
  const tipRef = useRef(null);
  const [tipSize, setTipSize] = useState({ width: 320, height: 200 });

  const current = STEPS[step];
  const rect = useTargetRect(current?.target, active);

  // Arranca una sola vez, un rato después de que el jugador tenga sesión.
  useEffect(() => {
    if (!currentUser?.id) {
      setActive(false);
      startedRef.current = false;
      return undefined;
    }
    if (startedRef.current || wasTourSeen()) return undefined;
    if (location.pathname.includes("/game")) return undefined;

    startedRef.current = true;
    const timer = setTimeout(() => {
      setStep(location.pathname === "/misiones" ? 1 : 0);
      setActive(true);
    }, TOUR_DELAY_MS);
    return () => clearTimeout(timer);
    // Solo depende de la sesión: el tour no debe reiniciarse al navegar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // Si cierra sesión o entra a un juego, el tour se oculta.
  useEffect(() => {
    if (!active) return;
    if (!currentUser?.id || location.pathname.includes("/game")) setActive(false);
  }, [active, currentUser?.id, location.pathname]);

  // Si el jugador toca el botón resaltado (o navega solo) ya está en /misiones: pasa al paso 2.
  useEffect(() => {
    if (active && step === 0 && location.pathname === "/misiones") setStep(1);
  }, [active, step, location.pathname]);

  // Si abandona /misiones en los pasos de la página, se corta el tour.
  useEffect(() => {
    if (active && step > 0 && location.pathname !== "/misiones" && !location.pathname.includes("/game")) {
      setActive(false);
    }
  }, [active, step, location.pathname]);

  // Lleva el bloque resaltado a la vista una sola vez por paso.
  useEffect(() => {
    if (!active || !rect || !current?.scroll) return;
    if (scrolledStepRef.current === step) return;
    const el = document.querySelector(current.target);
    if (!el) return;
    scrolledStepRef.current = step;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [active, rect, current, step]);

  // Mide el globo real para ubicarlo sin que se salga de la pantalla.
  useLayoutEffect(() => {
    const el = tipRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTipSize((prev) =>
      Math.abs(prev.width - r.width) > 0.5 || Math.abs(prev.height - r.height) > 0.5
        ? { width: r.width, height: r.height }
        : prev
    );
  }, [step, rect]);

  const finish = useCallback(() => {
    markTourSeen();
    setActive(false);
  }, []);

  // Escape también cierra el tutorial.
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish]);

  if (!active) return null;

  const isLast = step === STEPS.length - 1;
  const position = computePlacement(rect, tipSize.width, tipSize.height);
  const arrow = rect ? arrowStyle(position.side, rect, position, tipSize.width, tipSize.height) : null;
  const body = step === 0 && !isDesktop ? t(current.bodyMobile) : t(current.body);

  const next = () => {
    if (isLast) {
      finish();
      return;
    }
    if (step === 0) {
      if (location.pathname !== "/misiones") navigate("/misiones");
      setStep(1);
      return;
    }
    if (location.pathname !== "/misiones") navigate("/misiones");
    setStep(step + 1);
  };

  return createPortal(
    <>
      {/* Fondo oscurecido con un "hueco" sobre el elemento del paso. */}
      {rect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[90] rounded-2xl border-2"
          style={{
            top: rect.top - SPOT_PAD,
            left: rect.left - SPOT_PAD,
            width: rect.width + SPOT_PAD * 2,
            height: rect.height + SPOT_PAD * 2,
            borderColor: `${current.accent}cc`,
            boxShadow: `0 0 0 9999px rgba(5, 5, 10, 0.78), 0 0 28px ${current.accent}80`,
            transition: "top 220ms ease, left 220ms ease, width 220ms ease, height 220ms ease",
          }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 z-[90] bg-[rgba(5,5,10,0.78)]" />
      )}

      <div
        ref={tipRef}
        role="dialog"
        aria-label={t(current.title)}
        className="fixed z-[91] w-80 max-w-[calc(100vw-2rem)] rounded-2xl border bg-surface-container-high/95 p-4 shadow-2xl backdrop-blur-md"
        style={{
          left: position.left,
          top: position.top,
          borderColor: `${current.accent}88`,
          boxShadow: `0 0 24px ${current.accent}45`,
          transition: "left 220ms ease, top 220ms ease",
        }}
      >
        {arrow && <span aria-hidden="true" style={{ position: "absolute", ...arrow }} />}

        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest ${
              step === 0 ? "gold-gradient text-[#0A0A0F]" : "text-white"
            }`}
            style={step === 0 ? undefined : { background: `linear-gradient(135deg, ${current.accent}, ${current.accent}b3)` }}
          >
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {current.icon}
            </span>
            {step === 0 ? t("missions.tour.badge") : t("missions.tour.section")}
          </span>
          <span className="text-[10px] font-bold tabular-nums text-on-surface-variant">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <h3 className="mt-2 text-base font-bold leading-tight text-white">{t(current.title)}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">{body}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={finish}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant hover:text-white"
          >
            {t("missions.tour.skip")}
          </button>
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1 rounded-lg gold-gradient px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#0A0A0F] gold-glow cursor-pointer border-0 hover:brightness-110 active:scale-95 transition-all"
          >
            {isLast ? t("missions.tour.finish") : t("missions.tour.next")}
            <span className="material-symbols-outlined text-[16px]">
              {isLast ? "check" : "arrow_forward"}
            </span>
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
