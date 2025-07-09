// src/transformSettings.ts
import * as BABYLON from "@babylonjs/core";

// Interfaccia pubblica per le impostazioni di trasformazione,
// con un solo punto intermedio opzionale
export interface TransformSetting {
  position: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  scaling?: BABYLON.Vector3;
  intermediate?: {
    position?: BABYLON.Vector3;
    rotation?: BABYLON.Vector3;
    scaling?: BABYLON.Vector3;
  };
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

// Tipo raw per le voci in input (rotazioni in gradi, optional intermediate singolo)
interface RawTransformSetting {
  position: BABYLON.Vector3;
  rotation: [number, number, number];
  scaling: BABYLON.Vector3;
  intermediate?: {
    position?: BABYLON.Vector3;
    rotation?: [number, number, number];
    scaling?: BABYLON.Vector3;
  };
}

// Definizione “raw” delle impostazioni.
// Su “IN CAB” abbiamo un solo punto intermedio, poi il final transform.
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
    // punto finale “storico”
    position: new BABYLON.Vector3(0.5, 0, -28),
    rotation: [0, -90, 7],
    scaling: new BABYLON.Vector3(2.3, 2.3, 2.3),
    // UN SOLO punto intermedio
    intermediate: {
      position: new BABYLON.Vector3(0, 1, -14),
      rotation: [0, -45, 3],
      scaling: new BABYLON.Vector3(1.5, 1.5, 1.5),
    },
  },
};

// Mappatura finale: converte le rotazioni da gradi → radianti,
// mantiene position e scaling, e processa l’intermediate se presente.
export const transformSettings: Record<string, TransformSetting> = Object.fromEntries(
  Object.entries(transformSettingsRaw).map(([key, raw]) => {
    const setting: TransformSetting = {
      position: raw.position,
      rotation: vec3DegToRad(raw.rotation),
      scaling: raw.scaling,
    };

    if (raw.intermediate) {
      setting.intermediate = {
        position: raw.intermediate.position,
        rotation: raw.intermediate.rotation
          ? vec3DegToRad(raw.intermediate.rotation)
          : undefined,
        scaling: raw.intermediate.scaling,
      };
    }

    return [key, setting];
  })
);
