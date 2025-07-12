// src/logic/transformHandlers.ts
import * as BABYLON from "@babylonjs/core";
import { animateTransformTo, createAnimation } from "../src/utils";
import { TransformSetting } from "../src/transformSettings";

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

export async function handleClassicTransform(
  node: BABYLON.TransformNode,
  settings: TransformSetting
) {
  await animateTransformTo(
    node,
    {
      position: settings.position,
      rotation: settings.rotation,
      scaling: settings.scaling,
    },
    {
      durationPosRot: settings.durationPosRot,
      durationScale: settings.durationScale,
    }
  );
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

  if (camera && typeof step.finalCameraFov === "number") {
    const fovFrames = Math.ceil((step.durationCameraFov ?? 1.5) * frameRate);
    const fovAnim = createAnimation("fov", camera.fov, step.finalCameraFov, 0, fovFrames, easing);
    scene.beginDirectAnimation(camera, [fovAnim], 0, fovFrames, false, 1.0);
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
  const settings = getTransformSetting(fromLabel);
  const steps = settings?.exitIntermediate ?? [];

  if (camera.fov !== initialCameraFov) {
    const easing = new BABYLON.CubicEase();
    easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    const frameRate = 60;
    const frames = 60;

    const fovAnim = createAnimation("fov", camera.fov, initialCameraFov, 0, frames, easing);
    scene.beginDirectAnimation(camera, [fovAnim], 0, frames, false);
  }

  for (const step of steps) {
    await handleInterpolatedTransform(modelRoot, scene, step, camera);
  }

  for (const name of previouslyHiddenNodes) {
    const node = scene.getNodeByName(name);
    if (node && node instanceof BABYLON.AbstractMesh) {
      node.isVisible = true;
    }
  }

  previouslyHiddenNodes.clear();
}
