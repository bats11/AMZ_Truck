// src/vehicleLoadingManager.ts
import { runTruckTransform, animateCartsIn } from "./vehicleLoadingTransform";
import type { ExtraBagConfig } from "./CreateCarts";
import * as BABYLON from "@babylonjs/core";
import { vec3DegToRad } from "./utils";

export type LoadingState = "startLoading" | "leftSideLoading" | "rightSideLoading";

class VehicleLoadingManager {
  private currentState: LoadingState = "startLoading";
  private firstEntry = true;
  private listeners: (() => void)[] = [];
  private isTransitioning = false;

  public enter() {
    this.setState("startLoading");
    this.firstEntry = true;
  }

  public exit() {
    this.currentState = "startLoading";
    this.firstEntry = true;
    this.isTransitioning = false;
    console.log("🚪 Exit cargo loading → stato pulito");
    this.notify();
  }

  public async setState(state: LoadingState) {
    if (this.isTransitioning) {
      console.warn("⛔ Ignorato click multiplo: già in transizione.");
      return;
    }

    this.isTransitioning = true;
    this.currentState = state;
    console.log(`🚚 Cargo Loading: stato attivo → ${state}`);
    this.notify();

    const scene = (window as any)._BABYLON_SCENE;
    if (!scene) {
      console.warn("⚠️ Scene Babylon non disponibile.");
      this.isTransitioning = false;
      return;
    }

    switch (state) {
      case "leftSideLoading": {
        await runTruckTransform("opening");

        const { CreateCarts } = await import("./CreateCarts");
        const carts = new CreateCarts(scene);
        carts.spawnCarts();

        const extraBags: ExtraBagConfig[] = [
          {
            meshName: "HeavyBox",
            count: 3,
            rotation: vec3DegToRad([-90, 0, 0]),
          },
          {
            meshName: "OverszBox",
            count: 2,
            rotation: vec3DegToRad([-90, 0, 0]),
          },
        ];

        carts.spawnBags(20, extraBags);
        (window as any)._CART_ENTITIES = carts.getCarts();

        await animateCartsIn(carts.getCarts(), scene);

        // In futuro: attiva LoadTruckController qui
        // const { LoadTruckController } = await import("./LoadTruckController");
        // new LoadTruckController(scene, "left");
        break;
      }

      case "rightSideLoading": {
        console.log("🕐 Stato 'rightSideLoading' riconosciuto, ma ancora senza logica attiva.");
        // In futuro: runTruckTransform("right"), crea carts, bags, controller
        break;
      }

      case "startLoading":
      default: {
        // Nessuna azione da eseguire per ora
        break;
      }
    }

    this.isTransitioning = false;
  }

  public getState(): LoadingState {
    return this.currentState;
  }

  public shouldRunInitialEntry(): boolean {
    return this.firstEntry;
  }

  public markInitialEntryDone() {
    this.firstEntry = false;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const vehicleLoadingManager = new VehicleLoadingManager();
