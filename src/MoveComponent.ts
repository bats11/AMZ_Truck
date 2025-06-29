// src/moveComponent.ts
import * as BABYLON from "@babylonjs/core";
import { animateTransformTo } from "./utils";
import { setMoveCameraTo } from "./babylonBridge";
import { transformSettings } from "./transformSettings";

let modelRoot: BABYLON.TransformNode | null = null;

/**
 * Inizializza il nodo radice del modello e gestisce la logica di rotazione su comandi esterni.
 */
export function setupMovementControls(scene: BABYLON.Scene) {
  modelRoot = scene.getTransformNodeByName("ModelRoot");
  if (!modelRoot) return;

  // Impostazioni iniziali personalizzabili
  modelRoot.position = new BABYLON.Vector3(0, 4, 0); // ← modificabile
  modelRoot.rotation = new BABYLON.Vector3(
    BABYLON.Tools.ToRadians(0),
    BABYLON.Tools.ToRadians(0),
    BABYLON.Tools.ToRadians(0)
  );
  modelRoot.scaling = new BABYLON.Vector3(1.1 ,1.1 ,1.1);

  // 🔵 Aggiunge una sfera visiva per mostrare la posizione della root
 /* const debugSphere = BABYLON.MeshBuilder.CreateSphere("debugSphere", {
    diameter: 0.2,
  }, scene);
  debugSphere.position = modelRoot.position.clone();

  const debugMat = new BABYLON.StandardMaterial("debugMat", scene);
  debugMat.diffuseColor = new BABYLON.Color3(0, 0, 1); // blu acceso
  debugSphere.material = debugMat;

  // 🔁 Sincronizza la sfera alla posizione della root (runtime)
  scene.onBeforeRenderObservable.add(() => {
    if (modelRoot) {
      debugSphere.position = modelRoot.getAbsolutePosition();
    }
  });*/


  setMoveCameraTo((label) => {
    if (!modelRoot) return;
      const settings = transformSettings[label];
    if (settings) {
      animateTransformTo(modelRoot, settings);
    }
  });
}

/**
 * Modifica dinamicamente transform del nodo root.
 */
export function setModelTransform(options: {
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
  scaling?: BABYLON.Vector3;
}) {
  if (!modelRoot) return;

  if (options.position) modelRoot.position = options.position;
  if (options.rotation) modelRoot.rotation = options.rotation;
  if (options.scaling) modelRoot.scaling = options.scaling;
}

/**
 * Accesso al nodo radice per ispezioni o altri usi.
 */
export function getModelRoot(): BABYLON.TransformNode | null {
  return modelRoot;
}
