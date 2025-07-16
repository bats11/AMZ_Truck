import * as BABYLON from "@babylonjs/core";
import { TransformSetting } from "./transformSettings";

/**
 * Esegue un fade-out animato sulle mesh specificate da `settings.hiddenNodes`.
 */
export async function handleHideMeshes(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  settings?: TransformSetting,
  previouslyHiddenNodes?: Set<string>
): Promise<void> {
  if (!settings?.hiddenNodes) return;

  const durationFrames = 30; // mezzo secondo a 60fps

  for (const name of settings.hiddenNodes) {
    const target = scene.getNodeByName(name);

    if (target && target instanceof BABYLON.AbstractMesh) {
      previouslyHiddenNodes?.add(name);

      // Avvia fade-out su visibility (da 1 a 0)
      BABYLON.Animation.CreateAndStartAnimation(
        `fadeOut_${name}`,
        target,
        "visibility",
        60, // fps
        durationFrames,
        target.visibility,
        0,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
    }
  }

  await new Promise(resolve => setTimeout(resolve, durationFrames * (1000 / 60)));
}
