import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../api/rutaApi";
import { authService } from "../services/authService";

// Token del chat de los juegos (POST /chat/session-token): con él, el chat del juego habilita el
// chat privado de esta cuenta (el userId de la URL solo no alcanza: cualquiera lo ve en la lista de
// jugadores). `ready` pasa a true cuando la respuesta llegó, salga bien o mal: si falla, el juego
// abre igual, solo que sin chat privado.
export default function useChatToken(userId) {
  const [state, setState] = useState({ token: "", ready: false });

  useEffect(() => {
    let cancelled = false;
    setState({ token: "", ready: false });

    if (!userId || !authService.getToken()) {
      setState({ token: "", ready: true });
      return undefined;
    }

    axios
      .post(`${API_URL}/chat/session-token`, {})
      .then((response) => {
        if (!cancelled) setState({ token: response.data.token || "", ready: true });
      })
      .catch((error) => {
        console.error("No se pudo obtener el token del chat:", error);
        if (!cancelled) setState({ token: "", ready: true });
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return state;
}
