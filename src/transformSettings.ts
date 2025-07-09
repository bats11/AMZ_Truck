// src/transformSettings.ts
import * as BABYLON from "@babylonjs/core";

// Interfaccia pubblica per le impostazioni di trasformazione
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
}

// Utility per convertire gradi in radianti
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

// Tipo raw per le voci in input
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
}

// Impostazioni grezze
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
        rotation: [0, -90, 6],
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
    ]
  }
};

// Conversione raw → finale
export const transformSettings: Record<string, TransformSetting> = Object.fromEntries(
  Object.entries(transformSettingsRaw).map(([key, raw]) => {
    const setting: TransformSetting = {
      position: raw.position,
      rotation: vec3DegToRad(raw.rotation),
      scaling: raw.scaling,
    };

    if (raw.intermediate && Array.isArray(raw.intermediate)) {
      setting.intermediate = raw.intermediate.map((step) => ({
        position: step.position,
        rotation: step.rotation ? vec3DegToRad(step.rotation) : undefined,
        scaling: step.scaling,
        durationScale: step.durationScale,
        durationPosRot: step.durationPosRot,
      }));
    }

    if (raw.exitIntermediate && Array.isArray(raw.exitIntermediate)) {
      setting.exitIntermediate = raw.exitIntermediate.map((step) => ({
        position: step.position,
        rotation: step.rotation ? vec3DegToRad(step.rotation) : undefined,
        scaling: step.scaling,
        durationScale: step.durationScale,
        durationPosRot: step.durationPosRot,
      }));
    }

    return [key, setting];
  })
);
