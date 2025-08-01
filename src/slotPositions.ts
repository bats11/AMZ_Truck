// src/data/slotPositions.ts
import * as BABYLON from "@babylonjs/core";

export interface SlotTransform {
  position: BABYLON.Vector3;
  rotation: BABYLON.Vector3;
}

const DEFAULT_ROTATION = new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(0), 0);

const EXTRA_DEFAULT_ROTATION = new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(0), 0);

export const BAG_SLOT_TRANSFORMS_LEFT: SlotTransform[] = [
  { position: new BABYLON.Vector3(0.65, 0.1727, 0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(0.65, -0.45, 0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-0.05, 0.1727, 0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-0.05, -0.45, 0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-0.75, 0.1727, 0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-0.75, -0.45, 0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-1.45, 0.1727, 0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-1.45, -0.45, 0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-2.15, 0.1727, 0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-2.15, -0.45, 0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-2.85, 0.1727, 0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-2.85, -0.45, 0.7554), rotation: DEFAULT_ROTATION },
];

export const BAG_SLOT_TRANSFORMS_RIGHT: SlotTransform[] = [
  { position: new BABYLON.Vector3(0.65, 0.1727, -0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(0.65, -0.45, -0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-0.05, 0.1727, -0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-0.05, -0.45, -0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-0.75, 0.1727, -0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-0.75, -0.45, -0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-1.45, 0.1727, -0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-1.45, -0.45, -0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-2.15, 0.1727, -0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-2.15, -0.45, -0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-2.85, 0.1727, -0.7554), rotation: DEFAULT_ROTATION },
  { position: new BABYLON.Vector3(-2.85, -0.45, -0.7554), rotation: DEFAULT_ROTATION },
];

export const EXTRA_SLOT_TRANSFORMS: Record<8 | 9, SlotTransform[]> = {
  8: [
    { position: new BABYLON.Vector3(-2.15, -0.45, -0.7554), rotation: EXTRA_DEFAULT_ROTATION },
    { position: new BABYLON.Vector3(-2.45, -0.45, -0.7554), rotation: EXTRA_DEFAULT_ROTATION },
    { position: new BABYLON.Vector3(-2.75, -0.45, -0.7554), rotation: EXTRA_DEFAULT_ROTATION },
  ],
  9: [
    { position: new BABYLON.Vector3(-2.15, 0.1727, -0.7554), rotation: DEFAULT_ROTATION },
    { position: new BABYLON.Vector3(-2.45, 0.1727, -0.7554), rotation: DEFAULT_ROTATION },
    { position: new BABYLON.Vector3(-2.75, 0.1727, -0.7554), rotation: DEFAULT_ROTATION },
  ],
};
