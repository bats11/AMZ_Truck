import * as BABYLON from "@babylonjs/core";

/**
 * Crea una camera fissa nella scena.
 * Questa camera non si muove e non ruota attorno all'oggetto.
 */
export function setupCamera(scene: BABYLON.Scene, canvas: HTMLCanvasElement): BABYLON.FreeCamera {
  // Posizione fissa della camera
  const cameraPosition = new BABYLON.Vector3(0, 0, -24); // Regola altezza e distanza
  const target = new BABYLON.Vector3(0, -0.2, 0); // Punto che la camera guarda

  const camera = new BABYLON.FreeCamera("fixedCamera", cameraPosition, scene);
  camera.setTarget(target);

  camera.attachControl(canvas, true);

    // 🎯 Imposta il Field of View in radianti (es. 0.6 ≈ 34.3°, 1.0 ≈ 57.3°, 1.5 ≈ 85.9°)
  camera.fov = BABYLON.Tools.ToRadians(37);

  // Disattiva input (rotazione/movimento)
  camera.inputs.clear();

  return camera;
}
