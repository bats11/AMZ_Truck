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
  const duration = 1.2;
  const totalFrames = frameRate * duration;

  const isRightSide = vehicleLoadingManager.getState?.() === "rightSideLoading";
  const exitDistance = isRightSide ? 7 : -7;

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const bagNodesInTruck = modelRoot.getChildren().filter((node) =>
    node.name.startsWith("BagWrapper_")
  ) as BABYLON.TransformNode[];

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

        // 3️⃣ Alla fine, disattiva ma NON dispose
        setTimeout(() => {
          bagNode.setEnabled(false); // 👈 disattiva al posto di dispose
          console.log(`📦 Bag ${bagNode.name} disattivata (non distrutta).`);
          resolve();
        }, totalFrames * (1000 / frameRate));
      }, delay);
    });
  });

  await Promise.all(promises);
  console.log("✅ Tutte le bag disattivate con animazione.");
}

