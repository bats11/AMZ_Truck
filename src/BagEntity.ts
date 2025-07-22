// src/BagEntity.ts
import * as BABYLON from "@babylonjs/core";

interface BagOptions {
  prefab: BABYLON.AbstractMesh;
  id: string;
  position: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  shadowGen?: BABYLON.ShadowGenerator;
}

export class BagEntity {
  public readonly id: string;
  public readonly mesh: BABYLON.AbstractMesh;
  public isLoaded: boolean = false;

  constructor(options: BagOptions) {
    const {
      prefab,
      id,
      position,
      rotation = new BABYLON.Vector3(0, 0, 0),
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
  }

  moveTo(position: BABYLON.Vector3, rotation?: BABYLON.Vector3) {
    this.mesh.position.copyFrom(position);
    if (rotation) this.mesh.rotation.copyFrom(rotation);
  }
}
