import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import API_URL from "../../../api/rutaApi";
import { swalThemeConfig } from "../../../utils/formatters";
import BotsTabNav from "../Bots/botsTabNav";

const REFRESH_MS = 5000;

export default function BuracoBots() {
  const navigate = useNavigate();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const loadData = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/admin/buraco-bots`);
      setBots(data);
    } catch {
      if (!quiet) Swal.fire({ title: "Error", text: "No se pudo cargar la lista de bots.", icon: "error", ...swalThemeConfig });
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // El estado (Libre / Esperando / Jugando) cambia solo: se refresca cada pocos segundos.
    const timer = setInterval(() => loadData(true), REFRESH_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async (bot) => {
    setSavingId(bot.botId);
    try {
      await axios.put(`${API_URL}/admin/buraco-bots/${bot.botId}`, { enabled: !bot.enabled });
      setBots((prev) => prev.map((b) => (b.botId === bot.botId ? { ...b, enabled: !bot.enabled } : b)));
    } catch {
      Swal.fire({ title: "Error", text: "No se pudo guardar el cambio.", icon: "error", ...swalThemeConfig });
    } finally {
      setSavingId(null);
    }
  };

  const activeCount = bots.filter((b) => b.enabled).length;

  return (
    <div className="bg-background text-on-background min-h-screen pt-20 pb-12">
      <div className="px-margin-desktop max-w-container-max mx-auto mb-8">
        <BotsTabNav active="buraco" />
        <div className="flex justify-between items-end mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">Bots en Buraco</h1>
            <p className="text-on-surface-variant font-body-sm max-w-2xl">
              Los bots activados se sientan en las mesas de Buraco donde alguien está esperando: si en unos 20
              segundos no entra nadie, se sienta uno y juega la partida como cualquier jugador (con su nick y su
              avatar, sin figurar como bot). En mesas con apuesta, el bot apuesta y cobra como cualquiera.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-6 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface font-label-lg hover:bg-surface-variant/20 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Volver al Panel
          </button>
        </div>

        <div className="bg-surface-container border border-outline-variant/20 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-on-surface-variant">Cargando bots...</span>
            </div>
          ) : bots.length === 0 ? (
            <p className="p-12 text-center text-on-surface-variant">
              Todavía no creaste ningún bot. Creá uno primero en "Bots de Bingo".
            </p>
          ) : (
            <>
              <div className="px-6 py-3 border-b border-outline-variant/10 text-sm text-on-surface-variant">
                {activeCount === 0
                  ? "Ningún bot activo en Buraco."
                  : `${activeCount} bot${activeCount === 1 ? "" : "s"} activo${activeCount === 1 ? "" : "s"} en Buraco.`}
              </div>
              <div className="divide-y divide-outline-variant/10">
                {bots.map((bot) => (
                  <div key={bot.botId} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                      <p className="font-bold text-on-surface truncate">{bot.nick}</p>
                      <p
                        className={`text-xs mt-0.5 ${
                          bot.status === "Libre" ? "text-on-surface-variant" : "text-primary font-bold"
                        }`}
                      >
                        {bot.status}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={bot.enabled}
                      aria-label={`Bot ${bot.nick} en Buraco`}
                      disabled={savingId === bot.botId}
                      onClick={() => toggle(bot)}
                      className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer border-0 flex-shrink-0 disabled:opacity-50 ${
                        bot.enabled ? "bg-green-500" : "bg-surface-container-highest"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all ${
                          bot.enabled ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
