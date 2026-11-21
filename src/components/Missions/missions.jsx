import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useMissions, { resetDate, timeLeft } from "../../utils/useMissions";
import MissionItem from "./missionItem";

// Color de cada seccion: diarias turquesa/azul, semanales violeta/fucsia.
const SECTION_THEME = {
  daily: { from: "#06b6d4", to: "#3b82f6", glow: "rgba(6,182,212,0.22)", bg: "linear-gradient(180deg, rgba(6,182,212,0.12), rgba(13,15,31,0.6) 45%)" },
  weekly: { from: "#a855f7", to: "#ec4899", glow: "rgba(168,85,247,0.24)", bg: "linear-gradient(180deg, rgba(168,85,247,0.14), rgba(13,15,31,0.6) 45%)" },
};

function Section({ title, icon, period, now, theme, tourId }) {
  if (!period) return null;
  const c = SECTION_THEME[theme];
  return (
    <section
      data-tour={tourId}
      className="rounded-2xl border p-5 mb-6"
      style={{ borderColor: `${c.from}55`, background: c.bg, boxShadow: `0 0 26px ${c.glow}` }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span
            className="w-9 h-9 rounded-xl inline-flex items-center justify-center material-symbols-outlined text-[20px] text-white"
            style={{ fontVariationSettings: "'FILL' 1", background: `linear-gradient(135deg, ${c.from}, ${c.to})`, boxShadow: `0 0 14px ${c.from}88` }}
          >
            {icon}
          </span>
          {title}
        </h2>
        <span
          className="text-xs text-on-surface-variant flex items-center gap-1 rounded-full px-3 py-1 border"
          style={{ borderColor: `${c.from}44`, background: `${c.from}14` }}
          title={resetDate(period.resetsAt)}
        >
          <span className="material-symbols-outlined text-[16px]" style={{ color: c.from }}>schedule</span>
          <span>
            Se renuevan en <b className="text-white">{timeLeft(period.resetsAt, now)}</b>
            <span className="hidden sm:inline"> · {resetDate(period.resetsAt)}</span>
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {period.missions.map((m) => (
          <MissionItem key={m.id} mission={m} />
        ))}
      </div>
    </section>
  );
}

/** Página /misiones: misiones diarias y semanales con su progreso y el cobro de fichas. */
export default function Missions() {
  const { currentUser } = useSelector((state) => state);
  const { data, error } = useMissions(currentUser?.id);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen pt-20 pb-16">
      <div className="px-4 md:px-margin-desktop max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
            <span
              className="w-12 h-12 rounded-2xl inline-flex items-center justify-center material-symbols-outlined text-[28px] text-white bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] shadow-[0_0_20px_rgba(236,72,153,0.5)]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              flag
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe08f] via-[#f9a8d4] to-[#7dd3fc]">Misiones</span>
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-2xl">
            Cumplí las misiones jugando y cobrá fichas gratis. Las diarias cambian todos los días a la medianoche
            (hora de Argentina) y las semanales cada lunes a la misma hora.
            Si no cobrás una misión cumplida antes de que se renueve, se pierde.
          </p>
        </header>

        {error && <p className="text-error mb-4">{error}</p>}
        {!data && !error && (
          <div className="h-24 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        {data && (
          <>
            <Section title="Misiones diarias" icon="today" period={data.daily} now={now} theme="daily" tourId="missions-daily" />
            <Section title="Misiones semanales" icon="date_range" period={data.weekly} now={now} theme="weekly" tourId="missions-weekly" />
          </>
        )}
      </div>
    </div>
  );
}
