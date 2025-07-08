import * as BABYLON from "@babylonjs/core";

export interface TransformSetting {
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  scaling?: BABYLON.Vector3;
}

// Utility per convertire gradi in radianti
function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}
function vec3DegToRad(arr: [number, number, number]) {
  return new BABYLON.Vector3(
    degToRad(arr[0]),
    degToRad(arr[1]),
    degToRad(arr[2])
  );
}

const transformSettingsRaw = {
  "FRONT SIDE": {
    position: new BABYLON.Vector3(0, 2.5, 0),
    rotation: [0, 90, 0],
    scaling: new BABYLON.Vector3(2.3, 2.3, 2.3),
  },
  "DRIVER SIDE": {
    position: new BABYLON.Vector3(0, 4, 0),
    rotation: [0, 180, 0],
    scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
  },
  "BACK SIDE": {
    position: new BABYLON.Vector3(0, 2.5, 0),
    rotation: [0, -90, 0],
    scaling: new BABYLON.Vector3(2.3, 2.3, 2.3),
  },
  "PASSENGER SIDE": {
    position: new BABYLON.Vector3(0, 4, 0),
    rotation: [0, 0, 0],
    scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
  },
  "IN CAB": {
    position: new BABYLON.Vector3(0.5, 0, -28),
    rotation: [0, -90, 7],
    scaling: new BABYLON.Vector3(2.3, 2.3, 2.3),
  },
} as const;

// Conversione in oggetti con rotazione in radianti
export const transformSettings: Record<string, TransformSetting> = Object.fromEntries(
  Object.entries(transformSettingsRaw).map(([key, value]) => [
    key,
    {
      ...value,
      rotation: value.rotation
        ? vec3DegToRad(value.rotation as [number, number, number])
        : undefined,
    },
  ])
);