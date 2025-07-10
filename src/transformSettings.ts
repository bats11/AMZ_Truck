// transformSettings.ts — ristrutturato con struttura gerarchica
import * as BABYLON from "@babylonjs/core";

export interface TransformSetting {
  position: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  scaling?: BABYLON.Vector3;
  intermediate?: {
    position?: BABYLON.Vector3;
    rotation?: BABYLON.Vector3;
    scaling?: BABYLON.Vector3;
    durationScale?: number;
    durationPosRot?: number;
  }[];
  exitIntermediate?: {
    position?: BABYLON.Vector3;
    rotation?: BABYLON.Vector3;
    scaling?: BABYLON.Vector3;
    durationScale?: number;
    durationPosRot?: number;
  }[];
  hiddenNodes?: string[];
  finalCameraFov?: number;
  durationCameraFov?: number;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function vec3DegToRad(arr: [number, number, number]): BABYLON.Vector3 {
  return new BABYLON.Vector3(
    degToRad(arr[0]),
    degToRad(arr[1]),
    degToRad(arr[2])
  );
}

export const transformSettings: Record<string, { settings?: TransformSetting; [subKey: string]: TransformSetting | undefined }> = {
  "FRONT SIDE": {
    settings: {
      position: new BABYLON.Vector3(0, 2.5, 0),
      rotation: vec3DegToRad([0, 90, 0]),
      scaling: new BABYLON.Vector3(2.3, 2.3, 2.3),
    },
    "Lights & Light Covers": {
      position: new BABYLON.Vector3(-1.5, 2.5, -15),
      rotation: vec3DegToRad([0, 90, 0]),
      scaling: new BABYLON.Vector3(2.3, 2.3, 2.3),
    },
    "Suspension & Exhaust System": {
      position: new BABYLON.Vector3(0, 2.5, -5),
      rotation: vec3DegToRad([0, 90, 0]),
      scaling: new BABYLON.Vector3(2.3, 2.3, 2.3),
    },
    "Electric Vehicle (EV)": {
      position: new BABYLON.Vector3(0, 2.5, -5),
      rotation: vec3DegToRad([0, 90, 0]),
      scaling: new BABYLON.Vector3(2.3, 2.3, 2.3),
    },
    "Body & Doors": {
      position: new BABYLON.Vector3(0, 2.5, -7),
      rotation: vec3DegToRad([0, 90, 0]),
      scaling: new BABYLON.Vector3(2.3, 2.3, 2.3),
    },
  },

  "IN CAB": {
    settings: {
      position: new BABYLON.Vector3(0.6, 0, -30.5),
      rotation: vec3DegToRad([0, -92, 15]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
      intermediate: [
        {
          position: new BABYLON.Vector3(0, 1, -14),
          rotation: vec3DegToRad([0, -90, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          durationScale: 1.0,
          durationPosRot: 2.0,
        },
        {
          position: new BABYLON.Vector3(0, 0, -30.5),
          rotation: vec3DegToRad([0, -90, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          durationScale: 1.0,
          durationPosRot: 2.0,
        },
      ],
      exitIntermediate: [
        {
          position: new BABYLON.Vector3(0, 4, 0),
          rotation: vec3DegToRad([0, 0, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          durationScale: 1.0,
          durationPosRot: 2,
        },
      ],
      hiddenNodes: ["SM_Driver_Seat_01a.001"],
      finalCameraFov: BABYLON.Tools.ToRadians(60),
      durationCameraFov: 2,
    },
    "Body & Doors": {
      position: new BABYLON.Vector3(-1.5, 1.5, -30),
      rotation: vec3DegToRad([0, -100, 0]),
      scaling: new BABYLON.Vector3(1.2, 1.2, 1.2),
    },
    "Brakes": {
      position: new BABYLON.Vector3(0, 1.2, -28),
      rotation: vec3DegToRad([0, -100, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
    },
  },

  "DRIVER SIDE": {
    settings: {
      position: new BABYLON.Vector3(0, 4, 0),
      rotation: vec3DegToRad([0, 180, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
    },
  },

  "BACK SIDE": {
    settings: {
      position: new BABYLON.Vector3(0, 2.5, 0),
      rotation: vec3DegToRad([0, -90, 0]),
      scaling: new BABYLON.Vector3(2.3, 2.3, 2.3),
    },
  },

  "PASSENGER SIDE": {
    settings: {
      position: new BABYLON.Vector3(0, 4, 0),
      rotation: vec3DegToRad([0, 0, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
    },
  },
};
