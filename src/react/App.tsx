// src/App.tsx
import React, { useEffect, useState } from "react";
import LoadingOverlay from "./LoadingOverlay";
import { setTouchLockedGetter } from "../babylonBridge";
import { resetModelTransform, getModelRoot } from "../MoveComponent";
import submenuData from "../data/SubmenuData.json";
import UIAnimations from "./UIAnimations";
import { setUiInteractivitySetter } from "../babylonBridge";
import { vehicleLoadingManager, resetScore } from "../vehicleLoadingManager";

export default function App() {
  const [appPhase, setAppPhase] = useState<"loading" | "selection" | "transitioning" | "experience">("loading");
  const [experienceType, setExperienceType] = useState<"dvic" | "cargoLoad" | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [touchLocked, setTouchLocked] = useState<boolean>(false);
  const [entryDone, setEntryDone] = useState(false);
  const [selectionKey, setSelectionKey] = useState(0);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
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
    setExperienceType(type);
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
      vehicleLoadingManager.exit();
      resetScore();
      window.dispatchEvent(new CustomEvent("hide-scoreboard"));
    }

    // 1) Reset modello
    resetModelTransform();

    // 2) Stato UI → selection
    setTouchLocked(false);
    setActiveMenu(null);
    setActiveSubmenu(null);
    setAppPhase("selection");
    setSelectionKey((prev) => prev + 1);
    setExperienceType(null);

    const container = document.getElementById("app-container");
    if (container) {
      container.style.setProperty("--ui-height", initialUiHeight);
    }

    // 3) Pulizia wrapper residui
    const modelRoot = getModelRoot();
    if (modelRoot) {
      const orphanWrappers = modelRoot
        .getChildren()
        .filter((n) => n.name.startsWith("BagWrapper_"));
      for (const w of orphanWrappers) {
        w.getChildMeshes(false).forEach((m) => m.dispose());
        w.dispose();
      }
      if (orphanWrappers.length > 0) {
        console.log(`🧹 resetApp: rimossi ${orphanWrappers.length} wrapper residuali`);
      }
    }

    // 4) Avvio spin “soft” dopo delay esterno (2.5s) dal reset
    setTimeout(async () => {
      const scene = (window as any)._BABYLON_SCENE as import("@babylonjs/core").Scene | undefined;
      const root = getModelRoot();
      if (!scene || !root) return;

      const { startIdleSpinFromSelection, stopIdleSpin } = await import("../entryAnimation");

      stopIdleSpin(root, scene); // pulizia eventuali spin precedenti

      startIdleSpinFromSelection(root, scene, {
        delaySec: 0,           // nessun delay interno, già gestito fuori
        accelAngleDeg: 12,
        accelDurationSec: 0.9,
        constAngleDeg: 8,
        constDurationSec: 0.5,
        direction: 1,
        space: "world"
      });
    }, 2500);
  };

  return (
    <>
      <LoadingOverlay />
      <UIAnimations
        appPhase={appPhase}
        experienceType={experienceType}
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
