// src/setupLighting.ts
import * as BABYLON from "@babylonjs/core";

/**
 * Imposta Directional Light + HDR e restituisce un CascadedShadowGenerator.
 */
export function setupLighting(scene: BABYLON.Scene): BABYLON.CascadedShadowGenerator {
  // === Directional Light === //
  const directionalLight = new BABYLON.DirectionalLight(
    "mainDirectionalLight",
    new BABYLON.Vector3(0.3, -0.8, 1.8).normalize(),
    scene
  );
  directionalLight.intensity = 4;
  directionalLight.diffuse = new BABYLON.Color3(1, 1, 1);
  directionalLight.specular = new BABYLON.Color3(1, 1, 1);
  directionalLight.shadowEnabled = true;

  // === Cascaded Shadow Generator === //
  const csm = new BABYLON.CascadedShadowGenerator(2048, directionalLight);
  csm.numCascades = 4;
  csm.stabilizeCascades = true;
  csm.lambda = 0.95; // equilibrio tra dettaglio vicino/lontano
  csm.shadowMaxZ = 100;

  csm.depthClamp = true;
  csm.bias = 0.0002;
  csm.normalBias = 0.01;

  // === HDR Environment Texture === //
  const hdrTexture = new BABYLON.HDRCubeTexture(
    "/assets/studio_small_08_4k.hdr",
    scene,
    1024,
    false,
    true,
    false,
    true
  );

  hdrTexture.onLoadObservable.addOnce(() => {
    console.log("HDR environment texture caricata.");
  });

  scene.environmentTexture = hdrTexture;
  scene.environmentIntensity = 0.5;

  scene.clearColor = BABYLON.Color4.FromHexString("#00000000");

  return csm;
}
