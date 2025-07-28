// src/react/UIAnimations.tsx
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraMenu from "./CameraMenu";
import VehicleLoadingUI from "./VehicleLoadingUI";
import { vehicleLoadingManager } from "../vehicleLoadingManager";
import { useSyncExternalStore } from "react";
import SlotOverlay from "./SlotOverlay";

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
  const originalUiHeightRef = useRef<string | null>(null);

  useEffect(() => {
    const handler = () => {
      const container = document.getElementById("app-container");
      if (container) {
        if (originalUiHeightRef.current === null) {
          const current = getComputedStyle(container).getPropertyValue("--ui-height").trim();
          originalUiHeightRef.current = current || null;
        }
        container.style.setProperty("--ui-height", "100%");
      }

      setShowOverlay(true);
    };

    window.addEventListener("show-slot-overlay", handler);
    return () => window.removeEventListener("show-slot-overlay", handler);
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
              className="exp-btn active"
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
              className="exp-btn"
              onClick={() => {
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
                <AnimatePresence mode="wait">
                  {loadingState === "startLoading" && (
                    <motion.div
                      key="vehicle-loading-ui"
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 40 }}
                      transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
                      style={{
                        position: "absolute",
                        top: "40%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1000,
                      }}
                    >
                      <VehicleLoadingUI
                        onLeftClick={() =>
                          vehicleLoadingManager.setState("leftSideLoading")
                        }
                        onRightClick={resetApp}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {loadingState === "leftSideLoading" && (
                  <motion.div
                    key="instruction-ui"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
                    style={{
                      position: "absolute",
                      top: "40%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 1000,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "2rem",
                      textAlign: "center",
                      width: "26rem",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "EmberCondensed",
                        fontSize: "1.6rem",
                        color: "#004f6c",
                        background: "white",
                        padding: "2rem",
                        borderRadius: "0.8rem",
                        boxShadow: "0 0.4rem 1.2rem rgba(0,0,0,0.1)",
                        lineHeight: "1.4",
                      }}
                    >
                      You have 3 carts to load into your vehicle. Check the carts below to see what’s coming next. Bags will come off the cart from left to right on each row.
                    </div>

                    <button
                      className="vehicle-loading-btn primary"
                      onClick={() => {
                        console.log("🚀 Secondo pulsante cliccato");
                        // Inserisci qui la logica effettiva di avvio caricamento
                      }}
                    >
                      Start Loading Vehicle
                    </button>
                  </motion.div>
                )}

                {showOverlay && (
                  <SlotOverlay
                    slotCount={12}
                    slotSize="4rem"
                    direction={loadingState === "rightSideLoading" ? "ltr" : "rtl"}
                    positionStyle={{
                      top: "21.45rem",
                      left: "21.7rem",
                      transform: "translateX(-50%)",
                    }}
                    onClickSlot={(i) => console.log(`🟦 Slot ${i + 1} cliccato`)}
                  />
                )}

                {loadingState === "startLoading" &&
                  (() => {
                    import("../vehicleLoadingTransform").then(
                      ({ animateToStartLoading }) => animateToStartLoading()
                    );
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
