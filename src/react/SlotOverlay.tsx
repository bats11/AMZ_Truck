// src/react/SlotOverlay.tsx
import React from "react";
import "./SlotOverlay.css";
import { slotManager } from "../SlotManager"; // ✅ Importa il manager

interface SlotOverlayProps {
  slotCount: number;
  onClickSlot?: (index: number) => void; // 🔄 reso opzionale
  slotSize?: string;
  positionStyle?: React.CSSProperties;
  rowGap?: string;
  columnGap?: string;
  direction?: "ltr" | "rtl";
}

export default function SlotOverlay({
  slotCount,
  onClickSlot,
  slotSize = "4rem",
  positionStyle = {},
  rowGap = "0.5rem",
  columnGap = "0.7rem",
  direction = "rtl",
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
          style={{
            width: "4.8rem",
            height: "4rem",
            lineHeight: "4rem"
          }}

          onClick={() => {
            // ✅ Logica di interazione integrata con SlotManager
            slotManager.assignToSlot(index);
            if (onClickSlot) onClickSlot(index); // opzionale callback esterna
          }}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}
