import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import axios from "axios";

import banner1 from "../../assets/banner1.png";
import sportsBanner from "../../assets/b1.jpg";
import bannercelu from "../../assets/bannercelu.png";
import logo from "../../assets/LogoOficial.PNG";

import Login from "../Login/login";
import RegistroForm from "../Register/register";
// La animacion de fondo usa three.js (pesado): se descarga despues de mostrar la pagina.
const ShaderAnimation = lazy(() => import("../ui/shader-animation").then((m) => ({ default: m.ShaderAnimation })));
import { formatChips, swalThemeConfig } from "../../utils/formatters";
import GamesCatalog from "../GamesCatalog/gamesCatalog";
import DailySpinModal from "../DailySpin/DailySpinModal";
import DailyBonusModal from "../DailyBonus/DailyBonusModal";
import MissionsCard from "../Missions/missionsCard";
import EditableText from "../ui/EditableText";
import EditableImage from "../ui/EditableImage";
import BannerCarousel from "../ui/BannerCarousel";
import { GAMES_CATALOG, CATEGORY_META, getDisplayedPlayers, getGameBySlug } from "../../data/gamesCatalog";
import { useOrderedGames } from "../../data/gameOrder";
import GameOrderEditor from "../ui/GameOrderEditor";
import { fetchUserProfile, getUserByEmail } from "../../redux/actions";
import API_URL from "../../api/rutaApi";
import { useAuth } from "../../context/oauthContext";
import { t } from "../../i18n/strings";
import { LOCALE } from "../../i18n/locale";
import SeoIntro from "./seoIntro";
import { POINTS_AND_TOURNAMENTS_NEWS_ID, newsArticlePath } from "../../data/newsLinks";

