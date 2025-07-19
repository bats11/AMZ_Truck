// src/damageManager.ts
import * as BABYLON from "@babylonjs/core";

/**
 * Stato interno delle mesh di danno attualmente visibili
 */
const currentlyVisibleDamageMeshes = new Set<string>();

/**
 * Nasconde tutte le damage mesh attive con un fade-out su visibility
 */
export function resetDamageVisibility(scene: BABYLON.Scene): void {
  for (const name of currentlyVisibleDamageMeshes) {
    const mesh = scene.getNodeByName(name);
    if (mesh && mesh instanceof BABYLON.AbstractMesh) {
      BABYLON.Animation.CreateAndStartAnimation(
        `fadeOut_${name}`,
        mesh,
        "visibility",
        60, // fps
        60, // 1 second
        mesh.visibility,
        0,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
    }
  }

  currentlyVisibleDamageMeshes.clear();
}

/**
 * Mostra una lista di damage mesh con un fade-in animato su visibility
 */
export function showDamageMeshes(scene: BABYLON.Scene, meshNames: string[]): void {
  for (const name of meshNames) {
    const mesh = scene.getNodeByName(name);
    if (mesh && mesh instanceof BABYLON.AbstractMesh) {
      BABYLON.Animation.CreateAndStartAnimation(
        `fadeIn_${name}`,
        mesh,
        "visibility",
        60, // fps
        30, // 0.5 secondi
        mesh.visibility,
        1,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      currentlyVisibleDamageMeshes.add(name);
    } else {
      console.warn(`⚠️ Mesh di danno non trovata nella scena: ${name}`);
    }
  }
}
