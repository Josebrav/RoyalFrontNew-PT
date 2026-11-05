import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import API_URL from "../../../api/rutaApi";

const CURRENCIES = [
  { code: "USD", label: "Dólares", hint: "PayPal y Mercado Pago Colombia/México" },
  { code: "ARS", label: "Pesos argentinos", hint: "Mercado Pago Argentina" },
  { code: "EUR", label: "Euros", hint: "PayPal España" },
  { code: "BRL", label: "Reales", hint: "Asaas Brasil" },
];

const fmt = (v) => new Intl.NumberFormat("es-ES").format(Number(v) || 0);
const pad = (n) => String(n).padStart(2, "0");
// Formato de <input type="datetime-local">, en la hora de quien carga la oferta.
const toLocalInput = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const emptyForm = () => {
  const now = new Date();
  return {
    title: "",
    multiplier: "",
    startsAt: toLocalInput(now),
    endsAt: toLocalInput(new Date(now.getTime() + 24 * 3600 * 1000)),
    prices: { USD: { price: "", chips: "" }, ARS: { price: "", chips: "" }, EUR: { price: "", chips: "" }, BRL: { price: "", chips: "" } },
  };
};

const statusOf = (offer) => {
  const now = Date.now();
  if (!offer.active) return { label: "Terminada", color: "text-on-surface-variant" };
  if (new Date(offer.endsAt).getTime() <= now) return { label: "Vencida", color: "text-on-surface-variant" };
  if (new Date(offer.startsAt).getTime() > now) return { label: "Programada", color: "text-primary" };
  return { label: "Activa", color: "text-green-400" };
};

