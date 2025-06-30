import * as BABYLON from "@babylonjs/core";
import { animateTransformTo, createAnimation } from "./utils";
import { setMoveCameraTo } from "./babylonBridge";
import { transformSettings, TransformSetting } from "./transformSettings";

let modelRoot: BABYLON.TransformNode | null = null;
let animationCycle = 0;

let initialTransform: {
  position: BABYLON.Vector3;
  rotation: BABYLON.Vector3;
  scaling: BABYLON.Vector3;
} | null = null;

export function setupMovementControls(scene: BABYLON.Scene) {
  modelRoot = scene.getTransformNodeByName("ModelRoot");
  if (!modelRoot) return;

  modelRoot.position = new BABYLON.Vector3(0, 4, 0);
  modelRoot.rotation = new BABYLON.Vector3(0, 0, 0);
  modelRoot.scaling = new BABYLON.Vector3(1.1, 1.1, 1.1);

  initialTransform = {
    position: modelRoot.position.clone(),
    rotation: modelRoot.rotation.clone(),
    scaling: modelRoot.scaling.clone(),
  };

  setMoveCameraTo(async (label) => {
    if (!modelRoot) return;

    animationCycle++; // Invalida animazioni precedenti

    const settings = transformSettings[label];
    if (!settings) return;

    const currentScale = modelRoot.scaling.lengthSquared();
    const targetScale = settings.scaling?.lengthSquared() ?? currentScale;

    const isReducingScale = targetScale < currentScale - 0.001;
    const isBigToBig = currentScale > 4.5 && targetScale > 4.5 && Math.abs(currentScale - targetScale) < 0.01;

    if (isBigToBig && settings.scaling) {
      await animateSandwichedTransition(modelRoot, scene, settings);
    } else if (isReducingScale && settings.scaling) {
      const frameRate = 60;
      const duration = 1.5;
      const totalFrames = Math.ceil(duration * frameRate);

      const animations: BABYLON.Animation[] = [];

      const scaleAnim = new BABYLON.Animation("scaleAnim", "scaling", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
      scaleAnim.setKeys([
        { frame: 0, value: modelRoot.scaling.clone() },
        { frame: totalFrames, value: settings.scaling.clone() },
      ]);
      const scaleEase = new BABYLON.CubicEase();
      scaleEase.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
      scaleAnim.setEasingFunction(scaleEase);
      animations.push(scaleAnim);

      if (settings.position) {
        const posAnim = new BABYLON.Animation("positionAnim", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
        posAnim.setKeys([
          { frame: 0, value: modelRoot.position.clone() },
          { frame: totalFrames, value: settings.position.clone() },
        ]);
        const posEase = new BABYLON.QuarticEase();
        posEase.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
        posAnim.setEasingFunction(posEase);
        animations.push(posAnim);
      }

      if (settings.rotation) {
        const rotAnim = new BABYLON.Animation("rotationAnim", "rotation", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
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

function animateSandwichedTransition(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  target: TransformSetting
) {
  animationCycle++;
  const currentCycle = animationCycle;

  const frameRate = 60;
  const shrinkEnd = 48;         
  const holdSmallUntil = 106;   
  const growEnd = 162;          
       
  const moveDuration = 60;    

  const scaleStart = node.scaling.clone();
  const scaleSmall = new BABYLON.Vector3(1.2, 1.2, 1.2);
  const scaleBig = target.scaling ?? node.scaling.clone();
  const posStart = node.position.clone();
  const posEnd = target.position ?? posStart;
  const rotStart = node.rotation.clone();
  const rotEnd = target.rotation ?? rotStart;

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const scaleAnim = new BABYLON.Animation("scalingAnim", "scaling", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
  scaleAnim.setKeys([
    { frame: 0, value: scaleStart },
    { frame: shrinkEnd, value: scaleSmall },
    { frame: holdSmallUntil, value: scaleSmall },  // 🔒 Mantieni piccolo durante il move
    { frame: growEnd, value: scaleBig }
  ]);
  scaleAnim.setEasingFunction(easing);

  scene.beginDirectAnimation(node, [scaleAnim], 0, growEnd, false, 1.0);

  // Start movimento dopo shrink
  const delayMs = (shrinkEnd / frameRate) * 1000;

  setTimeout(() => {
    if (animationCycle !== currentCycle) return;

    const moveStart = 0;
    const moveEnd = moveDuration;

    const animations: BABYLON.Animation[] = [];
    animations.push(createAnimation("position", posStart, posEnd, moveStart, moveEnd, easing));
    animations.push(createAnimation("rotation.x", rotStart.x, rotEnd.x, moveStart, moveEnd, easing));
    animations.push(createAnimation("rotation.y", rotStart.y, rotEnd.y, moveStart, moveEnd, easing));
    animations.push(createAnimation("rotation.z", rotStart.z, rotEnd.z, moveStart, moveEnd, easing));

    scene.beginDirectAnimation(node, animations, moveStart, moveEnd, false, 1.0);
  }, delayMs);
}

export function resetModelTransform() {
  if (!modelRoot || !initialTransform) return;
  animationCycle++;

  animateTransformTo(modelRoot, {
    position: initialTransform.position,
    rotation: initialTransform.rotation,
    scaling: initialTransform.scaling,
  });
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
