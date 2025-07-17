// src/MoveComponent.ts
import * as BABYLON from "@babylonjs/core";
import { setMoveCameraTo, setUiInteractivity } from "./babylonBridge";
import { getTransformSetting, transformSettings } from "./transformSettings";
import submenuData from "./data/SubmenuData.json";
import {
  handleClassicTransform,
  handleInterpolatedTransform,
  handleExitSequence,
} from "./transformHandlers";
import { handleHideMeshes } from "./hideMeshes";
import { handleAnimatedMeshes } from "./animatedMeshes";
import { handleExitAnimations } from "./animatedMeshes";
import { playEntryAnimation } from "./entryAnimation";
import { resetDamageVisibility, showDamageMeshes } from "./damageManager";

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

  setMoveCameraTo(async (
    label: string,
    opts?: { bypassBigToBig?: boolean; bypassCustomSequence?: boolean }
  ) => {
    if (!modelRoot) return;

    const isSubmenu = Object.values(submenuData).some((sub) => Object.keys(sub).includes(label));
    const settings = getTransformSetting(activeMenu ?? "", label);
    if (!settings) {
      console.warn(`⚠️ Nessuna impostazione trovata per ${activeMenu ?? "<root>"} > ${label}`);
      return;
    }

    const isCustomSequence = typedSubmenuData[activeMenu ?? ""]?.isCustomSequence === true;
    const isMainMenuTarget = transformSettings[label]?.settings !== undefined;
    const isSwitchingToAnotherMainMenu = isMainMenuTarget && activeCustomLabel !== label;

    const scene = modelRoot.getScene();
    resetDamageVisibility(scene);

    if (isInCustomSequence && isSwitchingToAnotherMainMenu) {
      await handleExitSequence(
        scene,
        activeCamera!,
        modelRoot,
        activeCustomLabel!,
        initialCameraFov!,
        previouslyHiddenNodes,
        (lbl) => transformSettings[lbl]?.settings
      );
      handleExitAnimations(scene);
      isInCustomSequence = false;
      activeCustomLabel = null;
    }

    animationCycle++;

    const runSequence = async (
      intermediateSteps: any[],
      finalTransform: any,
      settings: any
    ) => {
      setUiInteractivity(true);

      if (settings.sequenceStartTransform) {
        await handleInterpolatedTransform(modelRoot!, scene, settings.sequenceStartTransform, activeCamera ?? undefined);

        if (settings.sequenceStartTransform.triggerDamage && settings.sequenceStartTransform.damageNodes?.length) {
          showDamageMeshes(scene, settings.sequenceStartTransform.damageNodes);
        }

        if (
          settings.sequenceStartTransform.hideMeshes &&
          settings.hiddenNodes?.length
        ) {
          await handleHideMeshes(modelRoot!, scene, settings, previouslyHiddenNodes);
        }

        if (settings.sequenceStartTransform.animateMeshes) {
          await handleAnimatedMeshes(modelRoot!, scene, settings.sequenceStartTransform);
        }

        if (
          settings.sequenceStartTransform.triggerFovAdjust &&
          activeCamera &&
          typeof settings.finalCameraFov === "number"
        ) {
          const fovStep = {
            finalCameraFov: settings.finalCameraFov,
            durationCameraFov: settings.durationCameraFov ?? 1.5,
            triggerFovAdjust: true,
          };
          await handleInterpolatedTransform(modelRoot!, scene, fovStep, activeCamera);
        }
      }

      for (const step of intermediateSteps) {
        await handleInterpolatedTransform(modelRoot!, scene, step, activeCamera ?? undefined);

        if (step.triggerDamage && step.damageNodes?.length) {
          showDamageMeshes(scene, step.damageNodes);
        }

        if (step.hideMeshes && settings.hiddenNodes?.length) {
          await handleHideMeshes(modelRoot!, scene, settings, previouslyHiddenNodes);
        }

        if (step.animateMeshes) {
          await handleAnimatedMeshes(modelRoot!, scene, step);
        }

        if (step.triggerFovAdjust && activeCamera && settings.finalCameraFov !== undefined) {
          const fovStep = {
            finalCameraFov: settings.finalCameraFov,
            durationCameraFov: settings.durationCameraFov ?? 1.5,
          };
          await handleInterpolatedTransform(modelRoot!, scene, fovStep, activeCamera);
        }
      }

      await handleInterpolatedTransform(modelRoot!, scene, finalTransform, activeCamera ?? undefined);

      if (finalTransform.triggerDamage && finalTransform.damageNodes?.length) {
        showDamageMeshes(scene, finalTransform.damageNodes);
      }

      if (finalTransform.triggerFovAdjust && activeCamera && settings.finalCameraFov !== undefined) {
        const fovStep = {
          finalCameraFov: settings.finalCameraFov,
          durationCameraFov: settings.durationCameraFov ?? 1.5,
        };
        await handleInterpolatedTransform(modelRoot!, scene, fovStep, activeCamera);
      }

      setUiInteractivity(false);
    };

    if (!isSubmenu) {
      const currentScaleSq = modelRoot.scaling.lengthSquared();
      const targetScaleSq = settings.scaling ? settings.scaling.lengthSquared() : currentScaleSq;
      const isBigToBig = currentScaleSq > 5.0 && targetScaleSq > 5.0;

      if (isBigToBig && !opts?.bypassBigToBig) {
        isInCustomSequence = true;
        activeCustomLabel = label;

        const steps = Array.isArray(settings.intermediate) ? settings.intermediate : [];
        await runSequence(steps, settings, settings);
        return;
      }
    }

    if (isCustomSequence && isMainMenuTarget && !opts?.bypassCustomSequence) {
      isInCustomSequence = true;
      activeCustomLabel = label;

      const steps = Array.isArray(settings.intermediate) ? settings.intermediate : [];
      await runSequence(steps, settings, settings);
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

      await handleInterpolatedTransform(modelRoot, scene, step, activeCamera ?? undefined);

      if (settings.triggerDamage && settings.damageNodes?.length) {
        showDamageMeshes(scene, settings.damageNodes);
      }
    } else {
      await handleClassicTransform(modelRoot, settings);

      if (settings.triggerDamage && settings.damageNodes?.length) {
        showDamageMeshes(scene, settings.damageNodes);
      }
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
