// src/LoadTruckController.ts
import * as BABYLON from "@babylonjs/core";
import {
  liftTruckAfterCartArrival,
  hideTruckSideMeshes,
} from "./vehicleLoadingTransform";
import { handleInterpolatedTransform } from "./transformHandlers";
import { CartEntity } from "./CartEntity";

const FOCUS_POS = new BABYLON.Vector3(0, -2, -12);
const WAIT_POS_1 = new BABYLON.Vector3(-3, -6, 1);
const WAIT_POS_2 = new BABYLON.Vector3(3, -6, 1);

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
    // 1️⃣ Recupera carrelli
    const allCarts = (window as any)._CART_ENTITIES as CartEntity[] | undefined;
    if (!allCarts || allCarts.length !== 3) {
      console.warn("⚠️ Carrelli non trovati o incompleti.");
      return;
    }
    this.carts = allCarts;

    // 2️⃣ In parallelo: truck + carrelli + nascondi lato opposto
    const alwaysHide = [""];

    await Promise.all([
      liftTruckAfterCartArrival(),
      hideTruckSideMeshes(this.side, this.scene, alwaysHide),
      this.moveCartTo(this.carts[0], FOCUS_POS),
      this.moveCartTo(this.carts[1], WAIT_POS_1),
      this.moveCartTo(this.carts[2], WAIT_POS_2),
    ]);

    console.log("🛒 Carrelli e truck posizionati con interpolazione.");

    // 3️⃣ Comunica a React di mostrare la griglia slot
    window.dispatchEvent(new CustomEvent("show-slot-overlay"));
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
}
