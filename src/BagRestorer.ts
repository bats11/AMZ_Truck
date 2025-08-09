// src/BagRestorer.ts
import * as BABYLON from "@babylonjs/core";
import type { BagEntity } from "./BagEntity";
import { vec3DegToRad } from "./utils";

export class BagRestorer {
  private scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }

  /**
   * Riposiziona e riattiva le bag nei loro carrelli di origine.
   * Non aggiorna lo stato logico dei carrelli.
   */
  public restoreBagsToCarts(bags: BagEntity[]): number {
    if (!Array.isArray(bags) || bags.length === 0) {
      console.log("ℹ️ Nessuna bag da ripristinare.");
      return 0;
    }

    let restoredCount = 0;

    for (const bag of bags) {
      if (!bag.parentCart) {
        console.warn(`⚠️ Nessun carrello associato a ${bag.id}`);
        continue;
      }

      const wrapper = bag.root;

      // ✅ Riattiva wrapper
      wrapper.setEnabled(true);

      // ✅ Re-parent al carrello
      wrapper.parent = bag.parentCart.root;

      // ✅ Riposiziona alla posizione locale originale
      wrapper.position.copyFrom(bag.localOffset);

      // ✅ Rotation hardcoded iniziale (coerente con il resto del progetto)
      wrapper.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(
        vec3DegToRad([0, 90, 0])
      );

      // ✅ Riattiva visibilità dei mesh figli
      wrapper.getChildMeshes(false).forEach((mesh) => {
        mesh.setEnabled(true);
        mesh.visibility = 1;
      });

      restoredCount++;
    }

    console.log(`🔁 Bag ripristinate nei carrelli: ${restoredCount}`);
    return restoredCount;
  }
}
