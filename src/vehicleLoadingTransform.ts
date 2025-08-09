// src/vehicleLoadingTransform.ts
import * as BABYLON from "@babylonjs/core";
import { handleInterpolatedTransform } from "./transformHandlers";
import { getModelRoot } from "./MoveComponent";
import { vehicleLoadingManager } from "./vehicleLoadingManager";
import { CartEntity } from "./CartEntity";
import { createAnimation, vec3DegToRad } from "./utils";
import { handleAnimatedMeshes } from "./animatedMeshes";

let activeCamera: BABYLON.FreeCamera | null = null;

const previouslyHiddenTruckMeshes = new Set<string>();

export function setVehicleCamera(camera: BABYLON.FreeCamera) {
  activeCamera = camera;
}

type TruckTransformLabel = "start" | "opening" | "confirm" | "passengerSide";

const truckTransformPresets: Record<TruckTransformLabel, {
  position: BABYLON.Vector3;
  rotation: BABYLON.Vector3;
  scaling: BABYLON.Vector3;
  durationScale: number;
  durationPosRot: number;
}> = {
  start: {
    position: new BABYLON.Vector3(-0.5, 4, 2),
    rotation: vec3DegToRad([0, 260, 0]),
    scaling: new BABYLON.Vector3(1.7, 1.7, 1.7),
    durationScale: 3.0,
    durationPosRot: 1.5,
  },
  opening: {
    position: new BABYLON.Vector3(0, 4.7, 1.5),
    rotation: vec3DegToRad([0, 270, 5]),
    scaling: new BABYLON.Vector3(1.6, 1.6, 1.6),
    durationScale: 1.8,
    durationPosRot: 2.5,
  },
  confirm: {
    position: new BABYLON.Vector3(1.2, 4.5, -7),
    rotation: vec3DegToRad([0, 0, 0]),
    scaling: new BABYLON.Vector3(1, 1, 1),
    durationScale: 1.5,
    durationPosRot: 2.0,
  },
  passengerSide: {
    position: new BABYLON.Vector3(-1.2, 4.5, -7),
    rotation: vec3DegToRad([0, 180, 0]),
    scaling: new BABYLON.Vector3(1, 1, 1),
    durationScale: 1.5,
    durationPosRot: 2.0,
  },
};

export async function restoreHiddenTruckMeshes(scene: BABYLON.Scene) {
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

  const promises = Array.from(previouslyHiddenTruckMeshes).map((name) => {
    const node = scene.getNodeByName(name);
    if (!node || !(node instanceof BABYLON.AbstractMesh)) return Promise.resolve();

    const anim = new BABYLON.Animation(
      `fadeIn_${name}`,
      "visibility",
      60,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    anim.setKeys([
      { frame: 0, value: node.visibility },
      { frame: 30, value: 1 },
    ]);
    anim.setEasingFunction(easing);

    return new Promise<void>((resolve) => {
      scene.beginDirectAnimation(node, [anim], 0, 30, false, 1.0, resolve);
    });
  });

  await Promise.all(promises);
  previouslyHiddenTruckMeshes.clear();
}

export async function runTruckTransform(label: TruckTransformLabel) {
  const modelRoot = getModelRoot();
  if (!modelRoot || !activeCamera) return;

  const scene = modelRoot.getScene();
  const preset = truckTransformPresets[label];

  if (!preset) {
    console.warn(`⚠️ Nessun preset trovato per '${label}'`);
    return;
  }

  const fadeInPromise =
    (label === "start" || label === "passengerSide")
      ? restoreHiddenTruckMeshes(scene)
      : Promise.resolve();

  const transformPromise = handleInterpolatedTransform(modelRoot, scene, preset, activeCamera);

  await Promise.all([fadeInPromise, transformPromise]);

  console.log(`🚚 Truck transform '${label}' eseguito.`);
}

export const animateToStartLoading = () => runTruckTransform("start");
export const animateToLeftLoading = () => runTruckTransform("opening");
export const liftTruckAfterCartArrival = () => runTruckTransform("confirm");

export async function InitialCargoAnimation() {
  const modelRoot = getModelRoot();
  if (!modelRoot) {
    console.warn("⚠️ ModelRoot non trovato. Animazione iniziale saltata.");
    return;
  }

  const scene = modelRoot.getScene();

  await handleAnimatedMeshes(modelRoot, scene, {
    position: BABYLON.Vector3.Zero(), // richiesto dal tipo TransformSetting
    animatedMeshGroups: ["Back Door"],
  });

  console.log("✅ InitialCargoAnimation completata.");
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

export async function hideTruckSideMeshes(
  side: "left" | "right",
  scene: BABYLON.Scene,
  alwaysHideList: string[] = [],
  alsoShowList: string[] = []
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

  for (const mesh of meshesToHide) {
    previouslyHiddenTruckMeshes.add(mesh.name);
  }

  const easing = new BABYLON.QuadraticEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const frameStart = 0;
  const frameEnd = 120;

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

  // ✅ Mesh da mostrare (fade-in)
  if (alsoShowList.length > 0) {
    for (const name of alsoShowList) {
      const mesh = scene.getNodeByName(name);
      if (mesh && mesh instanceof BABYLON.AbstractMesh) {
        BABYLON.Animation.CreateAndStartAnimation(
          `fadeIn_${name}`,
          mesh,
          "visibility",
          60,
          30,
          mesh.visibility,
          1,
          BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
      }
    }
  }

  await Promise.all(promises);
  console.log(`🎭 Mesh nascoste: ${meshesToHide.length} (lato opposto + extra: [${alwaysHideList.join(", ")}])`);
}

// ✅ Funzione ausiliaria per rendere invisibile SM_Cargo_Bay_cut
// vehicleLoadingTransform.ts

export async function fadeOutMeshByName(scene: BABYLON.Scene, meshName: string) {
  const mesh = scene.getNodeByName(meshName);
  if (mesh && mesh instanceof BABYLON.AbstractMesh) {
    BABYLON.Animation.CreateAndStartAnimation(
      `fadeOut_${meshName}`,
      mesh,
      "visibility",
      60,
      30,
      mesh.visibility,
      0,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    console.log(`🎭 ${meshName} nascosta con fade-out.`);
  }
}
