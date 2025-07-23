// src/BagEntity.ts
import * as BABYLON from "@babylonjs/core";

interface BagOptions {
  prefab: BABYLON.AbstractMesh;
  id: string;
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  parent?: BABYLON.TransformNode;
  shadowGen?: BABYLON.ShadowGenerator;
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
    } = options;

    const scene = prefab.getScene();

    // 🧱 Wrapper root node per la bag
    const wrapper = new BABYLON.TransformNode(`BagWrapper_${id}`, scene);
    wrapper.position = position.clone();
    wrapper.rotation = rotation.clone();

    if (parent) {
      wrapper.parent = parent;
    }

    const clone = prefab.clone(id, null);
    if (!clone) throw new Error(`❌ Impossibile clonare prefab per ${id}`);

    clone.setEnabled(true);
    clone.position = BABYLON.Vector3.Zero();
    clone.rotation = BABYLON.Vector3.Zero();
    clone.scaling = new BABYLON.Vector3(1, 1, 1);
    clone.parent = wrapper;

    if (shadowGen) shadowGen.addShadowCaster(clone, true);

    this.id = id;
    this.root = wrapper;
  }

  moveTo(position: BABYLON.Vector3, rotation?: BABYLON.Vector3) {
    this.root.position.copyFrom(position);
    if (rotation) this.root.rotation.copyFrom(rotation);
  }
}
