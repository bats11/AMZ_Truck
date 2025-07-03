// src/movementHandler.ts
import * as BABYLON from "@babylonjs/core";
import { modelRoot } from "./modelState";
import { animateTransformTo, createAnimation } from "./utils";
import { setMoveCameraTo } from "./babylonBridge";
import { transformSettings, TransformSetting } from "./transformSettings";

let animationCycle = 0;

function isBig(lengthSquared: number): boolean {
  return lengthSquared > 5.0;
}

export function setupMovementHandler(scene: BABYLON.Scene) {
  setMoveCameraTo(async (label: string) => {
    if (!modelRoot) return;

    animationCycle++;
    const settings = transformSettings[label];
    if (!settings) return;

    const currentScaleSq = modelRoot.scaling.lengthSquared();
    const targetScaleSq = settings.scaling?.lengthSquared() ?? currentScaleSq;
    const isReducingScale = targetScaleSq < currentScaleSq - 0.001;
    const isBigToBig = isBig(currentScaleSq) && isBig(targetScaleSq);

    if (isBigToBig && settings.scaling) {
      await animateSandwichedTransition(modelRoot, scene, settings);
    } else if (isReducingScale && settings.scaling) {
      const frameRate = 60;
      const duration = 1.5;
      const totalFrames = Math.ceil(duration * frameRate);
      const animations: BABYLON.Animation[] = [];

      // Scala
      const scaleAnim = new BABYLON.Animation("scaleAnim", "scaling", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
      scaleAnim.setKeys([
        { frame: 0, value: modelRoot.scaling.clone() },
        { frame: totalFrames, value: settings.scaling.clone() },
      ]);
      const scaleEase = new BABYLON.CubicEase();
      scaleEase.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
      scaleAnim.setEasingFunction(scaleEase);
      animations.push(scaleAnim);

      // Posizione
      if (settings.position) {
        const posAnim = new BABYLON.Animation("posAnim", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
        posAnim.setKeys([
          { frame: 0, value: modelRoot.position.clone() },
          { frame: totalFrames, value: settings.position.clone() },
        ]);
        const posEase = new BABYLON.QuarticEase();
        posEase.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
        posAnim.setEasingFunction(posEase);
        animations.push(posAnim);
      }

      // Rotazione
      if (settings.rotation) {
        const rotAnim = new BABYLON.Animation("rotAnim", "rotation", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
        rotAnim.setKeys([
          { frame: 0, value: modelRoot.rotation.clone() },
          { frame: totalFrames, value: settings.rotation.clone() },
        ]);
        const rotEase = new BABYLON.QuarticEase();
        rotEase.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
        rotAnim.setEasingFunction(rotEase);
        animations.push(rotAnim);
      }

      scene.beginDirectAnimation(modelRoot, animations, 0, totalFrames, false, 1.0);
    } else {
      await animateTransformTo(modelRoot, settings);
    }
  });
}

/**
 * Transizione "sandwich": scala verso piccolo, poi muove e ruota
 */
async function animateSandwichedTransition(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  target: TransformSetting
): Promise<void> {
  animationCycle++;
  const currentCycle = animationCycle;
  const frameRate = 60;
  const shrinkEnd = 48;
  const holdUntil = 106;
  const growEnd = 162;

  const posStart = node.position.clone();
  const rotStart = node.rotation.clone();
  const scaleStart = node.scaling.clone();
  const scaleSmall = new BABYLON.Vector3(1, 1, 1);
  const scaleBig = target.scaling ?? scaleStart;

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const scaleAnim = new BABYLON.Animation(
    "sandwichScale",
    "scaling",
    frameRate,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3
  );
  scaleAnim.setKeys([
    { frame: 0, value: scaleStart },
    { frame: shrinkEnd, value: scaleSmall },
    { frame: holdUntil, value: scaleSmall },
    { frame: growEnd, value: scaleBig },
  ]);
  scaleAnim.setEasingFunction(easing);
  scene.beginDirectAnimation(node, [scaleAnim], 0, growEnd, false, 1.0);

  setTimeout(() => {
    if (animationCycle !== currentCycle) return;
    const moveAnims: BABYLON.Animation[] = [];

    moveAnims.push(createAnimation("position", posStart, target.position ?? posStart, 0, 60, easing));
    moveAnims.push(createAnimation("rotation.x", rotStart.x, target.rotation?.x ?? rotStart.x, 0, 60, easing));
    moveAnims.push(createAnimation("rotation.y", rotStart.y, target.rotation?.y ?? rotStart.y, 0, 60, easing));
    moveAnims.push(createAnimation("rotation.z", rotStart.z, target.rotation?.z ?? rotStart.z, 0, 60, easing));

    scene.beginDirectAnimation(node, moveAnims, 0, 60, false, 1.0);
  }, (shrinkEnd / frameRate) * 1000);
}
