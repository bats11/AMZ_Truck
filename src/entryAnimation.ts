// src/entryAnimation.ts
import * as BABYLON from "@babylonjs/core";

/* ────────────────────────────────────────────────────────────────────────────
   ENTRY ORIGINALE (invariata)
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
   LEGACY loop su rotation.y (invariato)
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
   LOOP MANUALE SU QUATERNION
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
    const dt = scene.getEngine().getDeltaTime() / 1000;
    const yawStep = angularSpeedRadSec * dt;
    const qDelta = BABYLON.Quaternion.FromEulerAngles(0, yawStep, 0);
    node.rotationQuaternion =
      space === "world"
        ? qDelta.multiply(node.rotationQuaternion!)
        : node.rotationQuaternion!.multiply(qDelta);
    // normalizziamo ogni tanto per stabilità numerica
    if ((++tick & 63) === 0) node.rotationQuaternion!.normalize();
  });

  _idleLoopByNode.set(node, { observer: obs, angularSpeed: angularSpeedRadSec, space });
}

/* ────────────────────────────────────────────────────────────────────────────
   START IDLE SPIN — fisico (accel costante) → costante → loop
   Nessun easing/keyframe: integrazione per-frame, 100% controllo della velocità.
   -------------------------------------------------------------------------- */
export function startIdleSpinFromSelection(
  node: BABYLON.TransformNode,
  scene: BABYLON.Scene,
  options?: {
    delaySec?: number;
    accelDurationSec?: number;   // durata fase A (accelerazione)
    constDurationSec?: number;   // durata fase B (costante, pre-loop) — opzionale
    constAngleDeg?: number;      // angolo percorso nella fase costante (per ricavare ω_target)
    direction?: 1 | -1;
    space?: "world" | "local";
  }
) {
  const {
    delaySec = 2.5,
    accelDurationSec = 0.9,
    constDurationSec = 0.5,
    constAngleDeg = 8,          // useremo questo + constDurationSec per ricavare ω_target
    direction = 1,
    space = "world",
  } = options ?? {};

  // fermiamo tutto ciò che potrebbe interferire
  scene.stopAnimation(node);
  stopIdleSpin(node, scene);

  if (!node.rotationQuaternion) {
    node.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(node.rotation.clone());
  }

  // ω_target (rad/sec): da “angolo percorso nel tratto costante / durata tratto costante”
  const omegaTarget = (BABYLON.Tools.ToRadians(constAngleDeg) * direction) / Math.max(constDurationSec, 0.0001);
  const accelTime = Math.max(accelDurationSec, 0.0001);
  const alpha = omegaTarget / accelTime; // accelerazione angolare costante (rad/sec^2)

  setTimeout(() => {
    let phase: "accel" | "constant" = "accel";
    let elapsed = 0;
    let omega = 0; // rad/sec
    let constElapsed = 0;

    // assicuriamo un solo observer alla volta
    const existing = _idleLoopByNode.get(node);
    if (existing?.observer) {
      scene.onBeforeRenderObservable.remove(existing.observer);
      _idleLoopByNode.delete(node);
    }

    const obs = scene.onBeforeRenderObservable.add(() => {
      const dt = scene.getEngine().getDeltaTime() / 1000;
      if (dt <= 0) return;

      if (phase === "accel") {
        elapsed += dt;
        // ω cresce linearmente: ω = α * t  (limitato a ω_target)
        omega = Math.min(alpha * elapsed, Math.abs(omegaTarget)) * Math.sign(omegaTarget);

        // integrazione angolare
        const yawStep = omega * dt;
        const qDelta = BABYLON.Quaternion.FromEulerAngles(0, yawStep, 0);
        node.rotationQuaternion =
          space === "world"
            ? qDelta.multiply(node.rotationQuaternion!)
            : node.rotationQuaternion!.multiply(qDelta);

        if (elapsed >= accelTime) {
          // clamp finale
          omega = omegaTarget;
          phase = constDurationSec > 0 ? "constant" : "accel"; // se 0, passeremo subito al loop
          elapsed = accelTime;
        }
      }

      if (phase === "constant") {
        constElapsed += dt;

        const yawStep = omegaTarget * dt;
        const qDelta = BABYLON.Quaternion.FromEulerAngles(0, yawStep, 0);
        node.rotationQuaternion =
          space === "world"
            ? qDelta.multiply(node.rotationQuaternion!)
            : node.rotationQuaternion!.multiply(qDelta);

        if (constElapsed >= constDurationSec) {
          // chiudiamo il preview costante e partiamo col loop alla stessa ω
          scene.onBeforeRenderObservable.remove(obs);
          startManualQuaternionLoop(node, scene, omegaTarget, space);
        }
      }
    });

    // se constDurationSec è 0, passiamo al loop appena finita l'accelerazione
    if (constDurationSec <= 0) {
      // usiamo un piccolo timeout per lasciare eseguire almeno un frame di accel finale
      setTimeout(() => {
        scene.onBeforeRenderObservable.remove(obs);
        startManualQuaternionLoop(node, scene, omegaTarget, space);
      }, 0);
    }

    // manteniamo traccia (utile per eventuale stop esterno)
    _idleLoopByNode.set(node, { observer: obs, angularSpeed: omegaTarget, space });
  }, delaySec * 1000);
}
