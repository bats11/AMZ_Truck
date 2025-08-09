// src/LoadTruckController.ts
import * as BABYLON from "@babylonjs/core";
import { hideTruckSideMeshes } from "./vehicleLoadingTransform";
import { handleInterpolatedTransform } from "./transformHandlers";
import { CartEntity } from "./CartEntity";
import { BagEntity } from "./BagEntity";
import { slotManager } from "./SlotManager";

const FOCUS_POS = new BABYLON.Vector3(0, 0.3, -10);
const WAIT_POS_1 = new BABYLON.Vector3(2.5, 0.3, -10);
const WAIT_POS_2 = new BABYLON.Vector3(5, 0.3, -10);

// 🚪 Destinazione ANIMATA di uscita (comune a tutti)
const EXIT_POS = new BABYLON.Vector3(-6.5, 0.3, -10);

const BAG_STAGING_POS = new BABYLON.Vector3(0, 4, -12);
const STAGING_ROTATION = new BABYLON.Vector3(
  BABYLON.Tools.ToRadians(10),
  BABYLON.Tools.ToRadians(10),
  0
);

const BAG_STAGING_ROTATION = new BABYLON.Vector3(
  BABYLON.Tools.ToRadians(0),
  BABYLON.Tools.ToRadians(-15),
  0
);

const EXTRA_BAG_STAGING_ROTATION = new BABYLON.Vector3(
  BABYLON.Tools.ToRadians(270),
  BABYLON.Tools.ToRadians(-10),
  BABYLON.Tools.ToRadians(0)
);

const EXTRA_BAG_STAGING_POS = new BABYLON.Vector3(0, 4.4, -13.6);

export class LoadTruckController {
  private scene: BABYLON.Scene;
  private side: "left" | "right";
  private carts: CartEntity[] = [];

  // 🗺️ spawn pos per carrello (usato per calcolare il PARK dinamico = spawn + (5,0,0))
  private cartSpawnPos = new Map<string, BABYLON.Vector3>();

  constructor(scene: BABYLON.Scene, side: "left" | "right") {
    this.scene = scene;
    this.side = side;
    this.begin();
  }

  private async begin() {
    slotManager.setRightSide(this.side === "right");
    await hideTruckSideMeshes(this.side, this.scene, [], ["SM_Cargo_Bay_cut"]);

    const allCarts = (window as any)._CART_ENTITIES as CartEntity[] | undefined;
    if (!allCarts || allCarts.length === 0) return;
    this.carts = allCarts;

    // 📌 Cattura spawnPos prima di qualsiasi spostamento
    for (const cart of this.carts) {
      const root = cart.root as BABYLON.TransformNode & { metadata?: any };
      const metaSpawn: BABYLON.Vector3 | undefined = root.metadata?.spawnPos;
      const spawn = (metaSpawn ? metaSpawn.clone() : root.position.clone());
      this.cartSpawnPos.set(cart.id, spawn);
    }

    if (this.side === "left") {
      await this.layoutCartsForPhase("normal");
    }

    window.dispatchEvent(new CustomEvent("show-slot-overlay"));

    const focus = this.getCartsForPhase("normal")[0];
    if (focus) {
      await this.iterateBagsInCart(focus);
    }
  }

  // =============== Helpers fase / selezione carrelli ===============

  /** Ritorna i carrelli che hanno ancora bag in base alla fase */
  private getCartsForPhase(phase: "normal" | "extra"): CartEntity[] {
    if (phase === "normal") {
      return this.carts.filter(c => c.getLoadedBags().some(b => !b.isExtra));
    }
    return this.carts.filter(c => c.getLoadedBags().some(b => b.isExtra));
  }

