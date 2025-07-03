// src/TouchRotation.ts
import * as BABYLON from "@babylonjs/core";
import { getTouchLocked } from "./babylonBridge";

let rootNode: BABYLON.TransformNode | null = null;
let isDragging = false;
let lastX = 0;
let velocityY = 0;
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
  if (!rootNode || getTouchLocked()) return;

  // → interrompi l’animazione di loop Babylon sul nodo
  const scene = rootNode.getScene();
  scene.stopAnimation(rootNode);

  // → interrompi eventuale inertia JS pendente
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  velocityY = 0;

  // → inizia il drag touch
  isDragging = true;
  lastX = e.clientX;
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging || !rootNode || getTouchLocked()) return;

  const deltaX = e.clientX - lastX;
  lastX = e.clientX;

  const rotY = deltaX * ROTATION_SPEED;
  rootNode.rotation.y -= rotY;
  velocityY = rotY;
}

function onPointerUp() {
  if (!rootNode) return;

  isDragging = false;
  applyInertia();
}

function applyInertia() {
  if (!rootNode || isDragging || getTouchLocked()) return;

  if (Math.abs(velocityY) > MIN_VELOCITY) {
    rootNode.rotation.y -= velocityY;
    velocityY *= INERTIA_DECAY;
    animationFrame = requestAnimationFrame(applyInertia);
  } else {
    animationFrame = null;
  }
}
