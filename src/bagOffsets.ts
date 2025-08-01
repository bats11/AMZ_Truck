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

export const BAG_EXTRA_OFFSETS: BABYLON.Vector3[] = [
  new BABYLON.Vector3(0.5414, 0.2, -0.6),
  new BABYLON.Vector3(0.24223 , 0.2, -0.6),
  new BABYLON.Vector3(-0.057, 0.2, -0.6),
  new BABYLON.Vector3(0.5414, 0.45, -0.6),
  new BABYLON.Vector3(0.24223, 0.45, -0.6),
  new BABYLON.Vector3(-0.057, 0.45, -0.6),
];