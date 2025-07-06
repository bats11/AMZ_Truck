import * as BABYLON from "@babylonjs/core";

export class MaterialManager {
  private scene: BABYLON.Scene;
  private baseUrl: string;

  constructor(scene: BABYLON.Scene, baseUrl: string = "") {
    this.scene = scene;
    this.baseUrl = baseUrl;
  }

  public configureGlassMaterial(): void {
    const mat = this.scene.materials.find((m) => m.name === "M_Car_Glass_01a");
    if (!(mat instanceof BABYLON.PBRMaterial)) return;

    mat.alpha = 0;
    mat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
    mat.alphaMode = BABYLON.Constants.ALPHA_COMBINE;
    mat.roughness = 0.1;
    mat.metallic = 0.2;
    mat.indexOfRefraction = 1.5;
    mat.subSurface.isTranslucencyEnabled = true;
    mat.subSurface.translucencyIntensity = 0.9;

    console.log("✔️ Glass material configured.");
  }

  public setMaterialVisibility(materialNames: string[], visible: boolean): void {
    for (const name of materialNames) {
      const mat = this.scene.materials.find((m) => m.name === name);
      if (mat) {
        mat.alpha = visible ? 1 : 0;
      }
    }
  }
}