  /** Posiziona fino a 3 carrelli per la fase indicata: focus + 2 attese; gli altri parcheggiati (posizione diretta) */
  private async layoutCartsForPhase(phase: "normal" | "extra") {
    const active = this.getCartsForPhase(phase);
    const toFocus = active[0];
    const toWait1 = active[1];
    const toWait2 = active[2];

    const moves: Promise<void>[] = [];

    for (const cart of this.carts) {
      if (cart === toFocus) {
        moves.push(this.moveCartTo(cart, FOCUS_POS));
      } else if (cart === toWait1) {
        moves.push(this.moveCartTo(cart, WAIT_POS_1));
      } else if (cart === toWait2) {
        moves.push(this.moveCartTo(cart, WAIT_POS_2));
      } else {
        // Parcheggio "statico" per chi non è attivo in questa fase: spawn + (5,0,0)
        const spawn = this.cartSpawnPos.get(cart.id) ?? cart.root.position.clone();
        const parkPos = spawn.add(new BABYLON.Vector3(5, 0, 0));
        moves.push(this.moveCartTo(cart, parkPos));
      }
    }

    await Promise.all(moves);
  }

  // ===================== Flusso bag normali ========================

  private async iterateBagsInCart(cart: CartEntity) {
    const bags = cart.getLoadedBags().filter(b => !b.isExtra).slice().reverse();

    for (const bag of bags) {
      const worldMatrix = bag.root.getWorldMatrix();
      const worldPos = worldMatrix.getTranslation();
      bag.root.setParent(null);
      bag.root.position.copyFrom(worldPos);
      cart.removeBag(bag);

      await this.moveBagTo(bag, BAG_STAGING_POS);

      slotManager.registerCorrectBag(bag);
      slotManager.setActiveBag(bag);
      await slotManager.waitForAssignment();

      if (slotManager.isFull()) {
        const result = slotManager.validate();
        console.log("🧪 Validazione sinistra:", result);

        (window as any)._UI_VALIDATION_RESULT = {
          isValid: result.isValid,
          errorCount: result.errors.length,
        };

        window.dispatchEvent(new Event("clear-slot-errors"));

        if (!result.isValid) {
          const errorSlots = result.errors.map(e =>
            typeof e === "number" ? e : e.slot
          );
          console.log("❌ Highlight error slots (left)", errorSlots);
          window.dispatchEvent(new CustomEvent("highlight-error-slots", {
            detail: { errors: errorSlots }
          }));
        }

        (window as any).setVehicleUiStage?.("leftResults");
        return;
      }
    }

    // Finite le bag normali di questo carrello
    const cartHasExtra = cart.getLoadedBags().some(b => b.isExtra);
    if (cartHasExtra) {
      await this.iterateExtraBagsInCart(cart);
      return;
    }

    // ⬇️ Nessuna rimozione dall’array e nessun dispose: esci e parcheggia dinamicamente
    await this.slideOutCart(cart);

    const hasMoreNormalBags = this.getCartsForPhase("normal").length > 0;

    if (hasMoreNormalBags) {
      await this.layoutCartsForPhase("normal");
      const nextFocus = this.getCartsForPhase("normal")[0];
      if (nextFocus) await this.iterateBagsInCart(nextFocus);
    } else {
      const nextExtra = this.getCartsForPhase("extra")[0];
      if (nextExtra) {
        window.dispatchEvent(new CustomEvent("start-extra-bags"));
        await this.layoutCartsForPhase("extra");
        await this.iterateExtraBagsInCart(nextExtra);
      } else {
        const result = slotManager.validate();
        (window as any)._UI_VALIDATION_RESULT = {
          isValid: result.isValid,
          errorCount: result.errors.length,
        };
        window.dispatchEvent(new Event("clear-slot-errors"));
        if (!result.isValid) {
          const errorSlots = result.errors.map(e =>
            typeof e === "number" ? e : e.slot
          );
          window.dispatchEvent(new CustomEvent("highlight-error-slots", {
            detail: { errors: errorSlots }
          }));
        }
        (window as any).setVehicleUiStage?.("leftResults");
      }
    }
  }

  // ===================== Flusso bag extra ==========================

