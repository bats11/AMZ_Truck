import * as BABYLON from "@babylonjs/core";
import { createAnimation } from "./utils";
import { getModelRoot } from "./MoveComponent";

export async function animateBagsExit(): Promise<void> {
  const modelRoot = getModelRoot();
  if (!modelRoot) {
    console.warn("⛔ ModelRoot (truck) non trovato.");
    return;
  }

  const scene = modelRoot.getScene();
  const bagNodes = modelRoot.getChildren().filter((node) =>
    node.name.startsWith("BagWrapper_")
  ) as BABYLON.TransformNode[];

  if (bagNodes.length === 0) {
    console.log("ℹ️ Nessuna bag da animare nel truck.");
    return;
  }

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  const exitDistance = -7; // quanto si spostano sulla Z
  const duration = 1.2; // secondi
  const frameRate = 60;
  const totalFrames = frameRate * duration;

  const promises = bagNodes.map((bagNode) => {
    const start = bagNode.position.clone();
    const end = start.add(new BABYLON.Vector3(0, 0, exitDistance));

    const anim = createAnimation("position", start, end, 0, totalFrames, easing);
    const delay = Math.random() * 600; // ritardo random da 0 a 600ms

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        scene.beginDirectAnimation(bagNode, [anim], 0, totalFrames, false, 1, () => {
          /*bagNode.getChildMeshes().forEach((m) => m.dispose());
          bagNode.dispose();*/
          console.log(`👋 Bag ${bagNode.name} spostata fuori vista (stand-by)`);
          resolve();
        });
      }, delay);
    });
  });

  await Promise.all(promises);
  console.log("🧹 Tutte le bag rimosse con animazione sfalsata.");
}
