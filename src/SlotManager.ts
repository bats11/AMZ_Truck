// src/SlotManager.ts
import { BagEntity } from "./BagEntity";
import { handleInterpolatedTransform } from "./transformHandlers";
import { BAG_SLOT_TRANSFORMS_LEFT } from "./slotPositions"; // 🔄 importa slot con rotazione
import { getModelRoot } from "./MoveComponent";
import * as BABYLON from "@babylonjs/core";

class SlotManager {
  private slotMap: Map<number, BagEntity> = new Map();
  private currentBag: BagEntity | null = null;
  private slotCapacity: number = 12;
  private correctBagOrder: BagEntity[] = [];
  private slotAssignedResolver: (() => void) | null = null;

  public setActiveBag(bag: BagEntity) {
    this.currentBag = bag;
    console.log(`📥 Bag attiva impostata: ${bag.id}`);
  }

  public async assignToSlot(slotIndex: number) {
    if (!this.currentBag) {
      console.warn("⛔ Nessuna bag attiva da assegnare.");
      return;
    }

    if (this.slotMap.has(slotIndex)) {
      console.warn(`⛔ Slot ${slotIndex} è già occupato.`);
      return;
    }

    const bag = this.currentBag;
    this.slotMap.set(slotIndex, bag);
    this.currentBag = null;

    const modelRoot = getModelRoot();
    if (!modelRoot) {
      console.warn("⛔ ModelRoot (truck) non trovato.");
      return;
    }

    const worldPos = bag.root.getAbsolutePosition();
    bag.root.setParent(modelRoot);
    const localPos = BABYLON.Vector3.TransformCoordinates(worldPos, modelRoot.getWorldMatrix().invert());
    bag.root.position.copyFrom(localPos);

    const slotTransform = BAG_SLOT_TRANSFORMS_LEFT[slotIndex]; // 🔄 usa posizione + rotazione

    const transform = {
      position: slotTransform.position,
      rotation: slotTransform.rotation, // ✅ nuova rotazione usata
      scaling: bag.root.scaling.clone(),
      durationPosRot: 1,
      durationScale: 0,
    };

    const scene = bag.root.getScene();
    await handleInterpolatedTransform(bag.root, scene, transform);

    console.log(`✅ Bag ${bag.id} assegnata e animata verso slot ${slotIndex}`);

    if (this.slotAssignedResolver) {
      this.slotAssignedResolver();
      this.slotAssignedResolver = null;
    }
  }

  public async waitForAssignment(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.slotAssignedResolver = resolve;
    });
  }

  public isFull(): boolean {
    return this.slotMap.size >= this.slotCapacity;
  }

  public isSlotAvailable(slotIndex: number): boolean {
    return !this.slotMap.has(slotIndex);
  }

  public getBagInSlot(slotIndex: number): BagEntity | undefined {
    return this.slotMap.get(slotIndex);
  }

  public getAssignments(): Map<number, BagEntity> {
    return new Map(this.slotMap);
  }

  public registerCorrectBag(bag: BagEntity) {
    this.correctBagOrder.push(bag);
    console.log(`🎯 Ordine corretto: slot ${this.correctBagOrder.length - 1} → ${bag.id}`);
  }

  public getCorrectBagOrder(): BagEntity[] {
    return [...this.correctBagOrder];
  }

  public validate(): { isValid: boolean; errors: { slot: number; expected: string; actual: string }[] } {
    const errors: { slot: number; expected: string; actual: string }[] = [];

    for (let i = 0; i < this.correctBagOrder.length; i++) {
      const expectedBag = this.correctBagOrder[i];
      const actualBag = this.slotMap.get(i);

      if (!actualBag || actualBag.id !== expectedBag.id) {
        errors.push({
          slot: i,
          expected: expectedBag.id,
          actual: actualBag?.id ?? "vuoto",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public reset() {
    this.slotMap.clear();
    this.currentBag = null;
    this.correctBagOrder = [];
    this.slotAssignedResolver = null;
    console.log("🔁 SlotManager resettato.");
  }
}

export const slotManager = new SlotManager();
