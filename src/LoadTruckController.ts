// src/LoadTruckController.ts
import * as BABYLON from "@babylonjs/core";
import { hideTruckSideMeshes } from "./vehicleLoadingTransform";
import { handleInterpolatedTransform } from "./transformHandlers";
import { CartEntity } from "./CartEntity";
import { BagEntity } from "./BagEntity";
import { slotManager } from "./SlotManager";

const FOCUS_POS = new BABYLON.Vector3(0, -1, -10);
const WAIT_POS_1 = new BABYLON.Vector3(2.5, -1, -10);
const WAIT_POS_2 = new BABYLON.Vector3(5, -1, -10);
const BAG_STAGING_POS = new BABYLON.Vector3(0, 3.7, -12);
const STAGING_ROTATION = new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(-10), 0);

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
    console.log("🟢 LoadTruckController inizializzato con lato:", this.side);

    const isLeft = this.side === "left";
    const isRight = this.side === "right";

    const allCarts = (window as any)._CART_ENTITIES as CartEntity[] | undefined;
    if (!allCarts || allCarts.length !== 3) {
      console.warn("⚠️ Carrelli non trovati o incompleti.", allCarts);
      return;
    }

    this.carts = allCarts;
    console.log("🛒 Carrelli trovati:", this.carts.map(c => c.id).join(", "));
    slotManager.setRightSide(this.side === "right");

    await hideTruckSideMeshes(this.side, this.scene, []);

    if (isLeft) {
      console.log("🚚 Inizio spostamento carrelli nella scena...");
      await Promise.all([
        this.moveCartTo(this.carts[0], FOCUS_POS),
        this.moveCartTo(this.carts[1], WAIT_POS_1),
        this.moveCartTo(this.carts[2], WAIT_POS_2),
      ]);
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

    const hasMoreNormalBags = this.carts.some(c =>
      c.getLoadedBags().some(b => !b.isExtra)
    );

    if (hasMoreNormalBags) {
      this.carts.push(this.carts.shift()!);
      await Promise.all([
        this.moveCartTo(this.carts[0], FOCUS_POS),
        this.moveCartTo(this.carts[1], WAIT_POS_1),
        this.moveCartTo(this.carts[2], WAIT_POS_2),
      ]);
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

      await this.moveBagTo(bag, BAG_STAGING_POS);

      slotManager.setActiveBag(bag);
      await slotManager.waitForAssignment();
    }

    const hasMoreExtra = this.carts.some(c =>
      c.getLoadedBags().some(b => b.isExtra)
    );

    if (hasMoreExtra) {
      this.carts.push(this.carts.shift()!);
      await Promise.all([
        this.moveCartTo(this.carts[0], FOCUS_POS),
        this.moveCartTo(this.carts[1], WAIT_POS_1),
        this.moveCartTo(this.carts[2], WAIT_POS_2),
      ]);
      await this.iterateExtraBagsInCart(this.carts[0]);
    } else {
      console.log("🧪 Validazione finale delle extra bag...");
      const result = slotManager.validateExtraBags();
      (window as any)._UI_VALIDATION_RESULT = {
        isValid: result.isValid,
        errorCount: result.errors.length,
      };
      (window as any).setVehicleUiStage?.("rightResults");
    }
  }

  private async moveCartTo(cart: CartEntity, target: BABYLON.Vector3) {
    console.log(`🎯 Spostamento carrello ${cart.id} verso ${target.toString()}`);
    const transform = {
      position: target,
      rotation: cart.root.rotation.clone(),
      scaling: cart.root.scaling.clone(),
      durationPosRot: 1.8,
      durationScale: 0,
    };
    await handleInterpolatedTransform(cart.root, this.scene, transform);
  }

  private async moveBagTo(bag: BagEntity, target: BABYLON.Vector3) {
    const transform = {
      position: target,
      rotation: STAGING_ROTATION,
      scaling: bag.root.scaling.clone(),
      durationPosRot: 1,
      durationScale: 0,
    };
    await handleInterpolatedTransform(bag.root, this.scene, transform);
  }
}
