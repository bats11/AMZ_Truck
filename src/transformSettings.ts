import * as BABYLON from "@babylonjs/core";

export interface TransformSetting {
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  scaling?: BABYLON.Vector3;
}

export const transformSettings: Record<string, TransformSetting> = {
  "FRONT SIDE": {
    position: new BABYLON.Vector3(0, 1.5, 0),
    rotation: new BABYLON.Vector3(0, Math.PI / 2, 0),
    scaling: new BABYLON.Vector3(2.5, 2.5, 2.5),
  },
  "DRIVER SIDE": { rotation: new BABYLON.Vector3(0, Math.PI, 0) },
  "BACK SIDE": { rotation: new BABYLON.Vector3(0, 3 * Math.PI / 2, 0) },
  "PASSENGER SIDE": { 
    position: new BABYLON.Vector3(0, 3, 0),
    rotation: new BABYLON.Vector3(0, 0, 0),
    scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
  },
  "IN CAB": { rotation: new BABYLON.Vector3(0, 0, 0) },
};