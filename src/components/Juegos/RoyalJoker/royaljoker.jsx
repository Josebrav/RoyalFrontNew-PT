import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";
import { HUB_SLOTS } from "../../../data/slotHub";

const RoyalJoker = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const game = HUB_SLOTS.royaljoker;

  return <GameFrame src={jugadorID ? game.url(jugadorID) : null} title={game.title} nativeWidth={1920} nativeHeight={1080} />;
};

export default RoyalJoker;
