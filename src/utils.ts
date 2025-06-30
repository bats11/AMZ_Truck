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

export function animateTransformTo(
  node: BABYLON.TransformNode,
  options: TransformOptions,
  durationOverride?: number
): Promise<void> {
  const frameRate = 60;
  const animations: BABYLON.Animation[] = [];
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
  let maxFrames = 0;

  if (options.position) {
    const start = node.position.clone();
    const end = options.position.clone();
    const distance = BABYLON.Vector3.Distance(start, end);
    const speed = 1;
    const duration = durationOverride ?? (distance / speed);
    const frames = Math.ceil(duration * frameRate);
    animations.push(createAnimation("position", start, end, 0, frames, easing));
    maxFrames = Math.max(maxFrames, frames);
  }

  if (options.rotation) {
    const current = node.rotation.clone();
    const target = options.rotation.clone();
    const delta = new BABYLON.Vector3(
      shortestAngleBetween(current.x, target.x),
      shortestAngleBetween(current.y, target.y),
      shortestAngleBetween(current.z, target.z)
    );
    const totalAngleDeg = Math.max(
      Math.abs(BABYLON.Tools.ToDegrees(delta.x)),
      Math.abs(BABYLON.Tools.ToDegrees(delta.y)),
      Math.abs(BABYLON.Tools.ToDegrees(delta.z))
    );
    const speedDegPerSec = 90;
    const duration = durationOverride ?? (totalAngleDeg / speedDegPerSec);
    const frames = Math.ceil(duration * frameRate);

    animations.push(createAnimation("rotation.x", current.x, current.x + delta.x, 0, frames, easing));
    animations.push(createAnimation("rotation.y", current.y, current.y + delta.y, 0, frames, easing));
    animations.push(createAnimation("rotation.z", current.z, current.z + delta.z, 0, frames, easing));

    maxFrames = Math.max(maxFrames, frames);
  }

  if (options.scaling) {
    const start = node.scaling.clone();
    const end = options.scaling.clone();
    const delta = BABYLON.Vector3.Distance(start, end);
    const speed = 1;
    const duration = durationOverride ?? (delta / speed);
    const frames = Math.ceil(duration * frameRate);
    animations.push(createAnimation("scaling", start, end, 0, frames, easing));
    maxFrames = Math.max(maxFrames, frames);
  }

  if (animations.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    node.animations = animations;
    node.getScene().beginAnimation(node, 0, maxFrames, false, 1.0, resolve);
  });
}

function normalizeAngle(angle: number): number {
  return (angle + Math.PI * 2) % (Math.PI * 2);
}

function shortestAngleBetween(current: number, target: number): number {
  current = normalizeAngle(current);
  target = normalizeAngle(target);
  let delta = target - current;
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}
