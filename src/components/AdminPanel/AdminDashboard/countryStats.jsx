import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import API_URL from '../../../api/rutaApi';
import { GAMES_CATALOG } from '../../../data/gamesCatalog';

const numberFormat = (n) => new Intl.NumberFormat('es-ES').format(n || 0);

const PERIODS = [
  { days: 1, label: 'Hoy' },
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
];

let regionNames = null;
try {
  regionNames = new Intl.DisplayNames(['es'], { type: 'region' });
} catch {
  regionNames = null;
}

const countryName = (code) => {
  if (!code) return 'Sin detectar';
  try {
    return regionNames?.of(code) || code;
  } catch {
    return code;
  }
};

// Bandera emoji a partir del código ISO (AR → 🇦🇷).
const countryFlag = (code) =>
  code && /^[A-Z]{2}$/.test(code)
    ? String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
    : '🌐';

const gameName = (slug) => {
  if (!slug) return '—';
  const normalized = slug.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const match = GAMES_CATALOG.find((g) => g.slug.replace(/[^a-z0-9]/gi, '').toLowerCase() === normalized);
  return match?.name || slug;
};

const formatRevenue = (revenue) => {
  const entries = Object.entries(revenue || {}).filter(([, v]) => v > 0);
  if (entries.length === 0) return '—';
  return entries
    .map(([currency, amount]) => `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(amount)} ${currency}`)
    .join(' · ');
};

const SORTS = {
  users: { label: 'Usuarios', get: (c) => c.users },
  signups: { label: 'Registros', get: (c) => c.signups },
  active: { label: 'Activos', get: (c) => c.active },
  players: { label: 'Jugadores', get: (c) => c.players },
  chipsWon: { label: 'Fichas ganadas', get: (c) => c.chipsWon },
};

