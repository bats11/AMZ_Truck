// src/react/SlotOverlay.tsx
import React from "react";
import "./SlotOverlay.css"; // ⬅️ da creare per il layout

interface SlotOverlayProps {
  slotCount: number;
  side: "left" | "right";
  onSlotClick: (index: number) => void;
  disabled?: boolean;
}

export default function SlotOverlay({
  slotCount,
  side,
  onSlotClick,
  disabled = false,
}: SlotOverlayProps) {
  return (
    <div className={`slot-overlay ${side}`}>
      {Array.from({ length: slotCount }, (_, i) => (
        <button
          key={i}
          className="slot-button"
          onClick={() => onSlotClick(i)}
          disabled={disabled}
        >
          {/* Placeholder slot index or icon */}
          {i + 1}
        </button>
      ))}
    </div>
  );
}
