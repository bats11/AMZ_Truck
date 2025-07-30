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

  const isRightSide = direction === "ltr";

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(6, ${slotSize})`,
    gridTemplateRows: `repeat(2, ${slotSize})`,
    rowGap,
    columnGap,
    alignContent: "start",
    justifyContent: "center",
    gridAutoFlow: "column",
    direction,
  };

  const renderSlot = (index: number) => {
    const isVisible = visibleSlots[index];
    const baseStyle: React.CSSProperties = {
      width: "100%",
      height: "100%",
      visibility: isVisible ? "visible" : "hidden",
      pointerEvents: isVisible ? "auto" : "none",
    };

    // Lato destro (right side), slot 8 e 9 → larghi
    if (isRightSide && index >= 8) {
      return (
        <button
          key={index}
          className="slot-button"
          style={{
            ...baseStyle,
            gridColumn: "5 / span 2",
            gridRow: index === 8 ? "1" : "2",
          }}
          onClick={() => {
            slotManager.assignToSlot(index);
            if (onClickSlot) onClickSlot(index);
          }}
        >
          {index + 1}
        </button>
      );
    }

    // Tutti gli altri slot (normali)
    return (
      <button
        key={index}
        className="slot-button"
        style={baseStyle}
        onClick={() => {
          slotManager.assignToSlot(index);
          if (onClickSlot) onClickSlot(index);
        }}
      >
        {index + 1}
      </button>
    );
  };

  return (
    <div className="slot-overlay" style={{ ...positionStyle, ...gridStyle }}>
      {Array.from({ length: slotCount }).map((_, index) => renderSlot(index))}
    </div>
  );
}
