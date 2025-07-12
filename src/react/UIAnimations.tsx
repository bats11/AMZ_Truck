// src/UIAnimations.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraMenu from "./CameraMenu";

interface UIAnimationsProps {
  appPhase: "loading" | "selection" | "transitioning" | "experience";
  activeMenu: string | null;
  activeSubmenu: string | null;
  setActiveMenu: (value: string | null) => void;
  setActiveSubmenu: (value: string | null) => void;
  touchLocked: boolean;
  setTouchLocked: (value: boolean) => void;
  resetApp: () => void;
  startExperience: () => void;
  entryDone: boolean;
  selectionKey: number;
}

export default function UIAnimations({
  appPhase,
  activeMenu,
  activeSubmenu,
  setActiveMenu,
  setActiveSubmenu,
  touchLocked,
  setTouchLocked,
  resetApp,
  startExperience,
  entryDone,
  selectionKey,
}: UIAnimationsProps) {
  return (
    <>
      {/* Pulsanti di selezione */}
      <AnimatePresence>
        {appPhase === "selection" && entryDone && (
          <motion.div
            className="experience-selection"
            key={`selection-${selectionKey}`} // forza remount anche al ritorno
            initial={{ opacity: 0, y: 40, x: 60 }} // ✅ entrata da destra
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 60 }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <motion.button
              className="exp-btn active"
              onClick={startExperience}
            >
              DVIC Inspection
            </motion.button>

            <motion.button className="exp-btn">
              Vehicle Loading
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interfaccia experience */}
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
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
