import * as BABYLON from "@babylonjs/core";
import { animateTransformTo, createAnimation } from "./utils";
import { setMoveCameraTo } from "./babylonBridge";
import { transformSettings, TransformSetting } from "./transformSettings";

let modelRoot: BABYLON.TransformNode | null = null;
let animationCycle = 0;

/** Stato iniziale salvato per il reset al ritorno */
interface TransformState {
  position: BABYLON.Vector3;
  rotation: BABYLON.Vector3;
  scaling: BABYLON.Vector3;
}
let initialTransform: TransformState | null = null;

function isBig(lengthSquared: number): boolean {
  return lengthSquared > 5.0;
}

export function setupMovementControls(scene: BABYLON.Scene) {
  modelRoot = scene.getTransformNodeByName("ModelRoot");
  if (!modelRoot) return;

  // 🎯 Definiamo lo stato neutro per reset
  initialTransform = {
    position: new BABYLON.Vector3(0, 1, 0),
    rotation: new BABYLON.Vector3(0, 0, 0),
    scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
  };

  // 🔁 Configuriamo lo stato di partenza per l'animazione d'apparizione
  modelRoot.position = new BABYLON.Vector3(0, 3, 0);
  modelRoot.rotation = initialTransform.rotation.clone();
  modelRoot.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);

  // ⏱️ Avviamo l'animazione d'apparizione dopo un breve delay
  setTimeout(() => {
    const frameRate = 60;
    const durationSec = 2;
    const totalFrames = durationSec * frameRate;
    const easing = new BABYLON.CubicEase();
    easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

    // Posizione
    const posAnim = new BABYLON.Animation("appearancePos", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
    posAnim.setKeys([
      { frame: 0, value: modelRoot!.position.clone() },
      { frame: totalFrames, value: initialTransform!.position.clone() },
    ]);
    posAnim.setEasingFunction(easing);

    // Scala
    const scaleAnim = new BABYLON.Animation("appearanceScale", "scaling", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
    scaleAnim.setKeys([
      { frame: 0, value: modelRoot!.scaling.clone() },
      { frame: totalFrames, value: initialTransform!.scaling.clone() },
    ]);
    scaleAnim.setEasingFunction(easing);

    // Rotazione (opzionale, qui mantenuta neutra)
    const rotAnim = new BABYLON.Animation("appearanceRot", "rotation", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
    rotAnim.setKeys([
      { frame: 0, value: modelRoot!.rotation.clone() },
      { frame: totalFrames, value: initialTransform!.rotation.clone() },
    ]);
    rotAnim.setEasingFunction(easing);

    scene.beginDirectAnimation(modelRoot!, [posAnim, scaleAnim, rotAnim], 0, totalFrames, false);
  }, 500);

  // 📦 Colleghiamo il comando React che muove il modello in base al label
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
      // Riduzione di scala + posizione/rotazione
      const frameRate2 = 60;
      const duration2 = 1.5;
      const totalFrames2 = Math.ceil(duration2 * frameRate2);
      const animations: BABYLON.Animation[] = [];

      // Scala
      const scaleAnim2 = new BABYLON.Animation("scaleAnim", "scaling", frameRate2, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
      scaleAnim2.setKeys([
        { frame: 0, value: modelRoot.scaling.clone() },
        { frame: totalFrames2, value: settings.scaling.clone() },
      ]);
      const scaleEase2 = new BABYLON.CubicEase();
      scaleEase2.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
      scaleAnim2.setEasingFunction(scaleEase2);
      animations.push(scaleAnim2);

      // Posizione
      if (settings.position) {
        const posAnim2 = new BABYLON.Animation("posAnim", "position", frameRate2, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
        posAnim2.setKeys([
          { frame: 0, value: modelRoot.position.clone() },
          { frame: totalFrames2, value: settings.position.clone() },
        ]);
        const posEase2 = new BABYLON.QuarticEase();
        posEase2.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
        posAnim2.setEasingFunction(posEase2);
        animations.push(posAnim2);
      }

      // Rotazione
      if (settings.rotation) {
        const rotAnim2 = new BABYLON.Animation("rotAnim", "rotation", frameRate2, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
        rotAnim2.setKeys([
          { frame: 0, value: modelRoot.rotation.clone() },
          { frame: totalFrames2, value: settings.rotation.clone() },
        ]);
        const rotEase2 = new BABYLON.QuarticEase();
        rotEase2.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
        rotAnim2.setEasingFunction(rotEase2);
        animations.push(rotAnim2);
      }

      scene.beginDirectAnimation(modelRoot, animations, 0, totalFrames2, false, 1.0);
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

  const scaleAnim = new BABYLON.Animation("sandwichScale", "scaling", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
  scaleAnim.setKeys([
    { frame: 0, value: scaleStart },
    { frame: shrinkEnd, value: scaleSmall },
    { frame: holdUntil, value: scaleSmall },
    { frame: growEnd, value: scaleBig },
  ]);
  scaleAnim.setEasingFunction(easing);
  scene.beginDirectAnimation(node, [scaleAnim], 0, growEnd, false, 1.0);

  // Dopo lo shrink, muoviamo e ruotiamo
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

/**
 * Riporta il modello allo stato "inizio esperienza"
 */
export function resetModelTransform() {
  if (modelRoot && initialTransform) {
    animationCycle++;
    animateTransformTo(modelRoot, initialTransform);
  }
}

/** Imposta direttamente transform senza animazione */
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
