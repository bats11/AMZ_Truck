// animateCartsExit.ts
import * as BABYLON from "@babylonjs/core";
import { createAnimation } from "./utils";

export async function animateCartsExit(): Promise<void> {
  const carts = (window as any)._CART_ENTITIES as any[] | undefined;

  if (!Array.isArray(carts) || carts.length === 0) {
    console.warn("⚠️ Nessun carrello trovato per uscita.");
    return;
  }

  const scene = carts[0].root.getScene();
  const frameRate = 60;
  const duration = 1.2;
  const totalFrames = frameRate * duration;
  const exitOffset = new BABYLON.Vector3(15, 0, 0); // verso lo sfondo

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const promises = carts.map((cart, i) => {
    const root = cart.root as BABYLON.TransformNode;
    const start = root.position.clone();
    const end = start.add(exitOffset);

    const anim = createAnimation("position", start, end, 0, totalFrames, easing);
    const delay = Math.random() * 600;

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // DEBUG: salta animazione ma risolvi comunque
        console.log(`⏭️ Carrello ${root.name} bypassato (nessuna animazione).`);
        resolve();
      }, delay);
    });
  });

  await Promise.all(promises);
  console.log("⏭️ animateCartsExit: animazione saltata per debug (tutti i carrelli).");
}
