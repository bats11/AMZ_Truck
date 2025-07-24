// transformSettings.ts — ristrutturato con struttura gerarchica
import * as BABYLON from "@babylonjs/core";
import { vec3DegToRad } from "./utils";


// transformSettings.ts

export interface TransformSetting {
  position: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  scaling?: BABYLON.Vector3;

  sequenceStartTransform?: {
    position?: BABYLON.Vector3;
    rotation?: BABYLON.Vector3;
    scaling?: BABYLON.Vector3;
    durationScale?: number;
    durationPosRot?: number;
    triggerFovAdjust?: boolean;
    hideMeshes?: boolean;
    animateMeshes?: boolean;
    animatedMeshGroups?: string[];
    triggerDamage?: boolean; 
    damageNodes?: string[];      
  };

  intermediate?: {
    position?: BABYLON.Vector3;
    rotation?: BABYLON.Vector3;
    scaling?: BABYLON.Vector3;
    durationScale?: number;
    durationPosRot?: number;
    hideMeshes?: boolean;
    triggerFovAdjust?: boolean;
    animateMeshes?: boolean;
    animatedMeshGroups?: string[];
    triggerDamage?: boolean;
    damageNodes?: string[];
  }[];

  exitIntermediate?: {
    position?: BABYLON.Vector3;
    rotation?: BABYLON.Vector3;
    scaling?: BABYLON.Vector3;
    durationScale?: number;
    durationPosRot?: number;
    animateMeshes?: boolean;
    animatedMeshGroups?: string[];
    triggerDamage?: boolean; 
    damageNodes?: string[];      
  }[];

  hiddenNodes?: string[];
  finalCameraFov?: number;
  durationCameraFov?: number;
  triggerFovAdjust?: boolean;
  animateMeshes?: boolean;
  animatedMeshGroups?: string[];

  durationScale?: number;
  durationPosRot?: number;
  hideMeshes?: boolean;
  triggerDamage?: boolean;
  damageNodes?: string[];        
}

