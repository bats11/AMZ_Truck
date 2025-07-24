// src/vehicleLoadingTransform.ts
import * as BABYLON from "@babylonjs/core";
import { handleInterpolatedTransform } from "./transformHandlers";
import { getModelRoot } from "./MoveComponent";
import { vehicleLoadingManager } from "./vehicleLoadingManager"; // ✅ già presente

let activeCamera: BABYLON.FreeCamera | null = null;

export function setVehicleCamera(camera: BABYLON.FreeCamera) {
  activeCamera = camera;
}

export async function animateToStartLoading() {
  const modelRoot = getModelRoot();
  if (!modelRoot || !activeCamera) return;

  const scene = modelRoot.getScene();

  const target = {
    position: new BABYLON.Vector3(0, 2.2, 0),
    rotation: new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(270), BABYLON.Tools.ToRadians(5)),
    scaling: new BABYLON.Vector3(1, 1, 1),
    durationScale: 3.0,
    durationPosRot: 1.5,
  };

  await handleInterpolatedTransform(modelRoot, scene, target, activeCamera);

  if (vehicleLoadingManager.shouldRunInitialEntry()) {
    await runInitialCargoEntry();
    vehicleLoadingManager.markInitialEntryDone();
  }
}

// ✅ NUOVA FUNZIONE DI ANIMAZIONE
export async function animateToLeftLoading() {
  const modelRoot = getModelRoot();
  if (!modelRoot || !activeCamera) return;

  const scene = modelRoot.getScene();

  const target = {
    position: new BABYLON.Vector3(0, 1, 0), // ✅ leggero offset a sinistra
    rotation: new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(0)),
    scaling: new BABYLON.Vector3(1, 1, 1),
    durationScale: 1.8,
    durationPosRot: 2.5,
  };

  await handleInterpolatedTransform(modelRoot, scene, target, activeCamera);
}

export async function runInitialCargoEntry() {
  console.log("🎬 Placeholder: funzione eseguita solo al primo ingresso.");
}
