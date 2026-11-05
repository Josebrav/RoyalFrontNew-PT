import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API_URL from "../../api/rutaApi";
import { tokenStore } from "../../api/tokenStore";
import { authService } from "../../services/authService";
import { swalThemeConfig } from "../../utils/formatters";
import { getRankMeta } from "../../utils/rank";
import { LOCALE } from "../../i18n/locale";
import { t } from "../../i18n/strings";

/**
 * Chat general en vivo (todo el sitio), contra el GlobalChatGateway del backend en /chat/ws.
 *
 * - Burbuja flotante abajo a la derecha; el panel se abre encima. La conexión queda abierta
 *   aunque el panel esté cerrado, para mostrar el contador de no leídos y los conectados.
 * - Invitados: pueden leer, no escribir.
 * - El access token vive solo en memoria (tokenStore). Si el backend responde AUTH_EXPIRED se
 *   refresca con authService.refreshSession() y se reconecta; si eso falla, se sigue como invitado.
 * - Mods/admins ven botones para borrar mensajes y silenciar usuarios.
 */

const WS_URL = `${API_URL.replace(/^http/i, "ws").replace(/\/+$/, "")}/chat/ws`;
const PING_INTERVAL_MS = 25000;
const MAX_RECONNECT_DELAY_MS = 30000;
const MAX_MESSAGES_KEPT = 200;
const DATE_LOCALE = LOCALE === "en" ? "en-US" : LOCALE === "pt" ? "pt-BR" : "es-ES";

const ERROR_KEYS = {
  LOGIN_REQUIRED: "chat.err.loginRequired",
  TOO_FAST: "chat.err.tooFast",
  DUPLICATE: "chat.err.duplicate",
  EMPTY: "chat.err.empty",
  BANNED: "chat.err.banned",
  FORBIDDEN: "chat.err.forbidden",
  MUTED: "chat.err.muted",
};

