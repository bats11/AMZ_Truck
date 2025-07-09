// src/MoveComponent.ts
import * as BABYLON from "@babylonjs/core";
import { setMoveCameraTo } from "./babylonBridge";
import { transformSettings, TransformSetting } from "./transformSettings";
import submenuData from "./data/submenuData.json";
import {
  handleClassicTransform,
  handleReducingScaleTransform,
  handleBigToBigTransition,
  handleCustomSequence
} from "../src/transformHandlers";
import { playEntryAnimation } from "../src/entryAnimation";

const typedSubmenuData = submenuData as Record<string, { isCustomSequence?: boolean }>;

let modelRoot: BABYLON.TransformNode | null = null;
let animationCycle = 0;

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

  initialTransform = {
    position: new BABYLON.Vector3(0, 1, 0),
    rotation: new BABYLON.Vector3(0, 0, 0),
    scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
  };

  modelRoot.position = new BABYLON.Vector3(0, 3, 0);
  modelRoot.rotation = new BABYLON.Vector3(0, Math.PI * 1.5, 0);
  modelRoot.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);

  setTimeout(() => {
    playEntryAnimation(modelRoot!, scene, initialTransform!);
  }, 500);

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
