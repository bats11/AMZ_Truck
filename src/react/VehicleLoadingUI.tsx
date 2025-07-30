// src/react/VehicleLoadingUI.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { vehicleLoadingManager } from "../vehicleLoadingManager";
import { runTruckTransform } from "../vehicleLoadingTransform";
import { slotManager } from "../SlotManager";

type UIStage = "start" | "confirm" | "instructions" | "leftResults" | "rightResults" | "none";

export default function VehicleLoadingUI() {
  const [uiStage, setUiStage] = useState<UIStage>("start");

  useEffect(() => {
    (window as any).setVehicleUiStage = (stage: UIStage) => {
      console.log(`📟 Cambio UIStage → ${stage}`);
      setUiStage(stage);
    };
  }, []);

  useEffect(() => {
    const container = document.getElementById("app-container");
    if (container) {
      container.style.setProperty("--ui-height", "100%");
      console.log("📐 UI height impostata a 100% per fase cargo");
    }
  }, []);

  useEffect(() => {
    if (uiStage === "instructions") {
      const timeout = setTimeout(async () => {
        console.log("⏱️ Fine istruzioni, avvio caricamento...");
        setUiStage("none");

        const scene = (window as any)._BABYLON_SCENE;
        if (!scene) {
          console.warn("⚠️ Scene Babylon non disponibile.");
          return;
        }

        const { LoadTruckController } = await import("../LoadTruckController");
        new LoadTruckController(scene, "left");
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [uiStage]);

  const validation = (window as any)._UI_VALIDATION_RESULT;
  const isValid = validation?.isValid ?? false;
  const errorCount = validation?.errorCount ?? 0;
  const buttonText = isValid ? "Start Passenger Side" : "Try Again?";

  return (
    <div className="vehicle-loading-ui wide">
      <AnimatePresence mode="wait">
        {uiStage === "start" && (
          <>
            <motion.button
              key="start-btn"
              className="vehicle-loading-btn primary fixed"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5 }}
              onClick={() => {
                vehicleLoadingManager.setState("leftSideLoading");
                setUiStage("none");
                setTimeout(() => {
                  setUiStage("confirm");
                }, 500);
              }}
            >
              Start Loading Vehicle
            </motion.button>

            <motion.button
              key="return-btn"
              className="vehicle-loading-btn secondary fixed"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5 }}
              onClick={() => {
                window.dispatchEvent(new CustomEvent("return-to-menu"));
              }}
            >
              Return to Activity Menu
            </motion.button>
          </>
        )}

        {uiStage === "confirm" && (
          <>
            <motion.div
              key="instruction-box"
              className="vehicle-loading-textbox"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5 }}
            >
              You have 3 carts to load into your vehicle. Check the carts below to see what’s coming next. Bags will come off the cart from left to right on each row.
            </motion.div>

            <motion.button
              key="confirm-btn"
              className="vehicle-loading-btn primary fixed"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5 }}
              onClick={async () => {
                console.log("📨 Conferma → transizione a 'instructions'");
                const scene = (window as any)._BABYLON_SCENE;
                if (!scene) {
                  console.warn("⚠️ Scene Babylon non disponibile.");
                } else {
                  await runTruckTransform("confirm");
                }
                setUiStage("instructions");
              }}
            >
              Start Loading Vehicle
            </motion.button>
          </>
        )}

        {uiStage === "instructions" && (
          <motion.div
            key="auto-instructions"
            className="vehicle-loading-textbox"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5 }}
          >
            Tap to select where the first bag should go. Tap again to lock it in.
          </motion.div>
        )}

        {uiStage === "leftResults" && (
          <>
            <motion.div
              key="result-box"
              className="vehicle-loading-textbox"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5 }}
            >
              {isValid ? (
                "Great job! You loaded the driver side perfectly! Let’s finish the last two carts on the passenger side."
              ) : (
                <>
                  Not quite. You have{" "}
                  <span className="validation-error-count">
                    {errorCount} bag{errorCount !== 1 ? "s" : ""}
                  </span>{" "}
                  out of place. Remember, lower numbers should be closest to the driver’s seat.
                </>
              )}
            </motion.div>

            <motion.button
              key="result-btn"
              className="vehicle-loading-btn primary fixed"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5 }}
              onClick={async () => {
                if (isValid) {
                  console.log("➡️ Avvio lato passeggero");

                  window.dispatchEvent(new CustomEvent("hide-slot-overlay"));
                  slotManager.reset();

                  const scene = (window as any)._BABYLON_SCENE;
                  if (!scene) {
                    console.warn("⚠️ Scene Babylon non disponibile.");
                    return;
                  }

                  vehicleLoadingManager.setState("rightSideLoading");

                  setUiStage("none");
                } else {
                  console.log("🔁 Riprova completa: reset + animazioni + ritorno a stato iniziale");

                  window.dispatchEvent(new CustomEvent("hide-slot-overlay"));
                  slotManager.reset();

                  const { animateBagsExit } = await import("../animateBagsExit");
                  const { animateCartsExit } = await import("../animateCartsExit");
                  const { runTruckTransform } = await import("../vehicleLoadingTransform");
                  const { vehicleLoadingManager } = await import("../vehicleLoadingManager");

                  await animateBagsExit();
                  await animateCartsExit();

                  await runTruckTransform("start");

                  vehicleLoadingManager.setState("startLoading");
                  setUiStage("start");
                }
              }}
            >
              {buttonText}
            </motion.button>
          </>
        )}

        {uiStage === "rightResults" && (
          <>
            <motion.div
              key="right-result-box"
              className="vehicle-loading-textbox"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5 }}
            >
              {isValid ? (
                "Excellent! All extra bags are in the correct position. Well done."
              ) : (
                <>
                  Some extra bags are not placed correctly. You have{" "}
                  <span className="validation-error-count">
                    {errorCount} error{errorCount !== 1 ? "s" : ""}
                  </span>
                  . Heavy boxes must go in the lower slot, and oversized ones in the upper slot.
                </>
              )}
            </motion.div>

            <motion.button
              key="right-result-btn"
              className="vehicle-loading-btn primary fixed"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5 }}
              onClick={async () => {
                if (isValid) {
                  console.log("✅ Validazione extra bag riuscita: esperienza conclusa.");
                  // Potresti far partire animazione di chiusura o avanzamento
                } else {
                  console.log("🔁 Riprova caricamento extra");
                  window.dispatchEvent(new CustomEvent("hide-slot-overlay"));
                  slotManager.reset();

                  const { animateBagsExit } = await import("../animateBagsExit");
                  const { animateCartsExit } = await import("../animateCartsExit");
                  const { runTruckTransform } = await import("../vehicleLoadingTransform");
                  const { vehicleLoadingManager } = await import("../vehicleLoadingManager");

                  await animateBagsExit();
                  await animateCartsExit();
                  await runTruckTransform("start");

                  vehicleLoadingManager.setState("startLoading");
                  setUiStage("start");
                }
              }}
            >
              {isValid ? "Finish Loading" : "Try Again?"}
            </motion.button>
          </>
        )}

      </AnimatePresence>
    </div>
  );
}
