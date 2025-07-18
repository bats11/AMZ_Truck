import React, { useEffect, useState, useRef } from "react";
import { moveCameraTo } from "../babylonBridge";
import { setActiveMenuForTransforms } from "../MoveComponent";
import submenuData from "../data/SubmenuData.json";
import { AnimatePresence, motion } from "framer-motion";

interface SubmenuDetails {
  _uiHeight?: string;
  details: string[];
}

interface SubmenuCategory {
  _uiHeight?: string;
  isCustomSequence?: boolean;
  [subKey: string]: SubmenuDetails | string | boolean | undefined;
}

const typedSubmenuData: Record<string, SubmenuCategory> = submenuData as Record<string, SubmenuCategory>;

// 🕒 Variabili per debounce manuale
let lastClickTime = 0;
const DEBOUNCE_DELAY = 700; // in ms

interface CameraMenuProps {
  position: "left" | "right";
  appPhase: "loading" | "selection" | "transitioning" | "experience";
  activeMenu: string | null;
  activeSubmenu: string | null;
  setActiveMenu: (value: string | null) => void;
  setActiveSubmenu: (value: string | null) => void;
  touchLocked: boolean;
  setTouchLocked: (value: boolean) => void;
  resetApp: () => void;
  buttonsDisabled: boolean;
}

export default function CameraMenu({
  position,
  appPhase,
  activeMenu,
  activeSubmenu,
  setActiveMenu,
  setActiveSubmenu,
  touchLocked,
  setTouchLocked,
  resetApp,
  buttonsDisabled,
}: CameraMenuProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isAnimatingMenuChange, setIsAnimatingMenuChange] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (
      appPhase === "experience" &&
      !activeMenu &&
      !isAnimatingMenuChange &&
      !hasInitializedRef.current
    ) {
      const firstMenuLabel = Object.keys(typedSubmenuData)[0];
      if (firstMenuLabel) {
        hasInitializedRef.current = true;
        onMainClick(firstMenuLabel);
      }
    }
  }, [appPhase, activeMenu, isAnimatingMenuChange]);

  useEffect(() => {
    const container = document.getElementById("app-container");
    if (!container) return;

    const getHeight = () => {
      if (!activeMenu) return null;
      const menuEntry = typedSubmenuData[activeMenu];
      if (!menuEntry) return null;

      if (activeSubmenu && typeof menuEntry[activeSubmenu] === "object") {
        const submenuEntry = menuEntry[activeSubmenu] as SubmenuDetails;
        if (submenuEntry._uiHeight?.trim()) return submenuEntry._uiHeight;
      }

      if (menuEntry._uiHeight?.trim()) return menuEntry._uiHeight;

      return null;
    };

    const targetHeight = getHeight();
    if (targetHeight) {
      container.style.transition = "height 1.8s cubic-bezier(0.65, 0, 0.35, 1)";
      container.style.setProperty("--ui-height", targetHeight);
    }
  }, [activeMenu, activeSubmenu]);

  function animateMenuChange(label: string, onSwitch: () => void) {
    if (isAnimatingMenuChange) return;

    setIsAnimatingMenuChange(true);
    const submenuWrapper = document.getElementById("submenu-wrapper");

    if (!submenuWrapper) {
      onSwitch();
      setIsAnimatingMenuChange(false);
      return;
    }

    submenuWrapper
      .animate(
        [{ transform: "scaleY(1)", opacity: 1 }, { transform: "scaleY(0)", opacity: 0 }],
        {
          duration: 600,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          fill: "forwards",
        }
      )
      .onfinish = () => {
        onSwitch();

        requestAnimationFrame(() => {
          submenuWrapper
            .animate(
              [{ transform: "scaleY(0)", opacity: 0 }, { transform: "scaleY(1)", opacity: 1 }],
              {
                duration: 900,
                easing: "cubic-bezier(0.65, 0, 0.35, 1)",
                fill: "forwards",
              }
            )
            .onfinish = () => setIsAnimatingMenuChange(false);
        });
      };
  }

  function onMainClick(label: string) {
    const now = Date.now();
    if (now - lastClickTime < DEBOUNCE_DELAY) return; // ⛔ Ignora click troppo ravvicinati
    lastClickTime = now;

    if (label === activeMenu) return;

    setActiveMenuForTransforms(label);
    moveCameraTo(label);
    animateMenuChange(label, () => {
      setActiveMenu(label);
      setActiveSubmenu(null);
    });

    if (!touchLocked) setTouchLocked(true);
  }

  function onSubClick(subKey: string) {
    if (activeSubmenu === subKey) {
      setActiveSubmenu(null);
      if (activeMenu) {
        moveCameraTo(activeMenu, {
          bypassBigToBig: true,
          bypassCustomSequence: true,
        });
      }
    } else {
      setActiveSubmenu(subKey);
      moveCameraTo(subKey);
    }
  }

  function toggleCheckbox(detail: string) {
    setCheckedItems((prev) => ({
      ...prev,
      [detail]: !prev[detail],
    }));
  }

  if (position === "right") {
    const mainButtons = Object.keys(typedSubmenuData);
    return (
      <div className="menu-main" style={{ display: "flex", flexDirection: "column" }}>
        {mainButtons.map((label) => {
          const isActive = activeMenu === label;
          return (
            <button
              key={label}
              onClick={() => onMainClick(label)}
              className={`menu-btn ${isActive ? "active" : "inactive"}`}
              disabled={buttonsDisabled}
            >
              {label}
            </button>
          );
        })}

        {touchLocked && (
          <button
            onClick={() => {
              setTouchLocked(false);
              resetApp();
              hasInitializedRef.current = false;
            }}
            className="return-btn"
          >
            <span className="return-label-wrapper">
              <span className="return-label">Activity Menu</span>
              <span className="return-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="return-icon-svg"
                  width="1.6rem"
                  height="1.6rem"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
    );
  }

  if (position === "left" && activeMenu) {
    const submenu = typedSubmenuData[activeMenu];
    return (
      <div
        id="submenu-wrapper"
        className="menu-submenu"
        style={{ transformOrigin: "top", transition: "none" }}
      >
        {Object.entries(submenu)
          .filter(([key]) => key !== "_uiHeight" && key !== "isCustomSequence")
          .map(([subKey, content]) => {
            const details = Array.isArray(content)
              ? content
              : (content as SubmenuDetails).details;

            return (
              <div key={subKey}>
                <button
                  onClick={() => onSubClick(subKey)}
                  className={`submenu-btn ${activeSubmenu === subKey ? "active" : ""}`}
                  disabled={buttonsDisabled}
                >
                  {subKey}
                </button>

                <AnimatePresence initial={false}>
                  {activeSubmenu === subKey && (
                    <motion.div
                      className="submenu-details"
                      key={subKey}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      {details.map((detail: string) => (
                        <label key={detail} className="detail-item">
                          <input
                            type="checkbox"
                            className="detail-checkbox"
                            checked={!!checkedItems[detail]}
                            onChange={() => toggleCheckbox(detail)}
                          />
                          <span>{detail}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
      </div>
    );
  }

  return null;
}
