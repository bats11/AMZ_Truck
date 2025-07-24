// src/CartEntity.ts
import * as BABYLON from "@babylonjs/core";
import { BagEntity } from "./BagEntity";

interface CartOptions {
  prefabs: BABYLON.AbstractMesh[]; // ✅ ora è un array di mesh
  id: string;
  position: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  maxPackages?: number;
  shadowGen?: BABYLON.ShadowGenerator;
}

export class CartEntity {
  public readonly id: string;
  public readonly root: BABYLON.TransformNode;
  public readonly maxPackages: number;

  private loadedBags: BagEntity[] = [];

  constructor(options: CartOptions) {
    const {
      prefabs,
      id,
      position,
      rotation = BABYLON.Vector3.Zero(),
      maxPackages = 9,
      shadowGen,
    } = options;

    const scene = prefabs[0].getScene();

    // 🧱 Wrapper principale
    const wrapper = new BABYLON.TransformNode(`CartWrapper_${id}`, scene);
    wrapper.position = position.clone();
    wrapper.rotation = rotation.clone();

    for (const mesh of prefabs) {
      const clone = mesh.clone(`${id}_${mesh.name}`, null);
      if (!clone) continue;

      clone.setEnabled(true);
      clone.parent = wrapper;
      clone.position = BABYLON.Vector3.Zero();
      clone.rotation = BABYLON.Vector3.Zero();
      clone.scaling = new BABYLON.Vector3(1, 1, 1);

      if (shadowGen) shadowGen.addShadowCaster(clone, true);
    }

    this.id = id;
    this.root = wrapper;
    this.maxPackages = maxPackages;
  }

  public addBag(bag: BagEntity): boolean {
    if (this.loadedBags.length >= this.maxPackages) return false;
    this.loadedBags.push(bag);
    return true;
  }

  public isFull(): boolean {
    return this.loadedBags.length >= this.maxPackages;
  }

  public getLoadedBags(): BagEntity[] {
    return this.loadedBags;
  }

  public moveTo(position: BABYLON.Vector3, rotation?: BABYLON.Vector3) {
    this.root.position.copyFrom(position);
    if (rotation) this.root.rotation.copyFrom(rotation);
  }
}
