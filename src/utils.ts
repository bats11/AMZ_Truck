import * as BABYLON from "@babylonjs/core";

export interface TransformOptions {
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  scaling?: BABYLON.Vector3;
}

export function createAnimation<T>(
  property: string,
  from: T,
  to: T,
  frameStart: number,
  frameEnd: number,
  easing: BABYLON.EasingFunction
): BABYLON.Animation {
  const animation = new BABYLON.Animation(
    property + "Anim",
    property,
    60,
    typeof from === "number"
      ? BABYLON.Animation.ANIMATIONTYPE_FLOAT
      : BABYLON.Animation.ANIMATIONTYPE_VECTOR3
  );

  animation.setKeys([
    { frame: frameStart, value: from },
    { frame: frameEnd, value: to },
  ]);
  animation.setEasingFunction(easing);
  return animation;
}

function createQuaternionAnimation(
  from: BABYLON.Quaternion,
  to: BABYLON.Quaternion,
  frameStart: number,
  frameEnd: number,
  easing: BABYLON.EasingFunction
): BABYLON.Animation {
  const animation = new BABYLON.Animation(
    "rotationQuaternionAnim",
    "rotationQuaternion",
    60,
    BABYLON.Animation.ANIMATIONTYPE_QUATERNION
  );

  animation.setKeys([
    { frame: frameStart, value: from },
    { frame: frameEnd, value: to },
  ]);
  animation.setEasingFunction(easing);
  return animation;
}

export async function animateTransformTo(
  node: BABYLON.TransformNode,
  options: TransformOptions,
  durationOverride?: number
): Promise<void> {
  const frameRate = 60;
  const animations: BABYLON.Animation[] = [];
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
  let maxFrames = 0;

  // --- POSIZIONE ---
  if (options.position) {
    const start = node.position.clone();
    const end = options.position.clone();
    const distance = BABYLON.Vector3.Distance(start, end);
    const duration = durationOverride ?? distance;
    const frames = Math.ceil(duration * frameRate);

    animations.push(createAnimation("position", start, end, 0, frames, easing));
    maxFrames = Math.max(maxFrames, frames);
  }

  // --- ROTAZIONE con quaternion ---
  if (options.rotation) {
    const currentQ =
      node.rotationQuaternion?.clone() ??
      BABYLON.Quaternion.FromEulerVector(node.rotation.clone());

    const targetQ = BABYLON.Quaternion.FromEulerVector(options.rotation.clone());
    const angle = Math.acos(Math.min(Math.max(BABYLON.Quaternion.Dot(currentQ, targetQ), -1), 1)) * 2;

    const duration = durationOverride ?? (BABYLON.Tools.ToDegrees(angle) / 90); // 90°/s
    const frames = Math.ceil(duration * frameRate);

    node.rotationQuaternion = currentQ;
    animations.push(createQuaternionAnimation(currentQ, targetQ, 0, frames, easing));
    maxFrames = Math.max(maxFrames, frames);
  }

  // --- SCALING ---
  if (options.scaling) {
    const start = node.scaling.clone();
    const end = options.scaling.clone();
    const delta = BABYLON.Vector3.Distance(start, end);
    const duration = durationOverride ?? delta;
    const frames = Math.ceil(duration * frameRate);

    animations.push(createAnimation("scaling", start, end, 0, frames, easing));
    maxFrames = Math.max(maxFrames, frames);
  }

  if (animations.length === 0) return;

  return new Promise((resolve) => {
    node.animations = animations;
    node.getScene().beginAnimation(node, 0, maxFrames, false, 1.0, resolve);
  });
}
