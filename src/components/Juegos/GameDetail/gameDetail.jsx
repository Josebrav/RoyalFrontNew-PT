import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { POINTS_AND_TOURNAMENTS_NEWS_ID, newsArticlePath } from "../../../data/newsLinks";
import Swal from "sweetalert2";
import { CATEGORY_META, getGameBySlug } from "../../../data/gamesCatalog";
import { swalThemeConfig } from "../../../utils/formatters";
import API_URL from "../../../api/rutaApi";
import EditableImage from "../../ui/EditableImage";
import { AdLeaderboard } from "../../ui/Ads/AdUnit";

export default function GameDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const game = getGameBySlug(slug);
  const isLoggedIn = !!useSelector((state) => state.currentUser?.id);
  const [topPlayers, setTopPlayers] = useState([]);
  // Royal Slots muestra el mismo ranking que su lobby en el juego: solo sus slots, por semana
  // (lunes a domingo) o mes calendario, igual que los torneos. El resto: total del juego.
  const isRoyalSlots = game?.slug === "royalslots";
  const [rankingPeriod, setRankingPeriod] = useState("weekly");

  useEffect(() => {
    if (!game || game.status !== "active") return;
    const request = isRoyalSlots
      ? axios
          .get(`${API_URL}/leaderboard/${rankingPeriod}?scope=royalslots&limit=5`)
          .then(({ data }) => data.map((row) => ({ id: row.userId, nick: row.nick, totalWon: row.chips })))
      : axios.get(`${API_URL}/leaderboard/top-winners/${game.slug}?limit=5`).then(({ data }) => data);
    request.then(setTopPlayers).catch(() => {});
  }, [game, isRoyalSlots, rankingPeriod]);

  if (!game) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center my-16 pt-20 md:pt-24">
        <h2 className="text-2xl font-bold text-error mb-4">Juego no encontrado.</h2>
        <button
          onClick={() => navigate("/juegos")}
          className="px-6 py-2.5 rounded-lg gold-gradient text-[#0A0A0F] font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all"
        >
          Ver Todos los Juegos
        </button>
      </div>
    );
  }

  const isActive = game.status === "active";
  const categoryMeta = CATEGORY_META[game.category];
  // Color de la categoría para el panel de ranking (no todo dorado; el dorado queda para "Jugar").
  const accent = categoryMeta?.accent || "#a855f7";
  const accentTo = categoryMeta?.accentTo || "#4c1d95";

  const handlePlay = () => {
    // La ficha es publica (para buscadores); para jugar hace falta cuenta.
    if (isActive && !isLoggedIn) {
      window.dispatchEvent(new Event("open-register-modal"));
      return;
    }
    if (isActive) {
      window.open(game.playPath, "_blank", "noopener,noreferrer");
      return;
    }
    Swal.fire({
      title: game.name,
      text: "¡Este juego estará disponible muy pronto! Nuestro equipo real está trabajando para traértelo.",
      icon: "info",
      ...swalThemeConfig,
    });
  };

  return (
    <main className="flex-grow max-w-container-max mx-auto w-full pt-20 md:pt-24 px-4 md:px-margin-desktop pb-16 text-on-surface">
      <button
        onClick={() => navigate("/juegos")}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-0 cursor-pointer mb-6 text-sm"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Ver Todos los Juegos
      </button>

      {/* Banner */}
      <div className="relative w-full h-56 md:h-80 rounded-xl overflow-hidden border border-outline-variant/20 mb-8">
        <EditableImage
          contentKey={`games.${game.slug}.cover`}
          fallbackSrc={game.image}
          fallbackIcon={game.icon}
          alt={game.name}
          className="w-full h-full object-cover"
          recommendedSize="600×800px aprox. (vertical), JPG o PNG"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          <span className={`text-[0.6875rem] font-black uppercase tracking-widest ${categoryMeta.className}`}>
            {categoryMeta.label}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tighter">{game.name}</h1>
        </div>
        {!isActive && (
          <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-on-surface-variant text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10">
            Próximamente
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-white mb-4">Sobre este juego</h2>
            <p className="text-on-surface-variant leading-relaxed">{game.description}</p>
          </div>

          {isActive && (
            <div
              className="bg-surface-container-high rounded-xl border overflow-hidden"
              style={{ borderColor: `${accent}55`, boxShadow: `0 0 20px ${accent}26` }}
            >
              <div
                className="p-4 flex justify-between items-center"
                style={{ background: `linear-gradient(90deg, ${accent}, ${accentTo})` }}
              >
                <h3 className="text-white font-bold text-headline-sm font-headline-sm">
                  Top Ganadores de {game.name}
                </h3>
                <span className="bg-black/25 text-white px-2 py-1 rounded text-label-md font-label-md font-bold">EN VIVO</span>
              </div>
              <div className="p-6 space-y-3">
                {isRoyalSlots && (
                  <div className="flex gap-2 mb-1">
                    {[
                      ["weekly", "Semanal"],
                      ["monthly", "Mensual"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setRankingPeriod(key)}
                        aria-pressed={rankingPeriod === key}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                          rankingPeriod === key
                            ? "text-white"
                            : "bg-transparent text-on-surface-variant border-outline-variant/30 hover:text-white"
                        }`}
                        style={rankingPeriod === key ? { background: accent, borderColor: accent } : undefined}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                {topPlayers.length === 0 ? (
                  <p className="text-on-surface-variant text-sm text-center py-4">
                    {isRoyalSlots
                      ? `Todavía no hay ganadores ${rankingPeriod === "weekly" ? "esta semana" : "este mes"}. ¡Sé el primero!`
                      : "Todavía no hay ganadores registrados en este juego. ¡Sé el primero!"}
                  </p>
                ) : (
                  topPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded ${index === 0 ? "bg-surface border-l-4" : "bg-surface/50"}`}
                      style={index === 0 ? { borderLeftColor: accent } : undefined}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`font-bold flex-shrink-0 ${index === 0 ? "" : "text-on-surface-variant"}`}
                          style={index === 0 ? { color: accent } : undefined}
                        >
                          {index + 1}
                        </span>
                        <span className="font-bold text-white truncate">{player.nick}</span>
                      </div>
                      <span
                        className={`font-bold flex-shrink-0 ${index === 0 ? "" : "text-on-surface-variant"}`}
                        style={index === 0 ? { color: accent } : undefined}
                      >
                        {new Intl.NumberFormat('es-ES').format(player.totalWon)}
                      </span>
                    </div>
                  ))
                )}
                <button
                  type="button"
                  onClick={() => navigate(newsArticlePath(POINTS_AND_TOURNAMENTS_NEWS_ID))}
                  className="w-full text-center text-xs font-bold hover:underline cursor-pointer bg-transparent border-0 pt-1 flex items-center justify-center gap-1"
                  style={{ color: accent }}
                >
                  <span className="material-symbols-outlined text-[16px]">emoji_events</span>
                  ¿Cómo funcionan los puntos y torneos?
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="glass-card p-6 rounded-xl space-y-4">
            {isActive && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant uppercase tracking-wider text-[0.6875rem]">Jugando ahora</span>
                <span className="flex items-center gap-1 text-white font-bold">
                  <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                  {new Intl.NumberFormat("es-ES").format(game.players)}
                </span>
              </div>
            )}
            <button
              onClick={handlePlay}
              className={`w-full py-3.5 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? "gold-gradient text-black hover:brightness-110 active:scale-95 cursor-pointer border-0"
                  : "bg-surface-container-high text-on-surface-variant border border-outline-variant/30 cursor-pointer hover:bg-surface-variant/40"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isActive ? "play_circle" : "hourglass_top"}
              </span>
              {isActive ? "Jugar" : "Próximamente"}
            </button>
            {isActive && (
              <p className="text-on-surface-variant text-[0.6875rem] text-center">
                Se abrirá en una pestaña nueva.
              </p>
            )}
          </div>
        </div>
      </div>
      <AdLeaderboard className="mt-8" />
    </main>
  );
}
