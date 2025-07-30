import * as BABYLON from "@babylonjs/core";

export class MaterialManager {
  private scene: BABYLON.Scene;
  private baseUrl: string;

  constructor(scene: BABYLON.Scene, baseUrl: string = "") {
    this.scene = scene;
    this.baseUrl = baseUrl;
  }

  public configureGlassMaterial(): void {
    const mat = this.scene.materials.find(m => m.name === "M_Car_Glass");
    if (!(mat instanceof BABYLON.PBRMaterial)) return;

    mat.alpha = 0.3;
    mat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
    mat.alphaMode = BABYLON.Constants.ALPHA_COMBINE;
    mat.roughness = 0.01;
    mat.metallic = 1;
    mat.indexOfRefraction = 0.52;
    mat.subSurface.isTranslucencyEnabled = true;
    mat.subSurface.translucencyIntensity = 1;
    console.log("✔️ Glass material configured.");
  }

  public prepareMaterialsForVisibility(meshes: BABYLON.AbstractMesh[]): void {
    const updated = new Set<string>();

    for (const mesh of meshes) {
      const mat = mesh.material;

      if (!mat || updated.has(mat.name)) continue;
      if (mat.name === "M_Car_Glass") continue;

      if (mat instanceof BABYLON.PBRMaterial) {
        mat.alpha = 1;
        mat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
        mat.needDepthPrePass = true;
        mat.forceDepthWrite = false;
        mat.backFaceCulling = false;
        updated.add(mat.name);
        console.log(`✅ PBR material prepared: ${mat.name}`);
      } else if (mat instanceof BABYLON.StandardMaterial) {
        mat.alpha = 1;
        mat.backFaceCulling = false;
        updated.add(mat.name);
        console.log(`✅ Standard material prepared: ${mat.name}`);
      } else {
        console.warn(`⚠️ Material not compatible: ${mat.name}`);
      }
    }
  }
}
