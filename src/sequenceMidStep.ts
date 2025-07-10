import * as BABYLON from "@babylonjs/core";
import { TransformSetting } from "./transformSettings";

/**
 * Nasconde i nodi specificati da `settings.hiddenNodes` e li aggiunge a `previouslyHiddenNodes`.
 */
export async function handleCustomSequenceMidStep(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  settings?: TransformSetting,
  previouslyHiddenNodes?: Set<string>
): Promise<void> {
  if (!settings?.hiddenNodes) return;

  for (const name of settings.hiddenNodes) {
    const target = scene.getNodeByName(name);
    if (target && target instanceof BABYLON.AbstractMesh) {
      target.isVisible = false;
      previouslyHiddenNodes?.add(name);
    }
  }

  await new Promise(resolve => setTimeout(resolve, 0));
}
