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

function DayCard({ n, day }) {
  const done = n < day;
  const today = n === day;
  const box = done
    ? "bg-gradient-to-b from-zinc-600 to-zinc-800 border-zinc-500/70"
    : today
      ? "bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 border-yellow-200 shadow-[0_0_18px_rgba(251,191,36,0.75)] scale-105"
      : "bg-gradient-to-b from-violet-600 to-indigo-800 border-violet-300/60";
  const label = today ? "bg-amber-900/80 text-amber-100" : "bg-black/45 text-white";
  const amount = today ? "text-violet-900" : "text-white";
  const unit = done ? "text-zinc-200" : today ? "text-violet-900" : "text-yellow-300";
  return (
    <div className={`relative flex flex-col items-center rounded-xl border-2 px-1 pt-1.5 pb-2 ${box}`}>
      <span className={`rounded-full px-2 py-0.5 text-[11px] sm:text-xs font-extrabold whitespace-nowrap ${label}`}>
        {t("dailyBonus.day")} {n}
      </span>
      {done && (
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-base leading-none">check</span>
        </span>
      )}
      <img src={chip} alt="" draggable={false} className={`w-10 h-10 sm:w-12 sm:h-12 my-1.5 select-none ${done ? "grayscale opacity-80" : ""}`} />
      <span className={`text-sm sm:text-base font-black leading-tight tabular-nums drop-shadow ${amount}`}>
        {AMOUNTS[n - 1].toLocaleString(NUMBER_LOCALE)}
      </span>
      <span className={`text-[11px] sm:text-xs font-extrabold leading-tight ${unit}`}>{t("dailyBonus.chips")}</span>
    </div>
  );
}

function CodePanel({ day }) {
  return (
    <div className="w-full rounded-[28px] p-[3px] bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-600 shadow-[0_0_40px_rgba(168,85,247,0.55)]">
      <div className="rounded-[25px] bg-gradient-to-b from-violet-800 via-indigo-900 to-violet-950 px-3 sm:px-5 pt-4 pb-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-300 text-4xl sm:text-5xl drop-shadow">crown</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase leading-none tracking-wide bg-gradient-to-b from-yellow-100 via-yellow-300 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_2px_0_rgba(120,53,15,0.9)]">
              {t("dailyBonus.title")}
            </h2>
          </div>
          <p className="max-w-[16rem] text-center sm:text-right text-sm sm:text-base font-extrabold text-white rounded-2xl bg-violet-950/60 border border-violet-400/50 px-3 py-2">
            {t("dailyBonus.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <DayCard key={n} n={n} day={day} />
          ))}
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
            className="mt-4 w-2/3 max-w-[322px] rounded-full p-[3px] bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-600 shadow-[0_0_22px_rgba(168,85,247,0.6)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-200"
          >
            <span className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-fuchsia-500 via-violet-600 to-indigo-700 px-4 py-3 text-white text-lg sm:text-xl font-black drop-shadow">
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