function BarList({ title, subtitle, rows, valueOf, format = numberFormat }) {
  const visible = rows.filter((r) => valueOf(r) > 0).sort((a, b) => valueOf(b) - valueOf(a)).slice(0, 8);
  const max = Math.max(1, ...visible.map(valueOf));
  return (
    <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-4">
      <p className="font-bold text-on-surface text-sm">{title}</p>
      <p className="text-[11px] text-on-surface-variant mb-3">{subtitle}</p>
      {visible.length === 0 ? (
        <p className="text-on-surface-variant text-xs py-4">Sin datos en este período.</p>
      ) : (
        <div className="space-y-2">
          {visible.map((r) => (
            <div key={r.country || 'none'} className="text-xs">
              <div className="flex justify-between gap-2 mb-1">
                <span className="text-on-surface truncate">
                  {countryFlag(r.country)} {countryName(r.country)}
                </span>
                <span className="text-primary font-bold tabular-nums flex-shrink-0">{format(valueOf(r))}</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(valueOf(r) / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SignupsChart({ daily, days }) {
  // Completa los días sin registros para que el gráfico no salte fechas.
  const series = useMemo(() => {
    const byDay = new Map((daily || []).map((d) => [d.day, d.signups]));
    const out = [];
    const span = Math.min(days, 90);
    for (let i = span - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      out.push({ day: key, signups: byDay.get(key) || 0 });
    }
    return out;
  }, [daily, days]);

  if (days <= 1) return null;
  const max = Math.max(1, ...series.map((d) => d.signups));

  return (
    <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-4 mb-4">
      <div className="flex justify-between items-baseline mb-3">
        <p className="font-bold text-on-surface text-sm">Registros por día</p>
        <p className="text-[11px] text-on-surface-variant">máx. {numberFormat(max)} en un día</p>
      </div>
      <div className="flex items-end gap-[2px] h-24">
        {series.map((d) => (
          <div
            key={d.day}
            title={`${d.day.split('-').reverse().join('/')}: ${d.signups} registros`}
            className="flex-1 min-w-0 rounded-t bg-primary/80 hover:bg-primary transition-colors"
            style={{ height: `${Math.max(d.signups > 0 ? 6 : 2, (d.signups / max) * 100)}%`, opacity: d.signups > 0 ? 1 : 0.25 }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
        <span>{series[0]?.day.split('-').reverse().slice(0, 2).join('/')}</span>
        <span>Hoy</span>
      </div>
    </div>
  );
}

export default function CountryStats({ viewerIsAdmin }) {
  const [days, setDays] = useState(30);
  const [includeBots, setIncludeBots] = useState(false);
  const [sortKey, setSortKey] = useState('users');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    axios
      .get(`${API_URL}/admin/stats/countries`, { params: { days, includeBots } })
      .then(({ data: res }) => !cancelled && setData(res))
      .catch(() => !cancelled && setError('No se pudieron cargar las estadísticas por país.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [days, includeBots]);

  const countries = data?.countries || [];
  const sorted = useMemo(
    () => [...countries].sort((a, b) => SORTS[sortKey].get(b) - SORTS[sortKey].get(a)),
    [countries, sortKey],
  );
  const periodLabel = PERIODS.find((p) => p.days === days)?.label.toLowerCase();

  const kpis = data
    ? [
        { title: 'Países detectados', value: data.totals.countriesDetected, icon: 'public' },
        { title: `Registros (${periodLabel})`, value: data.totals.signups, icon: 'person_add' },
        { title: `Activos (${periodLabel})`, value: data.totals.active, icon: 'bolt' },
        { title: `Jugadores con premios`, value: data.totals.players, icon: 'casino' },
      ]
    : [];

  return (
    <section className="bg-surface-container border border-outline-variant/20 rounded-xl mt-8 overflow-hidden">
      <div className="p-6 border-b border-outline-variant/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-headline-sm text-headline-sm text-on-surface">Estadísticas por País</h4>
          <p className="text-[11px] text-on-surface-variant mt-1">
            País detectado por la conexión del usuario (no el que escribe en su perfil).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-outline-variant/30 overflow-hidden">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => setDays(p.days)}
                className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  days === p.days ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer select-none">
            <input
              id="country-stats-bots"
              type="checkbox"
              checked={includeBots}
              onChange={(e) => setIncludeBots(e.target.checked)}
              className="cursor-pointer"
            />
            Incluir bots
          </label>
        </div>
      </div>

      <div className="p-6">
        {loading && !data ? (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <p className="text-error text-sm">{error}</p>
        ) : (
          <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {kpis.map((k) => (
                <div key={k.title} className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">{k.icon}</span>
                  <div className="min-w-0">
                    <p className="text-on-surface-variant uppercase tracking-wider text-[10px] truncate">{k.title}</p>
                    <p className="font-bold text-on-surface text-lg tabular-nums">{numberFormat(k.value)}</p>
                  </div>
                </div>
              ))}
            </div>

            <SignupsChart daily={data.dailySignups} days={days} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <BarList title="Registros por país" subtitle={`Cuentas nuevas · ${periodLabel}`} rows={countries} valueOf={(c) => c.signups} />
              <BarList title="Dónde juegan más" subtitle={`Jugadores con premios en juegos · ${periodLabel}`} rows={countries} valueOf={(c) => c.players} />
              <BarList title="Fichas ganadas" subtitle={`Premios cobrados en juegos · ${periodLabel}`} rows={countries} valueOf={(c) => c.chipsWon} />
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant">Ordenar por</span>
              {Object.entries(SORTS).map(([key, s]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortKey(key)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                    sortKey === key
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-surface-container-high text-[10px] uppercase tracking-wider text-on-surface-variant">
                  <tr>
                    <th className="text-left px-4 py-3">País</th>
                    <th className="text-right px-3 py-3">Usuarios</th>
                    <th className="text-right px-3 py-3">Registros</th>
                    <th className="text-right px-3 py-3">Activos</th>
                    <th className="text-right px-3 py-3">Online</th>
                    <th className="text-right px-3 py-3">Jugadores</th>
                    <th className="text-right px-3 py-3">Premios</th>
                    <th className="text-right px-3 py-3">Fichas ganadas</th>
                    <th className="text-left px-3 py-3">Juego top</th>
                    {viewerIsAdmin && (
                      <>
                        <th className="text-right px-3 py-3">Compradores</th>
                        <th className="text-right px-3 py-3">Depósitos</th>
                        <th className="text-right px-4 py-3">Recaudado</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {sorted.length === 0 ? (
                    <tr>
                      <td colSpan={viewerIsAdmin ? 12 : 9} className="px-4 py-6 text-center text-on-surface-variant text-xs">
                        Todavía no hay datos.
                      </td>
                    </tr>
                  ) : (
                    sorted.map((c) => (
                      <tr key={c.country || 'none'} className="border-t border-outline-variant/10 hover:bg-surface-container-low">
                        <td className={`px-4 py-2.5 font-bold ${c.country ? 'text-on-surface' : 'text-on-surface-variant italic'}`}>
                          {countryFlag(c.country)} {countryName(c.country)}
                        </td>
                        <td className="text-right px-3 py-2.5">{numberFormat(c.users)}</td>
                        <td className="text-right px-3 py-2.5">{numberFormat(c.signups)}</td>
                        <td className="text-right px-3 py-2.5">{numberFormat(c.active)}</td>
                        <td className="text-right px-3 py-2.5">{numberFormat(c.online)}</td>
                        <td className="text-right px-3 py-2.5">{numberFormat(c.players)}</td>
                        <td className="text-right px-3 py-2.5">{numberFormat(c.wins)}</td>
                        <td className="text-right px-3 py-2.5 text-primary font-bold">{numberFormat(c.chipsWon)}</td>
                        <td className="px-3 py-2.5 text-on-surface-variant">{gameName(c.topGame)}</td>
                        {viewerIsAdmin && (
                          <>
                            <td className="text-right px-3 py-2.5">{numberFormat(c.depositors)}</td>
                            <td className="text-right px-3 py-2.5">{numberFormat(c.deposits)}</td>
                            <td className="text-right px-4 py-2.5 text-primary font-bold">{formatRevenue(c.revenue)}</td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-3">
              Activos = entraron a la página en el período. Jugadores/Premios = cuántos cobraron premios en juegos y cuántas veces.
              {viewerIsAdmin && ' Compradores = usuarios del país que alguna vez compraron fichas; Depósitos y Recaudado son del período.'}
              {data.totals.unknownUsers > 0 &&
                ` ${numberFormat(data.totals.unknownUsers)} cuentas viejas aún sin país: se completa solo la próxima vez que entren.`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
