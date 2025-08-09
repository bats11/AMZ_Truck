// src/logic/entryAnimation.ts
import * as BABYLON from "@babylonjs/core";
import { createQuaternionAnimation, degToRad } from "./utils";

/* ────────────────────────────────────────────────────────────────────────────
   ENTRY ORIGINALE (lasciata invariata)
   - Alla fine richiama il "legacy" startIdleLoopRotation su rotation.y
   -------------------------------------------------------------------------- */
export function playEntryAnimation(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  initialTransform: { position: BABYLON.Vector3; rotation: BABYLON.Vector3; scaling: BABYLON.Vector3 }
) {
  const frameRate = 60;
  const durationSec = 3;
  const totalFrames = durationSec * frameRate;

  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

  const scaleAnim = new BABYLON.Animation(
    "appearanceScale",
    "scaling",
    frameRate,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3
  );
  scaleAnim.setKeys([
    { frame: 0, value: node.scaling.clone() },
    { frame: totalFrames, value: initialTransform.scaling.clone() },
  ]);
  scaleAnim.setEasingFunction(easing);

  const rotAnim = new BABYLON.Animation(
    "appearanceRot",
    "rotation",
    frameRate,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3
  );
  const startRot = node.rotation.clone();
  const endRot = initialTransform.rotation.clone();
  rotAnim.setKeys([
    { frame: 0, value: startRot },
    { frame: totalFrames * 0.4, value: BABYLON.Vector3.Lerp(startRot, endRot, 0.7) },
    { frame: totalFrames * 0.75, value: BABYLON.Vector3.Lerp(startRot, endRot, 0.9) },
    { frame: totalFrames, value: endRot },
  ]);

  scene.beginDirectAnimation(
    node,
    [scaleAnim, rotAnim],
    0,
    totalFrames,
    false,
    1.0,
    () => {
      startIdleLoopRotation(node, scene, startRot.y, endRot.y, totalFrames);
      window.dispatchEvent(new Event("entry-animation-finished"));
    }
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   LEGACY — loop su rotation.y (usato solo dall'entry originale)
   -------------------------------------------------------------------------- */
export function startIdleLoopRotation(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  startY: number,
  endY: number,
  totalFrames: number
) {
  const frameRate = 60;
  const frameStartFraction = 0.75;
  const interpFraction = 0.9;
  const frameStart = totalFrames * frameStartFraction;
  const frameEnd = totalFrames;
  const frameDelta = frameEnd - frameStart;

  const midY = BABYLON.Scalar.Lerp(startY, endY, interpFraction);
  const finalY = endY;

  const angleDelta = finalY - midY;
  const angularSpeed = angleDelta / frameDelta;

  if (Math.abs(angularSpeed) < 1e-5) {
    console.warn("⚠️ Velocità troppo bassa, loop non avviato.");
    return;
  }

  const fullRotation = Math.PI * 2;
  const loopDuration = Math.abs(fullRotation / angularSpeed);

  const currentY = node.rotation.y;
  const targetY = currentY + (angularSpeed > 0 ? fullRotation : -fullRotation);

  const loopAnim = new BABYLON.Animation(
    "loopRotationY",
    "rotation.y",
    frameRate,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
  );
  loopAnim.setKeys([
    { frame: 0, value: currentY },
    { frame: loopDuration, value: targetY },
  ]);

  node.animations = [loopAnim];
  scene.beginAnimation(node, 0, loopDuration, true);
}

/* ────────────────────────────────────────────────────────────────────────────
   NUOVO SPIN: Accelerazione (ease-in) → Tratto a velocità costante → Loop
   - lavoriamo su rotationQuaternion per evitare gimbal
   - usiamo il tratto costante per definire ω (come nel caso che funziona già)
   - opzione space: "world" (qΔ * q) o "local" (q * qΔ)
   - normalizzazione periodica per stabilità numerica
   -------------------------------------------------------------------------- */

type IdleLoopState = {
  observer: BABYLON.Nullable<BABYLON.Observer<BABYLON.Scene>>;
  angularSpeed: number; // rad/sec
  space: "world" | "local";
};
const _idleLoopByNode = new WeakMap<BABYLON.TransformNode, IdleLoopState>();

export function stopIdleSpin(node: BABYLON.TransformNode, scene: BABYLON.Scene) {
  const st = _idleLoopByNode.get(node);
  if (st?.observer) scene.onBeforeRenderObservable.remove(st.observer);
  _idleLoopByNode.delete(node);
}

function startManualQuaternionLoop(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  angularSpeedRadSec: number,
  space: "world" | "local" = "world"
) {
  stopIdleSpin(node, scene);

  if (!node.rotationQuaternion) {
    node.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(node.rotation.clone());
  }

  let tick = 0;
  const obs = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000; // sec
    const yawStep = angularSpeedRadSec * dt;
    const qDelta = BABYLON.Quaternion.FromEulerAngles(0, yawStep, 0);
    node.rotationQuaternion =
      space === "world"
        ? qDelta.multiply(node.rotationQuaternion!)
        : node.rotationQuaternion!.multiply(qDelta);

    // micro drift guard
    if ((++tick & 63) === 0) node.rotationQuaternion!.normalize();
  });

  _idleLoopByNode.set(node, { observer: obs, angularSpeed: angularSpeedRadSec, space });
}

/**
 * Ripartenza spin dopo il rientro in Selection, stile “accel → costante → loop”.
 *
 * Fasi:
 *  A) Accelerazione (ease-in) su un piccolo Δθ_accel
 *  B) Tratto a velocità costante (easing lineare) su Δθ_const, durata T_const
 *     ⇒ velocità del loop ω = Δθ_const / T_const
 *  C) Avvio del loop manuale con la stessa ω (seamless)
 *
 * Valori “soft” default pensati per essere discreti:
 *  - delaySec: 2.5  (attesa prima di iniziare qualsiasi cosa)
 *  - accelAngleDeg: 12°
 *  - accelDurationSec: 0.9s
 *  - constAngleDeg: 8°
 *  - constDurationSec: 0.5s
 *  - direction: +1
 *  - space: "world"
 */
export function startIdleSpinFromSelection(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  options?: {
    delaySec?: number;
    accelAngleDeg?: number;
    accelDurationSec?: number;
    constAngleDeg?: number;
    constDurationSec?: number;
    direction?: 1 | -1;
    space?: "world" | "local";
  }
) {
  const {
    delaySec = 2.5,
    accelAngleDeg = 12,
    accelDurationSec = 0.9,
    constAngleDeg = 8,
    constDurationSec = 0.5,
    direction = 1,
    space = "world",
  } = options ?? {};

  // Preparazione
  scene.stopAnimation(node);
  stopIdleSpin(node, scene);

  if (!node.rotationQuaternion) {
    node.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(node.rotation.clone());
  }

  // Timer esterno (partenza “dopo qualche secondo”)
  setTimeout(() => {
    const frameRate = 60;

    // Stato iniziale
    const q0 = node.rotationQuaternion!.clone();

    // === Fase A: Accelerazione (ease-in su quaternion)
    const deltaYawA = degToRad(accelAngleDeg) * direction;
    const qA = BABYLON.Quaternion.FromEulerAngles(0, deltaYawA, 0);
    const q1 = qA.multiply(q0);

    const easeIn = new BABYLON.CubicEase();
    easeIn.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);

    const framesA = Math.max(1, Math.round(accelDurationSec * frameRate));
    const animA = createQuaternionAnimation(q0, q1, 0, framesA, easeIn);

    // === Fase B: Tratto a velocità costante (lineare)
    const deltaYawB = degToRad(constAngleDeg) * direction;
    const qB = BABYLON.Quaternion.FromEulerAngles(0, deltaYawB, 0);
    const q2 = qB.multiply(q1);

    const linear = new BABYLON.PowerEase(1); // lineare
    linear.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

    const framesB = Math.max(1, Math.round(constDurationSec * frameRate));
    const animB = createQuaternionAnimation(q1, q2, 0, framesB, linear);

    // Sequenza: A poi B, poi loop con ω = Δθ_const / T_const
    scene.beginDirectAnimation(
      node,
      [animA],
      0,
      framesA,
      false,
      1.0,
      () => {
        scene.beginDirectAnimation(
          node,
          [animB],
          0,
          framesB,
          false,
          1.0,
          () => {
            const omega = deltaYawB / constDurationSec; // rad/sec dal tratto costante
            startManualQuaternionLoop(node, scene, omega, space);
          }
        );
      }
    );
  }, Math.max(0, delaySec) * 1000);
}
