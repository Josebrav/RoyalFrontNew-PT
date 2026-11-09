import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../../api/rutaApi";
import RankBadge from "../ui/RankBadge/rankBadge";
import { useAuth } from "../../context/oauthContext";
import { fetchConversations, fetchThread, sendMessage } from "../../redux/actions/index";

// Mientras hay una conversación abierta se sondea seguido, para que el otro vea el mensaje sin
// recargar la página en unos pocos segundos en vez de hasta 30s. Sin un hilo abierto (solo
// mirando la lista de conversaciones) se vuelve al intervalo lento — no hay necesidad de pegarle
// tan seguido al backend si no hay nada activo en pantalla.
const ACTIVE_THREAD_POLL_MS = 3000;
const IDLE_POLL_INTERVAL_MS = 30000;

function formatMessageTimestamp(dateString) {
  return new Date(dateString).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Avatar({ userId, nick, size = "w-11 h-11" }) {
  // TEMPORAL: vuelto a avatar-image, ver nota en nav.jsx — el avatar-thumbnail actual ancla mal
  // el recorte desde que la cámara del RoyalStore captura el cuerpo completo.
  const avatarSrc = userId ? `${API_URL}/user/${userId}/avatar-image` : null;
  const initials = (nick || "RG").slice(0, 2).toUpperCase();
  return (
    <div className={`${size} rounded-full overflow-hidden flex-shrink-0 royal-gold-gradient flex items-center justify-center text-surface-container-lowest font-bold text-sm`}>
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={nick}
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}

const URL_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

// Separa el texto en partes, marcando los enlaces. La puntuación pegada al final ("mirá: x.com.")
// no es parte del enlace. Solo http/https: nunca se arma un href con otro protocolo.
function splitLinks(text) {
  const source = String(text ?? "");
  const parts = [];
  let last = 0;
  for (const match of source.matchAll(URL_PATTERN)) {
    const url = match[0].replace(/[.,;:!?)\]]+$/, "");
    let href = null;
    try {
      const parsed = new URL(url.toLowerCase().startsWith("www.") ? `https://${url}` : url);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") href = parsed.href;
    } catch {
      // no es una URL válida: queda como texto
    }
    if (!href) continue;
    if (match.index > last) parts.push({ text: source.slice(last, match.index) });
    parts.push({ text: url, href });
    last = match.index + url.length;
  }
  if (last < source.length) parts.push({ text: source.slice(last) });
  return parts;
}

