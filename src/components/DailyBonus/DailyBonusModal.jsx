import { useRef, useState } from "react";
import axios from "axios";
import API_URL from "../../api/rutaApi";
import { playCoinSound } from "../../utils/coinSound";

import { t } from "../../i18n/strings";
import { LOCALE } from "../../i18n/locale";
import chip from "../../assets/dailyBonus/chip.png";

// Arte por idioma: dia1_en.png / botonReclamar_pt.png, etc. Si falta la version del idioma se usa la
// española (dia1.png). Con eager + import default Vite solo empaqueta las imagenes que existen.
const ART = import.meta.glob("../../assets/dailyBonus/*.png", { eager: true, import: "default" });
const art = (name) =>
  ART[`../../assets/dailyBonus/${name}_${LOCALE}.png`] ?? ART[`../../assets/dailyBonus/${name}.png`];

const DAY_IMAGES = [1, 2, 3, 4, 5, 6, 7].map((n) => art(`dia${n}`));
const botonReclamar = art("botonReclamar");

// En ingles y portugues el panel se arma con codigo (mismos colores que el arte en español) en vez de traducir
// las 7 imagenes. Montos iguales a DAILY_BONUS_AMOUNTS del backend (daily-bonus.service.ts).
const USE_CODE_PANEL = LOCALE !== "es";
const AMOUNTS = [2500, 5000, 10000, 15000, 25000, 35000, 50000];
const NUMBER_LOCALE = LOCALE === "pt" ? "pt-BR" : "en-US";

// Animaciones del panel (solo el de ingles/portugues). Con "reducir movimiento" quedan quietas.
const PANEL_CSS = `
@keyframes db-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes db-pop { 0% { transform: scale(.82); opacity: 0; } 70% { transform: scale(1.03); opacity: 1; } 100% { transform: scale(1); } }
@keyframes db-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes db-pulse { 0%, 100% { box-shadow: 0 0 14px rgba(251,191,36,.65), 0 0 0 0 rgba(253,224,71,.55); } 50% { box-shadow: 0 0 30px rgba(251,191,36,.95), 0 0 0 6px rgba(253,224,71,0); } }
@keyframes db-shine { 0% { transform: translateX(-130%) skewX(-20deg); } 60%, 100% { transform: translateX(260%) skewX(-20deg); } }
@keyframes db-twinkle { 0%, 100% { opacity: 0; transform: scale(.4) rotate(0deg); } 50% { opacity: 1; transform: scale(1) rotate(45deg); } }
@keyframes db-crown { 0%, 100% { transform: rotate(-8deg) translateY(0); } 50% { transform: rotate(8deg) translateY(-3px); } }
@keyframes db-border { to { background-position: 200% 0; } }
.db-pop { animation: db-pop .45s cubic-bezier(.2,.9,.3,1.2) both; }
.db-rays { position: absolute; left: 50%; top: 45%; width: 150%; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%, -50%);
  background: repeating-conic-gradient(from 0deg, rgba(253,224,71,.18) 0deg 9deg, transparent 9deg 22deg);
  -webkit-mask: radial-gradient(circle, #000 18%, transparent 62%); mask: radial-gradient(circle, #000 18%, transparent 62%);
  animation: db-spin 26s linear infinite; pointer-events: none; }
.db-bob { animation: db-bob 1.4s ease-in-out infinite; }
.db-today { animation: db-pulse 1.6s ease-in-out infinite; }
.db-shine { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; pointer-events: none; }
.db-shine::after { content: ""; position: absolute; top: 0; bottom: 0; width: 40%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent); animation: db-shine 2.6s ease-in-out infinite; }
.db-star { position: absolute; width: 16px; height: 16px; pointer-events: none; animation: db-twinkle 2.2s ease-in-out infinite;
  background: radial-gradient(circle, #fff 0 14%, rgba(253,230,138,.9) 15% 22%, transparent 24%),
    linear-gradient(#fde68a, #fde68a) center / 2px 100% no-repeat, linear-gradient(#fde68a, #fde68a) center / 100% 2px no-repeat; }
.db-crown { display: inline-block; animation: db-crown 2.4s ease-in-out infinite; transform-origin: 50% 90%; }
.db-frame { background: linear-gradient(90deg, #fde68a, #f59e0b, #ea580c, #fde68a, #f59e0b, #ea580c, #fde68a); background-size: 200% 100%; animation: db-border 4s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .db-pop, .db-rays, .db-bob, .db-today, .db-shine::after, .db-star, .db-crown, .db-frame { animation: none !important; }
  .db-star { opacity: .8; }
}
`;

const FILLED = { fontVariationSettings: "'FILL' 1" };

