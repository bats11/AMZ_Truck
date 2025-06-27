// src/setupBackground.ts
import * as BABYLON from "@babylonjs/core";
import { ShadowOnlyMaterial } from "@babylonjs/materials/shadowOnly/shadowOnlyMaterial";

/**
 * Crea un piano invisibile che riceve solo ombre (shadow catcher).
 */
export function setupBackground(scene: BABYLON.Scene): BABYLON.Mesh {
  const groundSize = 30;

  const ground = BABYLON.MeshBuilder.CreateGround("groundPlane", {
    width: groundSize,
    height: groundSize,
  }, scene);

  // ✅ ShadowOnlyMaterial corretto
  const shadowOnlyMat = new ShadowOnlyMaterial("shadowOnlyMat", scene);
  shadowOnlyMat.alpha = 0.2; // invisibile
  shadowOnlyMat.shadowColor = new BABYLON.Color3(0, 0, 0);

  ground.material = shadowOnlyMat;
  ground.receiveShadows = true;

  // 🔧 Trasformazioni
  ground.position = new BABYLON.Vector3(0, 0, 3);
  ground.rotation = new BABYLON.Vector3(
    BABYLON.Tools.ToRadians(-90),
    0,
    0
  );
  ground.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

  return ground;
}
