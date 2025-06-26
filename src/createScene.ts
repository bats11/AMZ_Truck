// src/createScene.ts
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/Textures/Loaders";

import { setupCamera } from "./setupCamera";
import { setupLighting } from "./setupLighting";
import { loadModel } from "./loadModel";
import { mountUI } from "./react/MainUI";
import { setupMovementControls } from "./MoveComponent";
import { enableTouchRotation } from "./TouchRotation";

export async function createScene() {
  const el = document.getElementById("renderCanvas");
  if (!(el instanceof HTMLCanvasElement)) {
    throw new Error("Element with id 'renderCanvas' is not a canvas element");
  }
  const canvas: HTMLCanvasElement = el;

  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    premultipliedAlpha: true,
  });

  const scene = new BABYLON.Scene(engine);

  setupCamera(scene, canvas);
  await setupLighting(scene);

  loadModel(scene, (meshes, bounding) => {
    const center = bounding.min.add(bounding.max).scale(0.5);
    setupMovementControls(center, scene);

    const root = scene.getTransformNodeByName("ModelRoot");
    if (root) {
      enableTouchRotation(root, canvas);
    }
  });

  mountUI();

  // ✅ Resize engine when canvas resizes (important for CSS-driven layout)
  const resizeCanvas = () => engine.resize();
  new ResizeObserver(resizeCanvas).observe(canvas as unknown as Element);
  window.addEventListener("resize", resizeCanvas);
  engine.resize();

  engine.runRenderLoop(() => scene.render());
}
