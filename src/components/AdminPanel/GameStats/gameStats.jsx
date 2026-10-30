import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API_URL from "../../../api/rutaApi";

const PERIODS = [
  { days: 1, label: "24 h" },
  { days: 7, label: "7 días" },
  { days: 30, label: "30 días" },
  { days: 90, label: "90 días" },
  { days: 0, label: "Todo" },
];

const fmt = (v) => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(Math.round(v || 0));
const pct = (v) => (v == null ? "—" : `${v.toFixed(1)}%`);

// RTP real vs. el calibrado: verde si está cerca, ámbar si se va 5+ puntos, rojo si paga más del 100%
// (la casa pierde) o se aleja 10+ puntos del objetivo.
function rtpTone(rtp, target) {
  if (rtp == null) return "text-on-surface-variant";
  if (rtp > 100) return "text-error";
  if (target != null) {
    const diff = Math.abs(rtp - target);
    if (diff >= 10) return "text-error";
    if (diff >= 5) return "text-amber-400";
  }
  return "text-green-400";
}

// Gráfico de RTP por día (pagado / apostado de ese día) con la línea del 100% y la del objetivo.
function RtpChart({ daily, target }) {
  const points = daily.filter((d) => d.wagered > 0).map((d) => ({ day: d.day, rtp: (d.paid / d.wagered) * 100 }));
  if (points.length < 2) {
    return <p className="text-xs text-on-surface-variant py-6 text-center">Hacen falta al menos 2 días con apuestas para el gráfico.</p>;
  }
  const W = 600, H = 160, padL = 40, padR = 10, padT = 10, padB = 22;
  const maxY = Math.max(120, ...points.map((p) => p.rtp), target || 0);
  const x = (i) => padL + (i * (W - padL - padR)) / (points.length - 1);
  const y = (v) => padT + (1 - v / maxY) * (H - padT - padB);
  const ticks = [0, 50, 100, maxY > 150 ? Math.round(maxY) : null].filter((t) => t != null);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.rtp).toFixed(1)}`).join(" ");
  const labelEvery = Math.ceil(points.length / 7);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="RTP por día">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="currentColor" className="text-outline-variant/20" />
          <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="currentColor" className="text-on-surface-variant">{t}%</text>
        </g>
      ))}
      <line x1={padL} x2={W - padR} y1={y(100)} y2={y(100)} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity="0.7" />
      {target != null && (
        <line x1={padL} x2={W - padR} y1={y(target)} y2={y(target)} stroke="#4caf7d" strokeDasharray="2 4" strokeOpacity="0.8" />
      )}
      <path d={path} fill="none" stroke="#e6c364" strokeWidth="2" />
      {points.map((p, i) => (
        <g key={p.day}>
          <circle cx={x(i)} cy={y(p.rtp)} r="3" fill="#e6c364">
            <title>{`${p.day}: ${p.rtp.toFixed(1)}%`}</title>
          </circle>
          {i % labelEvery === 0 && (
            <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="currentColor" className="text-on-surface-variant">
              {p.day.slice(5)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function Stat({ label, value, className = "" }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</span>
      <span className={`font-bold tabular-nums ${className}`}>{value}</span>
    </div>
  );
}

export default function AdminGameStats() {
  const navigate = useNavigate();
  const viewerIsAdmin = useSelector((state) => state.currentUser?.role) === "admin";
  const [days, setDays] = useState(7);
  const [includeBots, setIncludeBots] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (!viewerIsAdmin) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    axios
      .get(`${API_URL}/admin/game-stats`, { params: { days, includeBots } })
      .then(({ data }) => !cancelled && setData(data))
      .catch((e) => !cancelled && setError(e.response?.status === 403 ? "Solo administradores." : "No se pudieron cargar las estadísticas."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [days, includeBots, viewerIsAdmin]);

  if (!viewerIsAdmin) {
    return (
      <div className="bg-background text-on-background min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">lock</span>
          <h2 className="font-headline-md text-headline-md text-white mb-2">Acceso Restringido</h2>
          <p className="text-on-surface-variant text-sm">Las estadísticas de juegos son solo para administradores.</p>
        </div>
      </div>
    );
  }

  const totals = data?.totals;

  return (
    <div className="bg-background text-on-background min-h-screen pt-20 pb-12">
      <div className="px-margin-desktop max-w-container-max mx-auto">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">Estadísticas de Juegos</h1>
            <p className="text-on-surface-variant font-body-sm">
              Cuánto se apuesta y cuánto paga cada juego. RTP = pagado / apostado.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-6 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface font-label-lg hover:bg-surface-variant/20 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Volver al Panel
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex rounded-xl overflow-hidden border border-outline-variant/30">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                onClick={() => setDays(p.days)}
                className={`px-4 py-2 text-sm font-bold transition-colors border-0 cursor-pointer ${
                  days === p.days ? "bg-primary text-black" : "bg-surface-container-high text-on-surface hover:bg-surface-variant/40"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
            <input id="game-stats-bots" type="checkbox" checked={includeBots} onChange={(e) => setIncludeBots(e.target.checked)} />
            Incluir bots
          </label>
        </div>

        {totals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              ["Total apostado", fmt(totals.wagered), "text-white"],
              ["Total pagado", fmt(totals.paid), "text-white"],
              ["Ganancia de la casa", fmt(totals.profit), totals.profit >= 0 ? "text-green-400" : "text-error"],
              ["RTP general", pct(totals.rtp), rtpTone(totals.rtp, null)],
            ].map(([label, value, cls]) => (
              <div key={label} className="bg-surface-container-high px-6 py-4 rounded-xl border border-outline-variant/20 flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-primary">{label}</span>
                <span className={`font-headline-md text-headline-md tabular-nums ${cls}`}>{value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-on-surface-variant">Calculando estadísticas...</span>
            </div>
          ) : error ? (
            <p className="p-12 text-center text-error">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high border-b border-outline-variant/30 text-xs">
                    {["Juego", "Jugadas", "Jugadores", "Apostado", "Pagado", "Ganancia casa", "RTP real", "RTP objetivo", ""].map((h, i) => (
                      <th key={i} className={`px-4 py-3 font-label-lg text-primary uppercase tracking-wider ${i > 0 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {data?.games.map((g) => {
                    const isOpen = open === g.slug;
                    return [
                      <tr
                        key={g.slug}
                        onClick={() => setOpen(isOpen ? null : g.slug)}
                        className="hover:bg-surface-variant/20 transition-colors cursor-pointer text-sm"
                      >
                        <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                          {g.name}
                          {g.trackingSince == null && g.plays === 0 && ["santawilds", "sugarcalavera", "gemasofgold", "royal-joker", "royal-pachinka"].includes(g.slug) && (
                            <span className="block text-[10px] font-normal text-on-surface-variant">Registrando desde hoy</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{fmt(g.plays)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{fmt(g.players)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{fmt(g.wagered)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{fmt(g.paid)}</td>
                        <td className={`px-4 py-3 text-right tabular-nums font-bold ${g.profit >= 0 ? "text-green-400" : "text-error"}`}>{fmt(g.profit)}</td>
                        <td className={`px-4 py-3 text-right tabular-nums font-bold ${rtpTone(g.rtp, g.targetRtp)}`}>{pct(g.rtp)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-on-surface-variant">{g.targetRtp != null ? `${g.targetRtp}%` : "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{isOpen ? "expand_less" : "expand_more"}</span>
                        </td>
                      </tr>,
                      isOpen && (
                        <tr key={`${g.slug}-detail`} className="bg-surface-container-low">
                          <td colSpan={9} className="px-4 py-5">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5 text-sm">
                              <Stat label="Apuesta promedio" value={fmt(g.avgBet)} />
                              <Stat label="Apuesta máxima" value={fmt(g.maxBet)} />
                              <Stat label="Premios entregados" value={fmt(g.winCount)} />
                              <Stat label="% jugadas con premio" value={g.plays ? pct((g.winCount / g.plays) * 100) : "—"} />
                              <Stat label="Premio más grande" value={fmt(g.maxWin)} className="text-primary" />
                            </div>
                            <div className="grid md:grid-cols-[2fr_1fr] gap-6">
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                                  RTP por día <span className="text-[#e6c364]">●</span> real · <span className="text-[#ef4444]">- -</span> 100%
                                  {g.targetRtp != null && <> · <span className="text-[#4caf7d]">··</span> objetivo</>}
                                </p>
                                <RtpChart daily={g.daily} target={g.targetRtp} />
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Jugadores que más ganaron</p>
                                {g.topWinners.length === 0 ? (
                                  <p className="text-xs text-on-surface-variant">Sin datos.</p>
                                ) : (
                                  <ul className="flex flex-col gap-1.5 text-sm">
                                    {g.topWinners.map((w) => (
                                      <li key={w.nick} className="flex justify-between gap-3">
                                        <button
                                          onClick={() => navigate(`/perfil/${w.nick}`)}
                                          className="text-white hover:text-primary bg-transparent border-0 p-0 cursor-pointer truncate"
                                        >
                                          {w.nick}
                                        </button>
                                        <span className={`tabular-nums font-bold ${w.profit >= 0 ? "text-error" : "text-green-400"}`} title={`Apostó ${fmt(w.wagered)} · cobró ${fmt(w.paid)}`}>
                                          {w.profit >= 0 ? "+" : ""}{fmt(w.profit)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ),
                    ];
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-on-surface-variant mt-4 leading-relaxed max-w-3xl">
          Minas, Ruleta y Bingo tienen historial completo. Los slots y Pachinko empezaron a registrar apuestas el 29/10/2026,
          así que sus números cuentan desde ahí. Domino no aparece porque es jugador contra jugador (el pozo pasa de un jugador a otro).
          En Bingo, los cartones de bots también suman a los pozos, por eso el RTP de los jugadores puede pasar del 100%.
          Con pocas jugadas el RTP varía mucho; se vuelve confiable con miles de jugadas.
        </p>
      </div>
    </div>
  );
}
