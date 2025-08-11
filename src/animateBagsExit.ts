// src/animateBagsExit.ts
import * as BABYLON from "@babylonjs/core";
import { createAnimation } from "./utils";
import { getModelRoot } from "./MoveComponent";
import { vehicleLoadingManager } from "./vehicleLoadingManager";
import { LoadTruckController } from "./LoadTruckController"; // ⬅️ aggiunto

export async function animateBagsExit(isRightSide?: boolean): Promise<void> {
  const modelRoot = getModelRoot();
  if (!modelRoot) {
    console.warn("⛔ ModelRoot (truck) non trovato.");
    return;
  }

  const scene = modelRoot.getScene();
  const frameRate = 60;
  const duration = 1.2; // secondi
  const totalFrames = frameRate * duration;

  if (isRightSide === undefined) {
    isRightSide = vehicleLoadingManager.getState?.() === "rightSideLoading";
  }

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  // 🔍 Bag sul truck
  const bagNodesInTruck = modelRoot.getChildren().filter((node) =>
    node.name.startsWith("BagWrapper_")
  ) as BABYLON.TransformNode[];

  // 🔍 Bag nei carrelli
  let bagNodesInCarts: BABYLON.TransformNode[] = [];
  const carts = (window as any)._CART_ENTITIES as any[] | undefined;
  if (Array.isArray(carts)) {
    for (const cart of carts) {
      const root = cart?.root as BABYLON.TransformNode;
      if (root) {
        const bags = root.getChildren().filter((n) =>
          n.name.startsWith("BagWrapper_")
        ) as BABYLON.TransformNode[];
        bagNodesInCarts.push(...bags);
      }
    }
  }

  // 🔍 Bag in staging
  const stagingBag = LoadTruckController.getCurrentStagingBag();
  let bagNodesInStaging: BABYLON.TransformNode[] = [];
  if (stagingBag) {
    bagNodesInStaging.push(stagingBag.root);
    console.log(`📍 Bag in staging aggiunta all'uscita: ${stagingBag.id}`);
  }

  if (
    bagNodesInTruck.length +
      bagNodesInCarts.length +
      bagNodesInStaging.length ===
    0
  ) {
    console.log("ℹ️ Nessuna bag trovata da animare.");
    return;
  }

  // 👉 Direzioni separate
  const exitDistanceTruck = isRightSide ? 7 : -7; // Truck
  const exitDistanceCart = -7; // Carrelli
  const exitDistanceStaging = -7; // Staging → stessa dei carrelli

  // Funzione interna per animare e fare dispose
  const animateBagNode = (bagNode: BABYLON.TransformNode, exitDistance: number) => {
    const start = bagNode.position.clone();
    const end = start.add(new BABYLON.Vector3(0, 0, exitDistance));
    const anim = createAnimation("position", start, end, 0, totalFrames, easing);
    const delay = Math.random() * 600;

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        scene.beginDirectAnimation(bagNode, [anim], 0, totalFrames, false, 1);

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

        setTimeout(() => {
          childMeshes.forEach((m) => m.dispose());
          bagNode.dispose();
          console.log(`🗑️ Bag ${bagNode.name} rimossa dalla scena.`);
          resolve();
        }, totalFrames * (1000 / frameRate));
      }, delay);
    });
  };

  // Anima tutte le bag
  const promisesTruck = bagNodesInTruck.map((node) =>
    animateBagNode(node, exitDistanceTruck)
  );
  const promisesCarts = bagNodesInCarts.map((node) =>
    animateBagNode(node, exitDistanceCart)
  );
  const promisesStaging = bagNodesInStaging.map((node) =>
    animateBagNode(node, exitDistanceStaging)
  );

  await Promise.all([...promisesTruck, ...promisesCarts, ...promisesStaging]);

  console.log(
    `✅ Tutte le bag eliminate. Truck lato ${
      isRightSide ? "RIGHT" : "LEFT"
    }, carrelli direzione standard, staging incluso.`
  );
}
