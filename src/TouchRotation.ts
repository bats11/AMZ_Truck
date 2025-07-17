// src/TouchRotation.ts
import * as BABYLON from "@babylonjs/core";
import { getTouchLocked } from "./babylonBridge";

let rootNode: BABYLON.TransformNode | null = null;
let isDragging = false;
let lastX = 0;
let velocityY = 0;
let animationFrame: number | null = null;

const ROTATION_SPEED = 0.005;
const INERTIA_DECAY = 0.97;
const MIN_VELOCITY = 0.0001;

let canvasRef: HTMLCanvasElement | null = null;

export function enableTouchRotation(node: BABYLON.TransformNode, canvas: HTMLCanvasElement) {
  rootNode = node;
  canvasRef = canvas;

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerUp);
}

function onPointerDown(e: PointerEvent) {
  if (!rootNode || getTouchLocked() || !canvasRef) return;

  const scene = rootNode.getScene();
  const rect = canvasRef.getBoundingClientRect();

  // Coordinate relative al canvas
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const pickResult = scene.pick(x, y);

  if (!pickResult?.hit || !isDescendantOf(pickResult.pickedMesh, rootNode)) return;

  scene.stopAnimation(rootNode);

  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  isDragging = true;
  lastX = e.clientX;
  velocityY = 0;

  if (!rootNode.rotationQuaternion) {
    rootNode.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(rootNode.rotation.clone());
  }
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging || !rootNode || getTouchLocked()) return;

  const deltaX = e.clientX - lastX;
  lastX = e.clientX;

  const rotY = deltaX * ROTATION_SPEED;
  velocityY = rotY;

  const qDelta = BABYLON.Quaternion.FromEulerAngles(0, -rotY, 0);
  rootNode.rotationQuaternion = qDelta.multiply(rootNode.rotationQuaternion!);
}

function onPointerUp() {
  if (!rootNode) return;
  isDragging = false;
  applyInertia();
}

function applyInertia() {
  if (!rootNode || isDragging || getTouchLocked()) return;

  let applied = false;

  if (Math.abs(velocityY) > MIN_VELOCITY) {
    const qDelta = BABYLON.Quaternion.FromEulerAngles(0, -velocityY, 0);
    rootNode.rotationQuaternion = qDelta.multiply(rootNode.rotationQuaternion!);

    velocityY *= INERTIA_DECAY;
    applied = true;
  }

  if (applied) {
    animationFrame = requestAnimationFrame(applyInertia);
  } else {
    animationFrame = null;
  }
}

function isDescendantOf(mesh: BABYLON.AbstractMesh | null, parent: BABYLON.Node): boolean {
  while (mesh) {
    if (mesh === parent) return true;
    mesh = mesh.parent as BABYLON.AbstractMesh;
  }
  return false;
}
