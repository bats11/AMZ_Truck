// utils.ts
import * as BABYLON from "@babylonjs/core";

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

export function createQuaternionAnimation(
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
