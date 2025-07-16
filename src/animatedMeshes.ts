import * as BABYLON from "@babylonjs/core";
import { TransformSetting } from "./transformSettings";

export async function handleAnimatedMeshes(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  settings?: TransformSetting
): Promise<void> {
  console.log("🎬 handleAnimatedMeshes triggered");
}
