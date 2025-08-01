// src/SlotManager.ts
import { BagEntity } from "./BagEntity";
import { handleInterpolatedTransform } from "./transformHandlers";
import {
  BAG_SLOT_TRANSFORMS_LEFT,
  BAG_SLOT_TRANSFORMS_RIGHT,
  EXTRA_SLOT_TRANSFORMS,
} from "./slotPositions";
import { getModelRoot } from "./MoveComponent";
import * as BABYLON from "@babylonjs/core";

class SlotManager {
  private slotMap: Map<number, BagEntity> = new Map();
  private extraSlotMap: Map<8 | 9, BagEntity[]> = new Map();
  private currentBag: BagEntity | null = null;
  private slotCapacity: number = 12;
  private correctBagOrder: BagEntity[] = [];
  private slotAssignedResolver: (() => void) | null = null;
  private useRightSide = false;

  private listeners: ((slotIndex: number) => void)[] = [];

  public onSlotAssigned(listener: (slotIndex: number) => void) {
    this.listeners.push(listener);
  }

  private notifySlotAssigned(slotIndex: number) {
    for (const l of this.listeners) l(slotIndex);
  }

  public setRightSide(enabled: boolean) {
    this.useRightSide = enabled;
    console.log(`🔄 SlotManager lato attivo: ${enabled ? "RIGHT" : "LEFT"}`);
  }

  public setActiveBag(bag: BagEntity) {
    this.currentBag = bag;
    console.log(`📥 Bag attiva impostata: ${bag.id}`);
  }

  public async assignToSlot(slotIndex: number) {
    if (!this.currentBag) {
      console.warn("⛔ Nessuna bag attiva da assegnare.");
      return;
    }

    const bag = this.currentBag;
    const isExtraSlot = this.useRightSide && (slotIndex === 8 || slotIndex === 9);

    if (isExtraSlot && !bag.isExtra) {
      console.warn(`⛔ Slot ${slotIndex} è riservato alle bag extra. Assegnazione rifiutata per ${bag.id}.`);
      return;
    }

    if (!isExtraSlot && this.slotMap.has(slotIndex)) {
      console.warn(`⛔ Slot ${slotIndex} è già occupato.`);
      return;
    }

    this.currentBag = null;

    const modelRoot = getModelRoot();
    if (!modelRoot) {
      console.warn("⛔ ModelRoot (truck) non trovato.");
      return;
    }

    const worldPos = bag.root.getAbsolutePosition();
    bag.root.setParent(modelRoot);

    // ✅ FIX SICURO — copia la matrice invece di mutarla
    const inverseWorld = modelRoot.getWorldMatrix().clone();
    inverseWorld.invert();
    const localPos = BABYLON.Vector3.TransformCoordinates(worldPos, inverseWorld);

    bag.root.position.copyFrom(localPos);

    let slotTransform;

    if (isExtraSlot) {
      const index = slotIndex as 8 | 9;
      const list = this.extraSlotMap.get(index) ?? [];
      const slotTransforms = EXTRA_SLOT_TRANSFORMS[index];
      const positionIndex = Math.min(list.length, slotTransforms.length - 1);
      slotTransform = slotTransforms[positionIndex];

      list.push(bag);
      this.extraSlotMap.set(index, list);

      console.log(`📦 Extra bag ${bag.id} assegnata a slot ${slotIndex} → pos ${positionIndex}`);
    } else {
      this.slotMap.set(slotIndex, bag);
      slotTransform = this.useRightSide
        ? BAG_SLOT_TRANSFORMS_RIGHT[slotIndex]
        : BAG_SLOT_TRANSFORMS_LEFT[slotIndex];
    }

    const transform = {
      position: slotTransform.position,
      rotation: slotTransform.rotation,
      scaling: bag.root.scaling.clone(),
      durationPosRot: 1,
      durationScale: 0,
    };

    const scene = bag.root.getScene();
    await handleInterpolatedTransform(bag.root, scene, transform);

    console.log(`✅ Bag ${bag.id} animata verso slot ${slotIndex}`);

    this.notifySlotAssigned(slotIndex);

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
    const isExtraSlot = this.useRightSide && (slotIndex === 8 || slotIndex === 9);
    if (isExtraSlot) return true;
    return !this.slotMap.has(slotIndex);
  }

  public getBagInSlot(slotIndex: number): BagEntity | undefined {
    return this.slotMap.get(slotIndex);
  }

  public getBagsInExtraSlot(slotIndex: 8 | 9): BagEntity[] {
    return this.extraSlotMap.get(slotIndex) ?? [];
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

  public validate(): {
    isValid: boolean;
    errors: { slot: number; expected: string; actual: string }[];
  } {
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

  public validateExtraBags(): {
    isValid: boolean;
    errors: { slot: number; expected: string; actual: string }[];
  } {
    const errors: { slot: number; expected: string; actual: string }[] = [];

    for (const [slotIndex, bags] of this.extraSlotMap.entries()) {
      for (const bag of bags) {
        const expectedType = slotIndex === 8 ? "OverszBox" : "HeavyBox";
        const actualType = bag.extraType;

        if (actualType !== expectedType) {
          errors.push({
            slot: slotIndex,
            expected: expectedType,
            actual: actualType ?? "unknown",
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public reset() {
    this.slotMap.clear();
    this.extraSlotMap.clear();
    this.currentBag = null;
    this.correctBagOrder = [];
    this.slotAssignedResolver = null;
    this.useRightSide = false;
    console.log("🔁 SlotManager resettato.");
  }
}

export const slotManager = new SlotManager();
