// src/entryAnimation.ts
import * as BABYLON from "@babylonjs/core";
import { modelRoot, initialTransform } from "./modelState";

export function playEntryAnimation(scene: BABYLON.Scene) {
  if (!modelRoot || !initialTransform) return;

  const frameRate   = 60;
  const durationSec = 3;
  const totalFrames = durationSec * frameRate; // 180

  // — Easing per posizione e scala —
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

  // === 1) Posizione ===
  const posAnim = new BABYLON.Animation(
    "appearancePos",
    "position",
    frameRate,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3
  );
  posAnim.setKeys([
    { frame: 0,           value: modelRoot.position.clone() },
    { frame: totalFrames, value: initialTransform.position.clone() },
  ]);
  posAnim.setEasingFunction(easing);

  // === 2) Scala ===
  const scaleAnim = new BABYLON.Animation(
    "appearanceScale",
    "scaling",
    frameRate,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3
  );
  scaleAnim.setKeys([
    { frame: 0,           value: modelRoot.scaling.clone() },
    { frame: totalFrames, value: initialTransform.scaling.clone() },
  ]);
  scaleAnim.setEasingFunction(easing);

  // === 3) Rotazione con decelerazione manuale ===
  const rotAnim = new BABYLON.Animation(
    "appearanceRot",
    "rotation",
    frameRate,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3
  );
  const startRot = modelRoot.rotation.clone();      // es. Y = 2π
  const endRot   = initialTransform.rotation.clone(); // es. Y = 0

  rotAnim.setKeys([
    { frame: 0,               value: startRot },
    { frame: totalFrames * 0.4,  value: BABYLON.Vector3.Lerp(startRot, endRot, 0.7) },
    { frame: totalFrames * 0.75, value: BABYLON.Vector3.Lerp(startRot, endRot, 0.9) },
    { frame: totalFrames,        value: endRot },
  ]);
  // nessun easing → lineare tra keyframe

  // === Avvia l’entry animation e al termine innesca il loop ===
  scene.beginDirectAnimation(
    modelRoot,
    [posAnim, scaleAnim, rotAnim],
    0,
    totalFrames,
    false,
    1.0,
    () => startIdleLoopRotation(scene, startRot.y, endRot.y, totalFrames)
  );
}

/**
 * Loop continuo su rotation.y che usa esattamente la
 * stessa velocità media del tratto frame 135→180.
 */
function startIdleLoopRotation(
  scene: BABYLON.Scene,
  startY: number,
  endY: number,
  totalFrames: number
) {
  if (!modelRoot) return;

  const frameRate = 60;

  // --- parametri del tratto ---
  const frameStartFraction = 0.75;  // keyframe a 135/180
  const interpFraction     = 0.9;   // Lerp(..., 0.9) at that key
  const frameStart = totalFrames * frameStartFraction; // 135
  const frameEnd   = totalFrames;                     // 180
  const frameDelta = frameEnd - frameStart;           // 45

  // --- valori Y reali ai due estremi del tratto ---
  const midY = BABYLON.Scalar.Lerp(startY, endY, interpFraction); // value at frame 135
  const finalY = endY;                                            // value at frame 180

  // --- velocità angolare (rad/frame) ---
  const angleDelta   = finalY - midY;
  const angularSpeed = angleDelta / frameDelta;

  if (Math.abs(angularSpeed) < 1e-5) {
    console.warn("⚠️ Velocità troppo bassa, loop non avviato.");
    return;
  }

  // === calcola durata per 360° a quella velocità ===
  const fullRotation = Math.PI * 2;
  const loopDuration = Math.abs(fullRotation / angularSpeed);

  // === definisci i valori di start/end per il loop ===
  const currentY = modelRoot.rotation.y;
  const targetY  = currentY + (angularSpeed > 0 ? fullRotation : -fullRotation);

  // === crea e avvia l’animazione di loop ===
  const loopAnim = new BABYLON.Animation(
    "loopRotationY",
    "rotation.y",
    frameRate,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.AnimationLOOPMODE_CYCLE
  );
  loopAnim.setKeys([
    { frame: 0,           value: currentY },
    { frame: loopDuration, value: targetY },
  ]);

  modelRoot.animations = [loopAnim];
  scene.beginAnimation(modelRoot, 0, loopDuration, true);
}