export const transformSettings: Record<string, { settings?: TransformSetting; [subKey: string]: TransformSetting | undefined }> = {
  "FRONT SIDE": {
    settings: {
      position: new BABYLON.Vector3(1, 2.5, 0),
      rotation: vec3DegToRad([0, 100, -3]),
      scaling: new BABYLON.Vector3(1.9, 1.9, 1.9),
      durationScale: 1.0,
      durationPosRot: 1,
      intermediate: [
        {
          position: new BABYLON.Vector3(0, 2.5, 0),
          rotation: vec3DegToRad([0, 90, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          durationScale: 0.7,
          durationPosRot: 1.5,
        },
      ],
    },
    "Lights & Light Covers": {
      position: new BABYLON.Vector3(3.5, 2.5, -14),
      rotation: vec3DegToRad([0, 124.32, 0]),
      scaling: new BABYLON.Vector3(1.9, 1.9, 1.9)
    },
    "Suspension & Exhaust System": {
      position: new BABYLON.Vector3(0, 2.1, -8),
      rotation: vec3DegToRad([0, 90, -15]),
      scaling: new BABYLON.Vector3(1.9, 1.9, 1.9)
    },
    "Electric Vehicle (EV)": {
      position: new BABYLON.Vector3(4.3, 2.4, -20.5),
      rotation: vec3DegToRad([10, 155, -3.5]),
      scaling: new BABYLON.Vector3(1.9, 1.9, 1.9)
    },
    "Body & Doors": {
      position: new BABYLON.Vector3(-1.2, 1.35, -11.3),
      rotation: vec3DegToRad([0, 78, -2]),
      scaling: new BABYLON.Vector3(1.9, 1.9, 1.9)
    },
    },

  "IN CAB": {
    settings: {
      position: new BABYLON.Vector3(0.5, -0.5, -30.5),
      rotation: vec3DegToRad([0, 268, 15]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
      triggerFovAdjust: true,
      sequenceStartTransform: 
        {
          position: new BABYLON.Vector3(0, 1, -10),
          rotation: vec3DegToRad([0, 270, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          durationScale: 1.0,
          durationPosRot: 2.0,
          hideMeshes: true,
          animateMeshes: true,
          animatedMeshGroups: ["Back Door","Inside Door"],
        },
      intermediate: [
        {
          position: new BABYLON.Vector3(0, 0, -30.5),
          rotation: vec3DegToRad([0, 270, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          durationScale: 1.0,
          durationPosRot: 2.0,
        },
      ],
      exitIntermediate: [
        {
          position: new BABYLON.Vector3(0, 1, -10),
          rotation: vec3DegToRad([0, 270, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          durationScale: 1.0,
          durationPosRot: 2.0,
        },
      ],
      hiddenNodes: ["SM_Driver_Seat_Rear"],
      finalCameraFov: BABYLON.Tools.ToRadians(60),
      durationCameraFov: 2,
    },
     "Body & Doors": {
      position: new BABYLON.Vector3(1.5, -0.8, -29),
      rotation: vec3DegToRad([28, 197, 12]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "Brakes": {
      position: new BABYLON.Vector3(-0.9, 0.5, -31.2),
      rotation: vec3DegToRad([0, 303, 7]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "Wipers": {
      position: new BABYLON.Vector3(-2.2, 1.6, -27.5),
      rotation: vec3DegToRad([0.7, 31.8, -25.3]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },

    "Windshield": {
      position: new BABYLON.Vector3(0.6, 0, -30.5),
      rotation: vec3DegToRad([0, 258, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
    },
  },

  "DRIVER SIDE": {
    settings: {
      position: new BABYLON.Vector3(0, 3, 0),
      rotation: vec3DegToRad([7, 155, -4]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
    },
      "Back Tire, Wheel, & Rim": {
      position: new BABYLON.Vector3(-2.8, 1.3, -26),
      rotation: vec3DegToRad([4, 168, -3]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "Lights & Light Covers": {
      position: new BABYLON.Vector3(1.6, 1.2, -27),
      rotation: vec3DegToRad([6.5, 234, 11]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "Body & Doors": {
      position: new BABYLON.Vector3(-0.8, 1.27, -17),
      rotation: vec3DegToRad([0, 122, -5]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "Suspension & Exhaust System": {
        position: new BABYLON.Vector3(2.6, 1.5, -27),
        rotation: vec3DegToRad([15, 214.32, 5]),
        scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
        triggerDamage: true,
        damageNodes: ["Damage_OilPuddle","OilGound"],
      },
      /*"Suspension & Exhaust System": {
        position: new BABYLON.Vector3(0, 1.5, -20),
        rotation: vec3DegToRad([-30, 135, 0]),
        scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
      },*/
      "EV System": {
      position: new BABYLON.Vector3(3.4, 0.83, -27.6),
      rotation: vec3DegToRad([0, 191, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "Side Mirrors": {
      position: new BABYLON.Vector3(1.2, 0.7, -21),
      rotation: vec3DegToRad([8.5, 138, -6]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "Front Tire, Wheel, & Rim": {
      position: new BABYLON.Vector3(1.7, 1.3, -24.5),
      rotation: vec3DegToRad([2.8, 146, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },

  },

  "BACK SIDE": {
    settings: {
      position: new BABYLON.Vector3(-0.5, 2.2, 0),
      rotation: vec3DegToRad([0, 260, 0]),
      scaling: new BABYLON.Vector3(2, 2, 2),
      durationScale: 1.5,
      durationPosRot: 1.5,
      intermediate: [
        {
          position: new BABYLON.Vector3(0, 2.2, 0),
          rotation: vec3DegToRad([0, 250, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          durationScale: 0.7,
          durationPosRot: 1.5,
        },
      ],
    },
    "Lights & Light Covers": {
      position: new BABYLON.Vector3(1.92, 2.9, -7),
      rotation: vec3DegToRad([-3, 287, 15]),
      scaling: new BABYLON.Vector3(2, 2, 2)
    },
      "Body & Doors": {
      position: new BABYLON.Vector3(-5, 0, -15),
      rotation: vec3DegToRad([0, 219, 0]),
      scaling: new BABYLON.Vector3(2, 2, 2)
    },
      "License Plates & Tags": {
      position: new BABYLON.Vector3(-1, 5, -17),
      rotation: vec3DegToRad([2.2, 260, 23]),
      scaling: new BABYLON.Vector3(2, 2, 2)
    },
      "Suspension & Exhaust System": {
      position: new BABYLON.Vector3(1, 4.3, -10),
      rotation: vec3DegToRad([-1, 280, 6]),
      scaling: new BABYLON.Vector3(2, 2, 2)
    },
      "EV System": {
      position: new BABYLON.Vector3(1, 3.4, -10),
      rotation: vec3DegToRad([0, 252, 6]),
      scaling: new BABYLON.Vector3(2, 2, 2)
    },
  },

  "PASSENGER SIDE": {
    settings: {
      position: new BABYLON.Vector3(0, 3, 0),
      rotation: vec3DegToRad([-10, 35, -4]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
    },
        "Side Mirrors": {
          position: new BABYLON.Vector3(-0.3, 0, -22),
          rotation: vec3DegToRad([0, 60, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          triggerDamage: true,
          damageNodes: ["Damage_Duct"],
        },
        "Front Tire, Wheel, & Rim": {
      position: new BABYLON.Vector3(-1.4, 2.2, -24.7),
      rotation: vec3DegToRad([-12, 37, -12]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "Lights & Light Covers": {
      position: new BABYLON.Vector3(-1.1, 1.6, -26.2),
      rotation: vec3DegToRad([-12, -15, -4]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "Body & Doors": {
      position: new BABYLON.Vector3(-0.5, 2.3, -12),
      rotation: vec3DegToRad([0, 310, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "Suspension & Exhaust System": {
      position: new BABYLON.Vector3(0.1, 1.6, -23),
      rotation: vec3DegToRad([0, 428, -2]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "EV system": {
      position: new BABYLON.Vector3(3.4, 0.83, -27.26),
      rotation: vec3DegToRad([0, 191, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "Back Tire, Wheel, & Rim": {
      position: new BABYLON.Vector3(2.7, 1.65, -26),
      rotation: vec3DegToRad([0, 365, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      
  },
};

export function getTransformSetting(activeMenu: string | null, label: string): TransformSetting | undefined {
  if (activeMenu && transformSettings[activeMenu]?.[label]) {
    return transformSettings[activeMenu][label];
  }
  if (transformSettings[label]?.settings) {
    return transformSettings[label].settings;
  }
  return undefined;
}

export { vec3DegToRad };

