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
const BAG_STAGING_POS = new BABYLON.Vector3(0, 4.1, -12);
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

const EXTRA_BAG_STAGING_POS = new BABYLON.Vector3(0, 4.5, -13.6);

export class LoadTruckController {
  private scene: BABYLON.Scene;
  private side: "left" | "right";
  private carts: CartEntity[] = [];

  constructor(scene: BABYLON.Scene, side: "left" | "right") {
    this.scene = scene;
    this.side = side;
    this.begin();
  }

  private async begin() {
    slotManager.setRightSide(this.side === "right");

    await hideTruckSideMeshes(this.side, this.scene, []);

    const allCarts = (window as any)._CART_ENTITIES as CartEntity[] | undefined;
    if (!allCarts || allCarts.length === 0) {
      console.warn("⚠️ Nessun carrello disponibile.");
      return;
    }

    this.carts = allCarts;

    if (this.side === "left") {
      const animations = [];

      if (this.carts[0]) animations.push(this.moveCartTo(this.carts[0], FOCUS_POS));
      if (this.carts[1]) animations.push(this.moveCartTo(this.carts[1], WAIT_POS_1));
      if (this.carts[2]) animations.push(this.moveCartTo(this.carts[2], WAIT_POS_2));

      await Promise.all(animations);
    }

    window.dispatchEvent(new CustomEvent("show-slot-overlay"));
    await this.iterateBagsInCart(this.carts[0]);
  }

  private async iterateBagsInCart(cart: CartEntity) {
    const bags = cart.getLoadedBags()
      .filter(b => !b.isExtra)
      .slice()
      .reverse();

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
        (window as any)._UI_VALIDATION_RESULT = {
          isValid: result.isValid,
          errorCount: result.errors.length,
        };

        (window as any).setVehicleUiStage?.("leftResults");
        return;
      }
    }

    const cartHasExtra = cart.getLoadedBags().some(b => b.isExtra);
    if (cartHasExtra) {
      console.log(`♻️ Carrello ${cart.id} ha bag extra, passo direttamente a fase extra.`);
      await this.iterateExtraBagsInCart(cart);
      return;
    }

    const removedCart = this.carts.shift()!;
    await this.slideOutAndDisposeCart(removedCart);

    const hasMoreNormalBags = this.carts.some(c =>
      c.getLoadedBags().some(b => !b.isExtra)
    );

    if (hasMoreNormalBags) {
      if (this.carts[0]) await this.moveCartTo(this.carts[0], FOCUS_POS);
      if (this.carts[1]) await this.moveCartTo(this.carts[1], WAIT_POS_1);
      if (this.carts[2]) await this.moveCartTo(this.carts[2], WAIT_POS_2);

      await this.iterateBagsInCart(this.carts[0]);
    } else {
      console.log("🚩 Tutte le bag normali caricate. Passo alla fase extra.");
      window.dispatchEvent(new CustomEvent("start-extra-bags"));
      await this.iterateExtraBagsInCart(this.carts[0]);
    }
  }

  private async iterateExtraBagsInCart(cart: CartEntity) {
    const bags = cart.getLoadedBags()
      .filter(b => b.isExtra)
      .slice()
      .reverse();

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

    const removedCart = this.carts.shift()!;
    await this.slideOutAndDisposeCart(removedCart);

    const hasMoreExtra = this.carts.some(c =>
      c.getLoadedBags().some(b => b.isExtra)
    );

    if (hasMoreExtra) {
      if (this.carts[0]) await this.moveCartTo(this.carts[0], FOCUS_POS);
      if (this.carts[1]) await this.moveCartTo(this.carts[1], WAIT_POS_1);
      if (this.carts[2]) await this.moveCartTo(this.carts[2], WAIT_POS_2);

      await this.iterateExtraBagsInCart(this.carts[0]);
    } else {
      console.log("🧪 Validazione finale combinata (bag normali + extra)");
      const resultNormal = slotManager.validate();
      const resultExtra = slotManager.validateExtraBags();

      const isValid = resultNormal.isValid && resultExtra.isValid;
      const totalErrors = resultNormal.errors.length + resultExtra.errors.length;

      (window as any)._UI_VALIDATION_RESULT = {
        isValid,
        errorCount: totalErrors,
      };

      (window as any).setVehicleUiStage?.("rightResults");

      // ✅ Notifica visiva → attiva stato "occupied" sugli slot larghi
      window.dispatchEvent(new Event("extra-bags-finished"));
    }
  }


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

  private async slideOutAndDisposeCart(cart: CartEntity) {
    const root = cart.root;
    const scene = root.getScene();

    const startPos = root.position.clone();
    const endPos = startPos.add(new BABYLON.Vector3(-5, 0, 0));

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
        root.dispose();
        console.log(`🗑️ Carrello ${cart.id} eliminato dalla scena`);
        resolve();
      });
    });
  }
}
