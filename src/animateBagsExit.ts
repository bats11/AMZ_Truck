// src/animateBagsExit.ts
import * as BABYLON from "@babylonjs/core";
import { createAnimation } from "./utils";
import { getModelRoot } from "./MoveComponent";
import { vehicleLoadingManager } from "./vehicleLoadingManager"; // ✅ import diretto

export async function animateBagsExit(): Promise<void> {
  const modelRoot = getModelRoot();
  if (!modelRoot) {
    console.warn("⛔ ModelRoot (truck) non trovato.");
    return;
  }

  const scene = modelRoot.getScene();
  const frameRate = 60;
  const duration = 1.2; // secondi
  const totalFrames = frameRate * duration;

  // ✅ Determina direzione in base al lato attivo
  const isRightSide = vehicleLoadingManager.getState?.() === "rightSideLoading";
  const exitDistance = isRightSide ? 7 : -7;

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  // 🔍 Cerca bag nel truck
  const bagNodesInTruck = modelRoot.getChildren().filter((node) =>
    node.name.startsWith("BagWrapper_")
  ) as BABYLON.TransformNode[];

  // 🔍 Cerca bag nei carrelli
  let bagNodesInCarts: BABYLON.TransformNode[] = [];
  const carts = (window as any)._CART_ENTITIES as any[] | undefined;

  if (Array.isArray(carts)) {
    for (const cart of carts) {
      const root = cart?.root as BABYLON.TransformNode;
      if (root) {
        const bags = root.getChildren().filter((n) => n.name.startsWith("BagWrapper_")) as BABYLON.TransformNode[];
        bagNodesInCarts.push(...bags);
      }
    }
  }

  const allBagNodes = [...bagNodesInTruck, ...bagNodesInCarts];

  // 🆕 Includi la bag in staging se presente
  const controller = (window as any)._LOAD_TRUCK_CONTROLLER as import("./LoadTruckController").LoadTruckController | undefined;
  if (controller?.getStagingBag()) {
    allBagNodes.push(controller.getStagingBag()!.root);
  }


  if (allBagNodes.length === 0) {
    console.log("ℹ️ Nessuna bag trovata da animare.");
    return;
  }

  const promises = allBagNodes.map((bagNode) => {
    const start = bagNode.position.clone();
    const end = start.add(new BABYLON.Vector3(0, 0, exitDistance));

    const anim = createAnimation("position", start, end, 0, totalFrames, easing);
    const delay = Math.random() * 600;

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // 1️⃣ Sposta wrapper
        scene.beginDirectAnimation(bagNode, [anim], 0, totalFrames, false, 1);

        // 2️⃣ Fade out delle mesh
        const childMeshes = bagNode.getChildMeshes(false);
        childMeshes.forEach((mesh) => {
          const visAnim = new BABYLON.Animation(
            `${mesh.name}_vis`,
            "visibility",
            frameRate,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
          );
          visAnim.setKeys([
            { frame: 0, value: 1 },
            { frame: totalFrames, value: 0 },
          ]);
          visAnim.setEasingFunction(easing);
          scene.beginDirectAnimation(mesh, [visAnim], 0, totalFrames, false, 1);
        });

        // 3️⃣ Dispose dopo animazione
        setTimeout(() => {
          childMeshes.forEach((m) => m.dispose());
          bagNode.dispose();
          console.log(`🗑️ Bag ${bagNode.name} rimossa dalla scena.`);
          resolve();
        }, totalFrames * (1000 / frameRate));
      }, delay);
    });
  });

  await Promise.all(promises);
  console.log("✅ Tutte le bag (truck + carrelli) eliminate con animazione.");
}
