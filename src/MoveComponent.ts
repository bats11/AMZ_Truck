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
      const frameRate = 60;
      const duration = 1.5;
      const totalFrames = Math.ceil(duration * frameRate);

      const animations: BABYLON.Animation[] = [];

      // === SCALING ===
      const scaleAnim = new BABYLON.Animation(
        "scaleAnim",
        "scaling",
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3
      );
      scaleAnim.setKeys([
        { frame: 0, value: modelRoot.scaling.clone() },
        { frame: totalFrames, value: settings.scaling.clone() },
      ]);
      const scaleEase = new BABYLON.CubicEase();
      scaleEase.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
      scaleAnim.setEasingFunction(scaleEase);
      animations.push(scaleAnim);

      // === POSITION ===
      if (settings.position) {
        const posAnim = new BABYLON.Animation(
          "positionAnim",
          "position",
          frameRate,
          BABYLON.Animation.ANIMATIONTYPE_VECTOR3
        );
        posAnim.setKeys([
          { frame: 0, value: modelRoot.position.clone() },
          { frame: totalFrames, value: settings.position.clone() },
        ]);
        const posEase = new BABYLON.QuarticEase();
        posEase.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
        posAnim.setEasingFunction(posEase);
        animations.push(posAnim);
      }

      // === ROTATION ===
      if (settings.rotation) {
        const rotAnim = new BABYLON.Animation(
          "rotationAnim",
          "rotation",
          frameRate,
          BABYLON.Animation.ANIMATIONTYPE_VECTOR3
        );
        rotAnim.setKeys([
          { frame: 0, value: modelRoot.rotation.clone() },
          { frame: totalFrames, value: settings.rotation.clone() },
        ]);
        const rotEase = new BABYLON.QuarticEase();
        rotEase.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
        rotAnim.setEasingFunction(rotEase);
        animations.push(rotAnim);
      }

      scene.beginDirectAnimation(modelRoot, animations, 0, totalFrames, false, 1.0);
    } else {
      // ➕ Caso standard: trasformazione diretta classica
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
