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
  slotSize = "5rem",
  positionStyle = {},
  rowGap = "0.5rem",
  columnGap = ".8rem",
  direction = "rtl",
}: SlotOverlayProps) {
  const [occupiedSlots, setOccupiedSlots] = useState<boolean[]>(Array(slotCount).fill(false));
  const [extraFinished, setExtraFinished] = useState(false);
  const [errorSlots, setErrorSlots] = useState<number[]>([]);
  const isRightSide = direction === "ltr";

  useEffect(() => {
    const handler = (slotIndex: number) => {
      setOccupiedSlots((prev) => {
        const updated = [...prev];
        updated[slotIndex] = true;
        return updated;
      });
    };
    slotManager.onSlotAssigned(handler);
  }, []);

  useEffect(() => {
    const handler = () => setExtraFinished(true);
    window.addEventListener("extra-bags-finished", handler);
    return () => window.removeEventListener("extra-bags-finished", handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      const errors = custom.detail?.errors as number[] || [];
      setErrorSlots(errors);
    };
    window.addEventListener("highlight-error-slots", handler);
    return () => window.removeEventListener("highlight-error-slots", handler);
  }, []);

  useEffect(() => {
    const handler = () => setErrorSlots([]);
    window.addEventListener("clear-slot-errors", handler);
    return () => window.removeEventListener("clear-slot-errors", handler);
  }, []);

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
    const isMultiSlot = isRightSide && (index === 8 || index === 9);
    const isOccupied = isMultiSlot ? false : occupiedSlots[index];
    const showOccupied = isMultiSlot ? extraFinished : occupiedSlots[index];
    const isError = errorSlots.includes(index);

    const baseStyle: React.CSSProperties = {
      width: "100%",
      height: "100%",
    };

    const className = `slot-button${showOccupied ? " occupied" : ""}${isError ? " error" : ""}`;

    const handleClick = () => {
      if (isOccupied) return;
      if (isMultiSlot && extraFinished) return;
      slotManager.assignToSlot(index);
      onClickSlot?.(index);
    };

    const dotOrX = isError ? (
      <span className="slot-x">✕</span>
    ) : (
      <span className="slot-dot">
        <span className="slot-dot-ring" />
      </span>
    );

    if (isMultiSlot) {
      return (
        <button
          key={index}
          className={className}
          style={{
            ...baseStyle,
            gridColumn: "5 / span 2",
            gridRow: index === 8 ? "1" : "2",
          }}
          onClick={handleClick}
        >
          {dotOrX}
        </button>
      );
    }

    return (
      <button
        key={index}
        className={className}
        style={baseStyle}
        onClick={handleClick}
      >
        {dotOrX}
      </button>
    );
  };

  return (
    <div className="slot-overlay" style={{ ...positionStyle, ...gridStyle }}>
      {Array.from({ length: slotCount }).map((_, index) => renderSlot(index))}
    </div>
  );
}
