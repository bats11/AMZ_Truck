// src/vehicleLoadingTransform.ts
import * as BABYLON from "@babylonjs/core";
import { handleInterpolatedTransform } from "./transformHandlers";
import { getModelRoot } from "./MoveComponent";
import { vehicleLoadingManager } from "./vehicleLoadingManager";
import { CartEntity } from "./CartEntity";
import { createAnimation, vec3DegToRad } from "./utils";

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
    rotation: vec3DegToRad([0, 270, 5]),
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
    rotation: vec3DegToRad([0, 0, 0]),
    scaling: new BABYLON.Vector3(1, 1, 1),
    durationScale: 1.8,
    durationPosRot: 2.5,
  };

  await handleInterpolatedTransform(modelRoot, scene, target, activeCamera);
}

export async function runInitialCargoEntry() {
  console.log("🎬 Placeholder: funzione eseguita solo al primo ingresso.");
}

export async function animateCartsIn(carts: CartEntity[], scene: BABYLON.Scene) {
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

  const promises = carts.map((cart) => {
    const node = cart.root;
    const finalPos = node.position.clone();
    const startPos = finalPos.add(new BABYLON.Vector3(5, 0, 0));

    node.position.copyFrom(startPos);

    const anim = createAnimation("position", startPos, finalPos, 0, 60, easing);

    return new Promise<void>((resolve) => {
      scene.beginDirectAnimation(node, [anim], 0, 60, false, 1, () => resolve());
    });
  });

  await Promise.all(promises);
}

export async function liftTruckAfterCartArrival() {
  const modelRoot = getModelRoot();
  if (!modelRoot || !activeCamera) return;

  const scene = modelRoot.getScene();

  const target = {
    position: new BABYLON.Vector3(0, 3, 0),
    rotation: vec3DegToRad([-5, 0, 0]),
    scaling: new BABYLON.Vector3(1, 1, 1),
    durationPosRot: 2,
    durationScale: 0,
  };

  await handleInterpolatedTransform(modelRoot, scene, target, activeCamera);
  console.log("⬆️ Truck spostato con transform fisso (Y + rotazione).");
}

// ✅ Nuova funzione adattiva per nascondere lato opposto
export async function hideTruckSideMeshes(
  side: "left" | "right",
  scene: BABYLON.Scene
) {
  const modelRoot = getModelRoot();
  if (!modelRoot) return;

  const targetSuffix = side === "left" ? "_right" : "_left";

  const meshesToHide = modelRoot.getChildMeshes(false).filter((mesh) =>
    mesh.name.toLowerCase().includes(targetSuffix)
  );

  if (meshesToHide.length === 0) {
    console.warn(`⚠️ Nessuna mesh trovata con suffisso ${targetSuffix}`);
    return;
  }

  const easing = new BABYLON.QuadraticEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const frameStart = 0;
  const frameEnd = 120; // ⏱ aumentato per visibilità più fluida

  const promises = meshesToHide.map((mesh) => {
    const anim = new BABYLON.Animation(
      `${mesh.name}_visibility`,
      "visibility",
      60,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    anim.setKeys([
      { frame: frameStart, value: 1 },
      { frame: frameEnd, value: 0 },
    ]);
    anim.setEasingFunction(easing);

    return new Promise<void>((resolve) => {
      scene.beginDirectAnimation(mesh, [anim], frameStart, frameEnd, false, 1, () => {
        mesh.visibility = 0;
        resolve();
      });
    });
  });

  await Promise.all(promises);
  console.log(`🎭 Mesh del lato opposto a "${side}" nascoste con dissolvenza.`);
}
