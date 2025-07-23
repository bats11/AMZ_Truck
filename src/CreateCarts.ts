// src/CreateCarts.ts
import * as BABYLON from "@babylonjs/core";
import { cargoMeshesByName } from "./loadModel";
import { CartEntity } from "./CartEntity";
import { BagEntity } from "./BagEntity";
import { vec3DegToRad } from "./utils";
import { BAG_OFFSET_PRESET } from "./bagOffsets"; // ✅ import preset esterno

export class CreateCarts {
  private scene: BABYLON.Scene;
  private carts: CartEntity[] = [];
  private bags: BagEntity[] = [];

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }

  spawnCarts(count: number = 3) {
    const base = cargoMeshesByName["LoadingCart"];
    if (!base) {
      console.warn("⚠️ Mesh 'LoadingCart' non trovata tra i prefab.");
      return;
    }

    const shadowGen = this.scene.metadata?.shadowGenerator;
    const spacing = 3;

    for (let i = 0; i < count; i++) {
      const position = new BABYLON.Vector3((i - Math.floor(count / 2)) * spacing, -4, 0);
      const rotation = vec3DegToRad([0, 0, 0]);

      const cart = new CartEntity({
        prefab: base,
        id: `Cart_${i}`,
        position,
        rotation,
        maxPackages: 9,
        shadowGen,
      });

      this.carts.push(cart);

      if (i === 0) {
        console.log("🧭 DEBUG CART ORIENTATION");
        console.log("📦 PREFAB ROTATION:", base.rotation.clone().scale(180 / Math.PI));
        console.log("Rotation (deg):", cart.mesh.rotation.clone().scale(180 / Math.PI));
        console.log("Local RIGHT:", cart.mesh.right);   // → dovrebbe essere (1,0,0) se ok
        console.log("Local FORWARD:", cart.mesh.forward); // → dovrebbe essere (0,0,1) o (0,0,-1)
      }

    }
  }

  spawnBags(count: number) {
    const base = cargoMeshesByName["AmzBag"];
    if (!base) {
      console.warn("⚠️ Mesh 'AmzBag' non trovata tra i prefab.");
      return;
    }

    const shadowGen = this.scene.metadata?.shadowGenerator;

    let bagIndex = 0;

    for (const cart of this.carts) {
      for (let i = 0; i < BAG_OFFSET_PRESET.length; i++) {
        if (bagIndex >= count || cart.isFull()) break;

        const offset = BAG_OFFSET_PRESET[i];
        const worldPos = cart.mesh.position.add(offset);
        const rotation = vec3DegToRad([0, 0, 0]);

        const bag = new BagEntity({
          prefab: base,
          id: `Bag_${bagIndex}`,
          position: worldPos,
          rotation,
          shadowGen,
        });

        bag.mesh.setParent(cart.mesh, true); // ✅ mantiene posizione globale
        cart.addBag(bag);
        this.bags.push(bag);
        bagIndex++;
      }

      if (bagIndex >= count) break;
    }
  }

  getCarts(): CartEntity[] {
    return this.carts;
  }

  getCartById(id: string): CartEntity | undefined {
    return this.carts.find(c => c.id === id);
  }

  getBags(): BagEntity[] {
    return this.bags;
  }

  getBagById(id: string): BagEntity | undefined {
    return this.bags.find(b => b.id === id);
  }
}
