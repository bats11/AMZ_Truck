// src/MoveComponent.ts
import * as BABYLON from "@babylonjs/core";
import { animateTransformTo } from "./utils";
import { setMoveCameraTo } from "./babylonBridge";
import { transformSettings, TransformSetting } from "./transformSettings";

let modelRoot: BABYLON.TransformNode | null = null;
let initialTransform: { position: BABYLON.Vector3; rotation: BABYLON.Vector3; scaling: BABYLON.Vector3 } | null = null;
let currentScene: BABYLON.Scene | null = null;                             // ←
let isSelectMode = false;                                                   // ←
let idleResumeTimer: number | null = null;                                  // ←

// Parametri di idle
const IDLE_FRAME_RATE = 30;                                                 // ←
const IDLE_FRAME_COUNT = 150; // 5s per giro a 30fps                          // ←
const IDLE_RESUME_DELAY = 5000; // ms, configurabile                         // ←

/** Crea un’animazione idle loop da startY → startY + 2π, con opzionale easing */
function createIdleAnimation(startY: number, easing?: BABYLON.EasingFunction) {
  const anim = new BABYLON.Animation(
    "idleRot",
    "rotation.y",
    IDLE_FRAME_RATE,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
  );
  anim.setKeys([
    { frame: 0,                 value: startY },
    { frame: IDLE_FRAME_COUNT,  value: startY + 2 * Math.PI },
  ]);
  if (easing) anim.setEasingFunction(easing);
  return anim;
}

/** Interrompe qualunque timer di resume */
export function clearIdleResume() {                                         // ← export in caso serva altrove
  if (idleResumeTimer !== null) {
    clearTimeout(idleResumeTimer);
    idleResumeTimer = null;
  }
}

/** Programma, dopo delay, il resume dell’idling se ancora in select mode */
export function scheduleIdleResume() {                                      // ← export in caso serva altrove
  clearIdleResume();
  if (!currentScene) return;
  idleResumeTimer = window.setTimeout(() => {
    if (isSelectMode && modelRoot) {
      resumeIdleWithEaseIn();
    }
  }, IDLE_RESUME_DELAY);
}

/** Riprende l’idling con un ease-in partendo dalla rotY corrente */
function resumeIdleWithEaseIn() {                                           // ←
  if (!modelRoot || !currentScene) return;
  currentScene.stopAnimation(modelRoot);
  const currentY = modelRoot.rotation.y % (2 * Math.PI);
  const easeIn = new BABYLON.QuadraticEase();
  easeIn.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
  const idleAnim = createIdleAnimation(currentY, easeIn);
  modelRoot.animations = [idleAnim];
  currentScene.beginAnimation(modelRoot, 0, IDLE_FRAME_COUNT, true);
}

/** Chiamata da React: entriamo in select mode */
export function enterSelectMode() {                                         // ← export
  isSelectMode = true;
  scheduleIdleResume();
}
/** Chiamata da React: usciamo da select mode */
export function exitSelectMode() {                                          // ← export
  isSelectMode = false;
  if (modelRoot && currentScene) {
    currentScene.stopAnimation(modelRoot);
  }
  clearIdleResume();
}

/** Setup initial scene, entrance + idle */
export function setupMovementControls(scene: BABYLON.Scene) {
  currentScene = scene;                                                     // ←
  modelRoot = scene.getTransformNodeByName("ModelRoot");
  if (!modelRoot) return;

  // 1) Stato di reset (fine entrance)
  initialTransform = {
    position: new BABYLON.Vector3(0, 1, 0),
    rotation: new BABYLON.Vector3(0, 0, 0),
    scaling: new BABYLON.Vector3(1.1, 1.1, 1.1),
  };

  // 2) Entry state (off-screen + piccola)
  modelRoot.position = new BABYLON.Vector3(0, 3, 0);
  modelRoot.rotation = initialTransform.rotation.clone();
  modelRoot.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);

  // 3) Entrance: bounce + rotazione Y
  setTimeout(() => {
    const frameRate = 60;
    const duration = 1.8;
    const total = frameRate * duration;
    const easing = new BABYLON.CubicEase();
    easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

    const scaleAnim = new BABYLON.Animation(
      "entranceScale", "scaling", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3
    );
    scaleAnim.setKeys([
      { frame: 0,           value: new BABYLON.Vector3(0.1, 0.1, 0.1) },
      { frame: total * 0.8, value: new BABYLON.Vector3(1.2, 1.2, 1.2) },
      { frame: total,       value: initialTransform!.scaling.clone() },
    ]);
    scaleAnim.setEasingFunction(easing);

    const rotAnim = new BABYLON.Animation(
      "entranceRot", "rotation.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT
    );
    rotAnim.setKeys([
      { frame: 0,     value: 0 },
      { frame: total, value: Math.PI / 2 },
    ]);

    scene
      .beginDirectAnimation(modelRoot!, [scaleAnim, rotAnim], 0, total, false)
      .onAnimationEndObservable.add(() => {
        // 4) Alla fine entrance: idle lineare starting from end state
        const endY = modelRoot!.rotation.y % (2 * Math.PI);
        const idleLinear = createIdleAnimation(endY);                       // ← lineare, senza easing
        modelRoot!.animations = [idleLinear];
        scene.beginAnimation(modelRoot!, 0, IDLE_FRAME_COUNT, true);
      });
  }, 500);

  // 5) UI buttons: only i due di select experience
  setMoveCameraTo(async (label: string) => {
    if (!modelRoot || !currentScene) return;
    currentScene.stopAnimation(modelRoot);                                   // ← stop idle
    clearIdleResume();                                                       // ← clear timer

    // esegui la trasformazione esistente...
    const settings = transformSettings[label];
    if (settings) {
      await animateTransformTo(modelRoot, settings);
    }

    // 6) al termine, se siamo ancora in select mode, schedule spawn of idle
    scheduleIdleResume();
  });
}

/** Reset “Return to Start” */
export function resetModelTransform() {
  if (!modelRoot || !initialTransform || !currentScene) return;
  currentScene.stopAnimation(modelRoot);
  animateTransformTo(modelRoot, {
    position: initialTransform.position,
    rotation: initialTransform.rotation,
    scaling: initialTransform.scaling,
  }).then(() => {
    // reinizia loop lineare
    const idleLinear = createIdleAnimation(0);                              // 0 perché reset rot=0
    modelRoot!.animations = [idleLinear];
    currentScene!.beginAnimation(modelRoot!, 0, IDLE_FRAME_COUNT, true);
  });
}
