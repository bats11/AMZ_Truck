// src/CreateCarts.ts
import * as BABYLON from "@babylonjs/core";
import { cargoMeshesByName } from "./loadModel";
import { CartEntity } from "./CartEntity";
import { BagEntity } from "./BagEntity";
import { vec3DegToRad } from "./utils";

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
        maxPackages: 5,
        shadowGen,
      });

      this.carts.push(cart);
    }
  }

  spawnBags(count: number) {
    const base = cargoMeshesByName["AmzBag"];
    if (!base) {
      console.warn("⚠️ Mesh 'AmzBag' non trovata tra i prefab.");
      return;
    }

    const shadowGen = this.scene.metadata?.shadowGenerator;
    const spacing = 1.2;

    for (let i = 0; i < count; i++) {
      const position = new BABYLON.Vector3(i * spacing, -3.8, 2.5);
      const rotation = vec3DegToRad([0, 0, 0]);

      const bag = new BagEntity({
        prefab: base,
        id: `Bag_${i}`,
        position,
        rotation,
        shadowGen,
      });

      this.bags.push(bag);
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
