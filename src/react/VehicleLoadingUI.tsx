// src/react/VehicleLoadingUI.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { vehicleLoadingManager } from "../vehicleLoadingManager";
import { runTruckTransform } from "../vehicleLoadingTransform";
import { slotManager } from "../SlotManager";
import ConfettiEffect from "./ConfettiEffect";


type UIStage = "start" | "confirm" | "instructions" | "leftResults" | "rightResults" | "none";

export default function VehicleLoadingUI() {
  const [uiStage, setUiStage] = useState<UIStage>("start");
  const [isBusy, setIsBusy] = useState(false);

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

        // ⬅️ AGGIUNTA QUI
        window.dispatchEvent(new CustomEvent("show-scoreboard"));

        const { LoadTruckController } = await import("../LoadTruckController");
        new LoadTruckController(scene, "left");
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [uiStage]);


  useEffect(() => {
    if (uiStage === "rightResults" && isValid) {
      const scene = (window as any)._BABYLON_SCENE;
      if (!scene) return;

      window.dispatchEvent(new CustomEvent("hide-slot-overlay"));

      const sequence = async () => {
        const { restoreHiddenTruckMeshes, fadeOutMeshByName } = await import("../vehicleLoadingTransform");
        await Promise.all([
          restoreHiddenTruckMeshes(scene),
          fadeOutMeshByName(scene, "SM_Cargo_Bay_cut")
        ]);
        

        const { getModelRoot } = await import("../MoveComponent");
        const modelRoot = getModelRoot();

        if (modelRoot) {
          const truckBags = modelRoot.getChildren().filter((node) =>
            node.name.startsWith("BagWrapper_")
          );

          for (const node of truckBags) {
            node.getChildMeshes(false).forEach((m) => m.dispose());
            node.dispose();
          }

          console.log(`🧹 Bag nel truck eliminate dopo transizione (${truckBags.length})`);
        }
      };

      sequence();
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
          <motion.div
            key="start-ui"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}
          >
            <motion.button
              key="start-btn"
              className="vehicle-loading-btn primary fixed"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              disabled={isBusy}
              onClick={async () => {
                if (isBusy) return;
                setIsBusy(true);

                if (vehicleLoadingManager.shouldRunInitialEntry()) {
                  const { InitialCargoAnimation } = await import("../vehicleLoadingTransform");
                  InitialCargoAnimation();
                  vehicleLoadingManager.markInitialEntryDone();
                }

                vehicleLoadingManager.setState("leftSideLoading");
                setUiStage("none");

                setTimeout(() => {
                  setUiStage("confirm");
                  setIsBusy(false);
                }, 500);
              }}
            >
              Start Loading Vehicle
            </motion.button>

            <motion.button
              key="return-btn"
              className="vehicle-loading-btn secondary fixed"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              disabled={isBusy}
              onClick={async () => {
                if (isBusy) return;
                setIsBusy(true);
                setUiStage("none");

                // ⏳ Aspetta che l’uscita finisca prima di resettare
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent("return-to-menu"));
                  setIsBusy(false);
                }, 600);
              }}
            >
              Return to Activity Menu
            </motion.button>
          </motion.div>
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
              disabled={isBusy}
              onClick={async () => {
                if (isBusy) return;
                setIsBusy(true);

                console.log("📨 Conferma → transizione a 'instructions'");
                const scene = (window as any)._BABYLON_SCENE;
                if (scene) {
                  runTruckTransform("confirm");
                }

                setUiStage("instructions");
                setIsBusy(false);
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
            Tap to select where the first bag should go.
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
              disabled={isBusy}
              onClick={async () => {
                if (isBusy) return;
                setIsBusy(true);

                if (isValid) {
                  window.dispatchEvent(new CustomEvent("hide-slot-overlay"));
                  window.dispatchEvent(new CustomEvent("show-scoreboard")); // ⬅️ attiva il pannello
                  slotManager.reset();

                  const scene = (window as any)._BABYLON_SCENE;
                  if (scene) {
                    vehicleLoadingManager.setState("rightSideLoading");
                  }

                  setUiStage("none");
                  setIsBusy(false);
                } else {
                  window.dispatchEvent(new CustomEvent("hide-slot-overlay"));
                  slotManager.reset();
                  setUiStage("none");

                  const { animateBagsExit } = await import("../animateBagsExit");
                  const { animateCartsExit } = await import("../animateCartsExit");
                  const { runTruckTransform } = await import("../vehicleLoadingTransform");

                  await animateBagsExit();
                  await animateCartsExit();
                  setUiStage("start");
                  setIsBusy(false);
                  await runTruckTransform("start");

                  await vehicleLoadingManager.setState("startLoading");
                  
                }
              }}
            >
              {buttonText}
            </motion.button>
          </>
        )}

        {uiStage === "rightResults" && isValid && <ConfettiEffect />}

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
                "Great job! You loaded both sides perfectly!"
              ) : (
                <>
                  Not quite! You have{" "}
                  <span className="validation-error-count">
                    {errorCount} item{errorCount !== 1 ? "s" : ""}
                  </span>{" "}
                  out of place. Remember, heavy boxes with red stickers should be placed on the floor of the vehicle.
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
              disabled={isBusy}
              onClick={async () => {
                if (isBusy) return;
                setIsBusy(true);

                if (isValid) {
                  slotManager.reset();
                  window.dispatchEvent(new CustomEvent("return-to-menu"));
                } else {
                  //window.dispatchEvent(new CustomEvent("hide-slot-overlay"));
                  slotManager.reset();
                  setUiStage("none");

                  window.dispatchEvent(new CustomEvent("hide-slot-overlay"));

                  const { animateBagsExit } = await import("../animateBagsExit");
                  const { animateCartsExit } = await import("../animateCartsExit");
                  const { runTruckTransform } = await import("../vehicleLoadingTransform");

                  
                  await animateBagsExit();
                  await animateCartsExit();
                  await runTruckTransform("start");

                  vehicleLoadingManager.setState("startLoading");
                  setUiStage("start");
                }

                setIsBusy(false);
              }}
            >
              {isValid ? "Return to Activity Menu" : "Try Again?"}
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
