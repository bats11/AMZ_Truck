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
