import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_URL from "../../../api/rutaApi";
import { RANK_META } from "../../../utils/rank";
import { activityLabel, timeAgo } from "../../../utils/activityLabel";

const fmt = (n) => new Intl.NumberFormat("es-ES").format(n || 0);
const pctOf = (part, total) => (total ? `${Math.round((part / total) * 100)}%` : "—");

function Stat({ label, value, hint }) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/10 rounded-lg p-4">
      <p className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="font-headline-sm text-headline-sm text-on-surface mt-1 tabular-nums">{value}</p>
      {hint && <p className="text-[0.6875rem] text-on-surface-variant mt-0.5">{hint}</p>}
    </div>
  );
}

// Barras de registros por dia (ultimos 14 dias).
function SignupBars({ days }) {
  const max = Math.max(1, ...days.map((d) => d.signups));
  return (
    <div className="flex items-end gap-1.5 h-36 pt-4">
      {days.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1 min-w-0" title={`${d.day}: ${d.signups} registros`}>
          <span className="text-[0.625rem] text-on-surface-variant tabular-nums">{d.signups || ""}</span>
          <div className="w-full rounded-t bg-primary/80" style={{ height: `${Math.max(2, (d.signups / max) * 96)}px` }} />
          <span className="text-[0.5625rem] text-on-surface-variant">{d.day.slice(8)}</span>
        </div>
      ))}
    </div>
  );
}

/** Estadisticas de usuarios del panel (GET admin/stats/users). */
const UserInsights = ({ includeBots, viewerIsAdmin }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      axios
        .get(`${API_URL}/admin/stats/users`, { params: { includeBots } })
        .then((res) => !cancelled && (setData(res.data), setError(false)))
        .catch(() => !cancelled && setError(true));
    load();
    const t = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [includeBots]);

  if (error && !data) return <p className="text-error text-sm mt-8">No se pudieron cargar las estadísticas de usuarios.</p>;
  if (!data) return null;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-headline-md text-headline-md text-on-surface">Usuarios</h2>
        <Link to="/admin/online" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-[1.1rem]">radar</span>
          Ver quién está en línea
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Stat label="En línea" value={fmt(data.onlineNow)} />
        <Stat label="Activos 24 h" value={fmt(data.active24h)} hint={pctOf(data.active24h, data.total)} />
        <Stat label="Activos 7 días" value={fmt(data.active7d)} hint={pctOf(data.active7d, data.total)} />
        <Stat label="Activos 30 días" value={fmt(data.active30d)} hint={pctOf(data.active30d, data.total)} />
        <Stat label="Sin entrar +30 días" value={fmt(data.dormant)} hint={pctOf(data.dormant, data.total)} />
        <Stat label="Registros hoy" value={fmt(data.signupsToday)} />
        <Stat label="Registros 7 días" value={fmt(data.signups7d)} />
        <Stat label="Registros 30 días" value={fmt(data.signups30d)} />
        <Stat label="Con Google" value={fmt(data.googleAccounts)} hint={pctOf(data.googleAccounts, data.total)} />
        <Stat label="Con email" value={fmt(data.emailAccounts)} hint={pctOf(data.emailAccounts, data.total)} />
        <Stat label="Llegaron referidos" value={fmt(data.referred)} hint={pctOf(data.referred, data.total)} />
        {viewerIsAdmin && <Stat label="Compraron fichas" value={fmt(data.payers)} hint={pctOf(data.payers, data.total)} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-5 lg:col-span-2">
          <h4 className="font-headline-sm text-headline-sm text-on-surface">Registros por día</h4>
          <p className="text-xs text-on-surface-variant">Últimos 14 días</p>
          <SignupBars days={data.signupsByDay} />
        </div>
        <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-5">
          <h4 className="font-headline-sm text-headline-sm text-on-surface mb-3">Dónde están ahora</h4>
          {data.onlineByActivity.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Nadie conectado en este momento.</p>
          ) : (
            <ul className="space-y-2">
              {data.onlineByActivity.map((a) => {
                const act = activityLabel(a.activity || null);
                return (
                  <li key={a.activity} className="flex justify-between text-sm">
                    <span className={act.isGame ? "text-primary font-bold" : "text-on-surface"}>{act.label === "—" ? "Sin dato" : act.label}</span>
                    <span className="tabular-nums text-on-surface">{a.count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-5">
          <h4 className="font-headline-sm text-headline-sm text-on-surface mb-3">Últimos registrados</h4>
          <ul className="space-y-2 max-h-[360px] overflow-y-auto">
            {data.recentSignups.map((u) => (
              <li key={u.id} className="flex justify-between gap-2 text-sm">
                <span className="min-w-0 truncate">
                  <Link to={`/perfil/${encodeURIComponent(u.nick)}`} className="font-bold text-on-surface hover:text-primary">{u.nick}</Link>
                  <span className="ml-2 text-[0.625rem] uppercase text-on-surface-variant">
                    {u.isGoogle ? "Google" : "Email"}{u.isReferred ? " · referido" : ""}{u.signupCountry ? ` · ${u.signupCountry}` : ""}
                  </span>
                </span>
                <span className="text-on-surface-variant flex-shrink-0">{timeAgo(u.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-5">
          <h4 className="font-headline-sm text-headline-sm text-on-surface">Más apostaron (7 días)</h4>
          <p className="text-xs text-on-surface-variant mb-3">Slots y Pachinka</p>
          {data.topWagerers.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Sin apuestas registradas esta semana.</p>
          ) : (
            <ul className="space-y-2">
              {data.topWagerers.map((u, i) => (
                <li key={u.id} className="flex justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate"><b className="text-primary mr-2">{i + 1}</b>{u.nick}</span>
                  <span className="tabular-nums text-on-surface flex-shrink-0">{fmt(u.wagered)} <span className="text-on-surface-variant text-xs">({fmt(u.spins)} giros)</span></span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-5">
          <h4 className="font-headline-sm text-headline-sm text-on-surface mb-3">Usuarios por rango</h4>
          <ul className="space-y-2">
            {data.ranks.map((r) => (
              <li key={r.rank} className="flex justify-between text-sm">
                <span className={`font-bold uppercase text-xs ${RANK_META[r.rank]?.className || "text-on-surface"}`}>{RANK_META[r.rank]?.label || r.rank}</span>
                <span className="tabular-nums text-on-surface">{fmt(r.count)} <span className="text-on-surface-variant text-xs">({pctOf(r.count, data.total)})</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserInsights;