// Colores del podio (1, 2, 3) y del resto de la lista de Top Ganadores.
const PODIUM = [
  { c: "#facc15", bg: "linear-gradient(90deg, rgba(250,204,21,0.28), rgba(250,204,21,0.06))" },
  { c: "#cbd5e1", bg: "linear-gradient(90deg, rgba(203,213,225,0.22), rgba(203,213,225,0.05))" },
  { c: "#f59e0b", bg: "linear-gradient(90deg, rgba(217,119,66,0.26), rgba(217,119,66,0.05))" },
];
const PODIUM_REST = { c: "#a78bfa", bg: "linear-gradient(90deg, rgba(139,92,246,0.16), rgba(139,92,246,0.03))" };

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state);
  // Sin miniatura propia, las tarjetas usan la portada que ya se habia subido (games.<slug>.cover).
  const siteContent = useSelector((state) => state.siteContent);
  const cardFallback = (game) => {
    const cover = siteContent?.[`games.${game.slug}.cover`];
    return cover?.type === "image" && cover.imageUrl ? cover.imageUrl : game.image;
  };
  const orderedGames = useOrderedGames();
  // Al recargar la página, restaurar la sesión (canjear la cookie httpOnly por un access token
  // nuevo) es async — mientras tanto currentUser?.id todavía es falsy en Redux, así que sin este
  // chequeo se alcanzaba a pintar la landing de invitado (con el botón de Iniciar Sesión) un
  // instante antes de que la sesión real apareciera y recién ahí saltara al dashboard. auth.loading
  // deja esperar ese instante en vez de comprometerse a una de las dos vistas de entrada.
  const auth = useAuth();
  // Sin sesión se entra directo al inicio con los juegos (antes había una pantalla de bienvenida con
  // Crear cuenta / Iniciar sesión / Entrar como invitado; se quitó a pedido). La nav sigue ofreciendo
  // Iniciar Sesión / Registrarse.
  const isGuestPreview = !currentUser?.id;

  const [topWinners, setTopWinners] = useState([]);
  const [recentWins, setRecentWins] = useState([]);

  // La ruleta ya NO aparece sola al loguearse (Unity tiene su propia pantalla de carga, se
  // sentia intrusivo) - se abre solo cuando el jugador clickea la tarjeta "Giro Diario VIP",
  // y dailySpinStatus (traido de GET /daily-spin/status) decide si esa tarjeta ofrece girar
  // o avisa que ya giro hoy.
  const [showDailySpin, setShowDailySpin] = useState(false);
  const [dailySpinStatus, setDailySpinStatus] = useState(null);
  useEffect(() => {
    if (!currentUser?.id) return;
    axios.get(`${API_URL}/daily-spin/status`).then(({ data }) => setDailySpinStatus(data)).catch(() => {});
  }, [currentUser?.id]);

  // Bono Diario de 7 días (independiente del Giro Diario de arriba, no se excluyen entre sí):
  // si al entrar/loguearse todavía no reclamó el de hoy, el modal se abre solo.
  const [dailyBonusStatus, setDailyBonusStatus] = useState(null);
  useEffect(() => {
    if (!currentUser?.id) return;
    axios.get(`${API_URL}/daily-bonus/status`).then(({ data }) => setDailyBonusStatus(data)).catch(() => {});
  }, [currentUser?.id]);

  const handleDailyBonusClaimed = ({ error }) => {
    if (error) {
      setDailyBonusStatus((prev) => (prev ? { ...prev, canClaim: false } : prev));
      Swal.fire({ title: t("dailyBonus.title"), text: error, icon: "error", ...swalThemeConfig });
      return;
    }
    setDailyBonusStatus((prev) => (prev ? { ...prev, canClaim: false } : prev));
    if (currentUser?.email) {
      dispatch(getUserByEmail(currentUser.email));
    }
  };

  // Real recent wins (chips actually won in games) for the guest landing page ticker.
  useEffect(() => {
    if (currentUser?.id) return;
    axios.get(`${API_URL}/leaderboard/recent-wins?limit=12`).then(({ data }) => setRecentWins(data)).catch(() => {});
  }, [currentUser?.id]);

  // Scroll reveal animation observer
  useEffect(() => {
    if (currentUser?.id || isGuestPreview) return;

    const observerOptions = {
      threshold: 0.1,
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => revealObserver.observe(el));

    // Red de seguridad: `.reveal` arranca en opacity:0 (ver index.css) y se queda así para
    // siempre si por lo que sea el IntersectionObserver nunca dispara (ej. el layout todavía no
    // asentó cuando se creó, o el navegador tarda en pintar) — eso deja el título y los botones
    // de "Iniciar Sesión"/"Registrarse" invisibles sin ningún error en consola, indistinguible de
    // una página realmente rota. Después de un instante, se fuerza "active" en todo lo que
    // todavía no lo tenga, sea cual sea la razón — nunca debería depender de esto en el uso
    // normal (el observer ya debería haber disparado antes), pero garantiza que el contenido de
    // arriba de la página SIEMPRE termine visible.
    const fallbackTimer = setTimeout(() => {
      document.querySelectorAll(".reveal:not(.active)").forEach((el) => el.classList.add("active"));
    }, 700);

    return () => {
      elements.forEach((el) => revealObserver.unobserve(el));
      clearTimeout(fallbackTimer);
    };
    // auth.loading en las deps: este efecto corre en CADA render de Home (los hooks son
    // incondicionales), incluido el primero, mientras auth.loading todavía es true y Home solo
    // muestra el spinner - en ese momento document.querySelectorAll(".reveal") no encuentra nada
    // porque el JSX de invitado (con los .reveal reales) ni se montó. Sin auth.loading acá, el
    // observer y el fallback de 700ms se arman contra ese DOM vacío y nunca se vuelven a armar
    // cuando el JSX de invitado por fin aparece - los .reveal reales se quedan en opacity:0 para
    // siempre (logo, texto y botones invisibles, aunque el fondo sí se vea porque no tiene esta
    // clase). Justo el bug reportado: "no aparecen los logos ni los botones la primera vez".
  }, [currentUser, auth.loading]);

  // Parallax effect for cards
  useEffect(() => {
    if (currentUser?.id || isGuestPreview) return;

    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll(".glass-card-hover");
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;

      cards.forEach((card, index) => {
        const factor = (index + 1) * 10;
        card.style.transform = `translate(${mouseX * factor}px, ${mouseY * factor}px) translateY(-8px)`;
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [currentUser, auth.loading]);

  // Real top-winners leaderboard (chips actually won in games)
  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchWidgets = () => {
      axios.get(`${API_URL}/leaderboard/top-winners?limit=5`).then(({ data }) => setTopWinners(data)).catch(() => {});
    };
    fetchWidgets();
    const interval = setInterval(fetchWidgets, 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Helper alerts and navigation functions
  const handlePlayGame = (path, title) => {
    if (path) {
      navigate(path);
    } else {
      Swal.fire({
        title: `${title}`,
        text: "¡Este juego estará disponible muy pronto! Nuestro equipo real está trabajando para traértelo.",
        icon: "info",
        ...swalThemeConfig,
      });
    }
  };

  const handleClaimDailySpin = () => {
    if (dailySpinStatus && !dailySpinStatus.canSpin) {
      Swal.fire({
        title: "Giro Diario VIP",
        text: "Ya reclamaste tu giro de hoy. ¡Volvé mañana por más fichas!",
        icon: "info",
        ...swalThemeConfig,
      });
      return;
    }
    setShowDailySpin(true);
  };

  const handleDailySpinResult = ({ amount, error }) => {
    setShowDailySpin(false);
    if (error) {
      Swal.fire({ title: "Giro Diario VIP", text: error, icon: "error", ...swalThemeConfig });
      return;
    }
    setDailySpinStatus({ canSpin: false, lastSpinAt: new Date().toISOString(), nextAvailableAt: null });
    dispatch(fetchUserProfile());
    Swal.fire({
      title: "Giro Diario VIP",
      text: `¡Ganaste ${new Intl.NumberFormat("es-ES").format(amount)} fichas! Se sumaron a tu balance.`,
      icon: "success",
      ...swalThemeConfig,
    });
  };

  const handleSoonAlert = (section) => {
    Swal.fire({
      title: section,
      text: "¡Esta promoción estará disponible muy pronto! Sigue atento a las novedades.",
      icon: "info",
      ...swalThemeConfig,
    });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // --- RENDERING CONFIG ---

  console.log("[Home] render, auth.loading=", auth.loading, "currentUser?.id=", currentUser?.id, "isGuestPreview=", isGuestPreview);

  // Todavía no sabemos si hay sesión o no (ver comentario junto a `auth` arriba) — ni landing de
  // invitado ni dashboard todavía, solo un loader, para no pasar de una pantalla a otra de golpe.
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. Authenticated User Lobby Dashboard (also shown, with no account data, for the
  // "Entrar como Invitado" preview)
  if (currentUser?.id || isGuestPreview) {
    const formattedChipsValue = formatChips(currentUser?.chips);

    let vipLevel = "Bronce I";
    if (currentUser?.chips >= 1000000) {
      vipLevel = "VIP Platino I";
    } else if (currentUser?.chips >= 100000) {
      vipLevel = "Oro IV";
    } else if (currentUser?.chips >= 10000) {
      vipLevel = "Plata II";
    } else if (currentUser?.chips > 0) {
      vipLevel = "Bronce IV";
    }

    return (
      <div className="bg-background text-on-background font-body-md overflow-x-hidden min-h-screen select-none pb-24 md:pb-12">
        {showDailySpin && (
          <DailySpinModal onClose={() => setShowDailySpin(false)} onResult={handleDailySpinResult} />
        )}

        {!showDailySpin && dailyBonusStatus?.canClaim && (
          <DailyBonusModal
            day={dailyBonusStatus.day}
            onClose={() => setDailyBonusStatus((prev) => (prev ? { ...prev, canClaim: false } : prev))}
            onClaimed={handleDailyBonusClaimed}
          />
        )}

        {/* Sticky Balance Bar (Below Navbar) */}
        {/* <div className="sticky top-16 z-40 bg-surface-container-low border-b border-outline-variant/10 px-4 md:px-margin-desktop py-2 flex items-center justify-between">
          <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar py-1">
            <div className="flex flex-col text-left">
              <span className="text-on-surface-variant text-[0.625rem] uppercase font-bold tracking-widest">Balance Real</span>
              <span className="text-on-surface font-bold text-label-lg font-label-lg">{formattedChipsValue}</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-on-surface-variant text-[0.625rem] uppercase font-bold tracking-widest">Crédito de Bono</span>
              <span className="text-primary font-bold text-label-lg font-label-lg">$250.00</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-on-surface-variant text-[0.625rem] uppercase font-bold tracking-widest">Nivel VIP</span>
              <span className="text-secondary font-bold text-label-lg font-label-lg">{vipLevel}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/chips')}
            className="gold-gradient px-6 py-2 rounded-lg text-on-primary font-bold text-label-lg font-label-lg hover:scale-105 active:scale-95 transition-transform gold-glow cursor-pointer border-0"
          >
            Depositar
          </button>
        </div> */}

        {/* Dashboard Main Content */}
        <main className="pt-6 px-4 md:px-margin-desktop max-w-container-max mx-auto space-y-12 pb-16">
          {/* Promo Carousel Bento Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[400px]">
            {/* Main Slide */}
            <div className="lg:col-span-8 relative rounded-xl overflow-hidden border border-outline-variant/30 group h-[320px] lg:h-full">
              <BannerCarousel
                fallbackSrc={banner1}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>

            {/* Secondary promo slides/widgets */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-[320px] lg:h-full">
              <div 
                onClick={() => handleSoonAlert('Bono Semanal')}
                className="relative flex-1 rounded-xl overflow-hidden border border-outline-variant/30 group cursor-pointer"
              >
                <EditableImage
                  contentKey="home.dashboard.banner2"
                  perLocale
                  fallbackSrc={sportsBanner}
                  alt="Banner de Bono Semanal"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  recommendedSize="800×400px aprox., JPG o PNG"
                />
                {/* <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end text-left">
                  <h3 className="font-headline-sm text-headline-sm text-white">Bono Semanal</h3>
                  <p className="text-on-surface-variant text-body-sm font-body-sm">Mejora tus fines de semana con un bono del 50%.</p>
                </div> */}
              </div>

              <div 
                onClick={() => handleSoonAlert('Premios')}
                className="relative flex-1 rounded-xl overflow-hidden border border-primary/40 group cursor-pointer gold-glow"
              >
                <EditableImage
                  contentKey="home.dashboard.banner3"
                  perLocale
                  fallbackSrc={bannercelu}
                  alt="Banner de Premios"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  recommendedSize="800×400px aprox., JPG o PNG"
                />
                {/* <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent p-6 flex flex-col justify-end text-left">
                  <h3 className="font-headline-sm text-headline-sm text-primary">Premios</h3>
                  <p className="text-white text-body-sm font-body-sm">Ganancias diarias en todos tus favoritos.</p>
                </div> */}
              </div>
            </div>
          </section>

          {/* Juegos + Top Ganadores/Conectados: una sola grilla. En pantallas grandes el panel de la
              derecha ocupa las 2 ultimas columnas de las primeras filas y las tarjetas siguen por debajo
              de el, a todo el ancho (juegos activos y despues los proximos, en gris). */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6">
              <div className="col-span-2 md:col-span-4 xl:col-start-1 xl:row-start-1 flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-[#ffe08f] via-[#f9a8d4] to-[#7dd3fc]">
                  <span className="w-8 h-8 rounded-lg inline-flex items-center justify-center bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] shadow-[0_0_14px_rgba(139,92,246,0.55)] material-symbols-outlined text-[18px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <EditableText contentKey="home.dashboard.popularGamesTitle" as="span">
                    {t("home.dashboard.popularGamesTitle")}
                  </EditableText>
                </h2>
                <div className="flex gap-2 items-center">
                  <GameOrderEditor />
                  <button
                    onClick={() => navigate('/juegos')}
                    className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 border border-[#a78bfa]/40 flex items-center justify-center hover:bg-[#8b5cf6]/40 transition-colors text-[#c4b5fd] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button
                    onClick={() => navigate('/juegos')}
                    className="w-8 h-8 rounded-lg bg-[#06b6d4]/20 border border-[#22d3ee]/40 flex items-center justify-center hover:bg-[#06b6d4]/40 transition-colors text-[#67e8f9] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>

                {orderedGames.filter((game) => game.status === "active" && game.showOnHome !== false).map((game) => (
                  <div
                    key={game.slug}
                    className="group relative rounded-xl overflow-hidden border-2 transition-all duration-200 hover:-translate-y-1"
                    style={{
                      borderColor: `${CATEGORY_META[game.category].accent}66`,
                      background: `linear-gradient(180deg, #13152a, ${CATEGORY_META[game.category].accentTo}55)`,
                      boxShadow: `0 6px 18px ${CATEGORY_META[game.category].accent}22`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = CATEGORY_META[game.category].accent; e.currentTarget.style.boxShadow = `0 0 24px ${CATEGORY_META[game.category].accent}88`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${CATEGORY_META[game.category].accent}66`; e.currentTarget.style.boxShadow = `0 6px 18px ${CATEGORY_META[game.category].accent}22`; }}
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <EditableImage
                        contentKey={`games.${game.slug}.thumbnail`}
                        fallbackSrc={cardFallback(game)}
                        fallbackIcon={game.icon}
                        alt={game.name}
                        className="w-full h-full object-cover"
                        recommendedSize="600×800px aprox. (vertical), JPG o PNG"
                      />
                    </div>
                    <div className="p-3 text-left">
                      <span
                        className="inline-block text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 text-white"
                        style={{ background: `linear-gradient(90deg, ${CATEGORY_META[game.category].accent}, ${CATEGORY_META[game.category].accentTo})` }}
                      >
                        {t(`catalog.category.${game.category}`)}
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-label-lg font-label-lg truncate text-white min-w-0">{game.name}</h4>
                        <span className="flex items-center gap-1 text-[0.6875rem] text-on-surface-variant flex-shrink-0">
                          <span className="material-symbols-outlined text-[13px]">person</span>
                          {new Intl.NumberFormat("es-ES").format(getDisplayedPlayers(game))}
                        </span>
                      </div>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-[#0a0b18]/85 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handlePlayGame(game.playPath, game.name)}
                        className="bg-gradient-to-r from-[#22c55e] to-[#06b6d4] w-3/4 py-2 rounded-lg font-black text-white text-label-md cursor-pointer border-0 shadow-[0_0_16px_rgba(34,197,94,0.5)] hover:brightness-110"
                      >
                        {t("home.dashboard.jugar")}
                      </button>
                      <button
                        onClick={() => navigate(`/juegos/${game.slug}`)}
                        className="border border-[#a78bfa] bg-[#8b5cf6]/15 text-[#ddd6fe] w-3/4 py-2 rounded-lg font-bold text-label-md hover:bg-[#8b5cf6]/30 cursor-pointer"
                      >
                        {t("home.dashboard.info")}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Juegos que todavia no salieron: misma tarjeta, en gris y sin jugar */}
                {orderedGames.filter((game) => game.status !== "active" && game.showOnHome !== false).map((game) => (
                  <div
                    key={game.slug}
                    onClick={() => navigate(`/juegos/${game.slug}`)}
                    className="order-1 xl:order-none relative bg-surface-container-high/60 rounded-xl overflow-hidden border border-outline-variant/20 opacity-60 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <div className="aspect-[3/4] overflow-hidden grayscale bg-surface-container flex items-center justify-center">
                      <EditableImage
                        contentKey={`games.${game.slug}.cover`}
                        fallbackSrc={game.image}
                        fallbackIcon={game.icon}
                        alt={game.name}
                        className="w-full h-full object-cover"
                        recommendedSize="600×800px aprox. (vertical), JPG o PNG"
                      />
                    </div>
                    <div className="p-3 text-left">
                      <span className="inline-block text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 text-on-surface-variant/80 border border-outline-variant/30">
                        {t("catalog.proximamente")}
                      </span>
                      <h4 className="font-bold text-label-lg font-label-lg truncate text-on-surface-variant">{game.name}</h4>
                    </div>
                  </div>
                ))}

            {/* Top Winners + Online Players: arriba a la derecha (3 filas: titulo + 2 de tarjetas);
                en pantallas grandes va "flotando" (absolute) en su lugar de la grilla, asi su alto no estira
                las filas: el alto lo ponen las tarjetas y la lista de conectados usa scroll. */}
            <div className="col-span-2 md:col-span-4 xl:col-span-2 xl:col-start-5 xl:row-start-1 xl:row-span-3 xl:relative">
            <aside className="xl:absolute xl:inset-0 flex flex-col gap-4 text-left min-h-0">
              {/* Top Winners Leaderboard */}
              <div
                className="rounded-xl border border-emerald-400/40 overflow-hidden flex flex-col flex-shrink-0 xl:flex-[1_0_auto] bg-gradient-to-b from-[#0f2a2a] to-[#0d0f1f]"
                style={{ boxShadow: "0 0 24px rgba(52, 211, 153, 0.22)" }}
              >
                <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-4 flex justify-between items-center">
                  <h3 className="text-white font-bold text-headline-sm font-headline-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[22px] text-yellow-300" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                    {t("home.dashboard.topGanadores")}
                  </h3>
                  <span className="bg-black/25 text-white px-2 py-1 rounded text-label-md font-label-md font-bold">{t("home.dashboard.enVivo")}</span>
                </div>
                <div className="p-4 flex flex-col gap-2 xl:flex-[1_0_auto]">
                  {topWinners.length === 0 ? (
                    <p className="text-on-surface-variant text-sm text-center py-4">
                      {t("home.dashboard.noPrizesYet")}
                    </p>
                  ) : (
                    topWinners.map((player, index) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg border-l-4 xl:flex-[1_0_auto]"
                        style={{ background: (PODIUM[index] || PODIUM_REST).bg, borderLeftColor: (PODIUM[index] || PODIUM_REST).c }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 text-[#0a0b18]"
                            style={{ background: (PODIUM[index] || PODIUM_REST).c, boxShadow: `0 0 10px ${(PODIUM[index] || PODIUM_REST).c}99` }}
                          >
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate(`/perfil/${player.nick}`)}
                            className="font-bold text-white truncate hover:text-emerald-400 hover:underline cursor-pointer bg-transparent border-0 p-0 text-left"
                          >
                            {player.nick}
                          </button>
                        </div>
                        <span className="font-black flex-shrink-0" style={{ color: (PODIUM[index] || PODIUM_REST).c }}>
                          {new Intl.NumberFormat('es-ES').format(player.totalWon)}
                        </span>
                      </div>
                    ))
                  )}
                <button
                  type="button"
                  onClick={() => navigate(newsArticlePath(POINTS_AND_TOURNAMENTS_NEWS_ID))}
                  className="w-full text-center text-xs font-bold text-emerald-400 hover:underline cursor-pointer bg-transparent border-0 pt-1 flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">emoji_events</span>
                  ¿Cómo funcionan los puntos y torneos?
                </button>
                </div>
              </div>

              <MissionsCard />

              {/* Tarjeta de Giro Diario VIP oculta a pedido (ver handleClaimDailySpin,
                  DailySpinModal y GET /daily-spin/status, todo intacto por si se retoma) */}
            </aside>
            </div>
          </div>

        </main>

        {/* BottomNavBar (Mobile Only) */}
        <nav className="flex justify-around items-center h-16 px-4 md:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-surface-container border-t border-outline-variant/30 shadow-lg">
          <button 
            onClick={() => navigate('/')}
            className="text-primary flex flex-col items-center gap-1 transition-transform active:scale-90 duration-200 bg-transparent border-0 cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <span className="font-label-md text-label-md">{t("home.dashboard.navInicio")}</span>
          </button>
          <button
            onClick={() => navigate('/juegos')}
            className="text-on-surface-variant hover:text-primary flex flex-col items-center gap-1 transition-transform active:scale-90 duration-200 bg-transparent border-0 cursor-pointer"
          >
            <span className="material-symbols-outlined">casino</span>
            <span className="font-label-md text-label-md">{t("home.dashboard.navJuegos")}</span>
          </button>
          <button
            onClick={() => navigate('/juegos')}
            className="text-on-surface-variant hover:text-primary flex flex-col items-center gap-1 transition-transform active:scale-90 duration-200 bg-transparent border-0 cursor-pointer"
          >
            <span className="material-symbols-outlined">search</span>
            <span className="font-label-md text-label-md">{t("home.dashboard.navBuscar")}</span>
          </button>
          <button
            onClick={() => navigate(currentUser?.nick ? `/perfil/${currentUser.nick}` : '/perfil')}
            className="text-on-surface-variant hover:text-primary flex flex-col items-center gap-1 transition-transform active:scale-90 duration-200 bg-transparent border-0 cursor-pointer"
          >
            <span className="material-symbols-outlined">account_circle</span>
            <span className="font-label-md text-label-md">{t("home.dashboard.navPerfil")}</span>
          </button>
        </nav>
      </div>
    );
  }

  // 2. Unauthenticated Guest Landing Page
  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden hero-section">
        <Suspense fallback={null}>
          <ShaderAnimation />
        </Suspense>
        {/* El shader de fondo (ver shader-animation.jsx) sale mucho más intenso/saturado en vivo
            de lo que sugiere su fórmula leída en frío — un overlay oscuro fuerte en TODA el área
            (no solo arriba/abajo como antes) es lo que lo deja como una textura de fondo sutil en
            vez de un remolino de colores que tapa el logo y hace ilegibles los botones. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/55 to-background z-[1] pointer-events-none"></div>
        {/* Brillos de color en las esquinas, mismos tonos ya usados en las categorías de juegos
            del sitio (slots violeta, mensajes/otros teal) — van encima del overlay oscuro para que
            se noten sin volver a competir con el logo. */}
        <div
          className="absolute top-1/4 left-[20%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none z-[2]"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.14) 0%, rgba(0,0,0,0) 70%)" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-[20%] translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none z-[2]"
          style={{ background: "radial-gradient(circle, rgba(45,212,191,0.12) 0%, rgba(0,0,0,0) 70%)" }}
        ></div>
        <div className="relative z-10 max-w-6xl w-full px-6 flex flex-col items-center justify-center">
          <div className="text-center reveal" style={{ transitionDelay: "0.2s" }}>
            <img
              src={logo}
              alt="RoyalGames"
              className="w-56 sm:w-72 md:w-[420px] h-auto object-contain mx-auto mb-4 drop-shadow-[0_0_40px_rgba(201,168,76,0.4)]"
            />
            <EditableText
              contentKey="home.heroTagline"
              as="h1"
              className="text-on-surface-variant text-lg md:text-xl font-light tracking-tight mb-6"
              translations={{ en: "The best games site", pt: "A melhor página de jogos" }}
            >
              La mejor pagina de juegos
            </EditableText>
            <div className="flex flex-col items-center gap-6 relative">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <RegistroForm className="px-14 py-5 rounded-full gold-gradient text-black font-bold text-sm uppercase tracking-[0.2em] shadow-2xl btn-hover-glow transition-all cursor-pointer border-0">
                  {t("home.crearCuenta")}
                </RegistroForm>

                <button
                  onClick={() => window.dispatchEvent(new Event('open-login-modal'))}
                  className="px-14 py-5 rounded-full border-2 border-primary/50 text-primary font-bold text-sm uppercase tracking-[0.2em] hover:bg-primary/5 transition-all cursor-pointer bg-transparent"
                >
                  {t("home.iniciarSesion")}
                </button>
              </div>

              <button
                onClick={() => navigate('/?vista=invitado')}
                className="px-14 py-3 rounded-full text-on-surface-variant font-bold text-sm uppercase tracking-[0.2em] hover:text-primary transition-all cursor-pointer bg-transparent border-0"
              >
                {t("home.entrarInvitado")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Winners Ticker */}
      {recentWins.length > 0 && (
        <div className="bg-surface border-y border-white/5 py-5 overflow-hidden reveal">
          <div className="animate-ticker">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex gap-16 items-center px-8">
                {recentWins.map((win, i) => {
                  const gameName = getGameBySlug(win.game)?.name || "un juego";
                  return (
                    <div key={`${dup}-${win.id || i}`} className="flex items-center gap-4 whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-on-surface-variant font-medium">{t("home.tickerJugador")} <span className="text-primary font-bold">{win.nick}</span> {t("home.tickerGano")}</span>
                      <span className="text-white font-bold bg-white/5 px-3 py-1 rounded border border-white/10">
                        {new Intl.NumberFormat('es-ES').format(win.amount)} {t("home.tickerFichas")}
                      </span>
                      <span className="text-on-surface-variant/80 text-xs">{t("home.tickerEn")} {gameName}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Games Catalog by Category */}
      <GamesCatalog />

      {/* Por qué jugar con nosotros */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
          <div className="text-center reveal" style={{ transitionDelay: "0.1s" }}>
            <span className="material-symbols-outlined text-primary text-5xl mb-6">casino</span>
            <EditableText
              contentKey="home.why1.title"
              as="h4"
              className="text-white font-bold text-xl mb-4 tracking-tight"
              translations={{ en: "Clean, Fair Play", pt: "Jogo Limpo e Justo" }}
            >
              Juego Limpio y Parejo
            </EditableText>
            <EditableText
              contentKey="home.why1.text"
              className="text-on-surface-variant font-light text-sm leading-relaxed"
              translations={{
                en: "Results are always random, the same for everyone. This is about having fun, no house tricks.",
                pt: "Os resultados são sempre aleatórios, iguais para todos. Aqui se joga por diversão, sem truques da casa.",
              }}
            >
              Los resultados son siempre al azar, iguales para todos. Acá se juega por diversión, sin trampas de la casa.
            </EditableText>
          </div>

          <div className="text-center reveal" style={{ transitionDelay: "0.2s" }}>
            <span className="material-symbols-outlined text-primary text-5xl mb-6">shield_lock</span>
            <EditableText
              contentKey="home.why2.title"
              as="h4"
              className="text-white font-bold text-xl mb-4 tracking-tight"
              translations={{ en: "Your Account, Secure", pt: "Sua Conta, Segura" }}
            >
              Tu Cuenta, Segura
            </EditableText>
            <EditableText
              contentKey="home.why2.text"
              className="text-on-surface-variant font-light text-sm leading-relaxed"
              translations={{
                en: "We protect your data and progress with good security practices, so all you have to worry about is playing.",
                pt: "Cuidamos dos seus dados e do seu progresso com boas práticas de segurança, para que você só precise se preocupar em jogar.",
              }}
            >
              Cuidamos tus datos y tu progreso con buenas prácticas de seguridad, para que solo te preocupes por jugar.
            </EditableText>
          </div>

          <div className="text-center reveal" style={{ transitionDelay: "0.3s" }}>
            <span className="material-symbols-outlined text-primary text-5xl mb-6">support_agent</span>
            <EditableText
              contentKey="home.why3.title"
              as="h4"
              className="text-white font-bold text-xl mb-4 tracking-tight"
              translations={{ en: "We're Always With You", pt: "Estamos Sempre com Você" }}
            >
              Te Acompañamos Siempre
            </EditableText>
            <EditableText
              contentKey="home.why3.text"
              className="text-on-surface-variant font-light text-sm leading-relaxed"
              translations={{
                en: "Questions or an issue? Our real team is one message away — send us your query and we'll respond right away.",
                pt: "Dúvidas ou algum problema? Nossa equipe de verdade está a uma mensagem de distância, mande sua consulta e responderemos rapidinho.",
              }}
            >
              ¿Dudas o algún problema? Nuestro equipo real está a un mensaje de distancia, mandanos tu consulta y responderemos enseguida.
            </EditableText>
          </div>
        </div>
      </section>

      {LOCALE === "es" && <SeoIntro />}

      {/* BottomNavBar (Mobile Only for Guest) */}
      <nav className="fixed bottom-0 w-full z-50 rounded-t-xl bg-surface-container dark:bg-surface-container border-t border-outline-variant/30 shadow-lg flex justify-around items-center h-16 px-4 md:hidden">
        <button
          onClick={() => scrollToSection("hero-shader-canvas")}
          className="text-primary flex flex-col items-center gap-1 text-[0.6875rem] active:scale-90 transition-transform duration-200 bg-transparent border-0 cursor-pointer"
        >
          <span className="material-symbols-outlined">home</span>
          <span>{t("home.bottomNavInicio")}</span>
        </button>

        <button
          onClick={() => navigate("/juegos")}
          className="text-on-surface-variant hover:text-primary flex flex-col items-center gap-1 text-[0.6875rem] active:scale-90 transition-transform duration-200 bg-transparent border-0 cursor-pointer"
        >
          <span className="material-symbols-outlined">casino</span>
          <span>{t("home.bottomNavJuegos")}</span>
        </button>

        <button
          onClick={() => navigate("/juegos")}
          className="text-on-surface-variant hover:text-primary flex flex-col items-center gap-1 text-[0.6875rem] active:scale-90 transition-transform duration-200 bg-transparent border-0 cursor-pointer"
        >
          <span className="material-symbols-outlined">search</span>
          <span>{t("home.bottomNavBuscar")}</span>
        </button>

        <Login className="text-on-surface-variant hover:text-primary flex flex-col items-center gap-1 text-[0.6875rem] active:scale-90 transition-transform duration-200 bg-transparent border-0 p-0 font-normal cursor-pointer">
          <span className="material-symbols-outlined">login</span>
          <span>{t("home.bottomNavAcceder")}</span>
        </Login>
      </nav>
    </div>
  );
}
