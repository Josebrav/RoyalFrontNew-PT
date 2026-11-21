import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useMissions, { resetDate, timeLeft } from "../../utils/useMissions";
import MissionItem from "./missionItem";

/** Tarjeta del inicio: las misiones de hoy, para que el jugador vea qué le falta apenas entra. */
export default function MissionsCard() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state);
  const { data } = useMissions(currentUser?.id);
  if (!currentUser?.id || !data?.daily) return null;

  return (
    <div className="flex-shrink-0 xl:flex-[1_0_auto] flex flex-col rounded-xl border border-[#06b6d4]/40 p-3 bg-gradient-to-b from-[#0c2233] to-[#0d0f1f] shadow-[0_0_22px_rgba(6,182,212,0.18)]">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="font-bold text-white flex items-center gap-2 text-sm">
          <span className="w-6 h-6 rounded-md inline-flex items-center justify-center material-symbols-outlined text-white text-[14px] bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
          Misiones de hoy
          {data.claimable > 0 && (
            <span className="bg-[#ec4899] text-white text-[0.625rem] font-bold rounded-full min-w-[18px] h-[18px] inline-flex items-center justify-center px-1">
              {data.claimable}
            </span>
          )}
        </h3>
        <span className="text-[0.6875rem] text-on-surface-variant" title={resetDate(data.daily.resetsAt)}>
          Se renuevan en {timeLeft(data.daily.resetsAt)}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 xl:flex-[1_0_auto]">
        {data.daily.missions.map((m) => (
          <MissionItem key={m.id} mission={m} compact grow />
        ))}
      </div>
      <button
        type="button"
        onClick={() => navigate("/misiones")}
        className="mt-2 w-full text-[0.6875rem] font-bold uppercase text-[#67e8f9] hover:underline bg-transparent border-0 cursor-pointer"
      >
        Ver también las semanales
      </button>
    </div>
  );
}
