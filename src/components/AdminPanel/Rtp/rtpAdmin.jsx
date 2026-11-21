import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API_URL from "../../../api/rutaApi";

/** Factor (1.01) -> ajuste en puntos porcentuales (+1). */
const toPct = (boost) => Math.round((boost - 1) * 1000) / 10;
const fromPct = (pct) => Math.round((1 + pct / 100) * 10000) / 10000;
const signed = (pct) => `${pct > 0 ? "+" : pct < 0 ? "−" : "±"}${Math.abs(pct).toLocaleString("es-ES")}%`;

/**
 * RTP de cada slot: el servidor multiplica todos los premios (lineas, bonus y tiradas gratis, no los pozos)
 * por este factor sobre la matematica calibrada del juego. Se aplica en el acto, sin deploy.
 */
export default function RtpAdmin() {
  const navigate = useNavigate();
  const isAdmin = useSelector((state) => state.currentUser?.role) === "admin";
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");

  const load = () =>
    axios
      .get(`${API_URL}/admin/rtp`)
      .then(({ data }) => {
        setData(data);
        setDraft(Object.fromEntries(data.games.map((g) => [g.id, toPct(g.boost)])));
        setError("");
      })
      .catch(() => setError("No se pudieron cargar los ajustes de RTP."));

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  if (!isAdmin) return null;

  const minPct = data ? toPct(data.min) : -20;
  const maxPct = data ? toPct(data.max) : 15;

  const save = async (game, pct) => {
    const boost = pct === null ? null : fromPct(pct);
    const label = pct === null ? `el valor por defecto (${signed(toPct(data.defaultBoost))})` : signed(pct);
    const ok = await Swal.fire({
      title: `RTP de ${game.name}`,
      html: `¿Cambiar el ajuste a <b>${label}</b>?<br/><small>Se aplica en el acto a todos los giros nuevos.</small>`,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
    });
    if (!ok.isConfirmed) return;
    setSaving(game.id);
    try {
      const { data: next } = await axios.put(`${API_URL}/admin/rtp/${game.id}`, { boost });
      setData(next);
      setDraft(Object.fromEntries(next.games.map((g) => [g.id, toPct(g.boost)])));
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: `RTP de ${game.name} guardado`, showConfirmButton: false, timer: 2200 });
    } catch (e) {
      Swal.fire({ icon: "error", title: "No se guardó", text: e?.response?.data?.message || "Probá de nuevo." });
    } finally {
      setSaving(null);
    }
  };

  const step = (id, delta) =>
    setDraft((d) => ({ ...d, [id]: Math.min(maxPct, Math.max(minPct, Math.round(((d[id] ?? 0) + delta) * 10) / 10)) }));

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md">RTP de las slots</h1>
          <p className="text-on-surface-variant text-sm max-w-2xl">
            Ajuste sobre la matemática calibrada de cada slot: todos los premios (líneas, bonus y tiradas gratis; no los pozos)
            se multiplican por este factor. <b>+1%</b> = paga un 1% más de lo calibrado. Se aplica en el acto, sin deploy.
          </p>
          {data && (
            <p className="text-on-surface-variant text-xs mt-1">
              Por defecto: {signed(toPct(data.defaultBoost))} · rango permitido {signed(minPct)} a {signed(maxPct)}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="px-4 py-2 rounded-lg border border-outline-variant/40 hover:bg-surface-variant cursor-pointer"
        >
          Volver al Panel
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {!data && !error && <p className="text-on-surface-variant">Cargando…</p>}

      {data && (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container divide-y divide-outline-variant/20">
          {data.games.map((g) => {
            const current = toPct(g.boost);
            const value = draft[g.id] ?? current;
            const changed = Math.abs(value - current) > 1e-9;
            return (
              <div key={g.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-[160px]">
                  <div className="font-bold">{g.name}</div>
                  <div className="text-xs text-on-surface-variant">
                    {g.custom
                      ? `Ajustado${g.updatedBy ? ` por ${g.updatedBy}` : ""}${g.updatedAt ? ` · ${new Date(g.updatedAt).toLocaleString("es-ES")}` : ""}`
                      : "Valor por defecto"}
                  </div>
                </div>
                <div className={`text-lg font-black tabular-nums w-20 text-right ${current > 0 ? "text-amber-300" : current < 0 ? "text-sky-300" : "text-white"}`}>
                  {signed(current)}
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => step(g.id, -0.5)} className="w-9 h-9 rounded-lg bg-surface-variant hover:brightness-125 cursor-pointer font-bold" aria-label={`Bajar RTP de ${g.name}`}>
                    −
                  </button>
                  <input
                    id={`rtp-${g.id}`}
                    type="number"
                    step="0.5"
                    min={minPct}
                    max={maxPct}
                    value={value}
                    onChange={(e) => setDraft((d) => ({ ...d, [g.id]: e.target.value === "" ? 0 : Number(e.target.value) }))}
                    className="w-20 h-9 text-center rounded-lg bg-black/30 border border-outline-variant/40 tabular-nums"
                  />
                  <span className="text-sm text-on-surface-variant">%</span>
                  <button type="button" onClick={() => step(g.id, 0.5)} className="w-9 h-9 rounded-lg bg-surface-variant hover:brightness-125 cursor-pointer font-bold" aria-label={`Subir RTP de ${g.name}`}>
                    +
                  </button>
                </div>
                <button
                  type="button"
                  disabled={!changed || saving === g.id || value < minPct || value > maxPct}
                  onClick={() => save(g, value)}
                  className="px-4 h-9 rounded-lg gold-gradient text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving === g.id ? "Guardando…" : "Guardar"}
                </button>
                {g.custom && (
                  <button
                    type="button"
                    disabled={saving === g.id}
                    onClick={() => save(g, null)}
                    className="px-3 h-9 rounded-lg border border-outline-variant/40 text-sm hover:bg-surface-variant cursor-pointer"
                    title="Volver al valor por defecto"
                  >
                    Por defecto
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
