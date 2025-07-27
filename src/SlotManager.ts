// src/SlotManager.ts
import { BagEntity } from "./BagEntity";
import { handleInterpolatedTransform } from "./transformHandlers";
import { SLOT_POSITIONS_LEFT } from "./slotPositions";
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

    // ✅ Calcola la posizione target dello slot
    const targetPos = SLOT_POSITIONS_LEFT[slotIndex];
    const transform = {
      position: targetPos,
      rotation: bag.root.rotation.clone(),
      scaling: bag.root.scaling.clone(),
      durationPosRot: 1.5,
      durationScale: 0,
    };

    // ✅ Esegui animazione
    const scene = bag.root.getScene();
    await handleInterpolatedTransform(bag.root, scene, transform);

    console.log(`✅ Bag ${bag.id} animata verso slot ${slotIndex}`);
  }

  /**
   * Verifica se tutti gli slot sono pieni
   */
  public isFull(): boolean {
    return this.slotMap.size >= this.slotCapacity;
  }

  /**
   * Verifica se uno slot è libero
   */
  public isSlotAvailable(slotIndex: number): boolean {
    return !this.slotMap.has(slotIndex);
  }

  /**
   * Ritorna la bag assegnata a uno slot, se presente
   */
  public getBagInSlot(slotIndex: number): BagEntity | undefined {
    return this.slotMap.get(slotIndex);
  }

  /**
   * Ritorna tutte le assegnazioni attuali
   */
  public getAssignments(): Map<number, BagEntity> {
    return new Map(this.slotMap);
  }

  /**
   * Registra l’ordine corretto delle bag (bag iterata → slot i)
   */
  public registerCorrectBag(bag: BagEntity) {
    this.correctBagOrder.push(bag);
    console.log(`🎯 Ordine corretto: slot ${this.correctBagOrder.length - 1} → ${bag.id}`);
  }

  /**
   * Ritorna l’ordine corretto delle bag
   */
  public getCorrectBagOrder(): BagEntity[] {
    return [...this.correctBagOrder];
  }

  /**
   * Resetta tutto lo stato interno
   */
  public reset() {
    this.slotMap.clear();
    this.currentBag = null;
    this.correctBagOrder = [];
    console.log("🔁 SlotManager resettato.");
  }
}

export const slotManager = new SlotManager();
