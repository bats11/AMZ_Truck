// src/MoveComponent.ts
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

const SMALL_SCALE = new BABYLON.Vector3(1.1, 1.1, 1.1);
const LARGE_SCALE_THRESHOLD = 1.9;

function animateScale(
  target: BABYLON.TransformNode,
  to: BABYLON.Vector3,
  totalFrames: number,
  onEnd?: () => void
) {
  const anim = new BABYLON.Animation(
    "scaleAnim",
    "scaling",
    60,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3
  );
  anim.setKeys([
    { frame: 0, value: target.scaling.clone() },
    { frame: totalFrames, value: to.clone() },
  ]);
  const ease = new BABYLON.CubicEase();
  ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
  anim.setEasingFunction(ease);

  target.getScene().beginDirectAnimation(target, [anim], 0, totalFrames, false, 1.0, onEnd);
}

function animatePositionRotation(
  target: BABYLON.TransformNode,
  settings: { position?: BABYLON.Vector3; rotation?: BABYLON.Vector3 },
  totalFrames: number,
  onEnd?: () => void
) {
  const anims: BABYLON.Animation[] = [];

  if (settings.position) {
    const anim = new BABYLON.Animation(
      "posAnim",
      "position",
      60,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3
    );
    anim.setKeys([
      { frame: 0, value: target.position.clone() },
      { frame: totalFrames, value: settings.position.clone() },
    ]);
    const ease = new BABYLON.QuarticEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
    anim.setEasingFunction(ease);
    anims.push(anim);
  }

  if (settings.rotation) {
    const anim = new BABYLON.Animation(
      "rotAnim",
      "rotation",
      60,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3
    );
    anim.setKeys([
      { frame: 0, value: target.rotation.clone() },
      { frame: totalFrames, value: settings.rotation.clone() },
    ]);
    const ease = new BABYLON.QuarticEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
    anim.setEasingFunction(ease);
    anims.push(anim);
  }

  if (anims.length > 0) {
    target.getScene().beginDirectAnimation(target, anims, 0, totalFrames, false, 1.0, onEnd);
  } else if (onEnd) {
    onEnd();
  }
}

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

    const currentScale = modelRoot.scaling.length();
    const isCurrentlyLarge = currentScale > LARGE_SCALE_THRESHOLD;

    if (isCurrentlyLarge) {
      animateScale(modelRoot, SMALL_SCALE, 30, () => {
        animatePositionRotation(modelRoot!, settings, 45, () => {
          if (settings.scaling) {
            animateScale(modelRoot!, settings.scaling, 30);
          }
        });
      });
    } else {
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
