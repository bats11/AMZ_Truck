// animatedMeshes.ts
import * as BABYLON from "@babylonjs/core";
import { TransformSetting } from "./transformSettings";
import { animationGroupsByName } from "./loadModel";

/**
 * Avvia le animazioni per i gruppi specificati in settings.animatedMeshGroups.
 */
export async function handleAnimatedMeshes(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  settings?: TransformSetting
): Promise<void> {
  if (!settings?.animatedMeshGroups || settings.animatedMeshGroups.length === 0) {
    console.warn("📭 Nessun gruppo di animazione specificato.");
    return;
  }

  for (const groupKey of settings.animatedMeshGroups) {
    const groups = animationGroupsByName[groupKey];
    if (!groups || groups.length === 0) {
      console.warn(`⚠️ Nessuna animazione trovata per: ${groupKey}`);
      continue;
    }

    console.log(`🎬 Avvio animazioni per: ${groupKey}`);
    for (const group of groups) {
      group.reset();
      group.play(false); // false = non in loop, salvo override
    }
  }
}
