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

  const exitDistance = -7;
  const duration = 1.2; // secondi
  const frameRate = 60;
  const totalFrames = frameRate * duration;

  const promises = bagNodes.map((bagNode) => {
    const start = bagNode.position.clone();
    const end = start.add(new BABYLON.Vector3(0, 0, exitDistance));

    const anim = createAnimation("position", start, end, 0, totalFrames, easing);
    const delay = Math.random() * 600;

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // 1️⃣ Spostamento wrapper
        scene.beginDirectAnimation(bagNode, [anim], 0, totalFrames, false, 1);

        // 2️⃣ Fade out visibilità su tutte le mesh
        const childMeshes = bagNode.getChildMeshes(false);
        childMeshes.forEach((mesh) => {
          const visibilityAnim = new BABYLON.Animation(
            `${mesh.name}_visibilityAnim`,
            "visibility",
            frameRate,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
          );

          visibilityAnim.setKeys([
            { frame: 0, value: 1 },
            { frame: totalFrames, value: 0 },
          ]);

          visibilityAnim.setEasingFunction(easing);

          scene.beginDirectAnimation(mesh, [visibilityAnim], 0, totalFrames, false, 1);
        });

        // 3️⃣ Risolvi al termine della durata animazione
        setTimeout(() => {
          console.log(`👋 Bag ${bagNode.name} spostata fuori vista (stand-by + fade out)`);
          resolve();
        }, totalFrames * (1000 / frameRate));
      }, delay);
    });
  });

  await Promise.all(promises);
  console.log("🧹 Tutte le bag animate in uscita con fade out.");
}
