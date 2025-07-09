import * as BABYLON from "@babylonjs/core";
import { setMoveCameraTo } from "./babylonBridge";
import { transformSettings } from "./transformSettings";
import submenuData from "./data/submenuData.json";
import {
  handleClassicTransform,
  handleReducingScaleTransform,
  handleBigToBigTransition,
} from "./transformHandlers";
import { playEntryAnimation } from "./entryAnimation";
import { animateTransformTo, createAnimation } from "./utils";

const typedSubmenuData = submenuData as Record<string, { isCustomSequence?: boolean }>;

let modelRoot: BABYLON.TransformNode | null = null;
let animationCycle = 0;

interface TransformState {
  position: BABYLON.Vector3;
  rotation: BABYLON.Vector3;
  scaling: BABYLON.Vector3;
}
let initialTransform: TransformState | null = null;

async function handleCustomSequenceMidStep(label: string): Promise<void> {
  console.log(`[custom sequence] MID-STEP logic for: ${label}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
}

async function runInterpolationsTo(
  scene: BABYLON.Scene,
  step: {
    position?: BABYLON.Vector3;
    rotation?: BABYLON.Vector3;
    scaling?: BABYLON.Vector3;
    durationScale?: number;
    durationPosRot?: number;
  }
): Promise<void> {
  if (!modelRoot) return;

  const frameRate = 60;
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const scaleFrames = Math.ceil((step.durationScale ?? 1.0) * frameRate);
  const moveFrames = Math.ceil((step.durationPosRot ?? 2.0) * frameRate);

  if (step.scaling) {
    const scaleAnim = createAnimation("scaling", modelRoot.scaling.clone(), step.scaling.clone(), 0, scaleFrames, easing);
    scene.beginDirectAnimation(modelRoot, [scaleAnim], 0, scaleFrames, false, 1.0);
  }

  const posRotAnims: BABYLON.Animation[] = [];
  if (step.position) {
    posRotAnims.push(createAnimation("position", modelRoot.position.clone(), step.position.clone(), 0, moveFrames, easing));
  }
  if (step.rotation) {
    const currentRot = modelRoot.rotation.clone();
    const targetRot = step.rotation.clone();
    posRotAnims.push(createAnimation("rotation.x", currentRot.x, targetRot.x, 0, moveFrames, easing));
    posRotAnims.push(createAnimation("rotation.y", currentRot.y, targetRot.y, 0, moveFrames, easing));
    posRotAnims.push(createAnimation("rotation.z", currentRot.z, targetRot.z, 0, moveFrames, easing));
  }

  if (posRotAnims.length > 0) {
    await new Promise<void>((resolve) => {
      scene.beginDirectAnimation(modelRoot!, posRotAnims, 0, moveFrames, false, 1.0, resolve);
    });
  }
}

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
  setTimeout(() => playEntryAnimation(modelRoot!, scene, initialTransform!), 500);

  setMoveCameraTo(async (label: string) => {
    if (!modelRoot) return;
    animationCycle++;

    const settings = transformSettings[label];
    if (!settings) return;

    const isCustomSequence = typedSubmenuData[label]?.isCustomSequence === true;
    if (isCustomSequence) {
      const steps = settings.intermediate ?? [];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await runInterpolationsTo(scene, step);

        if (i === 0) {
          await handleCustomSequenceMidStep(label); // solo dopo il primo step
        }
      }

      await runInterpolationsTo(scene, settings); // finale
      return;
    }

    const currentScaleSq = modelRoot.scaling.lengthSquared();
    const targetScaleSq = settings.scaling?.lengthSquared() ?? currentScaleSq;
    const isReducingScale = targetScaleSq < currentScaleSq - 0.001;
    const isBigToBig = currentScaleSq > 5.0 && targetScaleSq > 5.0;

    if (isBigToBig && settings.scaling) {
      await handleBigToBigTransition(modelRoot, scene, settings, { current: animationCycle });
    } else if (isReducingScale && settings.scaling) {
      await handleReducingScaleTransform(modelRoot, scene, settings);
    } else {
      await handleClassicTransform(modelRoot, settings);
    }
  });
}

export function resetModelTransform() {
  if (modelRoot && initialTransform) {
    animationCycle++;
    handleClassicTransform(modelRoot, initialTransform);
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
