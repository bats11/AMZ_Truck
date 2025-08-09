// src/animateCartsExit.ts
import * as BABYLON from "@babylonjs/core";
import type { CartEntity } from "./CartEntity";
import { createAnimation } from "./utils";

// Uscita visiva verso sinistra (coerente col controller)
const EXIT_POS = new BABYLON.Vector3(-6.5, 0.3, -10);

// Parametri di spawn usati da CreateCarts
const SPAWN_SPACING_X = 2.5;
const SPAWN_Y = 0.3;
const SPAWN_Z = -10;

// Tolleranza per confronti posizionali
const EPS = 0.15;

// Ricava lo spawn del carrello senza dipendere da altri file
function getSpawnPos(cart: CartEntity): BABYLON.Vector3 {
  const root = cart.root as BABYLON.TransformNode & { metadata?: any };
  const metaSpawn = root.metadata?.spawnPos;
  if (metaSpawn instanceof BABYLON.Vector3) return metaSpawn.clone();

  const m = /Cart_(\d+)/.exec(cart.id);
  if (m) {
    const i = parseInt(m[1], 10);
    return new BABYLON.Vector3(i * SPAWN_SPACING_X, SPAWN_Y, SPAWN_Z);
  }

  // Fallback: se è in park, current ≈ spawn+(5,0,0)
  return root.position.clone().add(new BABYLON.Vector3(-5, 0, 0));
}

function isNear(a: BABYLON.Vector3, b: BABYLON.Vector3, eps = EPS) {
  return BABYLON.Vector3.DistanceSquared(a, b) <= eps * eps;
}

function isParked(root: BABYLON.TransformNode, spawn: BABYLON.Vector3) {
  const park = spawn.add(new BABYLON.Vector3(6, 0, 0));
  return isNear(root.position, park);
}

function isAtExit(root: BABYLON.TransformNode) {
  return isNear(root.position, EXIT_POS);
}

/**
 * Slide‑out dei carrelli:
 * - anima SOLO quelli che non sono già in park e non sono già all'EXIT_POS
 * - niente dispose
 * - al termine li riporta allo spawn (pronti per il retry + BagRestorer)
 */
export async function animateCartsExit(): Promise<void> {
  const carts = (window as any)._CART_ENTITIES as CartEntity[] | undefined;
  if (!Array.isArray(carts) || carts.length === 0) {
    console.warn("⚠️ Nessun carrello trovato per uscita.");
    return;
  }

  const scene = carts[0].root.getScene();
  const frameRate = 60;
  const duration = 1.2;
  const totalFrames = frameRate * duration;

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const promises = carts.map((cart) => {
    const root = cart.root as BABYLON.TransformNode;
    const spawn = getSpawnPos(cart);

    // ⛔ Skip se già parcheggiato o già all'uscita
    if (isParked(root, spawn) || isAtExit(root)) {
      // niente da fare per carrelli già gestiti dal controller
      return Promise.resolve();
    }

    const start = root.position.clone();
    const end = EXIT_POS.clone();
    const anim = createAnimation("position", start, end, 0, totalFrames, easing);
    const delay = Math.random() * 600;

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        scene.beginDirectAnimation(root, [anim], 0, totalFrames, false, 1, () => {
          // rientro immediato allo spawn
          root.position.copyFrom(spawn);
          resolve();
        });
      }, delay);
    });
  });

  await Promise.all(promises);
  console.log("✅ animateCartsExit completata (solo carrelli non già parcheggiati/usciti).");
}
