// src/moveComponent.ts
import * as BABYLON from "@babylonjs/core";
import { animateTransformTo } from "./utils";
import { setMoveCameraTo } from "./babylonBridge";
import { transformSettings } from "./transformSettings";

let modelRoot: BABYLON.TransformNode | null = null;

let initialTransform: {
  position: BABYLON.Vector3;
  rotation: BABYLON.Vector3;
  scaling: BABYLON.Vector3;
} | null = null;

export function setupMovementControls(scene: BABYLON.Scene) {
  modelRoot = scene.getTransformNodeByName("ModelRoot");
  if (!modelRoot) return;

  modelRoot.position = new BABYLON.Vector3(0, 4, 0);
  modelRoot.rotation = new BABYLON.Vector3(
    BABYLON.Tools.ToRadians(0),
    BABYLON.Tools.ToRadians(0),
    BABYLON.Tools.ToRadians(0)
  );
  modelRoot.scaling = new BABYLON.Vector3(1.1, 1.1, 1.1);

  initialTransform = {
    position: modelRoot.position.clone(),
    rotation: modelRoot.rotation.clone(),
    scaling: modelRoot.scaling.clone(),
  };

  setMoveCameraTo((label) => {
    if (!modelRoot) return;
    const settings = transformSettings[label];
    if (!settings) return;

    const currentScale = modelRoot.scaling.lengthSquared();
    const targetScale = settings.scaling?.lengthSquared() ?? currentScale;
    const isReducingScale = targetScale < currentScale - 0.001;

    if (isReducingScale && settings.scaling) {
      // 1️⃣ Anima solo lo scaling SENZA toccare modelRoot.animations
      const frameRate = 60;
      const start = modelRoot.scaling.clone();
      const end = settings.scaling.clone();
      const delta = BABYLON.Vector3.Distance(start, end);
      const duration = delta / 1;
      const totalFrames = Math.ceil(duration * frameRate);

      const easing = new BABYLON.CubicEase();
      easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

      const anim = new BABYLON.Animation(
        "scaling",
        "scaling",
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3
      );
      anim.setKeys([
        { frame: 0, value: start },
        { frame: totalFrames, value: end },
      ]);
      anim.setEasingFunction(easing);

      // ✅ usa beginDirectAnimation per evitare conflitti
      scene.beginDirectAnimation(
        modelRoot,
        [anim],
        0,
        totalFrames,
        false,
        1.0,
        () => {
          // 2️⃣ Quando scaling è finito, parte rotation e position
          animateTransformTo(modelRoot!, {
            position: settings.position,
            rotation: settings.rotation,
          });
        }
      );
    } else {
      // ➕ Tutto insieme se non si riduce la scala
      animateTransformTo(modelRoot, settings);
    }
  });
}

export function resetModelTransform() {
  if (!modelRoot || !initialTransform) return;

  animateTransformTo(modelRoot, {
    position: initialTransform.position,
    rotation: initialTransform.rotation,
    scaling: initialTransform.scaling,
  });
}

export function setModelTransform(options: {
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  scaling?: BABYLON.Vector3;
}) {
  if (!modelRoot) return;

  if (options.position) modelRoot.position = options.position;
  if (options.rotation) modelRoot.rotation = options.rotation;
  if (options.scaling) modelRoot.scaling = options.scaling;
}

export function getModelRoot(): BABYLON.TransformNode | null {
  return modelRoot;
}
