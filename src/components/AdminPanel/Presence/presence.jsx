import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_URL from "../../../api/rutaApi";
import { RANK_META } from "../../../utils/rank";
import { activityLabel, timeAgo } from "../../../utils/activityLabel";

const fmt = (n) => new Intl.NumberFormat("es-ES").format(n || 0);
const PAGE_SIZE = 50;
const FILTERS = [
  { id: "online", label: "En línea" },
  { id: "offline", label: "Desconectados" },
  { id: "all", label: "Todos" },
];

/**
 * Quien esta en linea y quien no, y en que juego o pagina esta cada uno. "En linea" = latido en los
 * ultimos 5 minutos (la web lo manda cada 2 min y al cambiar de pagina). Se refresca solo cada 30 s.
 */
const Presence = () => {
  const [status, setStatus] = useState("online");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [includeBots, setIncludeBots] = useState(false);
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ total: 0, rows: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    return axios
      .get(`${API_URL}/admin/presence`, {
        params: { status, search: query || undefined, includeBots, limit: PAGE_SIZE, offset: page * PAGE_SIZE },
      })
      .then((res) => {
        setData(res.data);
        setError(null);
      })
      .catch(() => setError("No se pudo cargar la lista. Probá de nuevo en unos segundos."))
      .finally(() => setLoading(false));
  }, [status, query, includeBots, page]);

  useEffect(() => {
    setLoading(true);
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  // Busca al dejar de tipear (no en cada tecla).
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      setQuery(search.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Resumen por juego/pagina de los que estan en linea en esta pagina de resultados.
  const byActivity = {};
  if (status === "online") {
    for (const r of data.rows) {
      const { label } = activityLabel(r.currentActivity);
      byActivity[label] = (byActivity[label] || 0) + 1;
    }
  }
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  return (
    <div className="bg-background text-on-background min-h-screen pt-20 pb-12">
      <div className="px-4 md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-1">Usuarios en línea</h1>
            <p className="text-on-surface-variant text-sm">
              Quién está conectado ahora y en qué juego o página está. Se actualiza solo cada 30 segundos.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer select-none">
            <input type="checkbox" checked={includeBots} onChange={(e) => { setPage(0); setIncludeBots(e.target.checked); }} />
            Incluir bots
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex rounded-xl overflow-hidden border border-outline-variant/30">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => { setPage(0); setStatus(f.id); }}
                className={`px-4 py-2 text-sm font-bold transition-colors ${
                  status === f.id ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            id="presence-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nick…"
            className="flex-1 min-w-[12rem] bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 text-sm text-on-surface outline-none focus:border-primary"
          />
          <span className="text-sm text-on-surface-variant">{fmt(data.total)} usuarios</span>
        </div>

        {status === "online" && Object.keys(byActivity).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(byActivity)
              .sort((a, b) => b[1] - a[1])
              .map(([label, count]) => (
                <span key={label} className="px-3 py-1 rounded-full bg-surface-container border border-outline-variant/20 text-xs text-on-surface">
                  {label} <b className="text-primary">{count}</b>
                </span>
              ))}
          </div>
        )}

        {error && <p className="text-error text-sm mb-4">{error}</p>}

        <div className="bg-surface-container border border-outline-variant/20 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[0.6875rem] uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/20">
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Dónde está</th>
                <th className="px-4 py-3">Última actividad</th>
                <th className="px-4 py-3 text-right">Fichas</th>
                <th className="px-4 py-3">País</th>
                <th className="px-4 py-3">Registrado</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-on-surface-variant">Cargando…</td></tr>
              ) : data.rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-on-surface-variant">No hay usuarios con este filtro.</td></tr>
              ) : (
                data.rows.map((u) => {
                  const act = activityLabel(u.currentActivity);
                  return (
                    <tr key={u.id} className="border-b border-outline-variant/10 hover:bg-surface-container-high/40">
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${u.isOnline ? "text-green-400" : "text-on-surface-variant"}`}>
                          <span className={`w-2 h-2 rounded-full ${u.isOnline ? "bg-green-400" : "bg-outline-variant"}`} />
                          {u.isOnline ? "En línea" : "Desconectado"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <Link to={`/perfil/${encodeURIComponent(u.nick)}`} className="font-bold text-on-surface hover:text-primary">
                          {u.nick}
                        </Link>
                        {RANK_META[u.rank] && (
                          <span className={`ml-2 text-[0.625rem] font-bold uppercase ${RANK_META[u.rank].className}`}>{RANK_META[u.rank].label}</span>
                        )}
                        {u.role !== "user" && <span className="ml-2 text-[0.625rem] font-bold uppercase text-primary">{u.role}</span>}
                        {u.isBot && <span className="ml-2 text-[0.625rem] font-bold uppercase text-on-surface-variant">bot</span>}
                        {u.banned && <span className="ml-2 text-[0.625rem] font-bold uppercase text-error">baneado</span>}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {u.isOnline ? (
                          <span className={act.isGame ? "text-primary font-bold" : "text-on-surface"}>
                            {act.isGame && <span className="material-symbols-outlined text-[1rem] align-middle mr-1">sports_esports</span>}
                            {act.label}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant">Última vez: {act.label}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-on-surface-variant">{timeAgo(u.lastSeen)}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right tabular-nums">{fmt(u.chips)}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-on-surface-variant">{u.lastCountry || "—"}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-on-surface-variant">{timeAgo(u.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4 text-sm">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg bg-surface-container disabled:opacity-40">Anterior</button>
            <span className="text-on-surface-variant">Página {page + 1} de {pages}</span>
            <button disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg bg-surface-container disabled:opacity-40">Siguiente</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Presence;
