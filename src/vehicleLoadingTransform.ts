// src/vehicleLoadingTransform.ts
import * as BABYLON from "@babylonjs/core";
import { handleInterpolatedTransform } from "./transformHandlers";
import { getModelRoot } from "./MoveComponent"; // Solo per accedere al nodo, non logica
import { getTransformSetting } from "./transformSettings";

let activeCamera: BABYLON.FreeCamera | null = null;

export function setVehicleCamera(camera: BABYLON.FreeCamera) {
  activeCamera = camera;
}

export async function animateToStartLoading() {
  const modelRoot = getModelRoot();
  if (!modelRoot || !activeCamera) return;

  const scene = modelRoot.getScene();

  // Potresti spostare questi valori anche in transformSettings.ts se vuoi configurarli
  const target = {
    position: new BABYLON.Vector3(0, 2.2, 0),
    rotation: new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(270), BABYLON.Tools.ToRadians(5)),
    scaling: new BABYLON.Vector3(1.9, 1.9, 1.9),
    durationScale: 3.0,
    durationPosRot: 1.5,
  };

  await handleInterpolatedTransform(modelRoot, scene, target, activeCamera);
}
