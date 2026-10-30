import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import API_URL from "../../../api/rutaApi";

const fmt = (v) => new Intl.NumberFormat("es-ES").format(Number(v) || 0);
const linkFor = (code) => `${window.location.origin}/?promo=${encodeURIComponent(code)}`;

const EMPTY_FORM = { code: "", rewardAmount: 100000, description: "", maxUses: 0, newAccountsOnly: true, onePerIp: true };

/** Enlaces promocionales (ej. el de Facebook): quien entra por el enlace cobra las fichas al registrarse. */
export default function AdminPromos() {
  const navigate = useNavigate();
  const viewerIsAdmin = useSelector((state) => state.currentUser?.role) === "admin";
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [redemptions, setRedemptions] = useState([]);

  const load = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/admin/promo-codes`);
      setCodes(data);
    } catch {
      setCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewerIsAdmin) load();
    else setLoading(false);
  }, [viewerIsAdmin]);

  const copyLink = async (code) => {
    try {
      await navigator.clipboard.writeText(linkFor(code));
      Swal.fire({ icon: "success", title: "Enlace copiado", text: linkFor(code), timer: 2200, showConfirmButton: false, background: "#1a1a1a", color: "#fff" });
    } catch {
      Swal.fire({ icon: "info", title: "Copiá el enlace", text: linkFor(code), background: "#1a1a1a", color: "#fff" });
    }
  };

  const toggle = async (promo) => {
    await axios.patch(`${API_URL}/admin/promo-codes/${promo.id}`, { isActive: !promo.isActive });
    load();
  };

  const showRedemptions = async (promo) => {
    if (openId === promo.id) {
      setOpenId(null);
      return;
    }
    const { data } = await axios.get(`${API_URL}/admin/promo-codes/${promo.id}/redemptions`);
    setRedemptions(data);
    setOpenId(promo.id);
  };

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(`${API_URL}/admin/promo-codes`, { ...form, code: form.code.trim().toUpperCase() });
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      const message = err.response?.data?.message;
      Swal.fire({ icon: "error", title: "No se pudo crear", text: Array.isArray(message) ? message[0] : message || "Probá de nuevo.", background: "#1a1a1a", color: "#fff" });
    } finally {
      setSaving(false);
    }
  };

  if (!viewerIsAdmin) {
    return (
      <div className="bg-background text-on-background min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">lock</span>
          <h2 className="font-headline-md text-headline-md text-white mb-2">Acceso Restringido</h2>
          <p className="text-on-surface-variant text-sm">Las promociones son solo para administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen pt-20 pb-12">
      <div className="px-margin-desktop max-w-container-max mx-auto">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">Promociones</h1>
            <p className="text-on-surface-variant font-body-sm max-w-2xl">
              Enlaces para redes sociales: quien entra por el enlace y se registra recibe las fichas solo, una vez por cuenta.
              Copiá el enlace y pegalo en tu posteo.
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

        <div className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden mb-8">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : codes.length === 0 ? (
            <p className="p-12 text-center text-on-surface-variant">Todavía no hay promociones.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-surface-container-high border-b border-outline-variant/30 text-xs">
                    {["Código", "Fichas", "Condiciones", "Usos", "Fichas entregadas", "Estado", ""].map((h) => (
                      <th key={h} className="px-4 py-3 font-label-lg text-primary uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {codes.map((p) => [
                    <tr key={p.id} className="hover:bg-surface-variant/20">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{p.code}</div>
                        <div className="text-[11px] text-on-surface-variant break-all">{linkFor(p.code)}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-primary tabular-nums">{fmt(p.rewardAmount)}</td>
                      <td className="px-4 py-3 text-on-surface-variant text-xs">
                        {[p.newAccountsOnly && "Solo cuentas nuevas", p.onePerIp && "1 por conexión", p.maxUses > 0 && `Tope ${fmt(p.maxUses)}`]
                          .filter(Boolean)
                          .join(" · ") || "Sin límites"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{fmt(p.usedCount)}</td>
                      <td className="px-4 py-3 tabular-nums">{fmt(p.totalGiven)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggle(p)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border-0 cursor-pointer ${p.isActive ? "bg-green-500/15 text-green-400" : "bg-gray-500/15 text-gray-400"}`}
                          title={p.isActive ? "Tocá para pausar" : "Tocá para activar"}
                        >
                          {p.isActive ? "Activa" : "Pausada"}
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button onClick={() => copyLink(p.code)} className="px-3 py-1.5 rounded-lg bg-primary text-black text-xs font-bold border-0 cursor-pointer mr-2">
                          Copiar enlace
                        </button>
                        <button onClick={() => showRedemptions(p)} className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-on-surface text-xs bg-transparent cursor-pointer">
                          {openId === p.id ? "Ocultar" : "Quiénes lo usaron"}
                        </button>
                      </td>
                    </tr>,
                    openId === p.id && (
                      <tr key={`${p.id}-r`} className="bg-surface-container-low">
                        <td colSpan={7} className="px-4 py-4">
                          {redemptions.length === 0 ? (
                            <p className="text-xs text-on-surface-variant">Nadie lo usó todavía.</p>
                          ) : (
                            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
                              {redemptions.map((r, i) => (
                                <li key={i} className="flex justify-between gap-3">
                                  <button onClick={() => navigate(`/perfil/${r.nick}`)} className="text-white hover:text-primary bg-transparent border-0 p-0 cursor-pointer truncate">
                                    {r.nick}
                                  </button>
                                  <span className="text-on-surface-variant whitespace-nowrap">
                                    {new Date(r.createdAt).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    ),
                  ])}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form onSubmit={create} className="bg-surface-container rounded-xl border border-outline-variant/20 p-6 max-w-2xl">
          <h2 className="font-headline-sm text-white text-lg font-bold mb-4">Nueva promoción</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
              Código (va en el enlace)
              <input
                id="promo-code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })}
                placeholder="INSTAGRAM"
                required
                className="bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
              Fichas
              <input
                id="promo-amount"
                type="number"
                min="1"
                value={form.rewardAmount}
                onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })}
                required
                className="bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
              Tope de usos (0 = sin tope)
              <input
                id="promo-max"
                type="number"
                min="0"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
              Nota (solo la ves vos)
              <input
                id="promo-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Posteo de Instagram de noviembre"
                className="bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface text-sm"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-6 mb-5 text-sm text-on-surface">
            <label className="flex items-center gap-2 cursor-pointer">
              <input id="promo-new" type="checkbox" checked={form.newAccountsOnly} onChange={(e) => setForm({ ...form, newAccountsOnly: e.target.checked })} />
              Solo cuentas nuevas
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input id="promo-ip" type="checkbox" checked={form.onePerIp} onChange={(e) => setForm({ ...form, onePerIp: e.target.checked })} />
              Una por conexión (IP)
            </label>
          </div>
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl gold-gradient text-black font-bold border-0 cursor-pointer disabled:opacity-60">
            {saving ? "Creando..." : "Crear promoción"}
          </button>
        </form>
      </div>
    </div>
  );
}
