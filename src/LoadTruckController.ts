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

    const stagingCart = this.carts[0];
    const bags = stagingCart.getLoadedBags().slice().reverse(); // ✅ Iterazione inversa

    if (bags.length === 0) {
      console.warn("⚠️ Nessuna bag disponibile nel primo carrello.");
      return;
    }

    const firstBag = bags[0];

    // ✅ Calcola posizione globale
    const worldMatrix = firstBag.root.getWorldMatrix();
    const worldPosition = worldMatrix.getTranslation();

    // ✅ Disimparenta mantenendo la posizione visiva
    firstBag.root.setParent(null);
    firstBag.root.position.copyFrom(worldPosition);

    // ✅ Sposta con animazione verso zona staging
    await this.moveBagTo(firstBag, BAG_STAGING_POS);

    // ✅ Notifica SlotManager
    slotManager.setActiveBag(firstBag);
    slotManager.registerCorrectBag(firstBag);

    console.log(`📦 Bag ${firstBag.id} disimparentata e spostata in staging.`);
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
