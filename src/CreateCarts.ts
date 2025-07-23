// src/CreateCarts.ts
import * as BABYLON from "@babylonjs/core";
import { cargoMeshesByName } from "./loadModel";
import { CartEntity } from "./CartEntity";
import { BagEntity } from "./BagEntity";

export class CreateCarts {
  private scene: BABYLON.Scene;
  private carts: CartEntity[] = [];
  private bags: BagEntity[] = [];
  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }

  spawnCarts(count: number = 3) {
    const prefab = cargoMeshesByName["LoadingCart"];
    if (!prefab) {
      console.warn("⚠️ Prefab 'LoadingCart' non trovato.");
      return;
    }

    const shadowGen = this.scene.metadata?.shadowGenerator;
    const spacing = 2.5;

    for (let i = 0; i < count; i++) {
      const id = `Cart_${i}`;
      const position = new BABYLON.Vector3(i * spacing, -4, 0);
      const rotation = new BABYLON.Vector3(0, 0, 0);

      const cart = new CartEntity({
        id,
        prefab,
        position,
        rotation,
        shadowGen,
      });

      this.carts.push(cart);
      console.log(`🛒 CartEntity ${id} creato con root: ${cart.root.name}`);
    }
  }

  spawnBags(count: number) {
    const prefab = cargoMeshesByName["AmzBag"];
    if (!prefab) {
      console.warn("⚠️ Prefab 'AmzBag' non trovato.");
      return;
    }

    const shadowGen = this.scene.metadata?.shadowGenerator;
    const spacing = 1.2;

    for (let i = 0; i < count; i++) {
      const id = `Bag_${i}`;
      const position = new BABYLON.Vector3(i * spacing, -3.6, -0.8); // Z=-0.8 per non sovrapporsi ai cart
      const rotation = new BABYLON.Vector3(0, 0, 0);

      // Creazione del nodo wrapper + bag entity
      const bag = new BagEntity({
        id,
        prefab,
        position,
        rotation,
        shadowGen,
      });

      this.bags.push(bag);
      console.log(`📦 BagEntity ${id} creata con root: ${bag.root.name}`);
    }
  }

  getCarts(): CartEntity[] {
    return this.carts;
  }

  getCartById(id: string): CartEntity | undefined {
    return this.carts.find(c => c.id === id);
  }

  getBags(): any[] {
    return [];
  }

  getBagById(id: string): any | undefined {
    return undefined;
  }
}
