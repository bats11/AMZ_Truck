import * as BABYLON from "@babylonjs/core";

/**
 * Crea una camera fissa nella scena.
 * Questa camera non si muove e non ruota attorno all'oggetto.
 */
export function setupCamera(scene: BABYLON.Scene, canvas: HTMLCanvasElement): BABYLON.FreeCamera {
  // Posizione fissa della camera
  const cameraPosition = new BABYLON.Vector3(0, 2, -10); // Regola altezza e distanza
  const target = new BABYLON.Vector3(0, 1.5, 0); // Punto che la camera guarda

  const camera = new BABYLON.FreeCamera("fixedCamera", cameraPosition, scene);
  camera.setTarget(target);

  camera.attachControl(canvas, true);

  // Disattiva input (rotazione/movimento)
  camera.inputs.clear();

  return camera;
}
