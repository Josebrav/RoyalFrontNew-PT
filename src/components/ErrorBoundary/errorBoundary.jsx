import { Component } from "react";

/**
 * Si algo falla al dibujar la página (ej. una pestaña abierta con la versión vieja que busca un
 * archivo que ya no existe), en vez del cartel rojo con el detalle técnico se muestra un
 * "Cargando..." y la página se recarga sola. Si vuelve a fallar enseguida (2 recargas en 1 minuto),
 * un mensaje simple con un botón para recargar. El detalle queda solo en la consola.
 */
const KEY = "errorReloads";
const WINDOW_MS = 60000;
const MAX_RELOADS = 2;

function recentReloads() {
  try {
    const list = JSON.parse(sessionStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list.filter((t) => Date.now() - t < WINDOW_MS) : [];
  } catch {
    return [];
  }
}

function reloadIfAllowed() {
  const list = recentReloads();
  if (list.length >= MAX_RELOADS) return false;
  try {
    sessionStorage.setItem(KEY, JSON.stringify([...list, Date.now()]));
  } catch {
    // sin sessionStorage: se recarga igual una vez
  }
  window.location.reload();
  return true;
}

const screen = {
  minHeight: "100vh",
  background: "#0a0b18",
  color: "#e5e2f0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 16,
  padding: 24,
  textAlign: "center",
  fontFamily: "inherit",
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, gaveUp: false };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info?.componentStack);
    if (!reloadIfAllowed()) this.setState({ gaveUp: true });
  }

  render() {
    if (!this.state.error) return this.props.children;

    if (!this.state.gaveUp) {
      return (
        <div style={screen}>
          <span style={{ opacity: 0.6, fontSize: 14 }}>Cargando…</span>
        </div>
      );
    }

    return (
      <div style={screen}>
        <p style={{ fontSize: 16, maxWidth: 420, margin: 0 }}>No pudimos cargar la página. Probá recargar.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 28px",
            borderRadius: 10,
            border: "none",
            background: "#C9A84C",
            color: "#1a1406",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Recargar
        </button>
      </div>
    );
  }
}
