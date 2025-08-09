// src/animateBagsExit.ts
import * as BABYLON from "@babylonjs/core";
import { createAnimation } from "./utils";
import { getModelRoot } from "./MoveComponent";
import { vehicleLoadingManager } from "./vehicleLoadingManager";
import type { BagEntity } from "./BagEntity";

/**
 * Anima l'uscita delle bag dalla scena con fade-out e disattivazione o rimozione.
 *
 * @param opts 
 *  - truckBags: se true, include le bag caricate nel truck (default true)
 *  - cartBags: se true, include le bag ancora nei carrelli (default true)
 *  - isDestroying: se true, alla fine le bag vengono eliminate (dispose) e non restituite
 * @returns BagEntity[] animate (solo se isDestroying è false)
 */
export async function animateBagsExit(opts?: {
  truckBags?: boolean;
  cartBags?: boolean;
  isDestroying?: boolean; // ✅ nuovo flag
}): Promise<BagEntity[]> {
  const modelRoot = getModelRoot();
  if (!modelRoot) {
    console.warn("⛔ ModelRoot (truck) non trovato.");
    return [];
  }

  const scene = modelRoot.getScene();
  const frameRate = 60;
  const duration = 1.2;
  const totalFrames = frameRate * duration;

  const isRightSide = vehicleLoadingManager.getState?.() === "rightSideLoading";
  const exitDistance = isRightSide ? 7 : -7;

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const { truckBags = true, cartBags = true, isDestroying = false } = opts ?? {};

  let bagNodesInTruck: BABYLON.TransformNode[] = [];
  let bagNodesInCarts: BABYLON.TransformNode[] = [];

  // 🟦 Bag nel truck (figli diretti di ModelRoot)
  if (truckBags) {
    bagNodesInTruck = modelRoot.getChildren().filter((node) =>
      node.name.startsWith("BagWrapper_")
    ) as BABYLON.TransformNode[];
  }

  // 🛒 Bag nei carrelli (figli dei Cart.root)
  if (cartBags) {
    const carts = (window as any)._CART_ENTITIES as any[] | undefined;
    if (Array.isArray(carts)) {
      for (const cart of carts) {
        const root = cart?.root as BABYLON.TransformNode;
        if (!root) continue;
        const bags = root.getChildren().filter((n) =>
          n.name.startsWith("BagWrapper_")
        ) as BABYLON.TransformNode[];
        bagNodesInCarts.push(...bags);
      }
    }
  }

  const allBagNodes = [...bagNodesInTruck, ...bagNodesInCarts];
  if (allBagNodes.length === 0) {
    console.log("ℹ️ Nessuna bag trovata da animare.");
    return [];
  }

  // ✅ Lookup diretto via metadata, fallback via id
  const animatedBagEntities: BagEntity[] = [];

  // Fallback pool
  let allBagEntitiesForFallback: BagEntity[] | null = null;
  const getAllBagsForFallback = () => {
    if (allBagEntitiesForFallback) return allBagEntitiesForFallback;
    const carts = (window as any)._CART_ENTITIES as any[] | undefined;
    allBagEntitiesForFallback = Array.isArray(carts)
      ? carts.flatMap((c) => c.getBags?.() ?? [])
      : [];
    return allBagEntitiesForFallback;
  };

  const promises = allBagNodes.map((bagNode) => {
    // 1) Metadata lookup
    let bagEntity =
      (((bagNode as any).metadata?.bagEntityRef) as BagEntity | undefined) ?? undefined;

    // 2) Fallback via id
    if (!bagEntity) {
      const bagId = bagNode.name.replace("BagWrapper_", "");
      const allBags = getAllBagsForFallback();
      bagEntity = allBags.find((b) => b.id === bagId);
    }

    // ✅ Salva solo se non stiamo distruggendo
    if (bagEntity && !isDestroying) {
      animatedBagEntities.push(bagEntity);
    } else if (!bagEntity) {
      console.warn(`❌ BagEntity non trovata per nodo ${bagNode.name}`);
    }

    // Animazione + fade-out
    const start = bagNode.position.clone();
    const end = start.add(new BABYLON.Vector3(0, 0, exitDistance));
    const anim = createAnimation("position", start, end, 0, totalFrames, easing);
    const delay = Math.random() * 600;

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Movimento wrapper
        scene.beginDirectAnimation(bagNode, [anim], 0, totalFrames, false, 1);

        // Fade-out dei mesh figli
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

        // Disattiva o distruggi al termine
        setTimeout(() => {
          if (isDestroying) {
            bagNode.getChildMeshes(false).forEach((m) => m.dispose());
            bagNode.dispose();
            console.log(`🗑️ Bag ${bagNode.name} eliminata.`);
          } else {
            bagNode.setEnabled(false);
            console.log(`📦 Bag ${bagNode.name} disattivata (non distrutta).`);
          }
          resolve();
        }, totalFrames * (1000 / frameRate));
      }, delay);
    });
  });

  await Promise.all(promises);

  console.log(
    `✅ animateBagsExit: terminate ${allBagNodes.length} animazioni. ` +
    (isDestroying ? "Le bag sono state eliminate." : `Restituite ${animatedBagEntities.length} bag.`)
  );

  // ✅ Salvataggio globale per uso successivo
  if (!isDestroying) {
    (window as any)._LAST_ANIMATED_BAGS = animatedBagEntities;
  }

  return isDestroying ? [] : animatedBagEntities;
}
