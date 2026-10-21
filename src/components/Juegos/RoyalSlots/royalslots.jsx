import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import GameFrame from "../GameFrame/gameFrame";
import { ROYAL_SLOTS_LOBBY, HUB_SLOTS, HUB_ORIGINS } from "../../../data/slotHub";

// Lobby de slots. Siempre se queda en /game/royalslots: al elegir una slot en el lobby se cambia
// lo que muestra el marco por el build propio de esa slot (con ?hub=royalslots, para que muestre
// su casita), y al volver se muestra el lobby otra vez. Ver src/data/slotHub.js.
const RoyalSlots = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const [searchParams, setSearchParams] = useSearchParams();
  const slug = searchParams.get("juego");
  const slot = slug ? HUB_SLOTS[slug] : null;

  useEffect(() => {
    const onMessage = (event) => {
      if (!HUB_ORIGINS.has(event.origin)) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "royalslots:open" && HUB_SLOTS[data.game]) {
        setSearchParams({ juego: data.game });
      } else if (data.type === "royalslots:lobby") {
        setSearchParams({});
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setSearchParams]);

  const src = jugadorID
    ? slot
      ? `${slot.url(jugadorID)}&hub=royalslots`
      : ROYAL_SLOTS_LOBBY.url(jugadorID)
    : null;

  return (
    <GameFrame
      src={src}
      title={slot ? `Royal Slots · ${slot.title}` : ROYAL_SLOTS_LOBBY.title}
      nativeWidth={1920}
      nativeHeight={1080}
      onBack={slot ? () => setSearchParams({}) : undefined}
      backLabel="Lobby"
    />
  );
};

export default RoyalSlots;
