// src/TouchRotation.ts
import * as BABYLON from "@babylonjs/core";

let rootNode: BABYLON.TransformNode | null = null;
let isDragging = false;
let lastX = 0;
let velocity = 0;
let animationFrame: number | null = null;

const ROTATION_SPEED = 0.005;
const INERTIA_DECAY = 0.95;
const MIN_VELOCITY = 0.0001;

export function enableTouchRotation(node: BABYLON.TransformNode, canvas: HTMLCanvasElement) {
  rootNode = node;

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerUp);
}

function onPointerDown(e: PointerEvent) {
  if (!rootNode) return;
  isDragging = true;
  lastX = e.clientX;
  velocity = 0;

  // Ferma eventuale inerzia attiva
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging || !rootNode) return;

  const deltaX = e.clientX - lastX;
  lastX = e.clientX;

  const deltaRot = deltaX * ROTATION_SPEED;
  rootNode.rotation.y -= deltaRot;
  velocity = deltaRot;
}

function onPointerUp() {
  isDragging = false;
  applyInertia();
}

function applyInertia() {
  if (!rootNode || isDragging) return;

  if (Math.abs(velocity) > MIN_VELOCITY) {
    rootNode.rotation.y -= velocity;
    velocity *= INERTIA_DECAY;
    animationFrame = requestAnimationFrame(applyInertia);
  } else {
    velocity = 0;
    animationFrame = null;
  }
}
