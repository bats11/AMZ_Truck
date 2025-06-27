// src/setupLighting.ts
import * as BABYLON from "@babylonjs/core";

export function setupLighting(scene: BABYLON.Scene): BABYLON.CascadedShadowGenerator {
  const directionalLight = new BABYLON.DirectionalLight(
    "mainDirectionalLight",
    new BABYLON.Vector3(-0.35, -0.3, 0.6).normalize(),
    scene
  );
  directionalLight.intensity = 3;
  directionalLight.diffuse = new BABYLON.Color3(1, 1, 1);
  directionalLight.specular = new BABYLON.Color3(1, 1, 1);
  directionalLight.shadowEnabled = true;

  const csm = new BABYLON.CascadedShadowGenerator(2048, directionalLight);
  csm.numCascades = 4;
  csm.stabilizeCascades = true;
  csm.lambda = 0.95;
  csm.shadowMaxZ = 30;
  csm.depthClamp = true;
  csm.bias = 0.0005;
  csm.normalBias = 0.02;

  const hdrTexture = new BABYLON.HDRCubeTexture(
    "/assets/studio_small_08_4k.hdr",
    scene,
    512,
    false,
    true,
    false,
    true
  );

  hdrTexture.onLoadObservable.addOnce(() => {
    console.log("HDR environment texture caricata.");
  });

  scene.environmentTexture = hdrTexture;
  scene.environmentIntensity = 0.3;
  scene.clearColor = BABYLON.Color4.FromHexString("#00000000");

  return csm;
}
