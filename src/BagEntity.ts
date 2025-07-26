// src/BagEntity.ts
import * as BABYLON from "@babylonjs/core";

interface BagOptions {
  prefab: BABYLON.AbstractMesh | BABYLON.AbstractMesh[];
  id: string;
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  parent?: BABYLON.TransformNode;
  shadowGen?: BABYLON.ShadowGenerator;
  color?: string;
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

    const sourceMeshes = Array.isArray(prefab) ? prefab : [prefab];
    const scene = sourceMeshes[0].getScene();

    const wrapper = new BABYLON.TransformNode(`BagWrapper_${id}`, scene);

    // ✅ PRIMA il parenting
    if (parent) wrapper.parent = parent;

    // ✅ DOPO il parenting → applicato in spazio LOCALE
    wrapper.position = position.clone();
    wrapper.rotation = rotation.clone();

    for (let i = 0; i < sourceMeshes.length; i++) {
      const source = sourceMeshes[i];
      const clone = source.clone(`${id}_${i}`, null);
      if (!clone) {
        console.warn(`⚠️ Clone fallito per ${source.name}`);
        continue;
      }

      clone.setEnabled(true);
      clone.parent = wrapper;
      clone.position = BABYLON.Vector3.Zero();
      clone.rotation = BABYLON.Vector3.Zero();

      // ✅ Mantieni la scala originale del prefab
      clone.scaling = source.scaling.clone();

      // Applica colore solo se prefab è singolo e materiale è PBR
      if (!Array.isArray(prefab) && color && clone.material && clone.material instanceof BABYLON.PBRMaterial) {
        const clonedMat = clone.material.clone(`${id}_material`) as BABYLON.PBRMaterial;
        clonedMat.albedoColor = BABYLON.Color3.FromHexString(color);
        clone.material = clonedMat;
      }

      if (shadowGen) shadowGen.addShadowCaster(clone, true);
    }

    this.id = id;
    this.root = wrapper;
  }

  moveTo(position: BABYLON.Vector3, rotation?: BABYLON.Vector3) {
    this.root.position.copyFrom(position);
    if (rotation) this.root.rotation.copyFrom(rotation);
  }
}
