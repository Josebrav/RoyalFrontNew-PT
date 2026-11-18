import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { updateSiteContentImage, updateSiteContentLink } from "../../redux/actions";
import { swalThemeConfig } from "../../utils/formatters";
import { LOCALE } from "../../i18n/locale";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Renders <img> + (for admins/mods) overlay "Editar imagen" and "Editar link" buttons, as
// siblings — assumes the caller's own wrapping element already has position:relative (matches
// every current call site, which are all banner/card containers that are already `relative`),
// so it doesn't add an extra wrapping div that would fight with the `className` prop's own
// absolute-positioning needs.
// placeholder: qué mostrar si no hay imagen (por defecto, un ícono). allowLink: false oculta el botón
// de "Editar link" donde no tiene sentido (ej. las imágenes de los paquetes de fichas).
// perLocale: la imagen es de cada sitio (banners con texto). En los sitios en portugués/inglés se guarda bajo
// `${contentKey}.${LOCALE}` (cambiarla ahí no toca royaljuegos.com, ni al revés); mientras no tenga una propia,
// muestra la del sitio en español.
export default function EditableImage({ contentKey, fallbackSrc, fallbackIcon = "image", alt = "", className = "", recommendedSize, placeholder, allowLink = true, perLocale = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.currentUser);
  const effectiveKey = perLocale && LOCALE !== "es" ? `${contentKey}.${LOCALE}` : contentKey;
  const own = useSelector((state) => state.siteContent[effectiveKey]);
  const base = useSelector((state) => state.siteContent[contentKey]);
  const canEdit = currentUser?.role === "admin" || currentUser?.role === "mod";
  const imageOf = (o) => (o?.type === "image" && o.imageUrl ? o.imageUrl : null);
  const src = imageOf(own) || imageOf(base) || fallbackSrc;
  const linkTo = (own ? own.linkTo : base?.linkTo) || null;

  const handleImageClick = (e) => {
    // Sin link propio: no frena la propagación, así el onClick del contenedor padre (ej. un
    // "próximamente") sigue funcionando igual que antes de que existiera este sistema de links.
    if (!linkTo) return;
    e.stopPropagation();
    if (/^https?:\/\//i.test(linkTo)) {
      window.open(linkTo, "_blank", "noopener,noreferrer");
    } else {
      navigate(linkTo);
    }
  };

  const handleEditLink = async (e) => {
    e.stopPropagation();
    const { value: newLink, isConfirmed } = await Swal.fire({
      title: "Link de destino",
      input: "text",
      inputValue: linkTo || "",
      inputPlaceholder: "/ayuda, /juegos, https://... (opcional)",
      text: "A dónde navega al tocar esta imagen. Dejalo vacío para que no sea clickeable.",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      ...swalThemeConfig,
    });
    if (!isConfirmed) return;
    try {
      await dispatch(updateSiteContentLink(effectiveKey, newLink?.trim() || null));
    } catch (error) {
      Swal.fire({ title: "Error", text: "No se pudo actualizar el link.", icon: "error", ...swalThemeConfig });
    }
  };

  const handleEdit = async (e) => {
    e.stopPropagation();
    const { value: file } = await Swal.fire({
      title: "Cambiar imagen",
      text: recommendedSize ? `Tamaño recomendado: ${recommendedSize}` : undefined,
      input: "file",
      inputAttributes: { accept: "image/jpeg,image/png,image/webp" },
      showCancelButton: true,
      confirmButtonText: "Subir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#C9A84C",
      inputValidator: (file) => {
        if (!file) return "Elegí un archivo.";
        if (!ALLOWED_TYPES.includes(file.type)) return "Formato no permitido. Usá JPG, PNG o WEBP.";
        if (file.size > MAX_FILE_SIZE) return "El archivo pesa más de 5MB.";
      },
      ...swalThemeConfig,
    });
    if (!file) return;
    try {
      await dispatch(updateSiteContentImage(effectiveKey, file));
    } catch (error) {
      Swal.fire({ title: "Error", text: "No se pudo subir la imagen.", icon: "error", ...swalThemeConfig });
    }
  };

  return (
    <>
      {src ? (
        <img
          src={src}
          alt={alt}
          onClick={handleImageClick}
          className={`${className} ${linkTo ? "cursor-pointer" : ""}`}
        />
      ) : placeholder ? (
        <div className={className}>{placeholder}</div>
      ) : (
        // Sin imagen en la CMS y sin fallback local (ej. un juego nuevo sin cover todavía) — un
        // <img src={undefined}> se ve roto y muestra el alt como texto crudo. Este placeholder
        // deja clara la falta sin verse como un bug, hasta que un admin suba una imagen real.
        <div className={`${className} flex items-center justify-center bg-surface-container-high text-on-surface-variant`}>
          <span className="material-symbols-outlined text-4xl">{fallbackIcon}</span>
        </div>
      )}
      {canEdit && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          {allowLink && (
            <button
              type="button"
              onClick={handleEditLink}
              title="Editar link de destino"
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-primary flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">link</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleEdit}
            title="Editar imagen"
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-primary flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
        </div>
      )}
    </>
  );
}
