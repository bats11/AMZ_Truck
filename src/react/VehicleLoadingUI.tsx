import React from "react";

interface VehicleLoadingUIProps {
  onLeftClick: () => void;
  onRightClick: () => void;
}

export default function VehicleLoadingUI({ onLeftClick, onRightClick }: VehicleLoadingUIProps) {
  return (
    <div className="vehicle-loading-ui">
      <button className="vehicle-loading-btn primary" onClick={onLeftClick}>
        Start Loading Vehicle
      </button>
      <button className="vehicle-loading-btn secondary" onClick={onRightClick}>
        Return to Activity Menu
      </button>
    </div>
  );
}
