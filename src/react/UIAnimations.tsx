// src/react/UIAnimations.tsx
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraMenu from "./CameraMenu";
import VehicleLoadingUI from "./VehicleLoadingUI";
import { vehicleLoadingManager } from "../vehicleLoadingManager";
import { useSyncExternalStore } from "react";
import SlotOverlay from "./SlotOverlay";
import { runTruckTransform } from "../vehicleLoadingTransform";
import Scoreboard from "./Scoreboard"; // ⬅️ AGGIUNTO
import { fadeOutShadow } from "../setupBackground";


export default function UIAnimations({
  appPhase,
  experienceType,
  activeMenu,
  activeSubmenu,
  setActiveMenu,
  setActiveSubmenu,
  touchLocked,
  setTouchLocked,
  resetApp,
  startExperience,
  entryDone,
  buttonsDisabled,
}: any) {
  const loadingState = useSyncExternalStore(
    vehicleLoadingManager.subscribe.bind(vehicleLoadingManager),
    vehicleLoadingManager.getState.bind(vehicleLoadingManager)
  );

  const [showOverlay, setShowOverlay] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const originalUiHeightRef = useRef<string | null>(null);

  useEffect(() => {
    const handler = () => {
      setShowOverlay(true);
    };
    window.addEventListener("show-slot-overlay", handler);
    return () => window.removeEventListener("show-slot-overlay", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      setShowOverlay(false);
    };
    window.addEventListener("hide-slot-overlay", handler);
    return () => window.removeEventListener("hide-slot-overlay", handler);
  }, []);

  useEffect(() => {
    const handler = async () => {
      if (experienceType !== "cargoLoad") {
        console.warn("⛔ Ignorato 'return-to-menu': non in modalità cargoLoad.");
        return;
      }

      console.log("🔙 Evento 'return-to-menu' ricevuto. Resetting...");

      const scene = (window as any)._BABYLON_SCENE;
      if (scene) {
        const { handleExitAnimations } = await import("../animatedMeshes");
        handleExitAnimations(scene);
        // ⬅️ Fade-in ombra sul background
        const { fadeInShadow } = await import("../setupBackground");
        fadeInShadow(scene, 0.5);
      }

      setActiveMenu(null);
      setActiveSubmenu(null);
      resetApp();
    };

    window.addEventListener("return-to-menu", handler);
        return () => window.removeEventListener("return-to-menu", handler);
      }, [experienceType]);

      useEffect(() => {
      const handler = () => setShowScoreboard(true);
      window.addEventListener("show-scoreboard", handler);
      return () => window.removeEventListener("show-scoreboard", handler);
    }, []);

    useEffect(() => {
      const handler = () => setShowScoreboard(false);
      window.addEventListener("hide-scoreboard", handler);
      return () => window.removeEventListener("hide-scoreboard", handler);
    }, []);



  return (
    <>
      <AnimatePresence>
        {appPhase === "selection" && (
          <motion.div
            className="experience-selection"
            key="selection-buttons"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: entryDone ? 1 : 0, y: entryDone ? 0 : 40 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
            style={{ pointerEvents: entryDone ? "auto" : "none" }}
          >
            <motion.button
              className="vehicle-loading-btn primary"
              onClick={() => startExperience("dvic")}
              disabled={buttonsDisabled}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              DVIC Inspection
            </motion.button>

            <motion.button
              className="vehicle-loading-btn secondary"
              onClick={() => {
                const scene = (window as any)._BABYLON_SCENE;
                if (scene) fadeOutShadow(scene, 0.5);
                startExperience("cargoLoad");
                vehicleLoadingManager.enter();
              }}
              disabled={buttonsDisabled}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Vehicle Loading
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {appPhase === "experience" && (
          <motion.div
            id="app-container"
            key="app-container"
            style={{ pointerEvents: "none", transformOrigin: "top" }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          >
            {experienceType === "dvic" && (
              <>
                <motion.div
                  style={{
                    flex: 6.5,
                    display: "flex",
                    flexDirection: "column",
                    pointerEvents: "auto",
                    padding: "2rem 2rem 3rem 2rem",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.15,
                    duration: 0.6,
                    ease: [0.65, 0, 0.35, 1],
                  }}
                >
                  <CameraMenu
                    position="left"
                    appPhase={appPhase}
                    activeMenu={activeMenu}
                    activeSubmenu={activeSubmenu}
                    setActiveMenu={setActiveMenu}
                    setActiveSubmenu={setActiveSubmenu}
                    touchLocked={touchLocked}
                    setTouchLocked={setTouchLocked}
                    resetApp={resetApp}
                    buttonsDisabled={buttonsDisabled}
                  />
                </motion.div>

                <motion.div
                  style={{
                    flex: 3.5,
                    pointerEvents: "auto",
                    padding: "2rem 0 0 0",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0,
                    duration: 0.6,
                    ease: [0.65, 0, 0.35, 1],
                  }}
                >
                  <CameraMenu
                    position="right"
                    appPhase={appPhase}
                    activeMenu={activeMenu}
                    activeSubmenu={activeSubmenu}
                    setActiveMenu={setActiveMenu}
                    setActiveSubmenu={setActiveSubmenu}
                    touchLocked={touchLocked}
                    setTouchLocked={setTouchLocked}
                    resetApp={resetApp}
                    buttonsDisabled={buttonsDisabled}
                  />
                </motion.div>
              </>
            )}

            {experienceType === "cargoLoad" && (
              <>
                <VehicleLoadingUI />

                {showScoreboard && <Scoreboard />}

                {showOverlay && (
                  <SlotOverlay
                    slotCount={loadingState === "rightSideLoading" ? 10 : 12} // ✅ CORRETTO
                    slotSize="6.5rem"
                    direction={loadingState === "rightSideLoading" ? "ltr" : "rtl"}
                    positionStyle={
                      loadingState === "rightSideLoading"
                        ? {
                            top: "20.3rem",
                            left: "-16rem",
                            transform: "translateX(50%)",
                          }
                        : {
                            top: "20.5rem",
                            left: "29.3rem",
                            transform: "translateX(-50%)",
                          }
                    }
                    onClickSlot={(i) => console.log(`🟦 Slot ${i + 1} cliccato`)}
                  />
                )}

                {loadingState === "startLoading" &&
                  (() => {
                    runTruckTransform("start");
                    return null;
                  })()}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
