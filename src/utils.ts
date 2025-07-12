// utils.ts
import * as BABYLON from "@babylonjs/core";

export interface TransformOptions {
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  scaling?: BABYLON.Vector3;
}

export interface DurationOverrides {
  durationPosRot?: number;
  durationScale?: number;
}

const DEFAULT_SCALE_DURATION = 1.0;
const DEFAULT_POSROT_DURATION = 1.5;

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
  durations?: DurationOverrides
): Promise<void> {
  const frameRate = 60;
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const durationScale = durations?.durationScale ?? DEFAULT_SCALE_DURATION;
  const durationPosRot = durations?.durationPosRot ?? DEFAULT_POSROT_DURATION;

  const scaleFrames = Math.ceil(durationScale * frameRate);
  const posRotFrames = Math.ceil(durationPosRot * frameRate);

  const posRotAnims: BABYLON.Animation[] = [];
  const scaleAnims: BABYLON.Animation[] = [];

  // SCALING
  if (options.scaling) {
    const scaleAnim = createAnimation("scaling", node.scaling.clone(), options.scaling.clone(), 0, scaleFrames, easing);
    scaleAnims.push(scaleAnim);
  }

  // POSITION
  if (options.position) {
    const posAnim = createAnimation("position", node.position.clone(), options.position.clone(), 0, posRotFrames, easing);
    posRotAnims.push(posAnim);
  }

  // ROTATION (Quaternion)
  if (options.rotation) {
    const currentQ =
      node.rotationQuaternion?.clone() ??
      BABYLON.Quaternion.FromEulerVector(node.rotation.clone());
    const targetQ = BABYLON.Quaternion.FromEulerVector(options.rotation.clone());

    node.rotationQuaternion = currentQ;
    posRotAnims.push(createQuaternionAnimation(currentQ, targetQ, 0, posRotFrames, easing));
  }

  return new Promise((resolve) => {
    let doneCount = 0;
    const tryResolve = () => {
      doneCount++;
      if (doneCount === 2) resolve();
    };

    if (scaleAnims.length > 0) {
      node.getScene().beginDirectAnimation(node, scaleAnims, 0, scaleFrames, false, 1.0, tryResolve);
    } else {
      tryResolve();
    }

    if (posRotAnims.length > 0) {
      node.getScene().beginDirectAnimation(node, posRotAnims, 0, posRotFrames, false, 1.0, tryResolve);
    } else {
      tryResolve();
    }
  });
}
