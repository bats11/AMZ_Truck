// src/data/slotPositions.ts
import * as BABYLON from "@babylonjs/core";

// 📍 Parametri generali per la griglia
const COLS = 6;
const ROWS = 2;
const STEP_X = 0.5;   // distanza tra colonne
const STEP_Y = 0.55;  // distanza tra righe

// 📍 Origini griglia lato sinistro e destro (modifica se necessario)
const ORIGIN_LEFT = new BABYLON.Vector3(0.67, 0.1727, 0.7554);   // angolo in basso a destra (vista RTL)
const ORIGIN_RIGHT = new BABYLON.Vector3(-1.5, 1, -11); // angolo in basso a sinistra (vista LTR)

// 📦 Funzione generatrice di posizioni slot
function generateSlotPositions(origin: BABYLON.Vector3, isRTL: boolean): BABYLON.Vector3[] {
  const positions: BABYLON.Vector3[] = [];

  for (let i = 0; i < COLS * ROWS; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);

    const x = origin.x + (isRTL ? -col * STEP_X : col * STEP_X);
    const y = origin.y + row * STEP_Y;
    const z = origin.z;

    positions.push(new BABYLON.Vector3(x, y, z));
  }

  return positions;
}

// ✅ Slot per lato sinistro: ordine RTL (da destra verso sinistra)
export const SLOT_POSITIONS_LEFT = generateSlotPositions(ORIGIN_LEFT, true);

// ✅ Slot per lato destro: ordine LTR (da sinistra verso destra)
export const SLOT_POSITIONS_RIGHT = generateSlotPositions(ORIGIN_RIGHT, false);
