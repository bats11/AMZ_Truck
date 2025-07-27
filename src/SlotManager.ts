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

  /**
   * Imposta quale bag è attualmente in fase di staging
   */
  public setActiveBag(bag: BagEntity) {
    this.currentBag = bag;
    console.log(`📥 Bag attiva impostata: ${bag.id}`);
  }

  /**
   * Assegna la bag attiva a uno slot, se disponibile, con animazione
   */
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

    // ✅ 1. Calcola la posizione globale attuale della bag
    const worldPos = bag.root.getAbsolutePosition();

    // ✅ 2. Imposta il truck come nuovo parent
    bag.root.setParent(modelRoot);

    // ✅ 3. Calcola la posizione locale corrispondente per mantenere la posizione visiva
    const localPos = BABYLON.Vector3.TransformCoordinates(worldPos, modelRoot.getWorldMatrix().invert());
    bag.root.position.copyFrom(localPos);

    // ✅ 4. Calcola la destinazione finale (slot)
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
    console.log("🔁 SlotManager resettato.");
  }
}

export const slotManager = new SlotManager();
