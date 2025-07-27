// src/BagLoadingController.ts
import * as BABYLON from "@babylonjs/core";
import { LoadTruckController } from "./LoadTruckController";
import { setUiInteractivity } from "./babylonBridge";
import { handleInterpolatedTransform } from "./transformHandlers";
import { BagEntity } from "./BagEntity";

// 🧱 Posizione di staging davanti al truck (valore provvisorio)
const BAG_STAGING_POS = new BABYLON.Vector3(0, -1.5, -9.5);
const BAG_STAGING_ROT = new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(90), 0);

export class BagLoadingController {
  private scene: BABYLON.Scene;
  private truckCtrl: LoadTruckController;
  private currentBagIndex: number = 0;
  private activeBags: BagEntity[] = [];

  constructor(scene: BABYLON.Scene, truckController: LoadTruckController) {
    this.scene = scene;
    this.truckCtrl = truckController;

    const focusedCart = this.truckCtrl.getFocusedCart();
    this.activeBags = focusedCart.getLoadedBags();

    if (this.activeBags.length === 0) {
      console.warn("⚠️ Nessuna bag trovata nel carrello in staging.");
      return;
    }

    // Inizia il caricamento della prima bag
    this.loadNextBag();

    // Registra il listener per i click sugli slot (per ora solo log)
    (window as any).onClickSlot = this.onSlotClicked.bind(this);
  }

  private async loadNextBag() {
    if (this.currentBagIndex >= this.activeBags.length) {
      console.log("✅ Tutte le bag del carrello attivo sono state gestite (fase 1–4).");
      return;
    }

    const bag = this.activeBags[this.currentBagIndex];
    const node = bag.root;

    const transform = {
      position: BAG_STAGING_POS,
      rotation: BAG_STAGING_ROT,
      scaling: node.scaling.clone(),
      durationPosRot: 1.5,
      durationScale: 0,
    };

    setUiInteractivity(true); // 🔒 blocca UI
    await handleInterpolatedTransform(node, this.scene, transform);
    setUiInteractivity(false); // 🔓 sblocca UI

    console.log(`📦 Bag ${bag.id} posizionata in staging.`);
  }

  private onSlotClicked(index: number) {
    console.log(`🟦 Slot ${index + 1} cliccato (fase 1–4, nessuna azione eseguita).`);
    // 👉 Per ora non facciamo nulla: la logica dello spostamento della bag sarà nel passo successivo
  }
}