  private async iterateExtraBagsInCart(cart: CartEntity) {
    const bags = cart.getLoadedBags().filter(b => b.isExtra).slice().reverse();

    for (const bag of bags) {
      const worldMatrix = bag.root.getWorldMatrix();
      const worldPos = worldMatrix.getTranslation();
      bag.root.setParent(null);
      bag.root.position.copyFrom(worldPos);
      cart.removeBag(bag);

      await this.moveBagTo(bag, EXTRA_BAG_STAGING_POS, EXTRA_BAG_STAGING_ROTATION);

      slotManager.setActiveBag(bag);
      await slotManager.waitForAssignment();
    }

    // carrello svuotato (extra): esci e parcheggia dinamicamente
    await this.slideOutCart(cart);

    const hasMoreExtra = this.getCartsForPhase("extra").length > 0;

    if (hasMoreExtra) {
      await this.layoutCartsForPhase("extra");
      const nextFocus = this.getCartsForPhase("extra")[0];
      if (nextFocus) await this.iterateExtraBagsInCart(nextFocus);
    } else {
      const resultNormal = slotManager.validate();
      const resultExtra = slotManager.validateExtraBags();
      const isValid = resultNormal.isValid && resultExtra.isValid;
      const totalErrors = resultNormal.errors.length + resultExtra.errors.length;

      console.log("🧪 Validazione destra:", { resultNormal, resultExtra });

      (window as any)._UI_VALIDATION_RESULT = {
        isValid,
        errorCount: totalErrors,
      };

      window.dispatchEvent(new Event("clear-slot-errors"));

      if (!isValid) {
        const errorSlots = [...resultNormal.errors, ...resultExtra.errors].map(e =>
          typeof e === "number" ? e : e.slot
        );
        console.log("❌ Highlight error slots (right)", errorSlots);
        window.dispatchEvent(new CustomEvent("highlight-error-slots", {
          detail: { errors: errorSlots }
        }));
      }

      (window as any).setVehicleUiStage?.("rightResults");
      window.dispatchEvent(new Event("extra-bags-finished"));
    }
  }

  // ====================== Movimenti ================================

  private async moveCartTo(cart: CartEntity, target: BABYLON.Vector3) {
    const transform = {
      position: target,
      rotation: STAGING_ROTATION,
      scaling: cart.root.scaling.clone(),
      durationPosRot: 1.8,
      durationScale: 0,
    };
    await handleInterpolatedTransform(cart.root, this.scene, transform);
  }

  private async moveBagTo(
    bag: BagEntity,
    target: BABYLON.Vector3,
    rotation: BABYLON.Vector3 = BAG_STAGING_ROTATION
  ) {
    const transform = {
      position: target,
      rotation: rotation,
      scaling: bag.root.scaling.clone(),
      durationPosRot: 1,
      durationScale: 0,
    };
    await handleInterpolatedTransform(bag.root, this.scene, transform);
  }

  /**
   * Uscita animata verso EXIT_POS; al termine teletrasporta il carrello
   * in PARK dinamico = spawnPos + (5,0,0).
   */
  private async slideOutCart(cart: CartEntity) {
    const root = cart.root;
    const scene = root.getScene();
    const startPos = root.position.clone();
    const endPos = EXIT_POS.clone(); // destinazione animata comune

    const easing = new BABYLON.CubicEase();
    easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);

    const anim = new BABYLON.Animation(
      `${root.name}_slideOut`,
      "position",
      60,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    anim.setKeys([
      { frame: 0, value: startPos },
      { frame: 60, value: endPos },
    ]);
    anim.setEasingFunction(easing);

    return new Promise<void>((resolve) => {
      scene.beginDirectAnimation(root, [anim], 0, 60, false, 1, () => {
        // Calcolo PARK dinamico: spawn + (5,0,0)
        const spawn = this.cartSpawnPos.get(cart.id) ?? root.position.clone();
        const parkPos = spawn.add(new BABYLON.Vector3(6, 0, 0));
        root.position.copyFrom(parkPos);
        console.log(`🅿️ Carrello ${cart.id} parcheggiato in ${parkPos.toString()} (spawn + (5,0,0)).`);
        resolve();
      });
    });
  }
}
