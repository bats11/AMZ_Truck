// src/vehicleLoadingTransform.ts
import * as BABYLON from "@babylonjs/core";
import { handleInterpolatedTransform } from "./transformHandlers";
import { getModelRoot } from "./MoveComponent";
import { vehicleLoadingManager } from "./vehicleLoadingManager";
import { CartEntity } from "./CartEntity";
import { createAnimation, vec3DegToRad } from "./utils";

let activeCamera: BABYLON.FreeCamera | null = null;

// 🆕 Store per le mesh nascoste
const previouslyHiddenTruckMeshes = new Set<string>();

export function setVehicleCamera(camera: BABYLON.FreeCamera) {
  activeCamera = camera;
}

type TruckTransformLabel = "start" | "opening" | "confirm";

const truckTransformPresets: Record<TruckTransformLabel, {
  position: BABYLON.Vector3;
  rotation: BABYLON.Vector3;
  scaling: BABYLON.Vector3;
  durationScale: number;
  durationPosRot: number;
}> = {
  start: {
    position: new BABYLON.Vector3(-0.5, 3, 2),
    rotation: vec3DegToRad([0, 260, 0]),
    scaling: new BABYLON.Vector3(1.7, 1.7, 1.7),
    durationScale: 3.0,
    durationPosRot: 1.5,
  },
  opening: {
    position: new BABYLON.Vector3(0, 3.5, 1.5),
    rotation: vec3DegToRad([0, 270, 5]),
    scaling: new BABYLON.Vector3(1.7, 1.7, 1.7),
    durationScale: 1.8,
    durationPosRot: 2.5,
  },
  confirm: {
    position: new BABYLON.Vector3(0.1, 3.5, -3),
    rotation: vec3DegToRad([10, 0, 0]),
    scaling: new BABYLON.Vector3(1, 1, 1),
    durationScale: 1.5,
    durationPosRot: 2.0,
  }
};

export async function runTruckTransform(label: TruckTransformLabel) {
  const modelRoot = getModelRoot();
  if (!modelRoot || !activeCamera) return;

  const scene = modelRoot.getScene();
  const preset = truckTransformPresets[label];

  if (!preset) {
    console.warn(`⚠️ Nessun preset trovato per '${label}'`);
    return;
  }

  await handleInterpolatedTransform(modelRoot, scene, preset, activeCamera);

  if (label === "start") {
    // 🆕 Fade-in delle mesh nascoste
    for (const name of previouslyHiddenTruckMeshes) {
      const node = scene.getNodeByName(name);
      if (node && node instanceof BABYLON.AbstractMesh) {
        BABYLON.Animation.CreateAndStartAnimation(
          `fadeIn_${name}`,
          node,
          "visibility",
          60,
          30,
          node.visibility,
          1,
          BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
      }
    }
    previouslyHiddenTruckMeshes.clear();

    if (vehicleLoadingManager.shouldRunInitialEntry()) {
      await runInitialCargoEntry();
      vehicleLoadingManager.markInitialEntryDone();
    }
  }

  console.log(`🚚 Truck transform '${label}' eseguito.`);
}

// Alias temporanei per compatibilità
export const animateToStartLoading = () => runTruckTransform("start");
export const animateToLeftLoading = () => runTruckTransform("opening");
export const liftTruckAfterCartArrival = () => runTruckTransform("confirm");

export async function runInitialCargoEntry() {
  console.log("🎬 Placeholder: funzione eseguita solo al primo ingresso.");
}

export async function animateCartsIn(carts: CartEntity[], scene: BABYLON.Scene) {
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

  const promises = carts.map((cart) => {
    const node = cart.root;
    const finalPos = node.position.clone();
    const startPos = finalPos.add(new BABYLON.Vector3(5, 0, 0));

    node.position.copyFrom(startPos);

    const anim = createAnimation("position", startPos, finalPos, 0, 60, easing);

    return new Promise<void>((resolve) => {
      scene.beginDirectAnimation(node, [anim], 0, 60, false, 1, () => resolve());
    });
  });

  await Promise.all(promises);
}

// ✅ Nasconde lato opposto e salva mesh
export async function hideTruckSideMeshes(
  side: "left" | "right",
  scene: BABYLON.Scene,
  alwaysHideList: string[] = []
) {
  const modelRoot = getModelRoot();
  if (!modelRoot) return;

  const targetSuffix = side === "left" ? "_right" : "_left";

  const suffixMeshes = modelRoot.getChildMeshes(false).filter((mesh) =>
    mesh.name.toLowerCase().includes(targetSuffix)
  );

  const extraMeshes = alwaysHideList
    .map((name) => scene.getMeshByName(name))
    .filter((mesh): mesh is BABYLON.AbstractMesh => !!mesh);

  const meshesToHide = [...suffixMeshes, ...extraMeshes];

  if (meshesToHide.length === 0) {
    console.warn(`⚠️ Nessuna mesh trovata da nascondere (lato: ${side})`);
    return;
  }

  const easing = new BABYLON.QuadraticEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const frameStart = 0;
  const frameEnd = 120;

  for (const mesh of meshesToHide) {
    previouslyHiddenTruckMeshes.add(mesh.name); // 🆕 Salva nome
  }

  const promises = meshesToHide.map((mesh) => {
    const anim = new BABYLON.Animation(
      `${mesh.name}_visibility`,
      "visibility",
      60,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    anim.setKeys([
      { frame: frameStart, value: 1 },
      { frame: frameEnd, value: 0 },
    ]);
    anim.setEasingFunction(easing);

    return new Promise<void>((resolve) => {
      scene.beginDirectAnimation(mesh, [anim], frameStart, frameEnd, false, 1, () => {
        mesh.visibility = 0;
        resolve();
      });
    });
  });

  await Promise.all(promises);
  console.log(
    `🎭 Mesh nascoste: ${meshesToHide.length} (lato opposto + extra: [${alwaysHideList.join(", ")}])`
  );
}
