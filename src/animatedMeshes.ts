// animatedMeshes.ts
import * as BABYLON from "@babylonjs/core";
import { TransformSetting } from "./transformSettings";
import { animationGroupsByName } from "./loadModel";

// 🔁 Traccia dei gruppi animati
const playedAnimationGroups = new Set<string>();

/**
 * Avvia le animazioni per i gruppi specificati e attende la fine
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

  const promises: Promise<void>[] = [];

  for (const groupKey of settings.animatedMeshGroups) {
    const groups = animationGroupsByName[groupKey];
    if (!groups || groups.length === 0) {
      console.warn(`⚠️ Nessuna animazione trovata per: ${groupKey}`);
      continue;
    }

    console.log(`🎬 Avvio animazioni FORWARD per: ${groupKey}`);
    playedAnimationGroups.add(groupKey);

    for (const group of groups) {
      // Forziamo lo stato di ripartenza
      group.stop();
      group.reset();
      group.speedRatio = 1;
      group.goToFrame(group.from);

      const p = new Promise<void>((resolve) => {
        const onEnd = () => {
          group.onAnimationGroupEndObservable.removeCallback(onEnd);
          resolve();
        };
        group.onAnimationGroupEndObservable.add(onEnd);
      });

      group.play(false); // play forward
      promises.push(p);
    }
  }

  await Promise.all(promises);
}

/**
 * Riproduce in reverse tutte le animazioni precedentemente giocate
 */
export function handleExitAnimations(scene: BABYLON.Scene): void {
  for (const groupKey of playedAnimationGroups) {
    const groups = animationGroupsByName[groupKey];
    if (!groups) continue;

    console.log(`↩️ Reverse animazioni per: ${groupKey}`);

    for (const group of groups) {
      group.stop();
      group.reset();
      group.speedRatio = -1;
      group.goToFrame(group.to);
      group.play(false);
    }
  }

  playedAnimationGroups.clear(); // 🧹 reset stato tracciato
}
