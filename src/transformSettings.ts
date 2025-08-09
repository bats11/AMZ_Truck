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
    environmentIntensity?: number;      
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
    environmentIntensity?: number;
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
  environmentIntensity?: number;        
}

export const transformSettings: Record<string, { settings?: TransformSetting; [subKey: string]: TransformSetting | undefined }> = {
  "FRONT SIDE": {
    settings: {
      position: new BABYLON.Vector3(1.26, 3.7, -1.22),
      rotation: vec3DegToRad([-3.25, 110, 8.85]),
      scaling: new BABYLON.Vector3(1.7, 1.7, 1.7),
      durationScale: 1.0,
      durationPosRot: 1,
      intermediate: [
        {
          position: new BABYLON.Vector3(0, 3.5, 0),
          rotation: vec3DegToRad([0, 90, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          durationScale: 0.7,
          durationPosRot: 1.5,
        },
      ],
    },
    "Lights & Light Covers": {
    position: new BABYLON.Vector3(3, 5.6, -5),
    rotation: vec3DegToRad([0, 120, 0]),
    scaling: new BABYLON.Vector3(1.7, 1.7, 1.7),
   },
   "Suspension & Exhaust System": {
    position: new BABYLON.Vector3(0, 3.7, -2.5),
    rotation: vec3DegToRad([0, 90, 10]),
    scaling: new BABYLON.Vector3(1.7, 1.7, 1.7)
   },
   "Electric Vehicle (EV)": {
    position: new BABYLON.Vector3(4.6, 5.8, -7.5),
    rotation: vec3DegToRad([0, 156, 0]),
    scaling: new BABYLON.Vector3(1.9, 1.9, 1.9),
   },
   "Body & Doors": {
    position: new BABYLON.Vector3(-1, 4, -2.3),
    rotation: vec3DegToRad([2, 70, 7]),
    scaling: new BABYLON.Vector3(1.7, 1.7, 1.7)
  },
    },

  "IN CAB": {
      settings: {
      position: new BABYLON.Vector3(-0.2, 4.2, -16.1),
       rotation: vec3DegToRad([1, 283.5, 15]),
       scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
      triggerFovAdjust: true,
      sequenceStartTransform: 
        {
          position: new BABYLON.Vector3(0, 3.8, -5.6),
          rotation: vec3DegToRad([0, 270, -12]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          durationScale: 1.0,
          durationPosRot: 2.0,
          hideMeshes: true,
          animateMeshes: true,
          animatedMeshGroups: ["Back Door","Inside Door"],
          
        },
      intermediate: [
        {
          position: new BABYLON.Vector3(0, 4.8, -16.4),
          rotation: vec3DegToRad([0, 270, 0]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          durationScale: 1.0,
          durationPosRot: 2.0,
        },
      ],
      exitIntermediate: [
        {
          position: new BABYLON.Vector3(0, 3.3, -5.8),
          rotation: vec3DegToRad([0, 270, -12]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          durationScale: 1.0,
          durationPosRot: 2.0,
        },
      ],
      hiddenNodes: ["SM_Driver_Seat_Rear"],
      finalCameraFov: BABYLON.Tools.ToRadians(80),
      durationCameraFov: 2,
      environmentIntensity: 2,
    },
     "Body & Doors": {
      position: new BABYLON.Vector3(1.7, 5, -14.6),
      rotation: vec3DegToRad([0, 194, 1]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "Brakes": {
      position: new BABYLON.Vector3(-0.3, 5.5, -16.8),
      rotation: vec3DegToRad([0, 289, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
      "Wipers": {
      position: new BABYLON.Vector3(-2.9, 5.2, -12.3),
      rotation: vec3DegToRad([0, 23, -5]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
    "Windshield": {
     position: new BABYLON.Vector3(0, 6, -16.3),
     rotation: vec3DegToRad([0, 280, -33]),
     scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
     triggerDamage: true,
     damageNodes: ["damage_GlassCrack"],
    },
    "Lights & Light Covers": {
     position: new BABYLON.Vector3(0.5, 4.8, -16.6),
     rotation: vec3DegToRad([-2, 273, 2.3]),
     scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
"Safety Accessories": {
  position: new BABYLON.Vector3(1.4, 3.6, -14.4),
  rotation: vec3DegToRad([-2, 166, 10]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
},
"Camera or Monitor": {
  position: new BABYLON.Vector3(-0.5, 4.3, -16.5),
  rotation: vec3DegToRad([-3, 283, 10]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
},
"Vehicle Documentation [DOT only]": {
  position: new BABYLON.Vector3(-0.5, 4.3, -16.6),
  rotation: vec3DegToRad([-2, 269, 16]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
},
"HVAC System": {
  position: new BABYLON.Vector3(-0.7, 4.3, -17),
  rotation: vec3DegToRad([-2, 291, 10]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
},
"Steering, Horn, & Alarm": {
  position: new BABYLON.Vector3(-0.9, 4.5, -16.4),
  rotation: vec3DegToRad([-2, 307, 10]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
},
  "Cleanliness": {
  position: new BABYLON.Vector3(-1.6, 4.4, -13),
  rotation: vec3DegToRad([-2, 396, -8]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
},
  },

  "DRIVER SIDE": {
    settings: {
    position: new BABYLON.Vector3(0.4, 4.5, -2.6),
    rotation: vec3DegToRad([0, 135, 0]),
    scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
    },
  "Back Tire, Wheel, & Rim": {
  position: new BABYLON.Vector3(-2, 6, -11.3),
  rotation: vec3DegToRad([0, 198, 0]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
  },
  "Lights & Light Covers": {
  position: new BABYLON.Vector3(0, 6, -12.2),
  rotation: vec3DegToRad([0, 143, -7]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
  },
  "Body & Doors": {
  position: new BABYLON.Vector3(0, 4.8, -7),
  rotation: vec3DegToRad([0, 120, 0]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
  },
"Suspension & Exhaust System": {
  position: new BABYLON.Vector3(2.2, 6.5, -14.5),
  rotation: vec3DegToRad([25, 210, 0]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
  triggerDamage: true,
  damageNodes: ["Damage_OilPuddle","OilGound"],
      },
  "EV System": {
  position: new BABYLON.Vector3(3.5, 5.6, -14),
  rotation: vec3DegToRad([0, 200, 0]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
},
"Side Mirrors": {
  position: new BABYLON.Vector3(0.13, 4.6, -10),
  rotation: vec3DegToRad([0, 120, 0]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
},
"Front Tire, Wheel, & Rim": {
  position: new BABYLON.Vector3(3, 6.05, -12.5),
  rotation: vec3DegToRad([0, 196, 0]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
},

  },

  "BACK SIDE": {
    settings: {
      position: new BABYLON.Vector3(-1, 3.7, 2.4),
      rotation: vec3DegToRad([0, 255, 0]),
      scaling: new BABYLON.Vector3(2, 2, 2),
      durationScale: 1.5,
      durationPosRot: 1.5,
      intermediate: [
        {
          position: new BABYLON.Vector3(-0.5, 3.7, 2.5),
          rotation: vec3DegToRad([0, 265, -6]),
          scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
          durationScale: 0.5,
          durationPosRot: 1.5,
        },
      ],
    },
  "Lights & Light Covers": {
  position: new BABYLON.Vector3(0, 3.5, 2.5),
  rotation: vec3DegToRad([0, 270, 0]),
  scaling: new BABYLON.Vector3(2, 2, 2)
},
"Body & Doors": {
  position: new BABYLON.Vector3(3.5, 2.5, 0.5),
  rotation: vec3DegToRad([9, 300, -12]),
  scaling: new BABYLON.Vector3(2, 2, 2)
},
"License Plates & Tags": {
  position: new BABYLON.Vector3(3.8, 4.5, -4.5),
  rotation: vec3DegToRad([9, 308, -12]),
  scaling: new BABYLON.Vector3(2, 2, 2)
},
"Suspension & Exhaust System": {
  position: new BABYLON.Vector3(1, 4.7, 0),
  rotation: vec3DegToRad([2, 280, -9]),
  scaling: new BABYLON.Vector3(2, 2, 2)
},
"EV System": {
  position: new BABYLON.Vector3(6.3, 5.6, -12.8),
  rotation: vec3DegToRad([0, 207, 0]),
  scaling: new BABYLON.Vector3(2, 2, 2)
  },
  },

  "PASSENGER SIDE": {
    settings: {
      position: new BABYLON.Vector3(-0.2, 4.5, -2.6),
      rotation: vec3DegToRad([0, 45, 0]),
      scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
    },
  "Side Mirrors": {
  position: new BABYLON.Vector3(-0.2, 4.65, -9),
  rotation: vec3DegToRad([0, 60, 0]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
  triggerDamage: true,
  damageNodes: ["Damage_Duct"],
 },
  "Front Tire, Wheel, & Rim": {
  position: new BABYLON.Vector3(-2.9, 6.05, -12),
  rotation: vec3DegToRad([0, -7, 0]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
  },
  "Lights & Light Covers": {
  position: new BABYLON.Vector3(-1.2, 5.8, -12),
  rotation: vec3DegToRad([0, -10, 0]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
  },
  "Body & Doors": {
  position: new BABYLON.Vector3(0, 4.7, -6.3),
  rotation: vec3DegToRad([0, 415, 0]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
  },
  "Suspension & Exhaust System": {
  position: new BABYLON.Vector3(-2.5, 5.9, -13.5),
  rotation: vec3DegToRad([0, 320, 0]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
  },
  "EV system": {
  position: new BABYLON.Vector3(-0.2, 4.5, -2.6),
  rotation: vec3DegToRad([0, 45, 0]),
  scaling: new BABYLON.Vector3(1.1, 1.1, 1.1)
  },
  "Back Tire, Wheel, & Rim": {
  position: new BABYLON.Vector3(2.4, 6, -11.8),
  rotation: vec3DegToRad([0, 358, 0]),
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

