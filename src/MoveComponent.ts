import * as BABYLON from "@babylonjs/core";
import { setMoveCameraTo } from "./babylonBridge";
import { transformSettings, TransformSetting, getTransformSetting } from "./transformSettings";
import submenuData from "./data/submenuData.json";
import {
  handleClassicTransform,
  handleInterpolatedTransform,
  handleExitSequence,
} from "./transformHandlers";
import { handleCustomSequenceMidStep } from "./sequenceMidStep";
import { playEntryAnimation } from "./entryAnimation";
import { createAnimation } from "./utils";

const typedSubmenuData = submenuData as Record<string, { isCustomSequence?: boolean }>;

let modelRoot: BABYLON.TransformNode | null = null;
let animationCycle = 0;
let activeCamera: BABYLON.FreeCamera | null = null;
let initialCameraFov: number | null = null;

let isInCustomSequence = false;
let activeCustomLabel: string | null = null;
let activeMenu: string | null = null;
const previouslyHiddenNodes = new Set<string>();

interface TransformState {
  position: BABYLON.Vector3;
  rotation: BABYLON.Vector3;
  scaling: BABYLON.Vector3;
}

let initialTransform: TransformState | null = null;

export function setActiveMenuForTransforms(menu: string | null) {
  activeMenu = menu;
}

export function setupMovementControls(scene: BABYLON.Scene, camera?: BABYLON.FreeCamera) {
  modelRoot = scene.getTransformNodeByName("ModelRoot");
  if (!modelRoot) return;
  activeCamera = camera ?? null;
  if (camera && initialCameraFov === null) {
    initialCameraFov = camera.fov;
  }

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

    const isSubmenu = Object.values(submenuData).some((sub) => Object.keys(sub).includes(label));
    const settings = getTransformSetting(activeMenu, label);
    if (!settings) {
      console.warn(`⚠️ Nessuna impostazione trovata per ${activeMenu ?? "<root>"} > ${label}`);
      return;
    }

    const isCustomSequence = typedSubmenuData[activeMenu ?? ""]?.isCustomSequence === true;

    if (isInCustomSequence && activeCustomLabel && activeCustomLabel !== label) {
      await handleExitSequence(
        modelRoot.getScene(),
        activeCamera!,
        modelRoot,
        activeCustomLabel,
        initialCameraFov!,
        previouslyHiddenNodes,
        (lbl) => getTransformSetting(activeMenu, lbl)
      );
      isInCustomSequence = false;
      activeCustomLabel = null;
    }

    animationCycle++;

    if (isCustomSequence) {
      isInCustomSequence = true;
      activeCustomLabel = label;

      const steps = Array.isArray(settings.intermediate) ? settings.intermediate : [];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await handleInterpolatedTransform(modelRoot, modelRoot.getScene(), step, activeCamera ?? undefined);
        if (i === 0 && settings.hiddenNodes?.length) {
          await handleCustomSequenceMidStep(modelRoot, modelRoot.getScene(), settings, previouslyHiddenNodes);
        }
      }

      await handleInterpolatedTransform(modelRoot, modelRoot.getScene(), settings, activeCamera ?? undefined);
      return;
    }

    if (isSubmenu) {
      const step = {
        position: settings.position,
        rotation: settings.rotation,
        scaling: settings.scaling,
        durationScale: 1.0,
        durationPosRot: 1.5,
      };
      await handleInterpolatedTransform(modelRoot, modelRoot.getScene(), step, activeCamera ?? undefined);
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
