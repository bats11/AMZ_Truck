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
  finalCameraFov?: number;        // 👈 nuovo
  durationCameraFov?: number;     // 👈 nuovo
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

interface RawTransformSetting {
  position: BABYLON.Vector3;
  rotation: [number, number, number];
  scaling: BABYLON.Vector3;
  intermediate?: {
    position?: BABYLON.Vector3;
    rotation?: [number, number, number];
    scaling?: BABYLON.Vector3;
    durationScale?: number;
    durationPosRot?: number;
  }[];
  exitIntermediate?: {
    position?: BABYLON.Vector3;
    rotation?: [number, number, number];
    scaling?: BABYLON.Vector3;
    durationScale?: number;
    durationPosRot?: number;
  }[];
  hiddenNodes?: string[];
  finalCameraFov?: number;
  durationCameraFov?: number;
}

const transformSettingsRaw: Record<string, RawTransformSetting> = {
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
    position: new BABYLON.Vector3(0.6, 0, -30.5),
    rotation: [0, -92, 15],
    scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
    intermediate: [
      {
        position: new BABYLON.Vector3(-1.8, 1, -14),
        rotation: [0, 0, 0],
        scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
        durationScale: 1.0,
        durationPosRot: 2.0,
      },
      {
        position: new BABYLON.Vector3(-1.8, 0, -30),
        rotation: [0, 0, 0],
        scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
        durationScale: 1.0,
        durationPosRot: 2.0,
      }
    ],
    exitIntermediate: [
      {
        position: new BABYLON.Vector3(0, 4, 0),
        rotation: [0, 0, 0],
        scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
        durationScale: 1.0,
        durationPosRot: 2,
      }
    ],
    hiddenNodes: ["SM_Driver_Seat_01a.001"],
    finalCameraFov: BABYLON.Tools.ToRadians(55),
    durationCameraFov: 3.5
  }
};

export const transformSettings: Record<string, TransformSetting> = Object.fromEntries(
  Object.entries(transformSettingsRaw).map(([key, raw]) => {
    const setting: TransformSetting = {
      position: raw.position,
      rotation: vec3DegToRad(raw.rotation),
      scaling: raw.scaling,
    };

    if (raw.intermediate) {
      setting.intermediate = raw.intermediate.map((step) => ({
        position: step.position,
        rotation: step.rotation ? vec3DegToRad(step.rotation) : undefined,
        scaling: step.scaling,
        durationScale: step.durationScale,
        durationPosRot: step.durationPosRot,
      }));
    }

    if (raw.exitIntermediate) {
      setting.exitIntermediate = raw.exitIntermediate.map((step) => ({
        position: step.position,
        rotation: step.rotation ? vec3DegToRad(step.rotation) : undefined,
        scaling: step.scaling,
        durationScale: step.durationScale,
        durationPosRot: step.durationPosRot,
      }));
    }

    if (raw.hiddenNodes) {
      setting.hiddenNodes = raw.hiddenNodes;
    }

    if (raw.finalCameraFov) {
      setting.finalCameraFov = raw.finalCameraFov;
    }
    if (raw.durationCameraFov) {
      setting.durationCameraFov = raw.durationCameraFov;
    }

    return [key, setting];
  })
);
