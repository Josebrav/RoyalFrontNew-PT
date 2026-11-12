import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { fetchNews, createNewsArticle, updateNewsArticle, deleteNewsArticle } from "../../redux/actions";
import { swalThemeConfig } from "../../utils/formatters";
import { SOCIAL_LINKS, FacebookIcon, InstagramIcon } from "../ui/SocialIcons";

const TAG_META = {
  Lanzamiento: "text-primary bg-primary/10 border-primary/30",
  Juegos: "text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/30",
  Promoción: "text-green-400 bg-green-400/10 border-green-400/30",
  Novedad: "text-[#4f8fe0] bg-[#4f8fe0]/10 border-[#4f8fe0]/30",
};

const TAG_ICON = {
  Lanzamiento: "rocket_launch",
  Juegos: "casino",
  Promoción: "redeem",
  Novedad: "campaign",
};

const TAG_OPTIONS = Object.keys(TAG_META);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const emptyForm = { titulo: "", texto: "", tag: TAG_OPTIONS[0], image: null, linkTo: "", featured: false, featuredUntil: "" };

// "2026-11-30T23:59" (input datetime-local, hora local) <-> ISO del servidor
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Ruta interna ("/game/...") o URL completa: las internas se abren en la misma pestaña. */
const isExternalLink = (link) => /^https?:\/\//i.test(link || "");

