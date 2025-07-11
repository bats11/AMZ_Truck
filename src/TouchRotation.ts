// src/TouchRotation.ts
import * as BABYLON from "@babylonjs/core";
import { getTouchLocked } from "./babylonBridge";

let rootNode: BABYLON.TransformNode | null = null;
let isDragging = false;
let lastX = 0;
let lastY = 0;
let velocityX = 0;
let velocityY = 0;
let animationFrame: number | null = null;

const ROTATION_SPEED = 0.005;
const INERTIA_DECAY = 0.97;
const MIN_VELOCITY = 0.0001;

export function enableTouchRotation(node: BABYLON.TransformNode, canvas: HTMLCanvasElement) {
  rootNode = node;

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerUp);
}

function onPointerDown(e: PointerEvent) {
  if (!rootNode || getTouchLocked()) return;

  const scene = rootNode.getScene();
  scene.stopAnimation(rootNode);

  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  velocityX = 0;
  velocityY = 0;

  // Assicura che rotationQuaternion sia attivo
  if (!rootNode.rotationQuaternion) {
    rootNode.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(rootNode.rotation.clone());
  }
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging || !rootNode || getTouchLocked()) return;

  const deltaX = e.clientX - lastX;
  const deltaY = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;

  const rotY = deltaX * ROTATION_SPEED;
  const rotX = deltaY * ROTATION_SPEED;

  velocityX = rotX;
  velocityY = rotY;

  const qDeltaX = BABYLON.Quaternion.FromEulerAngles(-rotX, 0, 0);
  const qDeltaY = BABYLON.Quaternion.FromEulerAngles(0, -rotY, 0);
  const qDelta = qDeltaX.multiply(qDeltaY);

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

  if (Math.abs(velocityX) > MIN_VELOCITY || Math.abs(velocityY) > MIN_VELOCITY) {
    const qDeltaX = BABYLON.Quaternion.FromEulerAngles(-velocityX, 0, 0);
    const qDeltaY = BABYLON.Quaternion.FromEulerAngles(0, -velocityY, 0);
    const qDelta = qDeltaX.multiply(qDeltaY);

    rootNode.rotationQuaternion = qDelta.multiply(rootNode.rotationQuaternion!);

    velocityX *= INERTIA_DECAY;
    velocityY *= INERTIA_DECAY;
    applied = true;
  }

  if (applied) {
    animationFrame = requestAnimationFrame(applyInertia);
  } else {
    animationFrame = null;
  }
}
