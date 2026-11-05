import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API_URL from "../../../api/rutaApi";

const fmt = (value) => new Intl.NumberFormat("es-ES").format(value);
const signed = (value) => `${value >= 0 ? "+" : "−"}${fmt(Math.abs(value))}`;
const ROLE_LABELS = { admin: "Admin", mod: "Mod" };
const PERIODS = [
  { days: 7, label: "Últimos 7 días" },
  { days: 30, label: "Últimos 30 días" },
  { days: 90, label: "Últimos 90 días" },
  { days: 3650, label: "Todo" },
];

function RoleBadge({ role }) {
  if (!ROLE_LABELS[role]) return null;
  return (
    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${role === "admin" ? "bg-primary/15 text-primary" : "bg-sky-500/15 text-sky-300"}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}

/** Fichas cargadas o descontadas a mano por admins y mods: quién, a quién y cuánto. */
export default function AdminStaffChips() {
  const navigate = useNavigate();
  const viewerIsAdmin = useSelector((state) => state.currentUser?.role) === "admin";
  const [days, setDays] = useState(30);
  const [data, setData] = useState({ summary: [], movements: [] });
  const [loading, setLoading] = useState(true);
  const [staffFilter, setStaffFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!viewerIsAdmin) return;
    let cancelled = false;
    setLoading(true);
    axios
      .get(`${API_URL}/admin/staff-chips`, { params: { days } })
      .then(({ data }) => !cancelled && setData(data))
      .catch(() => !cancelled && setData({ summary: [], movements: [] }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [viewerIsAdmin, days]);

  const movements = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.movements.filter((m) => {
      if (staffFilter !== "all" && (m.staffId ?? "desconocido") !== staffFilter) return false;
      if (typeFilter === "added" && m.amount < 0) return false;
      if (typeFilter === "removed" && m.amount >= 0) return false;
      if (typeFilter === "toSelf" && !m.toSelf) return false;
      if (typeFilter === "toStaff" && !m.toStaff) return false;
      return !term || m.recipientNick?.toLowerCase().includes(term) || m.staffNick?.toLowerCase().includes(term);
    });
  }, [data.movements, staffFilter, typeFilter, search]);

  if (!viewerIsAdmin) return null;

  const selectClass = "bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-white";

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md">Fichas del staff</h1>
          <p className="text-on-surface-variant text-sm">
            Fichas que los admins y mods cargaron o descontaron a mano: quién, a quién y cuánto.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="px-4 py-2 rounded-lg border border-outline-variant/40 hover:bg-surface-variant cursor-pointer"
        >
          Volver al Panel
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select aria-label="Período" className={selectClass} value={days} onChange={(e) => setDays(Number(e.target.value))}>
          {PERIODS.map((p) => (
            <option key={p.days} value={p.days}>{p.label}</option>
          ))}
        </select>
        <select aria-label="Persona del staff" className={selectClass} value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
          <option value="all">Todo el staff</option>
          {data.summary.map((s) => (
            <option key={s.staffId ?? "desconocido"} value={s.staffId ?? "desconocido"}>{s.staffNick}</option>
          ))}
        </select>
        <select aria-label="Tipo de movimiento" className={selectClass} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Cargas y descuentos</option>
          <option value="added">Solo cargas</option>
          <option value="removed">Solo descuentos</option>
          <option value="toSelf">Cargas a sí mismo</option>
          <option value="toStaff">Cargas a otro del staff</option>
        </select>
        <input
          aria-label="Buscar por nick"
          className={`${selectClass} flex-1 min-w-[180px]`}
          placeholder="Buscar por nick"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Resumen por persona</h2>
        <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
          <table className="w-full text-sm">
            <thead className="bg-surface-container text-on-surface-variant text-left">
              <tr>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3 text-right">Movimientos</th>
                <th className="px-4 py-3 text-right">Cargado</th>
                <th className="px-4 py-3 text-right">Descontado</th>
                <th className="px-4 py-3 text-right">A sí mismo</th>
                <th className="px-4 py-3 text-right">Jugadores</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {data.summary.map((s) => (
                <tr
                  key={s.staffId ?? "desconocido"}
                  onClick={() => setStaffFilter(s.staffId ?? "desconocido")}
                  className="border-t border-outline-variant/10 hover:bg-surface-variant/40 cursor-pointer"
                >
                  <td className="px-4 py-3 font-bold">{s.staffNick}<RoleBadge role={s.staffRole} /></td>
                  <td className="px-4 py-3 text-right">{fmt(s.count)}</td>
                  <td className="px-4 py-3 text-right text-green-400">{fmt(s.added)}</td>
                  <td className="px-4 py-3 text-right text-error">{fmt(s.removed)}</td>
                  <td className={`px-4 py-3 text-right ${s.toSelf > 0 ? "text-amber-300 font-bold" : "text-on-surface-variant"}`}>{fmt(s.toSelf)}</td>
                  <td className="px-4 py-3 text-right">{fmt(s.recipients)}</td>
                </tr>
              ))}
              {!loading && data.summary.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-on-surface-variant">No hubo movimientos en este período.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Detalle ({fmt(movements.length)})</h2>
        <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
          <table className="w-full text-sm">
            <thead className="bg-surface-container text-on-surface-variant text-left">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Quién</th>
                <th className="px-4 py-3">A quién</th>
                <th className="px-4 py-3 text-right">Fichas</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-on-surface-variant">Cargando...</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-on-surface-variant">No hay movimientos con estos filtros.</td></tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className={`border-t border-outline-variant/10 ${m.toSelf ? "bg-amber-500/5" : ""}`}>
                    <td className="px-4 py-3 whitespace-nowrap text-on-surface-variant">
                      {new Date(m.createdAt).toLocaleString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 font-bold">{m.staffNick}<RoleBadge role={m.staffRole} /></td>
                    <td className="px-4 py-3">
                      <span className="font-bold">{m.recipientNick}</span>
                      <RoleBadge role={m.recipientRole} />
                      {m.recipientIsBot && <span className="ml-2 text-[10px] uppercase text-on-surface-variant">bot</span>}
                      {m.toSelf && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/15 text-amber-300">A sí mismo</span>}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${m.amount >= 0 ? "text-green-400" : "text-error"}`}>{signed(m.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