function NewsFormModal({ article, onClose, onSaved }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(
    article
      ? {
          titulo: article.titulo,
          texto: article.texto,
          tag: article.tag,
          image: null,
          linkTo: article.linkTo || "",
          featured: Boolean(article.featured),
          featuredUntil: toLocalInput(article.featuredUntil),
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      Swal.fire({ title: "Formato no permitido", text: "Usá JPG, PNG o WEBP.", icon: "error", ...swalThemeConfig });
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      Swal.fire({ title: "Archivo muy pesado", text: "El límite es 5MB.", icon: "error", ...swalThemeConfig });
      e.target.value = "";
      return;
    }
    setForm((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.texto.trim()) {
      Swal.fire({ title: "Faltan datos", text: "Completá título y texto.", icon: "warning", ...swalThemeConfig });
      return;
    }
    const link = form.linkTo.trim();
    if (link && !/^(\/\S*|https?:\/\/\S+)$/i.test(link)) {
      Swal.fire({ title: "Enlace inválido", text: "Tiene que empezar con / (página del sitio) o con https://", icon: "warning", ...swalThemeConfig });
      return;
    }
    if (form.featured && !form.image && !article?.imageUrl) {
      Swal.fire({ title: "Falta el banner", text: "Para salir en primera plana la noticia necesita una imagen.", icon: "warning", ...swalThemeConfig });
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("titulo", form.titulo.trim());
      formData.append("texto", form.texto.trim());
      formData.append("tag", form.tag);
      if (form.image) formData.append("image", form.image);
      formData.append("linkTo", link);
      formData.append("featured", form.featured ? "true" : "false");
      formData.append("featuredUntil", form.featured && form.featuredUntil ? new Date(form.featuredUntil).toISOString() : "");

      if (article) {
        await dispatch(updateNewsArticle(article.id, formData));
      } else {
        await dispatch(createNewsArticle(formData));
      }
      onSaved();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudo guardar la noticia.",
        icon: "error",
        ...swalThemeConfig,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="glass-card rounded-2xl border border-outline-variant/20 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm text-white">
            {article ? "Editar Noticia" : "Crear Noticia"}
          </h3>
          <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-primary bg-transparent border-0 cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant">Título</label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-on-surface outline-none focus:border-primary"
            disabled={saving}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant">Categoría</label>
          <select
            value={form.tag}
            onChange={(e) => setForm((prev) => ({ ...prev, tag: e.target.value }))}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-on-surface outline-none focus:border-primary"
            disabled={saving}
          >
            {TAG_OPTIONS.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant">Texto</label>
          <textarea
            rows={4}
            value={form.texto}
            onChange={(e) => setForm((prev) => ({ ...prev, texto: e.target.value }))}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-on-surface outline-none focus:border-primary resize-none"
            disabled={saving}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant">
            Imagen de Portada (opcional) — recomendado 1200×630px, JPG/PNG/WEBP hasta 5MB
          </label>
          {article?.imageUrl && !form.image && (
            <img src={article.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="w-full text-on-surface-variant text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:cursor-pointer"
            disabled={saving}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant">
            Enlace al tocar el banner (opcional) — ej. /game/sweettreats o https://...
          </label>
          <input
            type="text"
            value={form.linkTo}
            placeholder="/game/sweettreats"
            onChange={(e) => setForm((prev) => ({ ...prev, linkTo: e.target.value }))}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-on-surface outline-none focus:border-primary"
            disabled={saving}
          />
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
              className="w-5 h-5 accent-[#e9c349] cursor-pointer"
              disabled={saving}
            />
            <span className="text-sm text-white font-bold">Mostrar en primera plana</span>
          </label>
          <p className="text-xs text-on-surface-variant -mt-1">
            El banner aparece en el centro de la página, como las ofertas (una vez por día a cada visitante). Al tocarlo lleva al enlace.
          </p>
          {form.featured && (
            <div className="space-y-1">
              <label className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant">Mostrar hasta (vacío = sin fecha de fin)</label>
              <input
                type="datetime-local"
                value={form.featuredUntil}
                onChange={(e) => setForm((prev) => ({ ...prev, featuredUntil: e.target.value }))}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-on-surface outline-none focus:border-primary"
                disabled={saving}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg border border-outline-variant/30 text-on-surface-variant font-bold text-sm hover:bg-surface-variant/30 transition-all disabled:opacity-50 cursor-pointer bg-transparent"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg gold-gradient text-black font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer border-0"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function News() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.currentUser);
  const novedades = useSelector((state) => state.news.list);
  const canManage = currentUser?.role === "admin" || currentUser?.role === "mod";

  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [formState, setFormState] = useState(null); // null = closed, {} = creating, article = editing

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  // Enlace directo a una noticia (/noticias?articulo=<id>): abre su página, la lleva a la vista y
  // la resalta un momento.
  const [searchParams] = useSearchParams();
  const linkedId = searchParams.get("articulo");
  const [highlightedId, setHighlightedId] = useState(null);
  // Las noticias se muestran cerradas (título + comienzo del texto); "Ver más" las despliega.
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const toggleExpanded = (id) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const handledLinkRef = useRef(null);
  useEffect(() => {
    if (!linkedId || handledLinkRef.current === linkedId) return;
    const index = novedades.findIndex((n) => n.id === linkedId);
    if (index === -1) return;
    handledLinkRef.current = linkedId;
    setCurrentPage(Math.floor(index / itemsPerPage) + 1);
    setHighlightedId(linkedId);
    setExpandedIds((prev) => new Set(prev).add(linkedId));
    setTimeout(() => document.getElementById(`noticia-${linkedId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    setTimeout(() => setHighlightedId(null), 4000);
  }, [linkedId, novedades]);

  const totalPages = Math.max(1, Math.ceil(novedades.length / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const novedadesPagina = novedades.slice(startIdx, startIdx + itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  const handleDelete = async (article) => {
    const confirm = await Swal.fire({
      title: `¿Eliminar "${article.titulo}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      ...swalThemeConfig,
    });
    if (!confirm.isConfirmed) return;
    try {
      await dispatch(deleteNewsArticle(article.id));
    } catch (error) {
      Swal.fire({ title: "Error", text: "No se pudo eliminar la noticia.", icon: "error", ...swalThemeConfig });
    }
  };

  return (
    <main className="max-w-3xl mx-auto w-full pt-20 md:pt-24 px-4 pb-16 text-on-surface">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-white mb-2">Noticias</h1>
          <p className="text-on-surface-variant text-sm">Todo lo nuevo en RoyalGames.</p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setFormState({})}
            className="flex-shrink-0 px-4 py-2.5 rounded-lg gold-gradient text-black font-bold text-sm hover:brightness-110 transition-all cursor-pointer border-0 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Crear Noticia
          </button>
        )}
      </div>

      <div className="glass-card rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap mb-8">
        <p className="text-on-surface-variant text-sm font-bold">Seguinos para no perderte nada</p>
        <div className="flex items-center gap-3">
          <a
            href={SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors"
            aria-label="Facebook"
          >
            <FacebookIcon className="w-5 h-5" />
          </a>
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors"
            aria-label="Instagram"
          >
            <InstagramIcon className="w-5 h-5" />
          </a>
        </div>
      </div>

      {novedades.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3 block">newspaper</span>
          <p className="text-on-surface-variant">Todavía no hay noticias publicadas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {novedadesPagina.map((novedad) => (
            <div
              key={novedad.id}
              id={`noticia-${novedad.id}`}
              className={`glass-card rounded-xl p-5 flex gap-4 border-l-4 border-primary relative transition-shadow duration-500 ${
                highlightedId === novedad.id ? "ring-2 ring-primary shadow-[0_0_24px_rgba(230,195,100,0.45)]" : ""
              }`}
            >
              {novedad.imageUrl ? (
                <img
                  src={novedad.imageUrl}
                  alt={novedad.titulo}
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-primary/30"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-[22px]">{TAG_ICON[novedad.tag] || "campaign"}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-white">{novedad.titulo}</h3>
                  {canManage && novedad.featured && (
                    <span className="text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 text-primary bg-primary/10 border-primary/40">
                      Primera plana
                    </span>
                  )}
                  <span className={`text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${TAG_META[novedad.tag] || ""}`}>
                    {novedad.tag}
                  </span>
                </div>
                {(() => {
                  const isExpanded = expandedIds.has(novedad.id);
                  const isLong = novedad.texto.length > 160 || novedad.texto.includes("\n");
                  return (
                    <>
                      <p
                        className={`text-on-surface-variant text-sm leading-relaxed ${
                          isExpanded ? "whitespace-pre-line" : "line-clamp-2"
                        }`}
                      >
                        {novedad.texto}
                      </p>
                      {isLong && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(novedad.id)}
                          aria-expanded={isExpanded}
                          className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer bg-transparent border-0 p-0 flex items-center gap-1"
                        >
                          {isExpanded ? "Ver menos" : "Ver más"}
                          <span className="material-symbols-outlined text-[16px]">
                            {isExpanded ? "expand_less" : "expand_more"}
                          </span>
                        </button>
                      )}
                    </>
                  );
                })()}
                {novedad.linkTo && (
                  <a
                    href={novedad.linkTo}
                    {...(isExternalLink(novedad.linkTo) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="mt-3 inline-flex items-center gap-1 px-4 py-1.5 rounded-lg gold-gradient text-black text-xs font-bold uppercase tracking-wider no-underline hover:brightness-110"
                  >
                    Ver más
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                )}
              </div>
              {canManage && (
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setFormState(novedad)}
                    title="Editar"
                    className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 border border-white/10 text-primary flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(novedad)}
                    title="Eliminar"
                    className="w-7 h-7 rounded-full bg-black/30 hover:bg-error/30 border border-white/10 text-error flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {novedades.length > 0 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-5 py-2 rounded-lg border border-outline-variant/30 text-on-surface-variant font-bold text-sm hover:bg-surface-variant/30 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent"
          >
            Anterior
          </button>
          <span className="text-on-surface-variant text-xs">{currentPage} / {totalPages}</span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-5 py-2 rounded-lg gold-gradient text-black font-bold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-0"
          >
            Siguiente
          </button>
        </div>
      )}

      {formState !== null && (
        <NewsFormModal
          article={formState.id ? formState : null}
          onClose={() => setFormState(null)}
          onSaved={() => setFormState(null)}
        />
      )}
    </main>
  );
}
