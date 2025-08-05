// src/logic/transformHandlers.ts
import * as BABYLON from "@babylonjs/core";
import { createAnimation } from "../src/utils";
import { TransformSetting } from "../src/transformSettings";
import { setUiInteractivity } from "../src/babylonBridge";

function createQuaternionAnimation(
  from: BABYLON.Quaternion,
  to: BABYLON.Quaternion,
  frameStart: number,
  frameEnd: number,
  easing: BABYLON.EasingFunction
): BABYLON.Animation {
  const animation = new BABYLON.Animation(
    "rotationQuaternionAnim",
    "rotationQuaternion",
    60,
    BABYLON.Animation.ANIMATIONTYPE_QUATERNION
  );

  animation.setKeys([
    { frame: frameStart, value: from },
    { frame: frameEnd, value: to },
  ]);
  animation.setEasingFunction(easing);
  return animation;
}

export async function handleInterpolatedTransform(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  step: {
    position?: BABYLON.Vector3;
    rotation?: BABYLON.Vector3;
    scaling?: BABYLON.Vector3;
    durationScale?: number;
    durationPosRot?: number;
    finalCameraFov?: number;
    durationCameraFov?: number;
    triggerFovAdjust?: boolean;
    environmentIntensity?: number;
  },
  camera?: BABYLON.FreeCamera
): Promise<void> {
  const frameRate = 60;
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const scaleFrames = Math.ceil((step.durationScale ?? 1.0) * frameRate);
  const moveFrames = Math.ceil((step.durationPosRot ?? 2.0) * frameRate);

  if (step.scaling) {
    const scaleAnim = createAnimation("scaling", node.scaling.clone(), step.scaling.clone(), 0, scaleFrames, easing);
    scene.beginDirectAnimation(node, [scaleAnim], 0, scaleFrames, false, 1.0);
  }

  const posRotAnims: BABYLON.Animation[] = [];

  if (step.position) {
    posRotAnims.push(createAnimation("position", node.position.clone(), step.position.clone(), 0, moveFrames, easing));
  }

  if (step.rotation) {
    const currentQ =
      node.rotationQuaternion?.clone() ??
      BABYLON.Quaternion.FromEulerVector(node.rotation.clone());

    const targetQ = BABYLON.Quaternion.FromEulerVector(step.rotation.clone());

    node.rotationQuaternion = currentQ;
    posRotAnims.push(createQuaternionAnimation(currentQ, targetQ, 0, moveFrames, easing));
  }

  if (
    camera &&
    typeof step.finalCameraFov === "number" &&
    "triggerFovAdjust" in step &&
    step.triggerFovAdjust === true
  ) {
    const fovFrames = Math.ceil((step.durationCameraFov ?? 1.5) * frameRate);
    const fovAnim = createAnimation("fov", camera.fov, step.finalCameraFov, 0, fovFrames, easing);
    scene.beginDirectAnimation(camera, [fovAnim], 0, fovFrames, false, 1.0);
  }

  if (typeof step.environmentIntensity === "number") {
    if (!scene.metadata) scene.metadata = {};

    if (scene.metadata._originalEnvIntensity === undefined) {
      scene.metadata._originalEnvIntensity = scene.environmentIntensity;
      console.log("🔁 Salvato valore originale environmentIntensity:", scene.environmentIntensity);
    }

    const envAnim = createAnimation(
      "environmentIntensity",
      scene.environmentIntensity,
      step.environmentIntensity,
      0,
      moveFrames,
      easing
    );
    scene.beginDirectAnimation(scene, [envAnim], 0, moveFrames, false, 1.0);
  }

  if (posRotAnims.length > 0) {
    await new Promise<void>((resolve) => {
      scene.beginDirectAnimation(node, posRotAnims, 0, moveFrames, false, 1.0, resolve);
    });
  }
}

export async function handleExitSequence(
  scene: BABYLON.Scene,
  camera: BABYLON.FreeCamera,
  modelRoot: BABYLON.TransformNode,
  fromLabel: string,
  initialCameraFov: number,
  previouslyHiddenNodes: Set<string>,
  getTransformSetting: (label: string) => TransformSetting | undefined
): Promise<void> {
  setUiInteractivity(true); // ✅ BLOCCA UI

  try {
    const settings = getTransformSetting(fromLabel);

    const hasExitSteps = Array.isArray(settings?.exitIntermediate) && settings.exitIntermediate.length > 0;

    // ✅ Ripristina subito environmentIntensity (PRIMA di qualsiasi animazione)
    const original = scene.metadata?._originalEnvIntensity;
    if (typeof original === "number" && scene.environmentIntensity !== original) {
      const envAnim = createAnimation(
        "environmentIntensity",
        scene.environmentIntensity,
        original,
        0,
        60,
        new BABYLON.CubicEase()
      );
      scene.beginDirectAnimation(scene, [envAnim], 0, 60, false);
      console.log("🔁 Ripristino environmentIntensity IMMEDIATO:", original);
    }

    if (camera.fov !== initialCameraFov) {
      const easing = new BABYLON.CubicEase();
      easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
      const frameRate = 60;
      const frames = 60;

      const fovAnim = createAnimation("fov", camera.fov, initialCameraFov, 0, frames, easing);
      scene.beginDirectAnimation(camera, [fovAnim], 0, frames, false);
    }

    if (hasExitSteps) {
      for (const step of settings!.exitIntermediate!) {
        await handleInterpolatedTransform(modelRoot, scene, step, camera);
      }
    } else if (settings?.sequenceStartTransform) {
      await handleInterpolatedTransform(modelRoot, scene, settings.sequenceStartTransform, camera);
    }

    // 🔁 Fade-in delle mesh precedentemente nascoste
    for (const name of previouslyHiddenNodes) {
      const node = scene.getNodeByName(name);
      if (node && node instanceof BABYLON.AbstractMesh) {
        BABYLON.Animation.CreateAndStartAnimation(
          `fadeIn_${name}`,
          node,
          "visibility",
          60,
          30,
          node.visibility,
          1,
          BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
      }
    }

    previouslyHiddenNodes.clear();

  } finally {
    setUiInteractivity(false); // ✅ SBLOCCA UI
  }
}
