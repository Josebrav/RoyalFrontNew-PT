import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import API_URL from "../../api/rutaApi";
import { UPDATE_USER_PROFILE } from "../../redux/actions/action.types";
import { profileBackgroundImage } from "../../data/profileBackgrounds";
import panel from "../../assets/fondos/panel.jpg";
import chipsIcon from "../../assets/chips.png";

// Zonas del arte del panel (cuadrado): ventana, barra del precio, flechas y el piso donde va el boton.
const WINDOW = { left: "9.7%", top: "26.5%", width: "81.1%", height: "31.6%" };
// La barra se centra con el panel entero (no solo la parte a la derecha de la ficha), asi el texto no queda corrido
const BAR = { left: "9.7%", top: "61.6%", width: "81.1%", height: "8.9%" };
const ARROW_L = { left: "7.2%", top: "77.4%", width: "11.6%", height: "12.8%" };
const ARROW_R = { left: "81.3%", top: "77.4%", width: "11.6%", height: "12.8%" };
const ACTION = { left: "50%", top: "84%" };

const fmt = (n) => Number(n || 0).toLocaleString("es-AR");

/**
 * Tienda de fondos de perfil: se rota con las flechas, la ventana muestra el fondo y la cabecera del perfil
 * lo previsualiza en vivo (onPreview). Comprar descuenta las fichas una sola vez; los comprados se cambian gratis.
 * onApplied(id) avisa al perfil cual quedo puesto, asi se ve sin recargar.
 */
