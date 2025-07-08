// src/MoveComponent.ts
import * as BABYLON from "@babylonjs/core";
import { animateTransformTo, createAnimation } from "./utils";
import { setMoveCameraTo } from "./babylonBridge";
import { transformSettings, TransformSetting } from "./transformSettings";
import submenuData from "./data/submenuData.json";

const typedSubmenuData = submenuData as Record<string, { isCustomSequence?: boolean }>;

// 🧱 MODEL ROOT + STATO
let modelRoot: BABYLON.TransformNode | null = null;
let animationCycle = 0;

interface TransformState {
  position: BABYLON.Vector3;
  rotation: BABYLON.Vector3;
  scaling: BABYLON.Vector3;
}
let initialTransform: TransformState | null = null;

// 🧠 LOGICA DI CLASSIFICAZIONE
function isBig(lengthSquared: number): boolean {
  return lengthSquared > 5.0;
}

// 🎬 ENTRY POINT – SETUP
export function setupMovementControls(scene: BABYLON.Scene) {
  modelRoot = scene.getTransformNodeByName("ModelRoot");
  if (!modelRoot) return;

  initialTransform = {
    position: new BABYLON.Vector3(0, 1, 0),
    rotation: new BABYLON.Vector3(0, 0, 0),
    scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
  };

  modelRoot.position = new BABYLON.Vector3(0, 3, 0);
  modelRoot.rotation = new BABYLON.Vector3(0, Math.PI * 1.5, 0);
  modelRoot.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);

  setTimeout(() => {
    playEntryAnimation(scene);
  }, 500);

  // 🚀 COMANDO PRINCIPALE
  setMoveCameraTo(async (label: string) => {
    if (!modelRoot) return;
    animationCycle++;

    const isCustomSequence = typedSubmenuData[label]?.isCustomSequence === true;
    if (isCustomSequence) {
      await handleCustomSequence(label);
      return;
    }

    const settings = transformSettings[label];
    if (!settings) return;

    const currentScaleSq = modelRoot.scaling.lengthSquared();
    const targetScaleSq = settings.scaling?.lengthSquared() ?? currentScaleSq;

    const isReducingScale = targetScaleSq < currentScaleSq - 0.001;
    const isBigToBig = isBig(currentScaleSq) && isBig(targetScaleSq);

    if (isBigToBig && settings.scaling) {
      await handleBigToBigTransition(modelRoot, scene, settings);
    } else if (isReducingScale && settings.scaling) {
      await handleReducingScaleTransform(modelRoot, scene, settings);
    } else {
      await handleClassicTransform(modelRoot, settings);
    }
  });
}

// 🔁 TRANSIZIONI MODULARI
async function handleClassicTransform(node: BABYLON.TransformNode, settings: TransformSetting) {
  await animateTransformTo(node, settings);
}

async function handleReducingScaleTransform(node: BABYLON.TransformNode, scene: BABYLON.Scene, settings: TransformSetting) {
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

async function handleBigToBigTransition(node: BABYLON.TransformNode, scene: BABYLON.Scene, settings: TransformSetting) {
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
    if (animationCycle !== currentCycle) return;
    const moveAnims: BABYLON.Animation[] = [];
    moveAnims.push(createAnimation("position", posStart, settings.position ?? posStart, 0, 60, easing));
    moveAnims.push(createAnimation("rotation.x", rotStart.x, settings.rotation?.x ?? rotStart.x, 0, 60, easing));
    moveAnims.push(createAnimation("rotation.y", rotStart.y, settings.rotation?.y ?? rotStart.y, 0, 60, easing));
    moveAnims.push(createAnimation("rotation.z", rotStart.z, settings.rotation?.z ?? rotStart.z, 0, 60, easing));
    scene.beginDirectAnimation(node, moveAnims, 0, 60, false, 1.0);
  }, (shrinkEnd / frameRate) * 1000);
}

// 🔜 CUSTOM SEQUENCE (fase 4)
async function handleCustomSequence(label: string) {
  console.log(`[🔧 CustomSequence] Triggered for ${label}`);
  // Da implementare nel prossimo passo
}

// 🔄 RESET E SET
export function resetModelTransform() {
  if (modelRoot && initialTransform) {
    animationCycle++;
    animateTransformTo(modelRoot, initialTransform);
  }
}

export function setModelTransform(options: {
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  scaling?: BABYLON.Vector3;
}) {
  if (!modelRoot) return;
  if (options.position) modelRoot.position = options.position;
  if (options.rotation) modelRoot.rotation = options.rotation;
  if (options.scaling) modelRoot.scaling = options.scaling;
}

export function getModelRoot(): BABYLON.TransformNode | null {
  return modelRoot;
}

// 🎬 ANIMAZIONE INIZIALE
function playEntryAnimation(scene: BABYLON.Scene) {
  if (!modelRoot || !initialTransform) return;

  const frameRate = 60;
  const durationSec = 3;
  const totalFrames = durationSec * frameRate;

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

  const posAnim = new BABYLON.Animation("appearancePos", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
  posAnim.setKeys([
    { frame: 0, value: modelRoot.position.clone() },
    { frame: totalFrames, value: initialTransform.position.clone() },
  ]);
  posAnim.setEasingFunction(easing);

  const scaleAnim = new BABYLON.Animation("appearanceScale", "scaling", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
  scaleAnim.setKeys([
    { frame: 0, value: modelRoot.scaling.clone() },
    { frame: totalFrames, value: initialTransform.scaling.clone() },
  ]);
  scaleAnim.setEasingFunction(easing);

  const rotAnim = new BABYLON.Animation("appearanceRot", "rotation", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
  const startRot = modelRoot.rotation.clone();
  const endRot = initialTransform.rotation.clone();
  rotAnim.setKeys([
    { frame: 0, value: startRot },
    { frame: totalFrames * 0.4, value: BABYLON.Vector3.Lerp(startRot, endRot, 0.7) },
    { frame: totalFrames * 0.75, value: BABYLON.Vector3.Lerp(startRot, endRot, 0.9) },
    { frame: totalFrames, value: endRot },
  ]);

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

// 🔁 LOOP IDLE
function startIdleLoopRotation(scene: BABYLON.Scene, startY: number, endY: number, totalFrames: number) {
  if (!modelRoot) return;

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

  const currentY = modelRoot.rotation.y;
  const targetY = currentY + (angularSpeed > 0 ? fullRotation : -fullRotation);

  const loopAnim = new BABYLON.Animation("loopRotationY", "rotation.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
  loopAnim.setKeys([
    { frame: 0, value: currentY },
    { frame: loopDuration, value: targetY },
  ]);

  modelRoot.animations = [loopAnim];
  scene.beginAnimation(modelRoot, 0, loopDuration, true);
}
