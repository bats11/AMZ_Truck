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

  engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
  const scene = new BABYLON.Scene(engine);

  const camera = setupCamera(scene, canvas);

  const pipeline = new BABYLON.DefaultRenderingPipeline("defaultPipeline", true, scene, [camera]);
  pipeline.fxaaEnabled = true;

  const shadowGenerator = await setupLighting(scene);
  setupBackground(scene);

  loadModel(scene, (meshes, bounding) => {

  console.log("📦 Nodi disponibili nella scena:");
  scene.meshes.forEach((m) => console.log(`Mesh: ${m.name}`));
  scene.transformNodes.forEach((n) => console.log(`Node: ${n.name}`));


    for (const mesh of meshes) {
      mesh.receiveShadows = true;
      shadowGenerator.addShadowCaster(mesh, true);
    }

    setupMovementControls(scene, camera);

    const root = scene.getTransformNodeByName("ModelRoot");
    if (root) {
      enableTouchRotation(root, canvas);
    }
  }, () => {
    // ✅ Notifica React al termine del caricamento
    window.dispatchEvent(new Event("model-loaded"));
  });

  mountUI();

  const resizeCanvas = () => engine.resize();
  new ResizeObserver(resizeCanvas).observe(canvas as unknown as Element);
  window.addEventListener("resize", resizeCanvas);
  engine.resize();

  (window as any)._BABYLON_SCENE = scene; // ✅ rende accessibile la scena

  engine.runRenderLoop(() => scene.render());
}
