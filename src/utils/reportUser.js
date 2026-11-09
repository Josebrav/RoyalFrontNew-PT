import axios from "axios";
import Swal from "sweetalert2";
import API_URL from "../api/rutaApi";

const REASONS = {
  spam: "Spam o publicidad",
  insultos: "Insultos",
  acoso: "Acoso o amenazas",
  estafa: "Intento de estafa",
  contenido_sexual: "Contenido sexual",
  trampa: "Trampa en un juego",
  otro: "Otro motivo",
};

const theme = { background: "#1a1a1a", color: "#fff", confirmButtonColor: "#c9a84c" };

/**
 * Denuncia a un jugador (requisito de Google Play para los chats): elige el motivo, agrega un
 * comentario opcional y se manda al panel de Denuncias. `context` dice desde dónde ("Mensajes",
 * "Perfil"...). Devuelve true si se envió.
 */
export default async function reportUser({ userId, nick, context }) {
  const { value: reason } = await Swal.fire({
    title: `Denunciar a ${nick}`,
    input: "select",
    inputOptions: REASONS,
    inputPlaceholder: "Elegí un motivo",
    showCancelButton: true,
    confirmButtonText: "Siguiente",
    cancelButtonText: "Cancelar",
    inputValidator: (value) => (!value ? "Elegí un motivo" : undefined),
    ...theme,
  });
  if (!reason) return false;

  const { isConfirmed, value: details } = await Swal.fire({
    title: "¿Querés agregar algo?",
    text: "Opcional. El equipo de Royal Juegos revisa la denuncia y sus últimos mensajes.",
    input: "textarea",
    inputAttributes: { maxlength: "500" },
    showCancelButton: true,
    confirmButtonText: "Enviar denuncia",
    cancelButtonText: "Cancelar",
    ...theme,
  });
  if (!isConfirmed) return false;

  try {
    const { data } = await axios.post(`${API_URL}/reports`, { reportedUserId: userId, reason, details, context });
    Swal.fire({
      icon: "success",
      title: data?.alreadyReported ? "Ya habías denunciado a este jugador" : "Denuncia enviada",
      text: "Gracias. La vamos a revisar. Si no querés verlo más, también podés bloquearlo.",
      ...theme,
    });
    return true;
  } catch (err) {
    const message = err.response?.data?.message;
    Swal.fire({ icon: "error", title: "No se pudo enviar la denuncia", text: Array.isArray(message) ? message[0] : message || "Probá de nuevo en un momento.", ...theme });
    return false;
  }
}
