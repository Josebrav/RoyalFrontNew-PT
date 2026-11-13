import { useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { updateSiteContentText } from "../../redux/actions";
import { swalThemeConfig } from "../../utils/formatters";
import { GAMES_ORDER_KEY, useOrderedGames } from "../../data/gameOrder";

/**
 * Boton "Ordenar juegos" (solo admin/mod) y su ventana: lista de juegos que se reordena arrastrando
 * o con las flechas; "Primero" lo manda al principio. Al guardar, el orden vale para todos los visitantes
 * (inicio y pagina de Juegos), sin tocar codigo.
 */
export default function GameOrderEditor({ className = "" }) {
  const currentUser = useSelector((state) => state.currentUser);
  const canEdit = currentUser?.role === "admin" || currentUser?.role === "mod";
  const [open, setOpen] = useState(false);
  if (!canEdit) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-primary/20 ${className}`}
      >
        <span className="material-symbols-outlined text-[18px]">swap_vert</span>
        Ordenar juegos
      </button>
      {open && <OrderDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function OrderDialog({ onClose }) {
  const dispatch = useDispatch();
  const ordered = useOrderedGames();
  const [list, setList] = useState(ordered);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const content = useSelector((state) => state.siteContent);
  const coverOf = (game) => content[`games.${game.slug}.cover`]?.imageUrl || game.image;

  const move = (from, to) => {
    if (to < 0 || to >= list.length || from === to) return;
    setList((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await dispatch(updateSiteContentText(GAMES_ORDER_KEY, JSON.stringify(list.map((g) => g.slug))));
      onClose();
      Swal.fire({ title: "Orden guardado", icon: "success", timer: 1400, showConfirmButton: false, ...swalThemeConfig });
    } catch (error) {
      Swal.fire({ title: "Error", text: error.response?.data?.message || "No se pudo guardar el orden.", icon: "error", ...swalThemeConfig });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => setList(ordered);

  return createPortal(
    <div className="fixed inset-0 z-[99997] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="glass-card rounded-2xl border border-outline-variant/20 w-full max-w-md max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Ordenar juegos"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h3 className="font-headline-sm text-headline-sm text-white">Ordenar juegos</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-on-surface-variant hover:text-primary bg-transparent border-0 cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="px-5 pb-3 text-xs text-on-surface-variant">
          Arrastrá los juegos o usá las flechas. El de arriba es el primero que se ve en el inicio y en Juegos.
        </p>

        <ol className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5 list-none m-0">
          {list.map((game, i) => (
            <li
              key={game.slug}
              draggable
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (overIndex !== i) setOverIndex(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) move(dragIndex, i);
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={`flex items-center gap-3 rounded-lg border px-2 py-1.5 bg-surface-container-high cursor-grab active:cursor-grabbing transition-colors ${
                overIndex === i && dragIndex !== null && dragIndex !== i ? "border-primary" : "border-outline-variant/20"
              } ${dragIndex === i ? "opacity-40" : ""}`}
            >
              <span className="w-6 text-center text-xs font-bold text-primary tabular-nums">{i + 1}</span>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">drag_indicator</span>
              {coverOf(game) ? (
                <img src={coverOf(game)} alt="" className="w-9 h-12 object-cover rounded" draggable={false} />
              ) : (
                <span className="w-9 h-12 rounded bg-surface-variant" />
              )}
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-white truncate">{game.name}</span>
                {game.status !== "active" && <span className="text-[0.625rem] uppercase tracking-wider text-on-surface-variant">Próximamente</span>}
              </span>
              <span className="flex gap-1">
                <IconBtn icon="vertical_align_top" label="Primero" onClick={() => move(i, 0)} disabled={i === 0} />
                <IconBtn icon="arrow_upward" label="Subir" onClick={() => move(i, i - 1)} disabled={i === 0} />
                <IconBtn icon="arrow_downward" label="Bajar" onClick={() => move(i, i + 1)} disabled={i === list.length - 1} />
              </span>
            </li>
          ))}
        </ol>

        <div className="flex justify-between gap-3 px-5 py-4 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={reset}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-outline-variant/30 text-on-surface-variant font-bold text-sm bg-transparent cursor-pointer disabled:opacity-50"
          >
            Deshacer cambios
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-5 py-2 rounded-lg gold-gradient text-black font-bold text-sm border-0 cursor-pointer disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar orden"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function IconBtn({ icon, label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="w-7 h-7 rounded border border-outline-variant/30 bg-transparent text-on-surface-variant hover:text-primary hover:border-primary/50 flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-default"
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
    </button>
  );
}