export default function FondosShop({ open, onClose, classicImage, onPreview, onApplied }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.currentUser);
  const [data, setData] = useState(null);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    axios
      .get(`${API_URL}/profile-backgrounds`)
      .then((r) => {
        setData(r.data);
        const ids = [null, ...r.data.backgrounds.map((b) => b.id)];
        setIndex(Math.max(0, ids.indexOf(r.data.current ?? null)));
      })
      .catch(() => setError("No se pudieron cargar los fondos. Probá de nuevo en un rato."));
  }, [open]);

  const items = data
    ? [{ id: null, name: "Clásico", price: 0, owned: true }, ...data.backgrounds]
    : [{ id: null, name: "Clásico", price: 0, owned: true }];
  const item = items[Math.min(index, items.length - 1)];
  const current = data ? data.current ?? null : currentUser?.profileBackground ?? null;
  const inUse = item.id === current;
  const image = item.id ? profileBackgroundImage(item.id) : classicImage;

  useEffect(() => {
    if (open) onPreview?.(item.id);
  }, [open, item.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const close = () => {
    onPreview?.(undefined);
    onClose();
  };
  const move = (d) => {
    setConfirming(false);
    setIndex((i) => (i + d + items.length) % items.length);
  };

  const applyResult = (res) => {
    setData(res);
    onApplied?.(res.current ?? null);
    dispatch({ type: UPDATE_USER_PROFILE, payload: { ...currentUser, chips: res.chips, profileBackground: res.current } });
  };

  const act = async () => {
    if (busy || inUse) return;
    setError("");
    if (!item.owned) {
      const chips = data?.chips ?? currentUser?.chips ?? 0;
      if (chips < item.price) {
        setError(`Te faltan ${fmt(item.price - chips)} fichas para este fondo.`);
        return;
      }
      setConfirming(true);
      return;
    }
    await send();
  };

  const send = async () => {
    setConfirming(false);
    setBusy(true);
    try {
      const res = item.owned
        ? await axios.post(`${API_URL}/profile-backgrounds/use`, { backgroundId: item.id })
        : await axios.post(`${API_URL}/profile-backgrounds/buy`, { backgroundId: item.id });
      applyResult(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo completar. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  const barText = inUse ? "EN USO" : item.owned ? (item.id ? "TUYO" : "GRATIS") : fmt(item.price);
  const action = inUse ? "EN USO" : item.owned ? "USAR" : "COMPRAR";
  const arrowClass =
    "absolute rounded-full bg-transparent border-0 p-0 cursor-pointer transition-[background,box-shadow] hover:bg-white/15 hover:shadow-[0_0_24px_rgba(255,216,74,0.8)] active:bg-white/25";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={close}>
      <div
        className="relative w-full max-w-[min(560px,calc(100vh-40px))] aspect-square rounded-[2rem] overflow-hidden border-[3px] border-[#a78bfa] shadow-[0_0_40px_rgba(59,130,246,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={panel} alt="" className="absolute inset-0 w-full h-full select-none pointer-events-none" draggable={false} />

        <button
          type="button"
          onClick={close}
          aria-label="Cerrar"
          className="absolute top-2 right-2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#2b0a63]/90 border-2 border-[#ffd84a] text-white flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Ventana: el fondo que se esta mirando */}
        <div className="absolute overflow-hidden rounded-[3%] bg-black" style={WINDOW}>
          <img key={item.id ?? "clasico"} src={image} alt={item.name} className="w-full h-full object-cover animate-[fondoIn_.35s_ease-out]" />
          <div className="absolute left-2 bottom-2 px-3 py-1 rounded-full bg-black/60 border border-white/20 text-white text-xs sm:text-sm font-bold">
            {item.name}
          </div>
          <div className="absolute right-2 top-2 px-2 py-0.5 rounded-full bg-black/60 text-white/80 text-[0.65rem] sm:text-xs font-bold">
            {index + 1} / {items.length}
          </div>
        </div>

        {/* Barra: precio o estado */}
        <div
          className="absolute flex items-center justify-center font-black tracking-wide text-[#ffd84a] text-lg sm:text-3xl drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]"
          style={BAR}
        >
          {barText}
        </div>

        {/* Flechas dibujadas en el arte: zonas para tocar */}
        <button type="button" onClick={() => move(-1)} aria-label="Anterior" className={arrowClass} style={ARROW_L} />
        <button type="button" onClick={() => move(1)} aria-label="Siguiente" className={arrowClass} style={ARROW_R} />

        <button
          type="button"
          onClick={act}
          disabled={busy || inUse}
          style={ACTION}
          className={`absolute -translate-x-1/2 -translate-y-1/2 min-w-[42%] px-5 py-2 sm:py-3 rounded-full border-4 font-black text-base sm:text-2xl tracking-wide transition-transform ${
            inUse
              ? "bg-[#3b2a6b] border-[#6d5ba8] text-white/60 cursor-default"
              : item.owned
                ? "bg-gradient-to-b from-[#a855f7] to-[#6d28d9] border-[#ffd84a] text-white hover:scale-105 active:scale-95 cursor-pointer"
                : "bg-gradient-to-b from-[#ffe066] to-[#f59e0b] border-[#7c2d12] text-[#4a1d00] hover:scale-105 active:scale-95 cursor-pointer"
          }`}
        >
          {busy ? "..." : action}
        </button>

        <p className="absolute left-0 right-0 bottom-[2.5%] text-center text-[0.7rem] sm:text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] px-4">
          {error || (data ? `Tu saldo: ${fmt(data.chips)} fichas` : "")}
        </p>
      </div>
      {confirming && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 px-4" onClick={(e) => { e.stopPropagation(); setConfirming(false); }}>
          <div
            className="relative w-full max-w-[400px] rounded-3xl p-[3px] bg-gradient-to-b from-[#ffe066] via-[#c084fc] to-[#7c3aed] shadow-[0_0_40px_rgba(168,85,247,0.7)] animate-[fondoPop_.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-[22px] bg-gradient-to-b from-[#3b0f8a] to-[#1a0647] px-5 pt-5 pb-6 text-center">
              <div className="mx-auto -mt-1 mb-3 w-fit px-5 py-1.5 rounded-full bg-gradient-to-b from-[#a855f7] to-[#6d28d9] border-2 border-[#ffd84a] text-[#ffd84a] font-black tracking-wide text-lg drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
                ¿COMPRAR FONDO?
              </div>
              <div className="rounded-2xl overflow-hidden border-2 border-[#ffd84a]/80 shadow-[0_0_16px_rgba(255,216,74,0.4)] aspect-video">
                <img src={image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="mt-3 text-white font-black text-xl">{item.name}</div>
              <div className="mt-2 mx-auto w-fit flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-[#ffd84a]/50">
                <img src={chipsIcon} alt="" className="w-6 h-6" />
                <span className="text-[#ffd84a] font-black text-xl">{fmt(item.price)}</span>
              </div>
              <p className="mt-3 text-white/80 text-sm">Queda tuyo para siempre y lo podés cambiar cuando quieras.</p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="flex-1 py-2.5 rounded-full border-2 border-white/30 bg-white/10 text-white font-black tracking-wide hover:bg-white/20 active:scale-95 transition cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={send}
                  className="flex-1 py-2.5 rounded-full border-4 border-[#7c2d12] bg-gradient-to-b from-[#ffe066] to-[#f59e0b] text-[#4a1d00] font-black tracking-wide hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-[0_0_16px_rgba(255,216,74,0.6)]"
                >
                  COMPRAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes fondoPop { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        @keyframes fondoIn { from { opacity: 0; transform: scale(1.06); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
