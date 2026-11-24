import { useEffect, useRef, useState } from "react";
import axios from "axios";
import API_URL from "../../../api/rutaApi";
import { tokenStore } from "../../../api/tokenStore";

const WS_URL = `${API_URL.replace(/^http/, "ws")}/staff-chat/ws`;
const HISTORY_LIMIT = 40;
// Hora del mensaje; si no es de hoy, también el día (el historial ahora sobrevive de un día a otro).
const hhmm = (iso) => {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })} ${time}`;
};

/**
 * Chat en vivo entre los admins/mods que tienen abierta la página "Usuarios en línea"
 * (backend: StaffChatGateway en /staff-chat/ws). El servidor guarda en la base los últimos
 * 40 mensajes (sobreviven a los reinicios); al pasar de 40 se borran los más viejos.
 */
const StaffChat = () => {
  const [status, setStatus] = useState("connecting"); // connecting | open | closed | forbidden
  const [me, setMe] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [maxLength, setMaxLength] = useState(500);
  const [text, setText] = useState("");
  const [notice, setNotice] = useState(null);
  const socketRef = useRef(null);
  const listRef = useRef(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    let disposed = false;
    let retryTimer = null;
    let pingTimer = null;
    let attempts = 0;

    const connect = () => {
      if (disposed) return;
      setStatus("connecting");
      const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(tokenStore.get() || "")}`);
      socketRef.current = ws;
      let authExpired = false;
      let forbidden = false;

      ws.onopen = () => {
        attempts = 0;
        pingTimer = setInterval(() => ws.readyState === 1 && ws.send(JSON.stringify({ type: "ping" })), 25000);
      };
      ws.onmessage = (event) => {
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        const p = msg.payload || {};
        if (msg.type === "welcome") {
          setMe(p.me);
          setMessages(p.history || []);
          setMembers(p.members || []);
          setMaxLength(p.maxLength || 500);
          setStatus("open");
          stickToBottom.current = true;
        } else if (msg.type === "message") {
          setMessages((list) => [...list.filter((m) => m.id !== p.id), p].slice(-HISTORY_LIMIT));
        } else if (msg.type === "members") {
          setMembers(p.list || []);
        } else if (msg.type === "error") {
          if (p.code === "AUTH_EXPIRED") authExpired = true;
          else if (p.code === "FORBIDDEN") forbidden = true;
          else setNotice(p.message);
        }
      };
      ws.onclose = () => {
        clearInterval(pingTimer);
        if (disposed) return;
        if (forbidden) {
          setStatus("forbidden");
          return;
        }
        setStatus("closed");
        attempts += 1;
        const delay = Math.min(15000, 1000 * 2 ** Math.min(attempts, 4));
        if (authExpired) {
          // Cualquier request por axios pasa por el interceptor, que renueva el access token
          // (compartiendo el refresh con el resto de la página); después se reconecta.
          axios
            .get(`${API_URL}/admin/presence`, { params: { status: "online", limit: 1 } })
            .catch(() => {})
            .finally(() => { retryTimer = setTimeout(connect, 500); });
        } else {
          retryTimer = setTimeout(connect, delay);
        }
      };
    };

    connect();
    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      clearInterval(pingTimer);
      socketRef.current?.close();
    };
  }, []);

  // Baja solo si el usuario ya estaba abajo (no le saca la vista si está leyendo arriba).
  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const send = () => {
    const content = text.trim();
    const ws = socketRef.current;
    if (!content || !ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify({ type: "send", payload: { content } }));
    setText("");
    stickToBottom.current = true;
  };

  const statusLabel =
    status === "open" ? null
    : status === "forbidden" ? "Solo admins y mods pueden usar este chat."
    : status === "closed" ? "Reconectando…"
    : "Conectando…";

  return (
    <div className="bg-surface-container border border-outline-variant/20 rounded-xl flex flex-col h-[32rem] xl:h-[calc(100vh-7rem)] xl:max-h-[44rem] xl:sticky xl:top-24">
      <div className="px-4 py-3 border-b border-outline-variant/20">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[1.1rem] text-primary">forum</span>
            Chat del staff
          </h2>
          <span className={`inline-flex items-center gap-1.5 text-xs ${status === "open" ? "text-green-400" : "text-on-surface-variant"}`}>
            <span className={`w-2 h-2 rounded-full ${status === "open" ? "bg-green-400" : "bg-outline-variant"}`} />
            {status === "open" ? `${members.length} aquí` : "sin conexión"}
          </span>
        </div>
        {members.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {members.map((m) => (
              <span key={m.userId} className="px-2 py-0.5 rounded-full bg-surface-container-high text-[0.6875rem] text-on-surface">
                {m.nick}
                <span className="ml-1 uppercase text-[0.5625rem] font-bold text-primary">{m.role}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        ref={listRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        }}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
      >
        {messages.length === 0 && status === "open" && (
          <p className="text-center text-xs text-on-surface-variant mt-6">Todavía no hay mensajes. Escribí el primero.</p>
        )}
        {messages.map((m) => {
          const mine = m.userId === me?.userId;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <div className="flex items-baseline gap-1.5 text-[0.6875rem] text-on-surface-variant px-1">
                {!mine && <span className="font-bold text-on-surface">{m.nick}</span>}
                {!mine && m.role === "admin" && <span className="uppercase text-[0.5625rem] font-bold text-primary">admin</span>}
                <span>{hhmm(m.createdAt)}</span>
              </div>
              <div
                className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-sm whitespace-pre-wrap break-words select-text ${
                  mine ? "bg-primary text-on-primary rounded-br-sm" : "bg-surface-container-high text-on-surface rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      {(statusLabel || notice) && (
        <p className={`px-4 py-1.5 text-xs ${notice ? "text-error" : "text-on-surface-variant"}`}>{notice || statusLabel}</p>
      )}

      <div className="p-3 border-t border-outline-variant/20 flex gap-2 items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLength))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          disabled={status !== "open"}
          placeholder={status === "open" ? "Escribí un mensaje…" : ""}
          className="flex-1 resize-none max-h-28 bg-surface-container-high border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={status !== "open" || !text.trim()}
          className="shrink-0 w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-40"
          aria-label="Enviar"
        >
          <span className="material-symbols-outlined text-[1.2rem]">send</span>
        </button>
      </div>
    </div>
  );
};

export default StaffChat;
