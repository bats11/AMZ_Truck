import React, { useState } from "react";
import { moveCameraTo } from "../babylonBridge";
import submenuData from "../data/submenuData.json"; // ✅ JSON esterno

// Ottieni le categorie principali (FRONT SIDE, DRIVER SIDE, ecc.)
const mainButtons = Object.keys(submenuData);

interface CameraMenuProps {
  position: "left" | "right";
  activeMenu: string | null;
  activeSubmenu: string | null;
  setActiveMenu: (value: string | null) => void;
  setActiveSubmenu: (value: string | null) => void;
}

export default function CameraMenu({
  position,
  activeMenu,
  activeSubmenu,
  setActiveMenu,
  setActiveSubmenu,
}: CameraMenuProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  function onMainClick(label: string) {
    setActiveMenu(label);
    setActiveSubmenu(null);
    moveCameraTo(label);
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
    return (
      <div className="menu-main">
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
    const submenu = submenuData[activeMenu as keyof typeof submenuData];

    return (
      <div className="menu-submenu">
        {Object.entries(submenu).map(([subKey, details]) => (
          <div key={subKey}>
            <button
              onClick={() => onSubClick(subKey)}
              className={`submenu-btn ${activeSubmenu === subKey ? "active" : ""}`}
            >
              {subKey}
            </button>

            {activeSubmenu === subKey && (
              <div className="submenu-details">
                {details.map((detail) => (
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
        ))}
      </div>
    );
  }

  return null;
}
