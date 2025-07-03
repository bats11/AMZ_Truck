// src/App.tsx
import React, { useEffect, useState } from "react";
import LoadingOverlay from "./LoadingOverlay";
import { setTouchLockedGetter } from "../babylonBridge";
import { resetModelTransform } from "../MoveComponent";
import { moveCameraTo } from "../babylonBridge";
import submenuData from "../data/submenuData.json";
import UIAnimations from "./UIAnimations";

const typedSubmenuData: Record<string, any> = submenuData;

export default function App() {
  const [appPhase, setAppPhase] = useState<"loading" | "selection" | "transitioning" | "experience">("loading");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [touchLocked, setTouchLocked] = useState<boolean>(false);
  const initialUiHeight = "50%";

  useEffect(() => {
    setTouchLockedGetter(() => touchLocked);
  }, [touchLocked]);

  useEffect(() => {
    const handleFinishLoading = () => setAppPhase("selection");
    window.addEventListener("react-loading-finished", handleFinishLoading);
    return () => window.removeEventListener("react-loading-finished", handleFinishLoading);
  }, []);

  const startExperience = () => {
    const firstMenuLabel = Object.keys(typedSubmenuData)[0];
    if (!firstMenuLabel) return;

    setAppPhase("transitioning");

    setTimeout(() => {
      setActiveMenu(firstMenuLabel);
      setActiveSubmenu(null);
      setTouchLocked(true);
      moveCameraTo(firstMenuLabel);
      setAppPhase("experience");
    }, 600);
  };

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
      <UIAnimations
        appPhase={appPhase}
        activeMenu={activeMenu}
        activeSubmenu={activeSubmenu}
        setActiveMenu={setActiveMenu}
        setActiveSubmenu={setActiveSubmenu}
        touchLocked={touchLocked}
        setTouchLocked={setTouchLocked}
        resetApp={resetApp}
        startExperience={startExperience}
      />
    </>
  );
}
