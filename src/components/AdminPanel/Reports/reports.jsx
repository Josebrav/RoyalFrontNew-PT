import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API_URL from "../../../api/rutaApi";

const REASONS = {
  spam: "Spam",
  insultos: "Insultos",
  acoso: "Acoso",
  estafa: "Estafa",
  contenido_sexual: "Contenido sexual",
  trampa: "Trampa",
  otro: "Otro",
};

const ACTIONS = {
  dismiss: { label: "Descartar", hint: "No hubo falta." },
  warn: { label: "Advertir", hint: "Le llega un mensaje de advertencia en Mensajes." },
  mute_24h: { label: "Silenciar 24 h", hint: "No puede escribir en ningún chat por 24 horas." },
  mute_7d: { label: "Silenciar 7 días", hint: "No puede escribir en ningún chat por 7 días." },
  ban: { label: "Suspender cuenta", hint: "No puede volver a entrar. Solo admins.", adminOnly: true },
};

const fmtDate = (value) =>
  new Date(value).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

/** Denuncias entre jugadores: revisar las pruebas y resolver (requisito de Google Play para los chats). */
export default function AdminReports() {
  const navigate = useNavigate();
  const role = useSelector((state) => state.currentUser?.role);
  const isStaff = role === "admin" || role === "mod";
  const [status, setStatus] = useState("pending");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/admin/reports`, { params: { status } })
      .then(({ data }) => setReports(data))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isStaff) load();
  }, [isStaff, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolve = async (report, action) => {
    const { isConfirmed, value: note } = await Swal.fire({
      title: `${ACTIONS[action].label} a ${report.reportedNick}`,
      text: `${ACTIONS[action].hint} Se cierran también sus otras denuncias pendientes.`,
      input: "text",
      inputPlaceholder: "Nota interna (opcional)",
      showCancelButton: true,
      confirmButtonText: ACTIONS[action].label,
      cancelButtonText: "Cancelar",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: action === "ban" ? "#dc2626" : "#c9a84c",
    });
    if (!isConfirmed) return;
    try {
      await axios.patch(`${API_URL}/admin/reports/${report.id}`, { action, note });
      load();
    } catch (err) {
      const message = err.response?.data?.message;
      Swal.fire({ icon: "error", title: "No se pudo resolver", text: Array.isArray(message) ? message[0] : message || "Probá de nuevo.", background: "#1a1a1a", color: "#fff" });
    }
  };

  if (!isStaff) return null;

  return (
    <div className="bg-background text-on-background min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-headline-md">Denuncias</h1>
            <p className="text-on-surface-variant text-sm">
              Jugadores denunciados desde el chat de los juegos, Mensajes o el perfil. Revisá las pruebas y resolvé.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-4 py-2 rounded-lg border border-outline-variant/40 hover:bg-surface-variant cursor-pointer"
          >
            Volver al Panel
          </button>
        </div>

        <div className="flex gap-2">
          {[
            ["pending", "Pendientes"],
            ["resolved", "Resueltas"],
            ["all", "Todas"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatus(value)}
              aria-pressed={status === value}
              className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer ${status === value ? "gold-gradient text-[#0A0A0F]" : "border border-outline-variant/40 hover:bg-surface-variant"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && <p className="text-on-surface-variant">Cargando...</p>}
        {!loading && reports.length === 0 && (
          <p className="text-on-surface-variant">{status === "pending" ? "No hay denuncias pendientes." : "No hay denuncias."}</p>
        )}

        <div className="space-y-4">
          {reports.map((r) => (
            <article key={r.id} className="glass-card rounded-xl p-4 border border-outline-variant/20 space-y-3">
              <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="px-2 py-0.5 rounded bg-error/15 text-error text-xs font-bold uppercase">{REASONS[r.reason] ?? r.reason}</span>
                <span className="font-bold">{r.reportedNick}</span>
                <span className="text-sm text-on-surface-variant">denunciado por {r.reporterNick}</span>
                <span className="text-sm text-on-surface-variant">· {fmtDate(r.createdAt)}</span>
                {r.context && <span className="text-sm text-on-surface-variant">· {r.context}</span>}
                {r.reportsAgainst > 1 && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-xs font-bold">{r.reportsAgainst} denuncias en total</span>
                )}
                {r.reportedBanned && <span className="px-2 py-0.5 rounded bg-error/15 text-error text-xs font-bold">Suspendido</span>}
                {r.reportedMutedUntil && new Date(r.reportedMutedUntil) > new Date() && (
                  <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 text-xs font-bold">Silenciado hasta {fmtDate(r.reportedMutedUntil)}</span>
                )}
              </header>

              {r.details && <p className="text-sm">&ldquo;{r.details}&rdquo;</p>}

              <div className="rounded-lg bg-black/30 p-3 space-y-1 max-h-56 overflow-y-auto">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Últimos mensajes de {r.reportedNick}</p>
                {r.evidence?.length ? (
                  r.evidence.map((m, i) => (
                    <p key={i} className="text-sm break-words">
                      <span className="text-on-surface-variant text-xs">
                        {fmtDate(m.at)} · {m.source === "privado" ? `privado a ${r.reporterNick}` : m.where}:
                      </span>{" "}
                      {m.text}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant">No escribió en los chats en los últimos 3 días.</p>
                )}
              </div>

              {r.status === "pending" ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ACTIONS)
                    .filter(([, a]) => !a.adminOnly || role === "admin")
                    .map(([key, a]) => (
                      <button
                        key={key}
                        onClick={() => resolve(r, key)}
                        title={a.hint}
                        className={`px-3 py-1.5 rounded-lg text-sm border cursor-pointer ${key === "ban" ? "border-error/60 text-error hover:bg-error/10" : "border-outline-variant/40 hover:bg-surface-variant"}`}
                      >
                        {a.label}
                      </button>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">
                  Resuelta: <span className="text-white font-bold">{ACTIONS[r.action]?.label ?? r.action}</span>
                  {r.resolvedByNick && ` por ${r.resolvedByNick}`} · {r.resolvedAt && fmtDate(r.resolvedAt)}
                  {r.resolutionNote && ` · "${r.resolutionNote}"`}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
