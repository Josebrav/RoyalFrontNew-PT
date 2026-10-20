import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../api/rutaApi";

/**
 * Progreso del rango del usuario logueado (GET /users/me/rank-status): puntos en dólares, % de
 * fichas extra y cuánto cargó este mes para mantener el rango. null mientras carga o sin sesión.
 */
export default function useRankStatus(userId) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!userId) {
      setStatus(null);
      return undefined;
    }
    let cancelled = false;
    axios
      .get(`${API_URL}/users/me/rank-status`)
      .then(({ data }) => !cancelled && setStatus(data))
      .catch(() => !cancelled && setStatus(null));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return status;
}
