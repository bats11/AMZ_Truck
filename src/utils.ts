import * as BABYLON from "@babylonjs/core";

export function animateRotationTo(
  node: BABYLON.TransformNode,
  targetAngle: number,
  speedDegPerSec = 90
) {
  const frameRate = 60;
  const currentY = node.rotation.y;
  const delta = shortestAngleBetween(currentY, targetAngle);
  const totalAngleDeg = Math.abs(BABYLON.Tools.ToDegrees(delta));
  const duration = totalAngleDeg / speedDegPerSec;
  const totalFrames = Math.ceil(duration * frameRate);

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const anim = new BABYLON.Animation("rotationY", "rotation.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
  anim.setKeys([
    { frame: 0, value: currentY },
    { frame: totalFrames, value: currentY + delta },
  ]);
  anim.setEasingFunction(easing);

  node.animations = [anim];
  node.getScene().beginAnimation(node, 0, totalFrames, false);
}

export interface TransformOptions {
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  scaling?: BABYLON.Vector3;
}

export function animateTransformTo(
  node: BABYLON.TransformNode,
  options: TransformOptions
) {
  const frameRate = 60;
  const animations: BABYLON.Animation[] = [];
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
  let maxFrames = 0;

  if (options.position) {
    const start = node.position.clone();
    const end = options.position.clone();
    const distance = BABYLON.Vector3.Distance(start, end);
    const speed = 1; // units per second
    const duration = distance / speed;
    const frames = Math.ceil(duration * frameRate);
    const anim = new BABYLON.Animation(
      "position",
      "position",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3
    );
    anim.setKeys([
      { frame: 0, value: start },
      { frame: frames, value: end },
    ]);
    anim.setEasingFunction(easing);
    animations.push(anim);
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
    const duration = totalAngleDeg / speedDegPerSec;
    const frames = Math.ceil(duration * frameRate);

    const animX = new BABYLON.Animation(
      "rotationX",
      "rotation.x",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT
    );
    animX.setKeys([
      { frame: 0, value: current.x },
      { frame: frames, value: current.x + delta.x },
    ]);
    animX.setEasingFunction(easing);

    const animY = new BABYLON.Animation(
      "rotationY",
      "rotation.y",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT
    );
    animY.setKeys([
      { frame: 0, value: current.y },
      { frame: frames, value: current.y + delta.y },
    ]);
    animY.setEasingFunction(easing);

    const animZ = new BABYLON.Animation(
      "rotationZ",
      "rotation.z",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT
    );
    animZ.setKeys([
      { frame: 0, value: current.z },
      { frame: frames, value: current.z + delta.z },
    ]);
    animZ.setEasingFunction(easing);

    animations.push(animX, animY, animZ);
    maxFrames = Math.max(maxFrames, frames);
  }

  if (options.scaling) {
    const start = node.scaling.clone();
    const end = options.scaling.clone();
    const delta = BABYLON.Vector3.Distance(start, end);
    const speed = 1; // units per second
    const duration = delta / speed;
    const frames = Math.ceil(duration * frameRate);
    const anim = new BABYLON.Animation(
      "scaling",
      "scaling",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3
    );
    anim.setKeys([
      { frame: 0, value: start },
      { frame: frames, value: end },
    ]);
    anim.setEasingFunction(easing);
    animations.push(anim);
    maxFrames = Math.max(maxFrames, frames);
  }

  if (animations.length === 0) {
    return;
  }

  node.animations = animations;
  node.getScene().beginAnimation(node, 0, maxFrames, false);
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
