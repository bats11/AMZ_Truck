import React from "react";
import "./Scoreboard.css";

export default function Scoreboard() {
  return (
    <div className="scoreboard">
      <div className="scoreboard-left">BAGS LOADED</div>
      <div className="scoreboard-pill">
        <div className="pill-left">3</div>
        <div className="pill-right">
        <span className="pill-value">260</span>
        <span className="pill-label">points</span>
      </div>

      </div>
    </div>
  );
}