// Destellos alrededor del panel: posicion (%) y retraso de cada uno.
const STARS = [
  [3, 10, 0], [95, 8, 0.7], [1, 62, 1.3], [97, 58, 0.4], [28, -2, 1.8], [72, -1, 1.1], [50, 99, 0.9], [14, 97, 1.6], [86, 98, 0.2],
];

// Mas fichas apiladas a medida que avanzan los dias (el 7 es el regalo del gran premio).
const STACK = [1, 1, 2, 2, 3, 3, 0];

function ChipStack({ count, done }) {
  return (
    <div className="relative h-12 sm:h-14 w-14 mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <img
          key={i}
          src={chip}
          alt=""
          draggable={false}
          className={`absolute w-10 h-10 sm:w-11 sm:h-11 select-none drop-shadow-[0_3px_2px_rgba(0,0,0,0.6)] ${done ? "grayscale opacity-80" : ""}`}
          style={{ bottom: i * 6, left: `calc(50% - 20px + ${count > 1 ? (i % 2 === 0 ? -4 : 4) : 0}px)` }}
        />
      ))}
    </div>
  );
}

function DayCard({ n, day }) {
  const done = n < day;
  const today = n === day;
  const big = n === 7;
  const box = done
    ? "bg-gradient-to-b from-zinc-600 to-zinc-800 border-zinc-500/70"
    : today
      ? "db-today bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 border-yellow-100 scale-[1.07] z-[1]"
      : big
        ? "bg-gradient-to-b from-yellow-500 via-amber-600 to-orange-800 border-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.45)]"
        : "bg-gradient-to-b from-violet-500 via-violet-700 to-indigo-900 border-violet-300/60";
  const label = today ? "bg-amber-900/85 text-amber-50" : big && !done ? "bg-black/50 text-yellow-200" : "bg-black/45 text-white";
  const amount = today ? "text-violet-950" : "text-white";
  const unit = done ? "text-zinc-200" : today ? "text-violet-900" : "text-yellow-300";
  return (
    <div className={`relative flex flex-col items-center rounded-xl border-2 px-1 pt-1.5 pb-2 ${box}`}>
      {!done && <span className="db-shine" aria-hidden="true" />}
      {today && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-rose-400 to-red-600 border border-white/80 px-2 py-[1px] text-[10px] sm:text-[11px] font-black text-white tracking-wider shadow-md whitespace-nowrap">
          {t("dailyBonus.today")}
        </span>
      )}
      <span className={`rounded-full px-2 py-0.5 text-[11px] sm:text-xs font-extrabold whitespace-nowrap ${label} ${today ? "mt-1" : ""}`}>
        {t("dailyBonus.day")} {n}
      </span>
      {done && (
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center shadow">
          <span className="material-symbols-outlined text-white text-base leading-none">check</span>
        </span>
      )}
      <div className={`my-1 w-full ${today ? "db-bob" : ""}`}>
        {big ? (
          <span
            className={`material-symbols-outlined block text-center text-[44px] sm:text-[50px] leading-[48px] sm:leading-[56px] ${done ? "text-zinc-300" : today ? "text-amber-900" : "text-yellow-200 drop-shadow-[0_0_10px_rgba(253,224,71,0.9)]"}`}
            style={FILLED}
          >
            redeem
          </span>
        ) : (
          <ChipStack count={STACK[n - 1]} done={done} />
        )}
      </div>
      <span className={`text-sm sm:text-base font-black leading-tight tabular-nums drop-shadow ${amount}`}>
        {AMOUNTS[n - 1].toLocaleString(NUMBER_LOCALE)}
      </span>
      <span className={`text-[11px] sm:text-xs font-extrabold leading-tight ${unit}`}>{t("dailyBonus.chips")}</span>
      {big && !done && (
        <span className="mt-1 rounded-full bg-black/40 px-1.5 text-[9px] sm:text-[10px] font-black text-yellow-200 tracking-wide whitespace-nowrap">
          {t("dailyBonus.bigPrize")}
        </span>
      )}
    </div>
  );
}

