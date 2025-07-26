// src/CreateCarts.ts
import * as BABYLON from "@babylonjs/core";
import { cargoMeshesByName } from "./loadModel";
import { CartEntity } from "./CartEntity";
import { BagEntity } from "./BagEntity";
import {
  BAG_OFFSET_PRESET,
  BAG_OFFSET_PRESET_LAST,
  BAG_EXTRA_OFFSETS,
} from "./bagOffsets";

export interface ExtraBagConfig {
  meshName: string;
  count: number;
}

export class CreateCarts {
  private scene: BABYLON.Scene;
  private carts: CartEntity[] = [];
  private bags: BagEntity[] = [];

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }

  spawnCarts(count: number = 3) {
    const prefabMeshes = Object.values(cargoMeshesByName).filter(
      (mesh): mesh is BABYLON.AbstractMesh =>
        mesh instanceof BABYLON.AbstractMesh && mesh.name.startsWith("Cart_")
    );

    if (prefabMeshes.length === 0) {
      console.warn("⚠️ Nessuna mesh 'Cart_' trovata tra i prefab.");
      return;
    }

    const shadowGen = this.scene.metadata?.shadowGenerator;
    const spacing = 2.5;

    for (let i = 0; i < count; i++) {
      const id = `Cart_${i}`;
      const position = new BABYLON.Vector3(i * spacing - 2.5, -4, 0);
      const rotation = new BABYLON.Vector3(0, 0, 0);

      const cart = new CartEntity({
        id,
        prefabs: prefabMeshes,
        position,
        rotation,
        shadowGen,
      });

      this.carts.push(cart);
      console.log(`🛒 CartEntity ${id} creato con root: ${cart.root.name}`);
    }
  }

  spawnBags(normalCount: number, extraConfigs?: ExtraBagConfig[]) {
    const prefab = cargoMeshesByName["AmzBag"];
    if (!prefab) {
      console.warn("⚠️ Prefab 'AmzBag' non trovato.");
      return;
    }

    const shadowGen = this.scene.metadata?.shadowGenerator;

    const BAG_COLORS = [
      "#fdd43b", "#aad169", "#3498db", "#f17850", "#3498db",
      "#fdd43b", "#fdd43b", "#3498db", "#aad169", "#fdd43b",
      "#aad169", "#3498db", "#f17850", "#3498db", "#fdd43b",
      "#fdd43b", "#3498db", "#aad169", "#f17850", "#fdd43b",
    ];

    let bagIndex = 0;

    // 1️⃣ Bag normali nei carrelli
    for (let cartIndex = 0; cartIndex < this.carts.length; cartIndex++) {
      const cart = this.carts[cartIndex];
      const isLastCart = cartIndex === this.carts.length - 1;
      const offsetList = isLastCart ? BAG_OFFSET_PRESET_LAST : BAG_OFFSET_PRESET;

      for (let i = 0; i < offsetList.length; i++) {
        if (bagIndex >= normalCount || cart.isFull()) break;

        const offset = offsetList[i];
        const id = `Bag_${bagIndex}`;
        const color = BAG_COLORS[bagIndex % BAG_COLORS.length];

        const bag = new BagEntity({
          id,
          prefab,
          position: offset,
          rotation: new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(90), 0),
          parent: cart.root,
          shadowGen,
          color,
        });

        cart.addBag(bag);
        this.bags.push(bag);

        console.log(
          `📦 BagEntity ${id} → ${cart.id} (${isLastCart ? "offset LAST" : "offset DEFAULT"}) → ${offset.toString()} → color ${color}`
        );

        bagIndex++;
      }

      if (bagIndex >= normalCount) break;
    }

    // 2️⃣ Bag extra con mesh custom, parentate all’ultimo carrello
    if (extraConfigs?.length && this.carts.length > 0) {
      let extraIndex = 0;
      const targetCart = this.carts[this.carts.length - 1];

      for (const config of extraConfigs) {
        const prefab = cargoMeshesByName[config.meshName];
        if (!prefab) {
          console.warn(`⚠️ Mesh '${config.meshName}' non trovata nei prefab.`);
          continue;
        }

        for (let i = 0; i < config.count; i++) {
          const offset = BAG_EXTRA_OFFSETS[extraIndex % BAG_EXTRA_OFFSETS.length];
          const id = `ExtraBag_${config.meshName}_${i}`;

          const bag = new BagEntity({
            id,
            prefab,
            position: offset,
            rotation: new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(90), 0),
            parent: targetCart.root, // ✅ ora le bag extra sono figlie del carrello
            shadowGen,
          });

          this.bags.push(bag);

          console.log(
            `📦 Bag EXTRA ${id} → ${config.meshName} → ${offset.toString()} → parent: ${targetCart.id}`
          );

          extraIndex++;
        }
      }
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
