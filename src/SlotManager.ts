// src/SlotManager.ts
import * as BABYLON from "@babylonjs/core";
import { BagEntity } from "./BagEntity";

export type SlotSide = "left" | "right";

interface SlotData {
  index: number;
  position: BABYLON.Vector3;
  assignedBagId: string | null;
}

export class SlotManager {
  private slots: SlotData[] = [];

  constructor() {
    // Vuoto: creazione a parte
  }

  /**
   * Crea gli slot per un determinato lato (es. sinistro o destro)
   * @param count numero di slot (es. 12 per lato)
   * @param side "left" o "right"
   */
  createSlots(count: number, side: SlotSide) {
    this.slots = [];

    for (let i = 0; i < count; i++) {
      const pos = this.computePositionForSlot(i, side);
      this.slots.push({
        index: i,
        position: pos,
        assignedBagId: null,
      });
    }

    console.log(`🧩 ${count} slot creati per il lato "${side}"`);
  }

  assignBagToSlot(slotIndex: number, bag: BagEntity) {
    const slot = this.slots[slotIndex];
    if (slot) {
      slot.assignedBagId = bag.id;
    }
  }

  clearAssignments() {
    for (const slot of this.slots) {
      slot.assignedBagId = null;
    }
  }

  getSlots(): SlotData[] {
    return this.slots;
  }

  getSlotByIndex(index: number): SlotData | undefined {
    return this.slots[index];
  }

  getAssignedBagId(index: number): string | null {
    return this.slots[index]?.assignedBagId ?? null;
  }

  getSlotTargetPosition(index: number): BABYLON.Vector3 {
    return this.slots[index]?.position.clone() ?? BABYLON.Vector3.Zero();
  }

  /**
   * Calcola la posizione 3D target per uno slot dato l'indice e il lato
   */
  private computePositionForSlot(index: number, side: SlotSide): BABYLON.Vector3 {
    // Layout a 6 colonne x 2 righe
    const cols = 6;
    const col = index % cols;
    const row = Math.floor(index / cols);

    const x = (col - (cols - 1) / 2) * 0.5; // centrato
    const y = row * 0.6 + 0.4;
    const z = side === "left" ? -0.5 : 0.5; // profondo nel truck

    return new BABYLON.Vector3(x, y, z);
  }
}
