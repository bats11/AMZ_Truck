// src/react/App.tsx
import React, { useEffect, useState } from "react";
import CameraMenu from "./CameraMenu";
import LoadingOverlay from "./LoadingOverlay";
import {
  setTouchLockedGetter,
  moveCameraTo,
} from "../babylonBridge";          // ← solo touch & camera bridge
import { resetModelTransform } from "../MoveComponent"; // ← reset 3D
import submenuData from "../data/submenuData.json";

const typedSubmenuData: Record<string, any> = submenuData;

export default function App() {
  const [appPhase, setAppPhase] = useState<"loading" | "selection" | "experience">("loading");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [touchLocked, setTouchLocked] = useState<boolean>(false);
  const initialUiHeight = "50%";

  // Aggiorna il bridge su quando il touch deve essere disabilitato
  useEffect(() => {
    setTouchLockedGetter(() => touchLocked);
  }, [touchLocked]);

  // Al termine del loading, passa in "selection"
  useEffect(() => {
    const handleFinishLoading = () => setAppPhase("selection");
    window.addEventListener("react-loading-finished", handleFinishLoading);
    return () => window.removeEventListener("react-loading-finished", handleFinishLoading);
  }, []);

  // Start Experience: interrompe overlay, imposta camera e vai in "experience"
  const startExperience = () => {
    const firstMenuLabel = Object.keys(typedSubmenuData)[0];
    if (!firstMenuLabel) return;

    setActiveMenu(firstMenuLabel);
    setActiveSubmenu(null);
    setTouchLocked(true);
    moveCameraTo(firstMenuLabel);
    setAppPhase("experience");
  };

  // Reset App: torna a "selection" e resetta 3D/UI
  const resetApp = () => {
    resetModelTransform();
    setTouchLocked(false);
    setActiveMenu(null);
    setActiveSubmenu(null);
    setAppPhase("selection");

    const container = document.getElementById("app-container");
    if (container) {
      container.style.setProperty("--ui-height", initialUiHeight);
    }
  };

  return (
    <>
      <LoadingOverlay />

      {appPhase === "selection" && (
        <div className="experience-selection">
          <button className="exp-btn active" onClick={startExperience}>
            Damage Report
          </button>
          <button className="exp-btn" disabled>
            Cargo
          </button>
        </div>
      )}

      {appPhase === "experience" && (
        <div id="app-container" style={{ pointerEvents: "none" }}>
          <div style={{ flex: 6.5, pointerEvents: "auto", padding: "2rem 2rem 0 4rem" }}>
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
          <div style={{ flex: 3.5, pointerEvents: "auto", padding: "2rem 0 0 0" }}>
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
      )}
    </>
  );
}
