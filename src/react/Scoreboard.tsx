import React, { useEffect, useState } from "react";
import "./Scoreboard.css";
import { subscribeToScore, getScore } from "../vehicleLoadingManager";

export default function Scoreboard() {
  const [score, setScore] = useState(getScore());

  useEffect(() => {
    const unsubscribe = subscribeToScore(setScore);
    return () => unsubscribe();
  }, []);

  return (
    <div className="scoreboard">
      <div className="scoreboard-left">BAGS LOADED</div>
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
