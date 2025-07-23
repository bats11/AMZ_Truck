// src/data/bagOffsets.ts
import * as BABYLON from "@babylonjs/core";

// Preset manuale per 9 bag (3x3)
export const BAG_OFFSET_PRESET: BABYLON.Vector3[] = [
  new BABYLON.Vector3(0.6456, 0.3873, 0),
  new BABYLON.Vector3(0,       0.3873, 0),
  new BABYLON.Vector3(-0.6456,  0.3873, 0),

  new BABYLON.Vector3(0.6456, 1.1604, 0),
  new BABYLON.Vector3(0,       1.1604, 0),
  new BABYLON.Vector3(-0.6456,  1.1604, 0),

  new BABYLON.Vector3(0.6456, 1.934,  0),
  new BABYLON.Vector3(0,       1.934,  0),
  new BABYLON.Vector3(-0.6456,  1.934,  0),
];

export const BAG_OFFSET_PRESET_LAST: BABYLON.Vector3[] = [
  new BABYLON.Vector3(-0.6456, 0.3873, 0),
  new BABYLON.Vector3(-0.6456, 1.1604, 0),
  new BABYLON.Vector3(-0.6456, 1.934, 0),
];