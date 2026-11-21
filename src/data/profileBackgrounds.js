// Fondos de perfil (cabecera 16:9 detras del avatar). Los precios y quien compro que los maneja el servidor
// (modulo profile-backgrounds); aca solo van las imagenes y el color del marco del avatar de cada uno.
// "clasico" = el banner de siempre segun el rango (ese ya trae su marco dibujado).
import dulces from "../assets/fondos/dulces.jpg";
import gamer from "../assets/fondos/gamer.jpg";
import navidad from "../assets/fondos/navidad.jpg";
import pesca from "../assets/fondos/pesca.jpg";
import oriental from "../assets/fondos/oriental.jpg";

export const PROFILE_BACKGROUNDS = {
  dulces: { image: dulces, frame: "#ff5fb8", glow: "rgba(255,95,184,0.75)" },
  gamer: { image: gamer, frame: "#22d3ee", glow: "rgba(168,85,247,0.85)" },
  navidad: { image: navidad, frame: "#ffd84a", glow: "rgba(239,68,68,0.7)" },
  pesca: { image: pesca, frame: "#f59e0b", glow: "rgba(56,189,248,0.75)" },
  oriental: { image: oriental, frame: "#ff4d6d", glow: "rgba(244,114,182,0.8)" },
};

export const profileBackgroundImage = (id) => (id && PROFILE_BACKGROUNDS[id]?.image) || null;
export const profileBackgroundTheme = (id) => (id && PROFILE_BACKGROUNDS[id]) || null;
