// src/react/SlotOverlay.tsx
import React from "react";
import "./SlotOverlay.css";

interface SlotOverlayProps {
  slotCount: number;
  onClickSlot: (index: number) => void;
  slotSize?: string;              // es. "4rem"
  positionStyle?: React.CSSProperties;
  rowGap?: string;                // es. "0.5rem"
  columnGap?: string;             // es. "0.2rem"
  direction?: "ltr" | "rtl";      // ✅ nuova prop per direzione visuale
}

export default function SlotOverlay({
  slotCount,
  onClickSlot,
  slotSize = "4rem",
  positionStyle = {},
  rowGap = "0.5rem",
  columnGap = "0.5rem",
  direction = "rtl",              // ✅ default: da destra verso sinistra
}: SlotOverlayProps) {
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(6, ${slotSize})`,
    gridTemplateRows: `repeat(2, ${slotSize})`,
    rowGap,
    columnGap,
    alignContent: "start",
    justifyContent: "center",
    gridAutoFlow: "column",
    direction,
  };

  return (
    <div className="slot-overlay" style={{ ...positionStyle, ...gridStyle }}>
      {Array.from({ length: slotCount }).map((_, index) => (
        <button
          key={index}
          className="slot-button"
          style={{ width: slotSize, height: slotSize, lineHeight: slotSize }}
          onClick={() => onClickSlot(index)}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}