/** Ofertas de fichas: banner a pantalla completa, fechas y precio/fichas por moneda. */
export default function AdminOffers() {
  const viewerIsAdmin = useSelector((state) => state.currentUser?.role) === "admin";
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    axios
      .get(`${API_URL}/admin/chip-offers`)
      .then(({ data }) => setOffers(data))
      .catch(() => setOffers([]));

  useEffect(() => {
    if (viewerIsAdmin) load();
  }, [viewerIsAdmin]);

  const preview = image ? URL.createObjectURL(image) : null;
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const setPrice = (code, field, value) =>
    setForm((f) => ({ ...f, prices: { ...f.prices, [code]: { ...f.prices[code], [field]: value } } }));

  const submit = async (e) => {
    e.preventDefault();
    const items = CURRENCIES.filter(({ code }) => form.prices[code].price || form.prices[code].chips).map(({ code }) => ({
      currency: code,
      price: Number(form.prices[code].price),
      chips: Number(form.prices[code].chips),
    }));
    const body = new FormData();
    if (image) body.append("image", image);
    body.append("title", form.title);
    body.append("startsAt", new Date(form.startsAt).toISOString());
    body.append("endsAt", new Date(form.endsAt).toISOString());
    body.append("items", JSON.stringify(items));
    if (form.multiplier) body.append("multiplier", form.multiplier);

    setSaving(true);
    try {
      await axios.post(`${API_URL}/admin/chip-offers`, body);
      setForm(emptyForm());
      setImage(null);
      e.target.reset();
      await load();
      Swal.fire({ icon: "success", title: "Oferta creada", background: "#1a1a1a", color: "#fff", confirmButtonColor: "#c9a84c" });
    } catch (err) {
      const message = err.response?.data?.message;
      Swal.fire({
        icon: "error",
        title: "No se pudo crear la oferta",
        text: Array.isArray(message) ? message[0] : message || "Probá de nuevo en un momento.",
        background: "#1a1a1a",
        color: "#fff",
        confirmButtonColor: "#c9a84c",
      });
    } finally {
      setSaving(false);
    }
  };

  const endOffer = async (offer) => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: `¿Terminar "${offer.title}"?`,
      text: "Deja de mostrarse y de venderse ahora mismo. No se puede volver a activar.",
      showCancelButton: true,
      confirmButtonText: "Terminar oferta",
      cancelButtonText: "Cancelar",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#c9a84c",
    });
    if (!isConfirmed) return;
    await axios.patch(`${API_URL}/admin/chip-offers/${offer.id}/end`).catch(() => {});
    load();
  };

  // Ocultar la oferta a un jugador: no la ve ni se le aplica al comprar.
  const setExcluded = async (offer, nick, excluded) => {
    try {
      await axios.patch(`${API_URL}/admin/chip-offers/${offer.id}/excluded`, { nick, excluded });
      load();
    } catch (err) {
      const message = err.response?.data?.message;
      Swal.fire({
        icon: "error",
        title: "No se pudo cambiar",
        text: Array.isArray(message) ? message[0] : message || "Probá de nuevo en un momento.",
        background: "#1a1a1a",
        color: "#fff",
        confirmButtonColor: "#c9a84c",
      });
    }
  };

  const askExclude = async (offer) => {
    const { value: nick } = await Swal.fire({
      title: `Ocultar "${offer.title}" a un jugador`,
      input: "text",
      inputPlaceholder: "Nick del jugador",
      showCancelButton: true,
      confirmButtonText: "Ocultar",
      cancelButtonText: "Cancelar",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#c9a84c",
      inputValidator: (value) => (!value?.trim() ? "Escribí un nick" : undefined),
    });
    if (nick) setExcluded(offer, nick.trim(), true);
  };

  if (!viewerIsAdmin) return null;

  const inputClass = "w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-white";
  const labelClass = "text-xs font-bold text-primary mb-1 block uppercase tracking-wider";

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 text-white">
      <h1 className="font-headline-md text-headline-md">Ofertas de fichas</h1>

      <form onSubmit={submit} className="glass-card rounded-xl p-5 space-y-5 border border-outline-variant/20">
        <div>
          <label htmlFor="offer-title" className={labelClass}>Título</label>
          <input
            id="offer-title"
            className={inputClass}
            maxLength={120}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ej: Oferta de fin de semana"
            required
          />
        </div>

        <div>
          <label htmlFor="offer-image" className={labelClass}>Banner de la oferta</label>
          <input
            id="offer-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={inputClass}
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            required
          />
          <p className="text-xs text-on-surface-variant mt-1">JPG, PNG o WEBP de hasta 5 MB. Recomendado: 1920×1080.</p>
          {preview && <img src={preview} alt="Vista previa del banner" className="mt-3 max-h-56 rounded-lg" />}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="offer-starts" className={labelClass}>Empieza</label>
            <input
              id="offer-starts"
              type="datetime-local"
              className={inputClass}
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="offer-ends" className={labelClass}>Termina</label>
            <input
              id="offer-ends"
              type="datetime-local"
              className={inputClass}
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="offer-multiplier" className={labelClass}>Oferta express: multiplicador en cualquier compra</label>
          <input
            id="offer-multiplier"
            type="number"
            min="2"
            max="20"
            step="1"
            className={inputClass}
            value={form.multiplier}
            onChange={(e) => setForm({ ...form, multiplier: e.target.value })}
            placeholder="Ej: 7 para un 7x1. Vacío = oferta de paquete propio"
          />
          <p className="text-xs text-on-surface-variant mt-1">
            Multiplica las fichas de todos los paquetes, en todas las monedas y medios de pago, sin cambiar el precio.
          </p>
        </div>

        {!form.multiplier && <div className="space-y-3">
          <p className={labelClass}>Precio y fichas por moneda</p>
          <p className="text-xs text-on-surface-variant">
            Completá al menos una. Quien paga en una moneda que dejes vacía no ve la oferta en la página de compra.
          </p>
          {CURRENCIES.map(({ code, label, hint }) => (
            <div key={code} className="grid sm:grid-cols-3 gap-3 items-center">
              <div>
                <p className="font-bold">{label}</p>
                <p className="text-xs text-on-surface-variant">{hint}</p>
              </div>
              <input
                id={`offer-price-${code}`}
                type="number"
                min="0"
                step="0.01"
                aria-label={`Precio en ${label}`}
                placeholder={`Precio (${code})`}
                className={inputClass}
                value={form.prices[code].price}
                onChange={(e) => setPrice(code, "price", e.target.value)}
              />
              <input
                id={`offer-chips-${code}`}
                type="number"
                min="1"
                step="1"
                aria-label={`Fichas en ${label}`}
                placeholder="Fichas"
                className={inputClass}
                value={form.prices[code].chips}
                onChange={(e) => setPrice(code, "chips", e.target.value)}
              />
            </div>
          ))}
        </div>}

        <button
          type="submit"
          disabled={saving}
          className="gold-gradient px-8 py-3 rounded-lg font-bold uppercase tracking-wider text-[#0A0A0F] cursor-pointer disabled:opacity-50"
        >
          {saving ? "Creando..." : "Crear oferta"}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="font-headline-sm text-headline-sm">Ofertas creadas</h2>
        {offers.length === 0 && <p className="text-on-surface-variant">Todavía no hay ofertas.</p>}
        {offers.map((offer) => {
          const status = statusOf(offer);
          const canEnd = status.label === "Activa" || status.label === "Programada";
          return (
            <div key={offer.id} className="glass-card rounded-xl p-4 border border-outline-variant/20 flex flex-wrap gap-4 items-center">
              <img src={offer.imageUrl} alt="" className="w-40 h-24 object-cover rounded-lg" />
              <div className="flex-1 min-w-[220px] space-y-1">
                <p className="font-bold">
                  {offer.title} · <span className={status.color}>{status.label}</span>
                </p>
                <p className="text-sm text-on-surface-variant">
                  {new Date(offer.startsAt).toLocaleString("es-ES")} → {new Date(offer.endsAt).toLocaleString("es-ES")}
                </p>
                <p className="text-sm">
                  {offer.multiplier ? `Express: x${offer.multiplier} en cualquier compra` : offer.items.map((item) => `${fmt(item.chips)} fichas por ${fmt(item.price)} ${item.currency}`).join(" · ")}
                </p>
                {offer.excludedNicks?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-on-surface-variant">Oculta a:</span>
                    {offer.excludedNicks.map((nick) => (
                      <button
                        key={nick}
                        onClick={() => setExcluded(offer, nick, false)}
                        title="Volver a mostrársela"
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-variant hover:bg-primary/20 cursor-pointer"
                      >
                        {nick}
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {canEnd && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => askExclude(offer)}
                    className="px-4 py-2 rounded-lg border border-outline-variant/40 hover:bg-surface-variant cursor-pointer"
                  >
                    Ocultar a un jugador
                  </button>
                  <button
                    onClick={() => endOffer(offer)}
                    className="px-4 py-2 rounded-lg border border-outline-variant/40 hover:bg-surface-variant cursor-pointer"
                  >
                    Terminar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
