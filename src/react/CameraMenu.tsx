// src/CameraMenu.tsx
import React, { useEffect, useState } from "react";
import { moveCameraTo } from "../babylonBridge";
import submenuData from "../data/submenuData.json";
import { AnimatePresence, motion } from "framer-motion";

interface SubmenuDetails {
  _uiHeight?: string;
  details: string[];
}

interface SubmenuCategory {
  _uiHeight?: string;
  [subKey: string]: SubmenuDetails | string | undefined;
}

const typedSubmenuData: Record<string, SubmenuCategory> = submenuData as Record<string, SubmenuCategory>;

interface CameraMenuProps {
  position: "left" | "right";
  activeMenu: string | null;
  activeSubmenu: string | null;
  setActiveMenu: (value: string | null) => void;
  setActiveSubmenu: (value: string | null) => void;
  touchLocked: boolean;
  setTouchLocked: (value: boolean) => void;
  resetApp: () => void;
  animateMenuChange: (label: string, callback: () => void) => void;
}

export default function CameraMenu({
  position,
  activeMenu,
  activeSubmenu,
  setActiveMenu,
  setActiveSubmenu,
  touchLocked,
  setTouchLocked,
  resetApp,
  animateMenuChange,
}: CameraMenuProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

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

  function onMainClick(label: string) {
    if (label === activeMenu) return;

    const submenuWrapper = document.getElementById("submenu-wrapper");

    animateMenuChange(label, () => {
      setActiveMenu(label);
      setActiveSubmenu(null);
      moveCameraTo(label);
    });

    if (!touchLocked) setTouchLocked(true);
  }

  function onSubClick(subKey: string) {
  if (activeSubmenu === subKey) {
    setActiveSubmenu(null); // 🔁 Se già attivo, chiudi
  } else {
    setActiveSubmenu(subKey); // ✅ Altrimenti apri
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
        {mainButtons.map((label) => (
          <button
            key={label}
            onClick={() => onMainClick(label)}
            className={`menu-btn ${activeMenu === label ? "active" : ""}`}
          >
            {label}
          </button>
        ))}

        {touchLocked && (
          <button
            onClick={() => {
              setTouchLocked(false);
              resetApp();
            }}
            className="return-btn"
          >
            Exit
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
          .filter(([key]) => key !== "_uiHeight")
          .map(([subKey, content]) => {
            const details = Array.isArray(content)
              ? content
              : (content as SubmenuDetails).details;

            return (
              <div key={subKey}>
                <button
                  onClick={() => onSubClick(subKey)}
                  className={`submenu-btn ${activeSubmenu === subKey ? "active" : ""}`}
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
                      transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
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
