// src/logic/transformHandlers.ts
import * as BABYLON from "@babylonjs/core";
import { animateTransformTo, createAnimation } from "../src/utils";
import { TransformSetting } from "../src/transformSettings";

// Transizione classica
export async function handleClassicTransform(
  node: BABYLON.TransformNode,
  settings: TransformSetting
) {
  await animateTransformTo(node, settings);
}

// Transizione con scala in riduzione + easing dedicato
export async function handleReducingScaleTransform(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  settings: TransformSetting
) {
  const frameRate = 60;
  const duration = 1.5;
  const totalFrames = Math.ceil(duration * frameRate);
  const animations: BABYLON.Animation[] = [];

  const easing = new BABYLON.QuarticEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);

  if (settings.scaling) {
    const scaleAnim = new BABYLON.Animation("scaleAnim", "scaling", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
    scaleAnim.setKeys([
      { frame: 0, value: node.scaling.clone() },
      { frame: totalFrames, value: settings.scaling.clone() },
    ]);
    scaleAnim.setEasingFunction(easing);
    animations.push(scaleAnim);
  }

  if (settings.position) {
    const posAnim = new BABYLON.Animation("posAnim", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
    posAnim.setKeys([
      { frame: 0, value: node.position.clone() },
      { frame: totalFrames, value: settings.position.clone() },
    ]);
    posAnim.setEasingFunction(easing);
    animations.push(posAnim);
  }

  if (settings.rotation) {
    const rotAnim = new BABYLON.Animation("rotAnim", "rotation", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
    rotAnim.setKeys([
      { frame: 0, value: node.rotation.clone() },
      { frame: totalFrames, value: settings.rotation.clone() },
    ]);
    rotAnim.setEasingFunction(easing);
    animations.push(rotAnim);
  }

  scene.beginDirectAnimation(node, animations, 0, totalFrames, false, 1.0);
}

// Transizione sandwich per "big to big"
export async function handleBigToBigTransition(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  settings: TransformSetting,
  animationCycleRef: { current: number }
) {
  animationCycleRef.current++;
  const currentCycle = animationCycleRef.current;
  const frameRate = 60;
  const shrinkEnd = 48;
  const holdUntil = 106;
  const growEnd = 162;

  const posStart = node.position.clone();
  const rotStart = node.rotation.clone();
  const scaleStart = node.scaling.clone();
  const scaleSmall = new BABYLON.Vector3(1, 1, 1);
  const scaleBig = settings.scaling ?? scaleStart;

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const scaleAnim = new BABYLON.Animation("sandwichScale", "scaling", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
  scaleAnim.setKeys([
    { frame: 0, value: scaleStart },
    { frame: shrinkEnd, value: scaleSmall },
    { frame: holdUntil, value: scaleSmall },
    { frame: growEnd, value: scaleBig },
  ]);
  scaleAnim.setEasingFunction(easing);
  scene.beginDirectAnimation(node, [scaleAnim], 0, growEnd, false, 1.0);

  setTimeout(() => {
    if (animationCycleRef.current !== currentCycle) return;
    const moveAnims: BABYLON.Animation[] = [];
    moveAnims.push(createAnimation("position", posStart, settings.position ?? posStart, 0, 60, easing));
    moveAnims.push(createAnimation("rotation.x", rotStart.x, settings.rotation?.x ?? rotStart.x, 0, 60, easing));
    moveAnims.push(createAnimation("rotation.y", rotStart.y, settings.rotation?.y ?? rotStart.y, 0, 60, easing));
    moveAnims.push(createAnimation("rotation.z", rotStart.z, settings.rotation?.z ?? rotStart.z, 0, 60, easing));
    scene.beginDirectAnimation(node, moveAnims, 0, 60, false, 1.0);
  }, (shrinkEnd / frameRate) * 1000);
}

