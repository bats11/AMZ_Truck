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
import { setupBackground } from "./setupBackground";

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

  // ✅ Risoluzione piena senza scaling sfocato
  engine.setHardwareScalingLevel(1 / window.devicePixelRatio);

  const scene = new BABYLON.Scene(engine);

  // 📷 Setup camera e pipeline
  const camera = setupCamera(scene, canvas);

  const pipeline = new BABYLON.DefaultRenderingPipeline("defaultPipeline", true, scene, [camera]);
  pipeline.fxaaEnabled = true;

  // 💡 Luci, sfondo, modello
  const shadowGenerator = await setupLighting(scene);
  setupBackground(scene);

  loadModel(scene, (meshes, bounding) => {
    for (const mesh of meshes) {
      mesh.receiveShadows = true;
      shadowGenerator.addShadowCaster(mesh, true);
    }

    setupMovementControls(scene);

    const root = scene.getTransformNodeByName("ModelRoot");
    if (root) {
      enableTouchRotation(root, canvas);
    }
  });

  // 🖱️ UI React
  mountUI();

  // 📐 Resize e render loop
  const resizeCanvas = () => engine.resize();
  new ResizeObserver(resizeCanvas).observe(canvas as unknown as Element);
  window.addEventListener("resize", resizeCanvas);
  engine.resize();

  engine.runRenderLoop(() => scene.render());
}
