// src/data/bagOffsets.ts
import * as BABYLON from "@babylonjs/core";

// Preset manuale per 9 bag (3x3)
export const BAG_OFFSET_PRESET: BABYLON.Vector3[] = [
  new BABYLON.Vector3(0.465, 0.436, -0.43),
  new BABYLON.Vector3(0,       0.436, -0.43),
  new BABYLON.Vector3(-0.465,  0.436, -0.43),

  new BABYLON.Vector3(0.465, 1.0112, -0.43),
  new BABYLON.Vector3(0,       1.0112, -0.43),
  new BABYLON.Vector3(-0.465,  1.0112, -0.43),

  new BABYLON.Vector3(0.465, 1.586, -0.43),
  new BABYLON.Vector3(0,       1.586, -0.43),
  new BABYLON.Vector3(-0.465,  1.586, -0.43),
];

export const BAG_OFFSET_PRESET_LAST: BABYLON.Vector3[] = [
  new BABYLON.Vector3(-0.465, 0.436, -0.43),
  new BABYLON.Vector3(-0.465, 1.0112, -0.43),
  new BABYLON.Vector3(-0.465, 1.586, -0.43),
];