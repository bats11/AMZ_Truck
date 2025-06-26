// materialManager.ts
import * as BABYLON from "@babylonjs/core";

export interface MaterialAssignment {
  materialName: string;
  textureFileName: string;
  uvChannel?: number;
  lightmapIntensity?: number;
}

export class MaterialManager {
  private scene: BABYLON.Scene;
  private baseUrl: string;

  constructor(scene: BABYLON.Scene, baseUrl: string = "") {
    this.scene = scene;
    this.baseUrl = baseUrl;
  }

  public applyAllLightmaps(): void {
    const assignments: MaterialAssignment[] = [
      // ... (lista assegnamenti)
    ];
    this.applyLightmaps(assignments);
    this.configureGlassMaterial();
  }

  private applyLightmaps(assignments: MaterialAssignment[]): void {
    assignments.forEach(({ materialName, textureFileName, uvChannel = 0, lightmapIntensity = 1 }) => {
      const mat = this.getMaterialByName(materialName);
      if (mat instanceof BABYLON.PBRMaterial) {
        const tex = new BABYLON.Texture(this.baseUrl + textureFileName, this.scene);
        tex.coordinatesIndex = uvChannel;
        tex.level = lightmapIntensity;
        mat.lightmapTexture = tex;
        mat.useLightmapAsShadowmap = true;
      }
    });
  }

  /*public applyGroundUnlit(meshes: BABYLON.AbstractMesh[]): void {
    const mat = new BABYLON.StandardMaterial("GroundUnlit", this.scene);
    mat.disableLighting = true;

    const tex = new BABYLON.Texture(
      this.baseUrl + "T_PlaneUnlit2.jpg",
      this.scene,
      false, false, undefined,
      () => console.log("✅ Ground texture loaded"),
      (msg, e) => console.error("❌ Ground texture error:", msg, e)
    );
    mat.diffuseTexture = tex;
    mat.emissiveTexture = tex;
    mat.emissiveColor = new BABYLON.Color3(1, 1, 1);

    meshes.forEach(m => m.material = mat);
    console.log("✔️ GroundUnlitMaterial with texture applied.");
  }*/

  private configureGlassMaterial(): void {
    const mat = this.getMaterialByName("M_Car_Glass_01a") as BABYLON.PBRMaterial | null;
    if (!mat) return;

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

  private getMaterialByName(name: string): BABYLON.Material | null {
    const mat = this.scene.materials.find(m => m.name === name) || null;
    if (!mat) console.warn(`Material "${name}" not found.`);
    return mat;
  }
}
