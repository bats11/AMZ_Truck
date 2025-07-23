// src/BagEntity.ts
import * as BABYLON from "@babylonjs/core";

interface BagOptions {
  prefab: BABYLON.AbstractMesh;
  id: string;
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  parent?: BABYLON.TransformNode;
  shadowGen?: BABYLON.ShadowGenerator;
  color?: string; // ✅ nuovo campo colore (hex string o css name)
}

export class BagEntity {
  public readonly id: string;
  public readonly root: BABYLON.TransformNode;
  public isLoaded: boolean = false;

  constructor(options: BagOptions) {
    const {
      prefab,
      id,
      position = BABYLON.Vector3.Zero(),
      rotation = BABYLON.Vector3.Zero(),
      parent,
      shadowGen,
      color,
    } = options;

    const scene = prefab.getScene();

    // 🧱 Nodo root wrapper
    const wrapper = new BABYLON.TransformNode(`BagWrapper_${id}`, scene);
    wrapper.position = position.clone();
    wrapper.rotation = rotation.clone();

    if (parent) {
      wrapper.parent = parent;
    }

    // 🧱 Clona mesh prefab
    const clone = prefab.clone(id, null);
    if (!clone) throw new Error(`❌ Impossibile clonare prefab per ${id}`);

    clone.setEnabled(true);
    clone.position = BABYLON.Vector3.Zero();
    clone.rotation = BABYLON.Vector3.Zero();
    clone.scaling = new BABYLON.Vector3(1, 1, 1);
    clone.parent = wrapper;

    // ✅ Applica colore se definito
    if (color && clone.material && clone.material instanceof BABYLON.PBRMaterial) {
  const clonedMat = clone.material.clone(`${id}_material`) as BABYLON.PBRMaterial;
  clonedMat.albedoColor = BABYLON.Color3.FromHexString(color);
  clone.material = clonedMat;
}
    if (shadowGen) shadowGen.addShadowCaster(clone, true);

    this.id = id;
    this.root = wrapper;
  }

  moveTo(position: BABYLON.Vector3, rotation?: BABYLON.Vector3) {
    this.root.position.copyFrom(position);
    if (rotation) this.root.rotation.copyFrom(rotation);
  }
}