function CodePanel({ day }) {
  return (
    <div className="relative w-full db-pop">
      <style>{PANEL_CSS}</style>
      <div className="db-rays" aria-hidden="true" />
      {STARS.map(([x, y, d], i) => (
        <span key={i} className="db-star" aria-hidden="true" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}
      <div className="db-frame relative w-full rounded-[28px] p-[3px] shadow-[0_0_44px_rgba(168,85,247,0.6)]">
        <div className="relative rounded-[25px] bg-[radial-gradient(ellipse_at_top,_#7c3aed_0%,_#3b0764_55%,_#1e1b4b_100%)] px-3 sm:px-5 pt-4 pb-5">
          <div className="flex items-center justify-center mb-5">
            <div className="flex items-center gap-2">
              <span className="db-crown material-symbols-outlined text-yellow-300 text-4xl sm:text-5xl drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]" style={FILLED}>
                crown
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase leading-none tracking-wide bg-gradient-to-b from-yellow-50 via-yellow-300 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_2px_0_rgba(120,53,15,0.9)]">
                {t("dailyBonus.title")}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-2.5 pt-2">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <DayCard key={n} n={n} day={day} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
const FLYING_CHIPS_COUNT = 7;
const FLIGHT_DURATION_MS = 650;

// Fichas volando del botón "Reclamar" hasta el contador de fichas de la nav (#nav-chips-target,
// ver Nav/nav.jsx). Son <img> position:fixed insertadas directo en el body (no React state) porque
// son puramente decorativas y se auto-destruyen solas al terminar la transición.
function flyChipsToNav(originRect) {
  const target = document.getElementById("nav-chips-target");
  if (!target) return;
  const targetRect = target.getBoundingClientRect();
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;
  const originX = originRect.left + originRect.width / 2;
  const originY = originRect.top + originRect.height / 2;

  for (let i = 0; i < FLYING_CHIPS_COUNT; i++) {
    const img = document.createElement("img");
    img.src = chip;
    img.style.position = "fixed";
    img.style.left = "0";
    img.style.top = "0";
    img.style.width = "32px";
    img.style.height = "32px";
    img.style.zIndex = "9999";
    img.style.pointerEvents = "none";
    img.style.transform = `translate(${originX - 16}px, ${originY - 16}px) scale(1)`;
    img.style.opacity = "1";
    img.style.transition = `transform ${FLIGHT_DURATION_MS}ms cubic-bezier(0.32, 0, 0.67, 0) ${i * 45}ms, opacity ${FLIGHT_DURATION_MS}ms ease-in ${i * 45}ms`;
    document.body.appendChild(img);

    const scatterX = (Math.random() - 0.5) * 60;
    const scatterY = (Math.random() - 0.5) * 40;
    requestAnimationFrame(() => {
      img.style.transform = `translate(${originX - 16 + scatterX}px, ${originY - 16 + scatterY}px) scale(1)`;
      requestAnimationFrame(() => {
        img.style.transform = `translate(${targetX - 16}px, ${targetY - 16}px) scale(0.3)`;
        img.style.opacity = "0.2";
      });
    });

    setTimeout(() => img.remove(), FLIGHT_DURATION_MS + i * 45 + 120);
  }
}

export default function DailyBonusModal({ day, onClose, onClaimed }) {
  const [claiming, setClaiming] = useState(false);
  const buttonRef = useRef(null);
  const dayImage = DAY_IMAGES[Math.min(Math.max(day, 1), 7) - 1];

  const handleClaim = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      const { data } = await axios.post(`${API_URL}/daily-bonus/claim`);
      playCoinSound();
      if (buttonRef.current) {
        flyChipsToNav(buttonRef.current.getBoundingClientRect());
      }
      setTimeout(() => {
        onClaimed?.(data);
      }, FLIGHT_DURATION_MS + FLYING_CHIPS_COUNT * 45);
    } catch (error) {
      setClaiming(false);
      onClaimed?.({ error: error?.response?.data?.message || t("dailyBonus.error") });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-[662px] flex flex-col items-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 text-white flex items-center justify-center cursor-pointer hover:bg-surface-variant transition-colors"
          aria-label={t("dailyBonus.close")}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {USE_CODE_PANEL ? (
          <CodePanel day={Math.min(Math.max(day, 1), 7)} />
        ) : (
          <img src={dayImage} alt={`${t("dailyBonus.title")} - ${t("dailyBonus.day")} ${day}`} className="w-full select-none" draggable={false} />
        )}

        {USE_CODE_PANEL ? (
          <button
            ref={buttonRef}
            type="button"
            onClick={handleClaim}
            disabled={claiming}
            className="db-frame db-today mt-5 w-2/3 max-w-[322px] rounded-full p-[3px] shadow-[0_0_22px_rgba(168,85,247,0.6)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-200"
          >
            <span className="relative overflow-hidden flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-fuchsia-500 via-violet-600 to-indigo-700 px-4 py-3 text-white text-lg sm:text-xl font-black drop-shadow">
              <span className="db-shine" aria-hidden="true" />
              <span className="material-symbols-outlined text-2xl">redeem</span>
              {t("dailyBonus.claim")}!
            </span>
          </button>
        ) : (
          <button
            ref={buttonRef}
            type="button"
            onClick={handleClaim}
            disabled={claiming}
            className="mt-0 w-2/3 max-w-[322px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-95"
          >
            <img src={botonReclamar} alt={t("dailyBonus.claim")} className="w-full select-none" draggable={false} />
          </button>
        )}
      </div>
    </div>
  );
}
