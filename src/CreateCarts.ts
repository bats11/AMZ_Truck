import * as BABYLON from "@babylonjs/core";
import { cargoMeshesByName } from "./loadModel";

export class CreateCarts {
  private scene: BABYLON.Scene;
  private carts: BABYLON.AbstractMesh[] = [];

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }

  spawnCarts(count = 3, spacing = 2.5) {
    const base = cargoMeshesByName["LoadingCart"];
    if (!base) {
      console.warn("⚠️ Mesh 'LoadingCart' non trovata tra i prefab.");
      return;
    }

    const shadowGen = this.scene.metadata?.shadowGenerator;

    for (let i = 0; i < count; i++) {
      const clone = base.clone(`LoadingCartClone_${i}`, null);
      if (!clone) continue;

      clone.setEnabled(true);
      clone.position = new BABYLON.Vector3(i * -spacing, -4, 0);
      clone.rotation = new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(0), 0);

      if (shadowGen) shadowGen.addShadowCaster(clone, true); // ✅ ombre abilitate

      this.carts.push(clone);
    }
  }

  getClones() {
    return this.carts;
  }
}
