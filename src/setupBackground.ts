// src/setupBackground.ts
import * as BABYLON from "@babylonjs/core";
import { ShadowOnlyMaterial } from "@babylonjs/materials/shadowOnly/shadowOnlyMaterial";

let shadowOnlyMatRef: ShadowOnlyMaterial | null = null;
let groundRef: BABYLON.Mesh | null = null;

function animateShadowAlpha(from: number, to: number, durationSec: number, onComplete?: () => void) {
  if (!shadowOnlyMatRef) return;
  const scene = shadowOnlyMatRef.getScene();
  const anim = new BABYLON.Animation(
    "fadeShadowAlpha",
    "alpha",
    60,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  anim.setKeys([
    { frame: 0, value: from },
    { frame: durationSec * 60, value: to }
  ]);

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
  anim.setEasingFunction(easing);

  scene.beginDirectAnimation(shadowOnlyMatRef, [anim], 0, durationSec * 60, false, 1, () => {
    if (onComplete) onComplete();
  });
}

/**
 * Fade-out dell’ombra sul background.
 * Alla fine disattiva anche ground.receiveShadows.
 */
export function fadeOutShadow(scene: BABYLON.Scene, durationSec: number = 0.5) {
  if (!shadowOnlyMatRef || !groundRef) return;
  animateShadowAlpha(shadowOnlyMatRef.alpha, 0, durationSec, () => {
    groundRef!.receiveShadows = false;
  });
}

/**
 * Fade-in dell’ombra sul background.
 * Prima riattiva ground.receiveShadows, poi aumenta alpha.
 */
export function fadeInShadow(scene: BABYLON.Scene, durationSec: number = 0.5, targetAlpha: number = 0.1) {
  if (!shadowOnlyMatRef || !groundRef) return;
  groundRef.receiveShadows = true;
  animateShadowAlpha(shadowOnlyMatRef.alpha, targetAlpha, durationSec);
}

/**
 * Crea un piano invisibile che riceve solo ombre (shadow catcher).
 */
export function setupBackground(scene: BABYLON.Scene): BABYLON.Mesh {
  const groundSize = 30;

  const ground = BABYLON.MeshBuilder.CreateGround("groundPlane", {
    width: groundSize,
    height: groundSize,
  }, scene);

  // ✅ ShadowOnlyMaterial corretto
  const shadowOnlyMat = new ShadowOnlyMaterial("shadowOnlyMat", scene);
  shadowOnlyMat.alpha = 0.1; // invisibile
  shadowOnlyMat.shadowColor = new BABYLON.Color3(0, 0, 0);

  ground.material = shadowOnlyMat;
  ground.receiveShadows = true;

  // 🔧 Trasformazioni
  ground.position = new BABYLON.Vector3(0, 0, 6);
  ground.rotation = new BABYLON.Vector3(
    BABYLON.Tools.ToRadians(-90),
    0,
    0
  );
  ground.scaling = new BABYLON.Vector3(1, 1, 1);

  // 🔗 Salva riferimenti globali per fade
  shadowOnlyMatRef = shadowOnlyMat;
  groundRef = ground;

  return ground;
}
