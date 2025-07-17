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

    console.log(`🎬 Avvio animazioni per: ${groupKey}`);
    playedAnimationGroups.add(groupKey); // 👈 Salviamo il gruppo usato

    for (const group of groups) {
      group.reset();

      const p = new Promise<void>((resolve) => {
        const onEnd = () => {
          group.onAnimationGroupEndObservable.removeCallback(onEnd);
          resolve();
        };
        group.onAnimationGroupEndObservable.add(onEnd);
      });

      group.play(false); // normale
      promises.push(p);
    }
  }

  await Promise.all(promises);
}

/**
 * Riproduce in reverse tutte le animazioni precedentemente giocate
 */
// animatedMeshes.ts

export function handleExitAnimations(scene: BABYLON.Scene): void {
  for (const groupKey of playedAnimationGroups) {
    const groups = animationGroupsByName[groupKey];
    if (!groups) continue;

    console.log(`↩️ Reverse animazioni (non bloccanti) per: ${groupKey}`);

    for (const group of groups) {
      group.reset();
      group.goToFrame(group.to);
      group.speedRatio = -1;
      group.play(false);
    }
  }

  playedAnimationGroups.clear(); // 🧹 reset stato
}

