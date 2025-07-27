// src/SlotManager.ts
import { BagEntity } from "./BagEntity";
import { handleInterpolatedTransform } from "./transformHandlers";
import { SLOT_POSITIONS_LEFT } from "./slotPositions";
import { getModelRoot } from "./MoveComponent";
import * as BABYLON from "@babylonjs/core";

class SlotManager {
  private slotMap: Map<number, BagEntity> = new Map();
  private currentBag: BagEntity | null = null;
  private slotCapacity: number = 12;
  private correctBagOrder: BagEntity[] = [];
  private slotAssignedResolver: (() => void) | null = null; // ✅ nuovo

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

    const targetPos = SLOT_POSITIONS_LEFT[slotIndex];
    const transform = {
      position: targetPos,
      rotation: bag.root.rotation.clone(),
      scaling: bag.root.scaling.clone(),
      durationPosRot: 1.5,
      durationScale: 0,
    };

    const scene = bag.root.getScene();
    await handleInterpolatedTransform(bag.root, scene, transform);

    console.log(`✅ Bag ${bag.id} assegnata e animata verso slot ${slotIndex}`);

    // ✅ risolve la promise in attesa
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

  public reset() {
    this.slotMap.clear();
    this.currentBag = null;
    this.correctBagOrder = [];
    this.slotAssignedResolver = null;
    console.log("🔁 SlotManager resettato.");
  }
}

export const slotManager = new SlotManager();
