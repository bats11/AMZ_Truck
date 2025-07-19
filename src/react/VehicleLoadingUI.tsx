// src/react/VehicleLoadingUI.tsx
import React from "react";

interface VehicleLoadingUIProps {
  onLeftClick: () => void;
  onRightClick: () => void;
}

export default function VehicleLoadingUI({ onLeftClick, onRightClick }: VehicleLoadingUIProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "55%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        gap: "4rem",
        zIndex: 1000,
        pointerEvents: "auto",
      }}
    >
      <button className="exp-btn" onClick={onLeftClick}>
        Load Left Side
      </button>
      <button className="exp-btn" onClick={onRightClick}>
        Activity Menu
      </button>
    </div>
  );
}
