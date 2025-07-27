// src/LoadTruckController.ts
import * as BABYLON from "@babylonjs/core";
import {
  liftTruckAfterCartArrival,
  hideTruckSideMeshes,
} from "./vehicleLoadingTransform";
import { handleInterpolatedTransform } from "./transformHandlers";
import { CartEntity } from "./CartEntity";
import { BagEntity } from "./BagEntity";
import { slotManager } from "./SlotManager";

const FOCUS_POS = new BABYLON.Vector3(0, -2, -12);
const WAIT_POS_1 = new BABYLON.Vector3(-3, -6, 1);
const WAIT_POS_2 = new BABYLON.Vector3(3, -6, 1);
const BAG_STAGING_POS = new BABYLON.Vector3(0, 1, -12);

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
    const allCarts = (window as any)._CART_ENTITIES as CartEntity[] | undefined;
    if (!allCarts || allCarts.length !== 3) {
      console.warn("⚠️ Carrelli non trovati o incompleti.");
      return;
    }
    this.carts = allCarts;

    const alwaysHide = [""];

    await Promise.all([
      liftTruckAfterCartArrival(),
      hideTruckSideMeshes(this.side, this.scene, alwaysHide),
      this.moveCartTo(this.carts[0], FOCUS_POS),
      this.moveCartTo(this.carts[1], WAIT_POS_1),
      this.moveCartTo(this.carts[2], WAIT_POS_2),
    ]);

    console.log("🛒 Carrelli e truck posizionati con interpolazione.");
    window.dispatchEvent(new CustomEvent("show-slot-overlay"));

    await this.iterateBagsInCart(this.carts[0]);
  }

  private async iterateBagsInCart(cart: CartEntity) {
    const bags = cart.getLoadedBags().slice().reverse();

    for (const bag of bags) {
      const worldMatrix = bag.root.getWorldMatrix();
      const worldPos = worldMatrix.getTranslation();

      bag.root.setParent(null);
      bag.root.position.copyFrom(worldPos);

      await this.moveBagTo(bag, BAG_STAGING_POS);

      slotManager.registerCorrectBag(bag);
      slotManager.setActiveBag(bag);

      await slotManager.waitForAssignment();

      // 🔒 Se tutti gli slot sono pieni, blocca e valida
      if (slotManager.isFull()) {
        console.log("🟨 Slot completati. Eseguo validazione...");

        const result = slotManager.validate();

        if (result.isValid) {
          console.log("✅ Validazione completata: tutti i pacchi corretti!");
        } else {
          console.warn("❌ Validazione fallita. Errori trovati:");
          result.errors.forEach((err) => {
            console.warn(`🛑 Slot ${err.slot}: atteso ${err.expected}, trovato ${err.actual}`);
          });
        }

        return; // 🔁 Interrompe il ciclo delle bag
      }
    }

    console.log(`✅ Tutte le bag del carrello ${cart.id} sono state caricate.`);

    this.carts.push(this.carts.shift()!);

    await Promise.all([
      this.moveCartTo(this.carts[0], FOCUS_POS),
      this.moveCartTo(this.carts[1], WAIT_POS_1),
      this.moveCartTo(this.carts[2], WAIT_POS_2),
    ]);

    const nextBags = this.carts[0].getLoadedBags();
    if (nextBags.length > 0) {
      await this.iterateBagsInCart(this.carts[0]);
    } else {
      console.log("🛑 Fine ciclo: nessuna bag nel carrello successivo.");
    }
  }

  private async moveCartTo(cart: CartEntity, target: BABYLON.Vector3) {
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
      rotation: bag.root.rotation.clone(),
      scaling: bag.root.scaling.clone(),
      durationPosRot: 1.5,
      durationScale: 0,
    };

    await handleInterpolatedTransform(bag.root, this.scene, transform);
  }
}
