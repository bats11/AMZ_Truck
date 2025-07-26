// src/vehicleLoadingTransform.ts
import * as BABYLON from "@babylonjs/core";
import { handleInterpolatedTransform } from "./transformHandlers";
import { getModelRoot } from "./MoveComponent";
import { vehicleLoadingManager } from "./vehicleLoadingManager";
import { CartEntity } from "./CartEntity";
import { createAnimation } from "./utils";

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

export async function animateToLeftLoading() {
  const modelRoot = getModelRoot();
  if (!modelRoot || !activeCamera) return;

  const scene = modelRoot.getScene();

  const target = {
    position: new BABYLON.Vector3(0, 1, 0),
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

// ✅ NUOVA FUNZIONE: animazione carrelli da destra
export async function animateCartsIn(carts: CartEntity[], scene: BABYLON.Scene) {
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

  const promises = carts.map((cart) => {
    const node = cart.root;
    const finalPos = node.position.clone();
    const startPos = finalPos.add(new BABYLON.Vector3(5, 0, 0)); // fuori schermo a destra

    node.position.copyFrom(startPos);

    const anim = createAnimation("position", startPos, finalPos, 0, 60, easing);

    return new Promise<void>((resolve) => {
      scene.beginDirectAnimation(node, [anim], 0, 60, false, 1, () => resolve());
    });
  });

  await Promise.all(promises);
}
