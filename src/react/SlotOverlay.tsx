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

  const isRightSide = direction === "ltr";

  useEffect(() => {
    const handler = (slotIndex: number) => {
      // Solo lato sinistro fa scomparire tutti gli slot assegnati
      if (!isRightSide || slotIndex < 8) {
        setVisibleSlots((prev) => {
          const next = [...prev];
          next[slotIndex] = false;
          return next;
        });
      }
    };
    slotManager.onSlotAssigned(handler);
  }, [isRightSide]);

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

    // ➕ Solo lato destro: slot 8 e 9 sono larghi
    if (isRightSide && (index === 8 || index === 9)) {
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
            onClickSlot?.(index);
          }}
        >
          {index + 1}
        </button>
      );
    }

    // Slot normali (sempre 1x1)
    return (
      <button
        key={index}
        className="slot-button"
        style={baseStyle}
        onClick={() => {
          slotManager.assignToSlot(index);
          onClickSlot?.(index);
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
