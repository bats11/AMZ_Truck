// src/modelState.ts
import * as BABYLON from "@babylonjs/core";

export let modelRoot: BABYLON.TransformNode | null = null;

export interface TransformState {
  position: BABYLON.Vector3;
  rotation: BABYLON.Vector3;
  scaling: BABYLON.Vector3;
}

export let initialTransform: TransformState | null = null;

export function setModelRoot(node: BABYLON.TransformNode) {
  modelRoot = node;
}

export function setInitialTransform(state: TransformState) {
  initialTransform = state;
}
