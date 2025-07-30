// src/react/SlotOverlay.tsx
import React, { useEffect, useState } from "react";
import "./SlotOverlay.css";
import { slotManager } from "../SlotManager";

interface SlotOverlayProps {
  slotCount: number;
  onClickSlot?: (index: number) => void;
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
  const [visibleSlots, setVisibleSlots] = useState<boolean[]>(
    Array(slotCount).fill(true)
  );

  useEffect(() => {
    const handler = (slotIndex: number) => {
      setVisibleSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = false;
        return next;
      });
    };
    slotManager.onSlotAssigned(handler);
  }, []);

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
            lineHeight: "4rem",
            visibility: visibleSlots[index] ? "visible" : "hidden",
            pointerEvents: visibleSlots[index] ? "auto" : "none",
          }}
          onClick={() => {
            slotManager.assignToSlot(index);
            if (onClickSlot) onClickSlot(index);
          }}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}
