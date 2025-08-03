import React, { useEffect, useState } from "react";
import "./Scoreboard.css";
import { subscribeToScore, getScore } from "../vehicleLoadingManager";
import { vehicleLoadingManager } from "../vehicleLoadingManager";

export default function Scoreboard() {
  const [score, setScore] = useState(getScore());
  const [sideLabel, setSideLabel] = useState("DRIVER SIDE");

  useEffect(() => {
    const unsubscribeScore = subscribeToScore(setScore);
    const unsubscribeState = vehicleLoadingManager.subscribe(() => {
      const state = vehicleLoadingManager.getState();
      setSideLabel(
        state === "rightSideLoading"
          ? "PASSENGER SIDE"
          : state === "leftSideLoading"
          ? "DRIVER SIDE"
          : ""
      );
    });

    // inizializza anche subito
    const initialState = vehicleLoadingManager.getState();
    setSideLabel(
      initialState === "rightSideLoading"
        ? "PASSENGER SIDE"
        : initialState === "leftSideLoading"
        ? "DRIVER SIDE"
        : ""
    );

    return () => {
      unsubscribeScore();
      unsubscribeState();
    };
  }, []);

  return (
    <div className="scoreboard">
      <div className="scoreboard-left">{sideLabel}</div>
      <div className="scoreboard-pill">
        <div className="pill-left">{score}</div>
        <div className="pill-right">
          <span className="pill-value">250</span>
          <span className="pill-label">points</span>
        </div>
      </div>
    </div>
  );
}
