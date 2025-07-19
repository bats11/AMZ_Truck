// transformSettings.ts — ristrutturato con struttura gerarchica
import * as BABYLON from "@babylonjs/core";

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
    damageNodes?: string[];      // ✅ NUOVO CAMPO
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
    damageNodes?: string[];      // ✅ NUOVO CAMPO
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
    damageNodes?: string[];      // ✅ NUOVO CAMPO
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
  damageNodes?: string[];        // ✅ NUOVO CAMPO anche al livello principale
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
      position: new BABYLON.Vector3(1, 2.5, 0),
      rotation: vec3DegToRad([0, 100, 0]),
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
      scaling: new BABYLON.Vector3(1.9, 1.9, 1.9),
    },
  },

  "IN CAB": {
    settings: {
      position: new BABYLON.Vector3(0.5, 0, -30.5),
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
      position: new BABYLON.Vector3(-1.5, 1.5, -30),
      rotation: vec3DegToRad([0, 260, 0]),
      scaling: new BABYLON.Vector3(1.2, 1.2, 1.2),
        exitIntermediate: [
    {
      position: new BABYLON.Vector3(0, 4, 0),
      rotation: vec3DegToRad([0, 0, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
      durationScale: 1.2,
      durationPosRot: 2.2,
    }
  ]
      
    },
    "Brakes": {
      position: new BABYLON.Vector3(0, 1.2, -28),
      rotation: vec3DegToRad([0, 260, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
    },
    /*"Wipers": {
      position: new BABYLON.Vector3(0.6, 0, -30.5),
      rotation: vec3DegToRad([0, 268, 15]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
    },*/
    
    "Windshield": {
      position: new BABYLON.Vector3(0.6, 0, -30.5),
      rotation: vec3DegToRad([0, 258, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
    },
  },

  "DRIVER SIDE": {
    settings: {
      position: new BABYLON.Vector3(0, 4, 0),
      rotation: vec3DegToRad([0, 180, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
    },
      "Back Tire, Wheel, & Rim": {
        position: new BABYLON.Vector3(0, 4, 0),
        rotation: vec3DegToRad([0, 180, 0]),
        scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
      },
      "Lights & Light Covers": {
        position: new BABYLON.Vector3(0, 4, 0),
        rotation: vec3DegToRad([0, 180, 0]),
        scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
      },
      "Body & Doors": {
        position: new BABYLON.Vector3(0, 4, 0),
        rotation: vec3DegToRad([0, 180, 0]),
        scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
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
        position: new BABYLON.Vector3(0, 4, 0),
        rotation: vec3DegToRad([0, 180, 0]),
        scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
      },
      "Side Mirrors": {
        position: new BABYLON.Vector3(0, 4, 0),
        rotation: vec3DegToRad([0, 180, 0]),
        scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
      },
      "Front Tire, Wheel, & Rim": {
        position: new BABYLON.Vector3(0, 4, 0),
        rotation: vec3DegToRad([0, 180, 0]),
        scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
      },
  },

  "BACK SIDE": {
    settings: {
      position: new BABYLON.Vector3(-1, 2.2, 0),
      rotation: vec3DegToRad([0, 260, 0]),
      scaling: new BABYLON.Vector3(1.9, 1.9, 1.9),
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
  },

  "PASSENGER SIDE": {
    settings: {
      position: new BABYLON.Vector3(0, 4, 0),
      rotation: vec3DegToRad([0, 0, 0]),
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
          position: new BABYLON.Vector3(-0.3, 0, -22),
          rotation: vec3DegToRad([0, 60, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
        },
        "Lights & Light Covers": {
          position: new BABYLON.Vector3(-0.3, 0, -22),
          rotation: vec3DegToRad([0, 60, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
        },
        "Body & Doors": {
          position: new BABYLON.Vector3(-0.3, 0, -22),
          rotation: vec3DegToRad([0, 60, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
        },
        "Suspension & Exhaust System": {
          position: new BABYLON.Vector3(-0.3, 0, -22),
          rotation: vec3DegToRad([0, 60, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
        },
        "EV system": {
          position: new BABYLON.Vector3(-0.3, 0, -22),
          rotation: vec3DegToRad([0, 60, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
        },
        "Back Tire, Wheel, & Rim": {
          position: new BABYLON.Vector3(-0.3, 0, -22),
          rotation: vec3DegToRad([0, 60, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
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