// Solo los mensajes de un admin llevan enlaces clickeables: si cualquier jugador pudiera mandarlos,
// serían la forma más fácil de estafar a otro. El resto se ve como texto.
function MessageText({ content, linkify, linkClassName }) {
  if (!linkify) return content;
  return splitLinks(content).map((part, i) =>
    part.href ? (
      <a
        key={i}
        href={part.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline font-bold ${linkClassName}`}
      >
        {part.text}
      </a>
    ) : (
      <span key={i}>{part.text}</span>
    ),
  );
}

function AdminBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 flex-shrink-0 rounded-full bg-primary text-black text-[0.625rem] font-black uppercase tracking-wider pl-1 pr-2 py-0.5">
      <span className="material-symbols-outlined text-[14px] leading-none">verified</span>
      Admin
    </span>
  );
}

export default function Messages() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { nick } = useParams();
  const auth = useAuth();
  const currentUser = useSelector((state) => state.currentUser);
  const { conversations, threads } = useSelector((state) => state.messages);

  const [activePartner, setActivePartner] = useState(null); // { id, nick, rank }
  const [messageText, setMessageText] = useState("");
  const threadContainerRef = useRef(null);
  const [partnerRoles, setPartnerRoles] = useState({}); // nick en minúsculas -> rol
  const rolesRequestedRef = useRef(new Set());

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchConversations());
    }
  }, [dispatch, currentUser?.id]);

  // Resolve the :nick route param to a userId, reusing the conversations list when possible.
  useEffect(() => {
    if (!nick || !currentUser?.id) return;

    const fromConversations = conversations.find(
      (c) => c.partnerNick?.toLowerCase() === nick.toLowerCase(),
    );
    if (fromConversations) {
      setActivePartner({
        id: fromConversations.partnerId,
        nick: fromConversations.partnerNick,
        rank: fromConversations.partnerRank,
      });
      return;
    }

    let cancelled = false;
    axios.get(`${API_URL}/user-nick?nick=${encodeURIComponent(nick)}`).then(({ data }) => {
      if (!cancelled && data?.id) {
        setActivePartner({ id: data.id, nick: data.nick, rank: data.rank });
      }
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [nick, currentUser?.id, conversations]);

  // El rol sale siempre del perfil en el servidor, nunca del nick ni del texto, para que nadie pueda
  // hacerse pasar por admin. Se pide una vez por persona y de a una, para no saturar la API con
  // listas largas. Mientras no se sabe, se trata como jugador normal.
  useEffect(() => {
    if (!currentUser?.id) return;
    const nicks = [...conversations.map((c) => c.partnerNick), activePartner?.nick]
      .filter(Boolean)
      .filter((n) => !rolesRequestedRef.current.has(n.toLowerCase()));
    if (nicks.length === 0) return;
    nicks.forEach((n) => rolesRequestedRef.current.add(n.toLowerCase()));

    (async () => {
      for (const n of nicks) {
        try {
          const { data } = await axios.get(`${API_URL}/user-nick?nick=${encodeURIComponent(n)}`);
          setPartnerRoles((prev) => ({ ...prev, [n.toLowerCase()]: data?.role }));
        } catch {
          // sin rol: se ve como jugador normal
        }
      }
    })();
  }, [conversations, activePartner?.nick, currentUser?.id]);

  const isAdminNick = (n) => partnerRoles[n?.toLowerCase()] === "admin";

  const refreshThread = useCallback(() => {
    if (activePartner?.id) {
      dispatch(fetchThread(activePartner.id));
    }
  }, [dispatch, activePartner?.id]);

  useEffect(() => {
    refreshThread();
  }, [refreshThread]);

  // Poll conversations + active thread periodically instead of a WebSocket connection. Cadence
  // speeds up while a thread is open (see constants above) so a reply shows up on its own.
  useEffect(() => {
    if (!currentUser?.id) return;
    const intervalMs = activePartner?.id ? ACTIVE_THREAD_POLL_MS : IDLE_POLL_INTERVAL_MS;
    const interval = setInterval(() => {
      dispatch(fetchConversations());
      refreshThread();
    }, intervalMs);
    return () => clearInterval(interval);
  }, [dispatch, currentUser?.id, refreshThread, activePartner?.id]);

  const activeMessages = activePartner?.id ? threads[activePartner.id] || [] : [];

  // Scroll only the message list itself into its latest position — never the outer
  // page. scrollIntoView() would bubble up to every scrollable ancestor, including
  // the whole document, which is what was yanking the page down to the footer.
  useEffect(() => {
    const el = threadContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeMessages.length]);

  // Mientras se restaura la sesión (al recargar tarda un instante) no se decide nada: si no, se
  // mostraba "Debes iniciar sesión" aunque el usuario sí estuviera logueado.
  if (auth.loading) return null;

  if (!currentUser?.id) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center my-16 pt-20 md:pt-24">
        <h2 className="text-2xl font-bold text-error mb-4">Debes iniciar sesión para ver tus mensajes.</h2>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 rounded-lg gold-gradient text-[#0A0A0F] font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all"
        >
          Ir al Lobby
        </button>
      </div>
    );
  }

  const handleSend = async (e) => {
    e.preventDefault();
    const content = messageText.trim();
    if (!content || !activePartner?.nick) return;
    setMessageText("");
    try {
      await dispatch(sendMessage(activePartner.nick, content, activePartner.id));
    } catch (error) {
      // keep the draft so the user doesn't lose it on failure
      setMessageText(content);
    }
  };

  return (
    <main className="flex-grow max-w-container-max mx-auto w-full select-none text-on-surface min-h-[85vh] pt-20 md:pt-24 px-4 md:px-margin-desktop pb-8">
      <h1 className="font-headline-lg text-headline-lg text-white mb-6">Mensajes</h1>

      <div className="glass-card rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] h-[70vh] min-h-[420px]">
        {/* Conversation list */}
        <div className={`border-r border-outline-variant/10 overflow-y-auto ${activePartner ? "hidden md:block" : "block"}`}>
          {conversations.length === 0 ? (
            <p className="p-6 text-on-surface-variant text-sm">
              Todavía no tienes conversaciones. Envía un mensaje desde el perfil de otro jugador.
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.partnerId}
                type="button"
                onClick={() => navigate(`/mensajes/${c.partnerNick}`)}
                className={`w-full flex items-center gap-3 p-4 border-b border-outline-variant/10 text-left cursor-pointer bg-transparent transition-colors hover:bg-surface-variant/20 ${
                  activePartner?.id === c.partnerId ? "bg-primary/10" : ""
                }`}
              >
                <Avatar userId={c.partnerId} nick={c.partnerNick} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="text-white font-bold truncate">{c.partnerNick}</span>
                      {isAdminNick(c.partnerNick) && <AdminBadge />}
                    </span>
                    {c.unreadCount > 0 && (
                      <span className="bg-primary text-black text-[0.625rem] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-xs truncate">
                    {c.lastSenderId === currentUser.id ? "Tú: " : ""}
                    {c.lastContent}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Active thread */}
        <div className={`flex flex-col ${activePartner ? "flex" : "hidden md:flex"}`}>
          {activePartner ? (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => navigate("/mensajes")}
                  className="md:hidden bg-transparent border-0 text-on-surface-variant cursor-pointer p-1"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <Avatar userId={activePartner.id} nick={activePartner.nick} size="w-9 h-9" />
                <button
                  type="button"
                  onClick={() => navigate(`/perfil/${activePartner.nick}`)}
                  className="flex items-center gap-2 bg-transparent border-0 cursor-pointer text-left"
                >
                  <span className="text-white font-bold">{activePartner.nick}</span>
                  <RankBadge tier={activePartner.rank} size="sm" />
                  {isAdminNick(activePartner.nick) && <AdminBadge />}
                </button>
              </div>

              {isAdminNick(activePartner.nick) && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-b border-primary/30 text-primary text-xs font-bold">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Cuenta oficial del equipo de Royal Juegos
                </div>
              )}

              <div ref={threadContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeMessages.length === 0 ? (
                  <p className="text-on-surface-variant text-sm text-center mt-8">
                    Todavía no hay mensajes. ¡Escribe el primero!
                  </p>
                ) : (
                  activeMessages.map((m) => {
                    const isMine = m.senderId === currentUser.id;
                    const fromAdmin = isMine ? currentUser.role === "admin" : isAdminNick(activePartner.nick);
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-[75%] ${isMine ? "ml-auto items-end" : "items-start"}`}
                      >
                        <div
                          className={`px-4 py-2 rounded-2xl text-sm [overflow-wrap:anywhere] select-text ${
                            isMine
                              ? "royal-gold-gradient text-surface-container-lowest rounded-br-sm"
                              : fromAdmin
                                ? "bg-primary/15 border-2 border-primary text-white rounded-bl-sm"
                                : "bg-surface-container-lowest text-on-surface rounded-bl-sm"
                          }`}
                        >
                          <MessageText
                            content={m.content}
                            linkify={fromAdmin}
                            linkClassName={isMine ? "text-surface-container-lowest" : "text-primary"}
                          />
                        </div>
                        <span className="text-[0.625rem] text-on-surface-variant/70 mt-1 px-1">
                          {formatMessageTimestamp(m.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-3 p-4 border-t border-outline-variant/10">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-full px-4 py-2.5 text-on-surface input-glow font-body-md text-sm"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black disabled:opacity-40 cursor-pointer border-0 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm p-6 text-center">
              Selecciona una conversación para empezar a chatear.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
