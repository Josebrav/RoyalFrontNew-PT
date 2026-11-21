import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";

// Juego del Bicho: build de Unity en S3. Se diseñó sobre una imagen de 1672x941.
const Bicho = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const gameURL = `https://juegodelbicho.s3.us-east-2.amazonaws.com/bicho/index.html?jugadorID=${jugadorID}`;

  return <GameFrame src={jugadorID ? gameURL : null} title="Juego del Bicho" nativeWidth={1672} nativeHeight={941} />;
};

export default Bicho;
