// src/CartEntity.ts
import * as BABYLON from "@babylonjs/core";
import { BagEntity } from "./BagEntity"; // ✅ nuova importazione

interface CartOptions {
  prefab: BABYLON.AbstractMesh;
  id: string;
  position: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  maxPackages?: number;
  shadowGen?: BABYLON.ShadowGenerator;
}

export class CartEntity {
  public readonly id: string;
  public readonly mesh: BABYLON.AbstractMesh;
  public readonly maxPackages: number;

  private loadedBags: BagEntity[] = []; // ✅ nuova proprietà

  constructor(options: CartOptions) {
    const {
      prefab,
      id,
      position,
      rotation = new BABYLON.Vector3(0, 0, 0),
      maxPackages = 9, // ✅ default aggiornato a 9
      shadowGen,
    } = options;

    const clone = prefab.clone(id, null);
    if (!clone) throw new Error(`❌ Impossibile clonare prefab per ${id}`);

    clone.setEnabled(true);
    clone.position = position.clone();
    clone.rotation = rotation.clone();

    if (shadowGen) shadowGen.addShadowCaster(clone, true);

    this.id = id;
    this.mesh = clone;
    this.maxPackages = maxPackages;
  }

  // ✅ Aggiunge una bag se c'è spazio
  public addBag(bag: BagEntity): boolean {
    if (this.loadedBags.length >= this.maxPackages) return false;
    this.loadedBags.push(bag);
    return true;
  }

  // ✅ Utile per controlli esterni
  public isFull(): boolean {
    return this.loadedBags.length >= this.maxPackages;
  }

  // 🧪 Opzionale: ottenere tutte le bag caricate
  public getLoadedBags(): BagEntity[] {
    return this.loadedBags;
  }

  moveTo(position: BABYLON.Vector3, rotation?: BABYLON.Vector3) {
    this.mesh.position.copyFrom(position);
    if (rotation) this.mesh.rotation.copyFrom(rotation);
  }
}