// Color sólido del ícono de rango (mismo tono que RankBadge, sin el gradiente de fondo).
const RANK_ICON_COLORS = {
  bronze: "#c08457",
  silver: "#c9c9d1",
  gold: "#f5d980",
  platinum: "#8fc9d6",
  diamond: "#9ad8ff",
};

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString(DATE_LOCALE, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function ChatAvatar({ userId, nick }) {
  const [failed, setFailed] = useState(false);
  const initials = (nick || "RG").slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 royal-gold-gradient flex items-center justify-center text-surface-container-lowest font-bold text-[11px]">
      {userId && !failed ? (
        <img
          src={`${API_URL}/user/${userId}/avatar-image`}
          alt={nick}
          loading="lazy"
          className="w-full h-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}

function RoleTag({ role }) {
  if (role === "admin") {
    return <span className="text-[9px] font-bold uppercase px-1.5 py-[1px] rounded bg-error/80 text-white">Admin</span>;
  }
  if (role === "mod") {
    return <span className="text-[9px] font-bold uppercase px-1.5 py-[1px] rounded bg-[#4f8fe0] text-white">Mod</span>;
  }
  return null;
}

export default function GlobalChat() {
  const currentUser = useSelector((state) => state.currentUser);
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("connecting"); // connecting | open | reconnecting
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState(0);
  const [me, setMe] = useState(null);
  const [maxLength, setMaxLength] = useState(300);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState(null); // { text, tone: 'error' | 'info' }
  const [unread, setUnread] = useState(0);

  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const pingTimerRef = useRef(null);
  const attemptsRef = useRef(0);
  const triedRefreshRef = useRef(false);
  const unmountedRef = useRef(false);
  const openRef = useRef(open);
  const listRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const noticeTimerRef = useRef(null);

  openRef.current = open;

  const showNotice = useCallback((text, tone = "error") => {
    setNotice({ text, tone });
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 5000);
  }, []);

  const connect = useCallback(() => {
    clearTimeout(reconnectTimerRef.current);
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    const token = tokenStore.get();
    const url = token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL;
    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      return;
    }
    wsRef.current = ws;
    let authExpired = false;

    ws.onopen = () => {
      attemptsRef.current = 0;
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
      }, PING_INTERVAL_MS);
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      const { type, payload } = data || {};
      switch (type) {
        case "welcome":
          triedRefreshRef.current = false;
          setStatus("open");
          setMe(payload?.me || null);
          setMessages(payload?.history || []);
          setOnline(payload?.online || 0);
          if (payload?.maxLength) setMaxLength(payload.maxLength);
          stickToBottomRef.current = true;
          break;
        case "message":
          setMessages((prev) => [...prev, payload].slice(-MAX_MESSAGES_KEPT));
          if (!openRef.current) setUnread((n) => Math.min(n + 1, 99));
          break;
        case "deleted":
          setMessages((prev) => prev.filter((m) => m.id !== payload?.id));
          break;
        case "online":
          setOnline(payload?.count || 0);
          break;
        case "notice":
          showNotice(payload?.message, "info");
          break;
        case "muted":
          setMe((prev) => (prev ? { ...prev, mutedMinutes: payload?.minutes } : prev));
          showNotice(t("chat.mutedPrefix") + " " + payload?.minutes + " min.");
          break;
        case "error":
          if (payload?.code === "AUTH_EXPIRED") {
            authExpired = true;
            return;
          }
          showNotice(ERROR_KEYS[payload?.code] ? t(ERROR_KEYS[payload.code]) : payload?.message || t("chat.err.generic"));
          break;
        default:
          break;
      }
    };

    ws.onclose = () => {
      clearInterval(pingTimerRef.current);
      if (unmountedRef.current || wsRef.current !== ws) return;
      wsRef.current = null;
      setStatus("reconnecting");

      if (authExpired && !triedRefreshRef.current) {
        triedRefreshRef.current = true;
        authService
          .refreshSession()
          .catch(() => authService.clearSession())
          .finally(() => {
            if (!unmountedRef.current) connect();
          });
        return;
      }

      const delay = Math.min(MAX_RECONNECT_DELAY_MS, 1000 * 2 ** attemptsRef.current) + Math.random() * 1000;
      attemptsRef.current += 1;
      reconnectTimerRef.current = setTimeout(connect, delay);
    };
  }, [showNotice]);

  // (Re)conecta al montar y cada vez que cambia la sesión (login/logout), para que el backend
  // sepa quién escribe.
  useEffect(() => {
    unmountedRef.current = false;
    triedRefreshRef.current = false;
    setStatus("connecting");
    connect();
    return () => {
      unmountedRef.current = true;
      clearTimeout(reconnectTimerRef.current);
      clearInterval(pingTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, currentUser?.id]);

  useEffect(() => () => clearTimeout(noticeTimerRef.current), []);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  // Auto-scroll solo si el usuario ya estaba abajo (no lo arrancamos de lo que está leyendo).
  useEffect(() => {
    const el = listRef.current;
    if (el && open && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  const sendEnvelope = (type, payload) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      showNotice(t("chat.err.offline"));
      return false;
    }
    ws.send(JSON.stringify({ type, payload }));
    return true;
  };

  const handleSend = (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    if (sendEnvelope("send", { content })) {
      setDraft("");
      stickToBottomRef.current = true;
    }
  };

  const handleDelete = async (message) => {
    const result = await Swal.fire({
      title: t("chat.mod.deleteConfirm"),
      text: message.content,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("chat.mod.delete"),
      cancelButtonText: t("chat.mod.cancel"),
      ...swalThemeConfig,
    });
    if (result.isConfirmed) sendEnvelope("delete", { messageId: message.id });
  };

  const handleMute = async (message) => {
    const result = await Swal.fire({
      title: `${t("chat.mod.mute")} ${message.nick}`,
      input: "select",
      inputOptions: { 5: "5 min", 10: "10 min", 30: "30 min", 60: "1 h", 1440: "24 h" },
      inputValue: "10",
      showCancelButton: true,
      confirmButtonText: t("chat.mod.mute"),
      cancelButtonText: t("chat.mod.cancel"),
      ...swalThemeConfig,
    });
    if (result.isConfirmed) sendEnvelope("mute", { userId: message.userId, minutes: Number(result.value) });
  };

  // En los juegos (iframes a pantalla completa) y en la landing de invitados no se muestra.
  const hidden = location.pathname.includes("/game") || (location.pathname === "/" && !currentUser?.id && !location.search.includes("vista=invitado"));
  if (hidden) return null;

  const canWrite = !!me?.canWrite;
  const canModerate = !!me?.canModerate;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("chat.title")}
          className="fixed z-[60] right-4 bottom-20 md:bottom-6 w-14 h-14 rounded-full gold-gradient gold-glow flex items-center justify-center text-[#0A0A0F] shadow-2xl border-0 cursor-pointer hover:brightness-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            forum
          </span>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-error text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border-2 border-surface">
              {unread > 98 ? "99+" : unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <section
          className="fixed z-[60] inset-x-0 bottom-0 h-[75vh] md:inset-x-auto md:right-6 md:bottom-6 md:w-[380px] md:h-[560px] md:max-h-[calc(100vh-7rem)] flex flex-col rounded-t-2xl md:rounded-2xl overflow-hidden bg-surface-container-low/95 backdrop-blur-md border border-outline-variant/30 shadow-2xl text-on-surface"
          aria-label={t("chat.title")}
        >
          {/* Header */}
          <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-outline-variant/20 bg-gradient-to-r from-surface-container to-surface-container-high">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                forum
              </span>
              <div className="min-w-0">
                <h2 className="text-white font-bold text-sm leading-tight truncate">{t("chat.title")}</h2>
                <p className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${status === "open" ? "bg-[#4caf7d]" : "bg-[#e0a84f] animate-pulse"}`} />
                  {status === "open" ? `${online} ${t("chat.online")}` : t(status === "connecting" ? "chat.connecting" : "chat.reconnecting")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("chat.close")}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent border-0 text-on-surface-variant hover:text-white hover:bg-surface-variant/40 cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          {/* Messages */}
          <div ref={listRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center mt-10 px-6">{t("chat.empty")}</p>
            ) : (
              messages.map((m) => {
                const isMine = me?.userId && m.userId === me.userId;
                const rankMeta = m.rank ? getRankMeta(m.rank) : null;
                return (
                  <div key={m.id} className="group flex items-start gap-2">
                    <ChatAvatar userId={m.userId} nick={m.nick} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => m.nick && navigate(`/perfil/${m.nick}`)}
                          className={`bg-transparent border-0 p-0 cursor-pointer text-[13px] font-bold hover:underline ${isMine ? "text-primary" : "text-white"}`}
                        >
                          {m.nick}
                        </button>
                        <RoleTag role={m.role} />
                        {rankMeta && (
                          <span
                            title={rankMeta.label}
                            className="material-symbols-outlined text-[14px]"
                            style={{ fontVariationSettings: "'FILL' 1", color: RANK_ICON_COLORS[m.rank] || RANK_ICON_COLORS.bronze }}
                          >
                            {rankMeta.icon}
                          </span>
                        )}
                        <span className="text-[10px] text-on-surface-variant/70">{formatTime(m.createdAt)}</span>
                        {canModerate && !isMine && m.role !== "admin" && (
                          <span className="ml-auto flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleDelete(m)}
                              title={t("chat.mod.delete")}
                              className="bg-transparent border-0 p-0 cursor-pointer text-on-surface-variant hover:text-error"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                            {m.userId && (
                              <button
                                type="button"
                                onClick={() => handleMute(m)}
                                title={t("chat.mod.mute")}
                                className="bg-transparent border-0 p-0 cursor-pointer text-on-surface-variant hover:text-[#e0a84f]"
                              >
                                <span className="material-symbols-outlined text-[16px]">volume_off</span>
                              </button>
                            )}
                          </span>
                        )}
                        {canModerate && isMine && (
                          <button
                            type="button"
                            onClick={() => handleDelete(m)}
                            title={t("chat.mod.delete")}
                            className="ml-auto bg-transparent border-0 p-0 cursor-pointer text-on-surface-variant hover:text-error opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[13px] text-on-surface/90 whitespace-pre-wrap break-words leading-snug select-text">
                        {m.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notice && (
            <div
              className={`mx-3 mb-2 px-3 py-2 rounded-lg text-xs ${
                notice.tone === "info" ? "bg-primary/15 text-primary" : "bg-error/15 text-error"
              }`}
            >
              {notice.text}
            </div>
          )}

          {/* Composer */}
          {canWrite ? (
            <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-outline-variant/20">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={draft}
                  maxLength={maxLength}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t("chat.placeholder")}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-full pl-4 pr-12 py-2.5 text-on-surface input-glow text-sm"
                />
                {draft.length > maxLength - 50 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-on-surface-variant">
                    {maxLength - draft.length}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={!draft.trim() || status !== "open"}
                aria-label={t("chat.send")}
                className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black disabled:opacity-40 cursor-pointer border-0 flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </form>
          ) : (
            <div className="p-3 border-t border-outline-variant/20 text-center text-xs text-on-surface-variant">
              {me ? t("chat.err.banned") : t("chat.loginToWrite")}
            </div>
          )}
        </section>
      )}
    </>
  );
}
