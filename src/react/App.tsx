import React, { useState, useEffect } from "react";
import CameraMenu from "./CameraMenu";
import { setTouchLockedGetter } from "../babylonBridge";
import { resetModelTransform } from "../MoveComponent";

function LoadingScreen() {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <p className="loading-text">Loading...</p>
    </div>
  );
}

export default function App() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [touchLocked, setTouchLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const initialUiHeight = "50%";

  // ✅ Sync stato touch con Babylon
  useEffect(() => {
    setTouchLockedGetter(() => touchLocked);
  }, [touchLocked]);

  // ✅ Espone il controllo del loading a Babylon
  useEffect(() => {
  console.log("🔧 React: espongo finishReactLoading su window");
  (window as any).finishReactLoading = () => {
    console.log("✅ React: finishReactLoading è stato chiamato");
    setIsLoading(false);
  };
}, []);


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
    <>
      {isLoading && <LoadingScreen />}
      <div id="app-container" style={{ pointerEvents: "none" }}>
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
    </>
  );
}


