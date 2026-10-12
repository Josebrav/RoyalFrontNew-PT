import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";

const Domino = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const gameURL = `https://dominoroyal.s3.us-east-2.amazonaws.com/domino/index.html?jugadorID=${jugadorID}`;

  return <GameFrame src={jugadorID ? gameURL : null} title="Dominó" nativeWidth={1920} nativeHeight={1080} />;
};

export default Domino;
