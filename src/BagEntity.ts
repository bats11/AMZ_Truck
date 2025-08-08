// src/BagEntity.ts
import * as BABYLON from "@babylonjs/core";
import type { CartEntity } from "./CartEntity"; // ✅ IMPORT necessario per associare la bag al carrello

interface BagOptions {
  prefab: BABYLON.AbstractMesh | BABYLON.AbstractMesh[];
  id: string;
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  parent?: BABYLON.TransformNode;
  shadowGen?: BABYLON.ShadowGenerator;
  color?: string;
  parentCart?: CartEntity;
  localOffset?: BABYLON.Vector3; // ✅ NUOVO
}

function computeLabelUVOffset(index: number): { uOffset: number; vOffset: number } {
  return {
    uOffset: (index % 2) * 0.5,
    vOffset: Math.floor(index / 2) * 0.1,
  };
}

export class BagEntity {
  public readonly id: string;
  public readonly root: BABYLON.TransformNode;
  public readonly isExtra: boolean;
  public readonly extraType: "HeavyBox" | "OverszBox" | null;
  public readonly parentCart: CartEntity | null;
  public readonly localOffset: BABYLON.Vector3; // ✅ NUOVO CAMPO
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
      parentCart = null,
      localOffset = BABYLON.Vector3.Zero(), // ✅ default sicuro
    } = options;

    const sourceMeshes = Array.isArray(prefab) ? prefab : [prefab];
    const scene = sourceMeshes[0].getScene();

    const wrapper = new BABYLON.TransformNode(`BagWrapper_${id}`, scene);
    if (parent) wrapper.parent = parent;
    wrapper.position = position.clone();
    wrapper.rotation = rotation.clone();

    this.parentCart = parentCart;
    this.localOffset = localOffset.clone(); // ✅ salvataggio

    const bagIndex = parseInt(id.split("_")[1]);

    for (let i = 0; i < sourceMeshes.length; i++) {
      const source = sourceMeshes[i];
      const clone = source.clone(`${id}_${i}`, null);
      if (!clone) {
        console.warn(`⚠️ Clone fallito per ${source.name}`);
        continue;
      }

      clone.setEnabled(true);
      clone.parent = wrapper;
      clone.position = source.position.clone();
      clone.rotation = source.rotation.clone();
      clone.scaling = source.scaling.clone();

      // 🎨 Colore personalizzato
      if (
        color &&
        source.name === "AmzBag_BodyColor" &&
        clone.material instanceof BABYLON.PBRMaterial
      ) {
        const originalMat = clone.material as BABYLON.PBRMaterial;
        const newMat = originalMat.clone(`${id}_colorMat`) as BABYLON.PBRMaterial;

        newMat.albedoColor = BABYLON.Color3.FromHexString(color).toLinearSpace();
        newMat.useAlphaFromAlbedoTexture = false;
        newMat.alpha = 1;
        newMat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_OPAQUE;

        clone.material = newMat;
      }

      // 🏷️ Etichetta numerata UV offset
      if (
        source.name === "AmzBag_Label" &&
        clone.material instanceof BABYLON.PBRMaterial
      ) {
        const originalMat = clone.material;
        const newMat = originalMat.clone(`${id}_labelMat`) as BABYLON.PBRMaterial;

        const originalTex = originalMat.albedoTexture;
        if (originalTex) {
          const clonedTex = originalTex.clone() as BABYLON.Texture;
          const { uOffset, vOffset } = computeLabelUVOffset(bagIndex);
          clonedTex.uOffset = uOffset;
          clonedTex.vOffset = vOffset;
          newMat.albedoTexture = clonedTex;
          clone.material = newMat;
        }
      }

      if (shadowGen) shadowGen.addShadowCaster(clone, true);
    }

    this.id = id;
    this.root = wrapper;
    this.isExtra = id.startsWith("ExtraBag_");
    this.extraType = this.isExtra ? (id.split("_")[1] as "HeavyBox" | "OverszBox") : null;

    console.log(`📦 Bag ${id} offset salvato: ${this.localOffset.toString()}`);
  }

  moveTo(position: BABYLON.Vector3, rotation?: BABYLON.Vector3) {
    this.root.position.copyFrom(position);
    if (rotation) this.root.rotation.copyFrom(rotation);
  }
}
