// src/react/SlotOverlay.tsx
import React, { useEffect, useState } from "react";
import "./SlotOverlay.css";
import { slotManager } from "../SlotManager";

interface SlotOverlayProps {
  slotCount: number;
  onClickSlot?: (index: number) => void;
  slotWidth?: string;
  slotHeight?: string;
  positionStyle?: React.CSSProperties;
  rowGap?: string;
  columnGap?: string;
  direction?: "ltr" | "rtl";
}

export default function SlotOverlay({
  slotCount,
  onClickSlot,
  slotWidth = "4.7rem",
  slotHeight = "4.4rem",
  positionStyle = {},
  rowGap = "0.5rem",
  columnGap = "0",
  direction = "rtl",
}: SlotOverlayProps) {
  const [visibleSlots, setVisibleSlots] = useState<boolean[]>(
    Array(slotCount).fill(true)
  );

  const isRightSide = direction === "ltr";

  useEffect(() => {
    const handler = (slotIndex: number) => {
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
    gridTemplateColumns: `repeat(6, ${slotWidth})`,
    gridTemplateRows: `repeat(2, ${slotHeight})`,
    rowGap,
    columnGap,
    alignContent: "start",
    justifyContent: "center",
    direction,
    // 🔥 gridAutoFlow rimosso per evitare forzature layout
  };

  const renderSlot = (index: number) => {
    const isVisible = visibleSlots[index];
    const baseStyle: React.CSSProperties = {
      width: "100%",
      height: "100%",
      visibility: isVisible ? "visible" : "hidden",
      pointerEvents: isVisible ? "auto" : "none",
    };

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
        />
      );
    }

    return (
      <button
        key={index}
        className="slot-button"
        style={baseStyle}
        onClick={() => {
          slotManager.assignToSlot(index);
          onClickSlot?.(index);
        }}
      />
    );
  };

  return (
    <div className="slot-overlay" style={{ ...positionStyle, ...gridStyle }}>
      {Array.from({ length: slotCount }).map((_, index) => renderSlot(index))}
    </div>
  );
}
