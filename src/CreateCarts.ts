import * as BABYLON from "@babylonjs/core";
import { cargoMeshesByName } from "./loadModel";
import { CartEntity } from "./CartEntity";
import { vec3DegToRad } from "./transformSettings"; // ✅ usa funzione già definita

export class CreateCarts {
  private scene: BABYLON.Scene;
  private carts: CartEntity[] = [];

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }

  spawnCarts() {
    const base = cargoMeshesByName["LoadingCart"];
    if (!base) {
      console.warn("⚠️ Mesh 'LoadingCart' non trovata tra i prefab.");
      return;
    }

    const shadowGen = this.scene.metadata?.shadowGenerator;

    const transforms = [
      {
        position: new BABYLON.Vector3(-3, -4, 0),
        rotation: vec3DegToRad([0, -90, 0]),
      },
      {
        position: new BABYLON.Vector3(0, -4, 0),
        rotation: vec3DegToRad([0, -90, 0]),
      },
      {
        position: new BABYLON.Vector3(3, -4, 0),
        rotation: vec3DegToRad([0, -90, 0]),
      },
    ];

    transforms.forEach((cfg, index) => {
      const cart = new CartEntity({
        prefab: base,
        id: `Cart_${index}`,
        position: cfg.position,
        rotation: cfg.rotation,
        maxPackages: 5,
        shadowGen: shadowGen,
      });

      this.carts.push(cart);
    });
  }

  getCarts(): CartEntity[] {
    return this.carts;
  }

  getCartById(id: string): CartEntity | undefined {
    return this.carts.find(c => c.id === id);
  }
}
