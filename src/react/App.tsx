import React, { useState, useEffect } from "react";
import CameraMenu from "./CameraMenu";
import { setTouchLockedGetter } from "../babylonBridge";
import { resetModelTransform } from "../MoveComponent";

export default function App() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [touchLocked, setTouchLocked] = useState<boolean>(false);
  const initialUiHeight = "50%";

  // ✅ Mantieni sincronizzato lo stato touchLocked con Babylon
  useEffect(() => {
    setTouchLockedGetter(() => touchLocked);
  }, [touchLocked]);

  // ✅ Funzione per riportare tutto allo stato iniziale
  const resetApp = () => {
    resetModelTransform();
    setActiveMenu(null);
    setActiveSubmenu(null);

    const container = document.getElementById("app-container");
    if (container) {
      container.style.setProperty("--ui-height", initialUiHeight);
    }
  };

  return (
    <div
      id="app-container"
      style={{
        pointerEvents: "none", // React non blocca il canvas
      }}
    >
      {/* Colonna sinistra */}
      <div
        style={{
          flex: 6.5,
          pointerEvents: "auto",
          padding: "2rem 2rem 0 4rem",
        }}
      >
        <CameraMenu
          position="left"
          activeMenu={activeMenu}
          activeSubmenu={activeSubmenu}
          setActiveMenu={setActiveMenu}
          setActiveSubmenu={setActiveSubmenu}
          touchLocked={touchLocked}
          setTouchLocked={setTouchLocked}
          resetApp={resetApp}
        />
      </div>

      {/* Colonna destra */}
      <div
        style={{
          flex: 3.5,
          pointerEvents: "auto",
          padding: "2rem 0 0 0",
        }}
      >
        <CameraMenu
          position="right"
          activeMenu={activeMenu}
          activeSubmenu={activeSubmenu}
          setActiveMenu={setActiveMenu}
          setActiveSubmenu={setActiveSubmenu}
          touchLocked={touchLocked}
          setTouchLocked={setTouchLocked}
          resetApp={resetApp}
        />
      </div>
    </div>
  );
}
