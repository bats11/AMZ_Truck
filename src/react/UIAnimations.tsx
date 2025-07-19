// src/react/UIAnimations.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraMenu from "./CameraMenu";
import VehicleLoadingUI from "./VehicleLoadingUI"; // ✅ nuovo import
import { vehicleLoadingManager } from "../vehicleLoadingManager"; // ✅ già esistente

interface UIAnimationsProps {
  appPhase: "loading" | "selection" | "transitioning" | "experience";
  experienceType: "dvic" | "vehicle" | null;
  activeMenu: string | null;
  activeSubmenu: string | null;
  setActiveMenu: (value: string | null) => void;
  setActiveSubmenu: (value: string | null) => void;
  touchLocked: boolean;
  setTouchLocked: (value: boolean) => void;
  resetApp: () => void;
  startExperience: (type: "dvic" | "vehicle") => void;
  entryDone: boolean;
  buttonsDisabled: boolean;
  setButtonsDisabled: (val: boolean) => void;
  selectionKey: number;
}

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
}: UIAnimationsProps) {
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
                startExperience("vehicle");
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

            {experienceType === "vehicle" &&
              vehicleLoadingManager.getState() === "startLoading" && (
                <VehicleLoadingUI
                  onLeftClick={() =>
                    vehicleLoadingManager.setState("leftSideLoading")
                  }
                  onRightClick={resetApp}
                />
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
