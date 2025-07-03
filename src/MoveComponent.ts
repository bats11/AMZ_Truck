// src/MoveComponent.ts
import * as BABYLON from "@babylonjs/core";
import { playEntryAnimation } from "./entryAnimation";
import { setupMovementHandler } from "./movementHandler";
import { animateTransformTo } from "./utils";
import { TransformState, modelRoot, setModelRoot, initialTransform, setInitialTransform } from "./modelState";

export function setupMovementControls(scene: BABYLON.Scene) {
  const node = scene.getTransformNodeByName("ModelRoot");
  if (!node) return;

  setModelRoot(node);

  const neutralTransform: TransformState = {
    position: new BABYLON.Vector3(0, 1, 0),
    rotation: new BABYLON.Vector3(0, 0, 0),
    scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
  };

  setInitialTransform(neutralTransform);

  // Stato iniziale visivo del modello prima dell’apparizione
  node.position = new BABYLON.Vector3(0, 3, 0);
  node.rotation = new BABYLON.Vector3(0, Math.PI * 2, 0);
  node.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);

  setTimeout(() => {
    playEntryAnimation(scene);
  }, 500);

  setupMovementHandler(scene);
}

export function resetModelTransform() {
  if (modelRoot && initialTransform) {
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
