import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { fetchConversations } from "../../redux/actions/index";
import { t } from "../../i18n/strings";

export default function Sidebar() {
  const dispatch = useDispatch();
  const { currentUser, messages } = useSelector((state) => state);
  const location = useLocation();

  // Mods ven el panel de admin igual que los admins (todo excepto gestión de roles).
  const canAccessAdminPanel = currentUser?.role === "admin" || currentUser?.role === "mod";
  const unreadTotal = (messages?.conversations || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchConversations());
    }
  }, [dispatch, currentUser?.id]);

  // `color` tiñe solo el ícono de cada ítem (reusando la misma paleta de las categorías de
  // juegos: azul/verde/violeta/teal) — el texto y el estado activo/hover quedan exactamente
  // como antes, así cada fila se distingue de un vistazo sin cambiar la estructura del panel.
  const accountItems = [
    { to: "/chips", icon: "paid", label: t("sidebar.comprarFichas"), color: "#4caf7d" },
    { to: "/chips?tab=history", icon: "receipt_long", label: t("sidebar.historial"), color: "#4f8fe0" },
  ];

  const socialItems = [
    { to: "/amigos", icon: "group", label: t("sidebar.amigos"), color: "#a855f7" },
    { to: "/mensajes", icon: "forum", label: t("sidebar.mensajes"), badge: unreadTotal, color: "#2dd4bf" },
    { to: "/ayuda", icon: "support_agent", label: t("sidebar.ayuda"), color: "#4caf7d" },
  ];

  // "Cargas" es el listado global de depósitos de toda la plataforma (un resumen de dinero) —
  // queda admin-only, igual que el backend. Los mods igual pueden ver los depósitos de UN
  // cliente puntual, pero desde la sección "Actividad" del detalle de ese usuario, no acá.
  const adminItems = [
    { to: "/admin/dashboard", icon: "dashboard", label: t("sidebar.panelAdmin"), color: "#4f8fe0" },
    { to: "/admin/users", icon: "manage_accounts", label: t("sidebar.usuarios"), color: "#a855f7" },
    { to: "/admin/tickets", icon: "support_agent", label: t("sidebar.tickets"), color: "#2dd4bf" },
    ...(currentUser?.role === "admin" ? [{ to: "/admin/deposits", icon: "payments", label: t("sidebar.cargas"), color: "#4caf7d" }] : []),
    ...(currentUser?.role === "admin" ? [{ to: "/admin/game-stats", icon: "query_stats", label: t("sidebar.estadisticasJuegos"), color: "#e6c364" }] : []),
    ...(currentUser?.role === "admin" ? [{ to: "/admin/promos", icon: "campaign", label: t("sidebar.promociones"), color: "#2dd4bf" }] : []),
    { to: "/admin/prizes", icon: "emoji_events", label: t("sidebar.premios"), color: "#a855f7" },
    { to: "/admin/referrals", icon: "diversity_3", label: t("sidebar.referidos"), color: "#2dd4bf" },
    { to: "/admin/trophies", icon: "military_tech", label: t("sidebar.trofeos"), color: "#4f8fe0" },
    { to: "/admin/game-images", icon: "photo_library", label: t("sidebar.imagenesJuegos"), color: "#4caf7d" },
    ...(currentUser?.role === "admin" || currentUser?.role === "mod" ? [{ to: "/admin/bingo-bots", icon: "smart_toy", label: t("sidebar.bots"), color: "#a855f7" }] : []),
  ];

  if (!currentUser?.id || location.pathname.includes("/game")) {
    return null;
  }

  const renderLink = ({ to, icon, label, badge, color }) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `group relative flex items-center justify-center lg:justify-start gap-3 w-12 h-12 lg:w-full lg:h-auto lg:px-3 lg:py-2.5 rounded-lg transition-colors duration-200 ${
          isActive
            ? "hud-side-link is-active text-primary"
            : "hud-side-link text-on-surface-variant hover:text-primary"
        }`
      }
    >
      <span className="relative material-symbols-outlined text-[22px]" style={{ color }}>
        {icon}
        {!!badge && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-error border-2 border-surface" />
        )}
      </span>
      <span className="hidden lg:inline font-body-sm text-body-sm whitespace-nowrap">
        {label}
      </span>
      {!!badge && (
        <span className="hidden lg:inline-flex ml-auto bg-primary text-black text-[0.625rem] font-bold rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
          {badge}
        </span>
      )}
      {/* Tooltip for collapsed (icon-only) state */}
      <span className="lg:hidden pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded bg-surface-container-high border border-outline-variant/30 px-2 py-1 text-xs text-on-surface opacity-0 group-hover:opacity-100 transition-opacity z-50">
        {label}
      </span>
    </NavLink>
  );

  return (
    <aside className="hidden md:flex fixed left-0 top-20 bottom-0 z-40 w-16 lg:w-56 flex-col gap-6 hud-side px-2 lg:px-4 py-6 overflow-y-auto">
      <div className="flex flex-col gap-1">
        <p className="hud-side-label hidden lg:flex px-3 mb-1 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/70">
          {t("sidebar.cuenta")}
        </p>
        {accountItems.map(renderLink)}
      </div>

      <div className="flex flex-col gap-1">
        <p className="hud-side-label hidden lg:flex px-3 mb-1 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/70">
          {t("sidebar.social")}
        </p>
        {socialItems.map(renderLink)}
      </div>

      {canAccessAdminPanel && (
        <div className="flex flex-col gap-1">
          <p className="hud-side-label hidden lg:flex px-3 mb-1 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/70">
            {t("sidebar.administracion")}
          </p>
          {adminItems.map(renderLink)}
        </div>
      )}
    </aside>
  );
}
