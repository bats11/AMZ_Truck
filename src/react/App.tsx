import React, { useEffect, useState } from "react";
import CameraMenu from "./CameraMenu";
import LoadingOverlay from "./LoadingOverlay";
import { setTouchLockedGetter } from "../babylonBridge";
import { resetModelTransform } from "../MoveComponent";
import { moveCameraTo } from "../babylonBridge";
import submenuData from "../data/submenuData.json";

import { motion, AnimatePresence } from "framer-motion";

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

      <AnimatePresence>
        {appPhase === "selection" && (
          <motion.div
            className="experience-selection"
            key="selection-buttons"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <motion.button
              className="exp-btn active"
              onClick={startExperience}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              Damage Report
            </motion.button>

            <motion.button
              className="exp-btn"
              disabled
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Cargo
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {appPhase === "experience" && (
          <motion.div
            id="app-container"
            key="app-container"
            style={{
              pointerEvents: "none",
              transformOrigin: "top",
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.65, 0, 0.35, 1],
            }}
          >
            {/* CameraMenu LEFT con delay */}
            <motion.div
              style={{
                flex: 6.5,
                pointerEvents: "auto",
                padding: "2rem 2rem 0 4rem",
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
                activeMenu={activeMenu}
                activeSubmenu={activeSubmenu}
                setActiveMenu={setActiveMenu}
                setActiveSubmenu={setActiveSubmenu}
                touchLocked={touchLocked}
                setTouchLocked={setTouchLocked}
                resetApp={resetApp}
              />
            </motion.div>

            {/* CameraMenu RIGHT */}
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
