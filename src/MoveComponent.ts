import * as BABYLON from "@babylonjs/core";
import { animateRotationTo } from "./utils";
import { setMoveCameraTo } from "./babylonBridge";

let modelRoot: BABYLON.TransformNode | null = null;

export function setupMovementControls(center: BABYLON.Vector3, scene: BABYLON.Scene) {
  modelRoot = scene.getTransformNodeByName("ModelRoot");
  if (!modelRoot) return;
  modelRoot.position = center;

  const presetAngles: Record<string, number> = {
    "FRONT SIDE": 0,
    "DRIVER SIDE": Math.PI / 2,
    "BACK SIDE": Math.PI,
    "PASSENGER SIDE": 3 * Math.PI / 2,
    "IN CAB": 0, // oppure personalizzato
  };

  setMoveCameraTo((label) => {
    if (!modelRoot) return;
    const angle = presetAngles[label];
    if (angle !== undefined) {
      animateRotationTo(modelRoot, angle);
    }
  });
}
