// src/UIAnimations.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraMenu from "./CameraMenu";
import { moveCameraTo } from "../babylonBridge";
import submenuData from "../data/submenuData.json";

const typedSubmenuData: Record<string, any> = submenuData;

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
}: UIAnimationsProps) {
  const [menuReady, setMenuReady] = useState(false);
  const [isAnimatingMenuChange, setIsAnimatingMenuChange] = useState(false);

  useEffect(() => {
    if (appPhase === "experience") setMenuReady(false);
  }, [appPhase]);

  useEffect(() => {
    if (
      appPhase === "experience" &&
      !activeMenu &&
      menuReady
    ) {
      const firstMenuLabel = Object.keys(typedSubmenuData)[0];
      if (firstMenuLabel) {
        setActiveMenu(firstMenuLabel);
        moveCameraTo(firstMenuLabel);
      }
    }
  }, [appPhase, menuReady, activeMenu]);

  const animateMenuChange = (label: string, onSwitch: () => void) => {
    if (isAnimatingMenuChange) return;

    setIsAnimatingMenuChange(true);
    const submenuWrapper = document.getElementById("submenu-wrapper");

    if (!submenuWrapper) {
      onSwitch();
      setIsAnimatingMenuChange(false);
      return;
    }

    submenuWrapper.animate(
      [{ transform: "scaleY(1)", opacity: 1 }, { transform: "scaleY(0)", opacity: 0 }],
      {
        duration: 400,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        fill: "forwards",
      }
    ).onfinish = () => {
      onSwitch();

      requestAnimationFrame(() => {
        submenuWrapper.animate(
          [{ transform: "scaleY(0)", opacity: 0 }, { transform: "scaleY(1)", opacity: 1 }],
          {
            duration: 400,
            easing: "cubic-bezier(0.65, 0, 0.35, 1)",
            fill: "forwards",
          }
        ).onfinish = () => setIsAnimatingMenuChange(false);
      });
    };
  };

  return (
    <>
      {/* Pulsanti di selezione */}
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
            {/* CameraMenu sinistra */}
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
                animateMenuChange={animateMenuChange}
              />
            </motion.div>

            {/* CameraMenu destra */}
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
              onAnimationComplete={() => {
                setMenuReady(true);
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
                animateMenuChange={animateMenuChange}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
