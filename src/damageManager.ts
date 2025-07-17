// src/damageManager.ts

import * as BABYLON from "@babylonjs/core";

/**
 * Esegue un fade-in (animazione su visibility) sulle mesh indicate.
 * Le mesh devono essere già presenti nella scena e avere visibility iniziale = 0.
 */
export function handleDamage(scene: BABYLON.Scene, damageMeshNames: string[]): void {
  for (const name of damageMeshNames) {
    const node = scene.getNodeByName(name);
    if (node && node instanceof BABYLON.AbstractMesh) {
      BABYLON.Animation.CreateAndStartAnimation(
        `fadeIn_${name}`,
        node,
        "visibility",
        60, // fps
        30, // 0.5 secondi
        node.visibility,
        1,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
    } else {
      console.warn(`⚠️ Mesh di danno non trovata nella scena: ${name}`);
    }
  }
}
