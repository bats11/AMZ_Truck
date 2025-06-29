import React, { useEffect, useState } from "react";
import { moveCameraTo } from "../babylonBridge";
import submenuData from "../data/submenuData.json";

// === Tipi estesi ===
interface SubmenuDetails {
  _uiHeight?: string;
  details: string[];
}

interface SubmenuCategory {
  _uiHeight?: string;
  [subKey: string]: SubmenuDetails | string | undefined;
}

const typedSubmenuData: Record<string, SubmenuCategory> = submenuData as Record<string, SubmenuCategory>;

// === Props component ===
interface CameraMenuProps {
  position: "left" | "right";
  activeMenu: string | null;
  activeSubmenu: string | null;
  setActiveMenu: (value: string | null) => void;
  setActiveSubmenu: (value: string | null) => void;
  touchLocked: boolean;
  setTouchLocked: (value: boolean) => void;
  resetApp: () => void;
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
}: CameraMenuProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // === Gestione altezza dinamica ===
  useEffect(() => {
    const container = document.getElementById("app-container");
    if (!container) return;

    const getHeight = () => {
      if (!activeMenu) return null;
      const menuEntry = typedSubmenuData[activeMenu];
      if (!menuEntry) return null;

      if (activeSubmenu && typeof menuEntry[activeSubmenu] === "object") {
        const submenuEntry = menuEntry[activeSubmenu] as SubmenuDetails;
        if (submenuEntry._uiHeight && submenuEntry._uiHeight.trim() !== "") return submenuEntry._uiHeight;
      }

      if (menuEntry._uiHeight && menuEntry._uiHeight.trim() !== "") return menuEntry._uiHeight;

      return null;
    };

    const targetHeight = getHeight();
    if (targetHeight) {
      container.style.transition = "height 1.8s cubic-bezier(0.65, 0, 0.35, 1)";
      container.style.setProperty("--ui-height", targetHeight);
    }
  }, [activeMenu, activeSubmenu]);

  // === Interazioni UI ===
  function onMainClick(label: string) {
    setActiveMenu(label);
    setActiveSubmenu(null);
    moveCameraTo(label);
    if (!touchLocked) setTouchLocked(true);
  }

  function onSubClick(subKey: string) {
    setActiveSubmenu(subKey);
    moveCameraTo(subKey);
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
      <div className="menu-main">
        {touchLocked && (
          <button
            onClick={() => {
              setTouchLocked(false);
              resetApp();
            }}
            className="menu-btn unlock-btn"
          >
            🔓 Unlock Touch
          </button>
        )}
        {mainButtons.map((label) => (
          <button
            key={label}
            onClick={() => onMainClick(label)}
            className={`menu-btn ${activeMenu === label ? "active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  if (position === "left" && activeMenu) {
    const submenu = typedSubmenuData[activeMenu];

    return (
      <div className="menu-submenu">
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

                {activeSubmenu === subKey && (
                  <div className="submenu-details">
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
                  </div>
                )}
              </div>
            );
          })}
      </div>
    );
  }

  return null;
}
