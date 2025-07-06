import * as BABYLON from "@babylonjs/core";

export interface TransitionConfig {
  intermediate?: {
    position?: BABYLON.Vector3;
    rotation?: BABYLON.Vector3;
    scaling?: BABYLON.Vector3;
  };
  target: {
    position?: BABYLON.Vector3;
    rotation?: BABYLON.Vector3;
    scaling?: BABYLON.Vector3;
  };
  materials?: string[];
}

export const transitionMap: Record<string, TransitionConfig> = {
  "IN CAB": {
    intermediate: {
      position: new BABYLON.Vector3(0, 1, 0),
      rotation: new BABYLON.Vector3(0, 0, 0),
      scaling: new BABYLON.Vector3(1, 1, 1),
    },
    target: {
      position: new BABYLON.Vector3(0, 3, 0),
      rotation: new BABYLON.Vector3(0, Math.PI / 2, 0),
      scaling: new BABYLON.Vector3(3, 3, 3),
    },
    materials: ["M_Wheels._Rear",  
"M_Cargo_Bay_Exterior_a",  
"M_Cargo_Bay_Exterior_b",  
"M_Cargo_Bay_Interior",  
"M_Cargo_Bay_Interior_Shelves",  
"M_Hand_Truck",  
"M_Triangle_kit",  
"M_Cabin_Interior_Rear",  
"M_Fire_extinguisher_Rear",  
"M_Carbin_Props_Rear",  
"M_Black_Plastic_Matt_Rear"  ],
  },
};
