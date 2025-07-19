// src/App.tsx
import React, { useEffect, useState } from "react";
import LoadingOverlay from "./LoadingOverlay";
import { setTouchLockedGetter } from "../babylonBridge";
import { resetModelTransform } from "../MoveComponent";
import submenuData from "../data/SubmenuData.json";
import UIAnimations from "./UIAnimations";
import { setUiInteractivitySetter } from "../babylonBridge";
import { vehicleLoadingManager } from "../vehicleLoadingManager";

export default function App() {
  const [appPhase, setAppPhase] = useState<"loading" | "selection" | "transitioning" | "experience">("loading");
  const [experienceType, setExperienceType] = useState<"dvic" | "cargoLoad" | null>(null); // ✅ nuovo stato
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [touchLocked, setTouchLocked] = useState<boolean>(false);
  const [entryDone, setEntryDone] = useState(false); // ✅ entry animation completata
  const [selectionKey, setSelectionKey] = useState(0); // ✅ forza remount
  const [buttonsDisabled, setButtonsDisabled] = useState(false); // blocca pulsanti durante animazione
  const initialUiHeight = "50%";

  useEffect(() => {
    setTouchLockedGetter(() => touchLocked);
    setUiInteractivitySetter(setButtonsDisabled);
  }, [touchLocked]);

  useEffect(() => {
    const handleFinishLoading = () => setAppPhase("selection");
    window.addEventListener("react-loading-finished", handleFinishLoading);
    return () => window.removeEventListener("react-loading-finished", handleFinishLoading);
  }, []);

  useEffect(() => {
    const onEntryDone = () => setEntryDone(true);
    window.addEventListener("entry-animation-finished", onEntryDone);
    return () => window.removeEventListener("entry-animation-finished", onEntryDone);
  }, []);

  const startExperience = (type: "dvic" | "cargoLoad") => {
    setExperienceType(type); // ✅ imposta il tipo di esperienza
    setAppPhase("transitioning");
    setTimeout(() => {
      setActiveMenu(null);
      setActiveSubmenu(null);
      setTouchLocked(true);
      setAppPhase("experience");
    }, 600);
  };

  const resetApp = () => {
    if (experienceType === "cargoLoad") {
      vehicleLoadingManager.exit(); // <--- pulizia sottostato
    }

    resetModelTransform();
    setTouchLocked(false);
    setActiveMenu(null);
    setActiveSubmenu(null);
    setAppPhase("selection");
    setSelectionKey((prev) => prev + 1);
    setExperienceType(null); // <--- smonta macro-esperienza

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
        experienceType={experienceType} // ✅ passaggio del tipo
        activeMenu={activeMenu}
        activeSubmenu={activeSubmenu}
        setActiveMenu={setActiveMenu}
        setActiveSubmenu={setActiveSubmenu}
        touchLocked={touchLocked}
        setTouchLocked={setTouchLocked}
        resetApp={resetApp}
        startExperience={startExperience}
        entryDone={entryDone}
        selectionKey={selectionKey}
        buttonsDisabled={buttonsDisabled}
        setButtonsDisabled={setButtonsDisabled}
      />
    </>
  );
}
