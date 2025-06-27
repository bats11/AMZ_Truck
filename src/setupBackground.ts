// src/setupBackground.ts
import * as BABYLON from "@babylonjs/core";


/**
 * Crea un piano con un materiale PBR quasi bianco e trasformazioni definite internamente.
 */
export function setupBackground(scene: BABYLON.Scene): BABYLON.Mesh {
  const groundSize = 30;

  const ground = BABYLON.MeshBuilder.CreateGround("groundPlane", {
    width: groundSize,
    height: groundSize,
  }, scene);

  const groundMaterial = new BABYLON.PBRMaterial("groundPBR", scene);
  groundMaterial.albedoColor = new BABYLON.Color3(0.95, 0.95, 0.95); // quasi bianco
  groundMaterial.metallic = 0;
  groundMaterial.roughness = 1; // superficie opaca
  ground.material = groundMaterial;

  ground.receiveShadows = true;

  // 🔧 Trasformazioni definite nel file
  ground.position = new BABYLON.Vector3(0, 0, 3);
  ground.rotation = new BABYLON.Vector3(
    BABYLON.Tools.ToRadians(-90), // attenzione: in radianti!
    0,
    0
  );
  ground.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

  return ground;
}
