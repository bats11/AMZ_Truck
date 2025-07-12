// src/logic/entryAnimation.ts
import * as BABYLON from "@babylonjs/core";

export function playEntryAnimation(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  initialTransform: { position: BABYLON.Vector3; rotation: BABYLON.Vector3; scaling: BABYLON.Vector3 }
) {
  const frameRate = 60;
  const durationSec = 3;
  const totalFrames = durationSec * frameRate;

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

  const posAnim = new BABYLON.Animation("appearancePos", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
  posAnim.setKeys([
    { frame: 0, value: node.position.clone() },
    { frame: totalFrames, value: initialTransform.position.clone() },
  ]);
  posAnim.setEasingFunction(easing);

  const scaleAnim = new BABYLON.Animation("appearanceScale", "scaling", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
  scaleAnim.setKeys([
    { frame: 0, value: node.scaling.clone() },
    { frame: totalFrames, value: initialTransform.scaling.clone() },
  ]);
  scaleAnim.setEasingFunction(easing);

  const rotAnim = new BABYLON.Animation("appearanceRot", "rotation", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
  const startRot = node.rotation.clone();
  const endRot = initialTransform.rotation.clone();
  rotAnim.setKeys([
    { frame: 0, value: startRot },
    { frame: totalFrames * 0.4, value: BABYLON.Vector3.Lerp(startRot, endRot, 0.7) },
    { frame: totalFrames * 0.75, value: BABYLON.Vector3.Lerp(startRot, endRot, 0.9) },
    { frame: totalFrames, value: endRot },
  ]);

  scene.beginDirectAnimation(
    node,
    [posAnim, scaleAnim, rotAnim],
    0,
    totalFrames,
    false,
    1.0,
    () => {
      startIdleLoopRotation(node, scene, startRot.y, endRot.y, totalFrames);
      window.dispatchEvent(new Event("entry-animation-finished")); // ✅ notifico React
    }
  );
}

export function startIdleLoopRotation(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  startY: number,
  endY: number,
  totalFrames: number
) {
  const frameRate = 60;
  const frameStartFraction = 0.75;
  const interpFraction = 0.9;
  const frameStart = totalFrames * frameStartFraction;
  const frameEnd = totalFrames;
  const frameDelta = frameEnd - frameStart;

  const midY = BABYLON.Scalar.Lerp(startY, endY, interpFraction);
  const finalY = endY;

  const angleDelta = finalY - midY;
  const angularSpeed = angleDelta / frameDelta;

  if (Math.abs(angularSpeed) < 1e-5) {
    console.warn("⚠️ Velocità troppo bassa, loop non avviato.");
    return;
  }

  const fullRotation = Math.PI * 2;
  const loopDuration = Math.abs(fullRotation / angularSpeed);

  const currentY = node.rotation.y;
  const targetY = currentY + (angularSpeed > 0 ? fullRotation : -fullRotation);

  const loopAnim = new BABYLON.Animation("loopRotationY", "rotation.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
  loopAnim.setKeys([
    { frame: 0, value: currentY },
    { frame: loopDuration, value: targetY },
  ]);

  node.animations = [loopAnim];
  scene.beginAnimation(node, 0, loopDuration, true);
}
