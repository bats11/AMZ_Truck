// src/vehicleLoadingManager.ts
import { animateToLeftLoading } from "./vehicleLoadingTransform";
import type { ExtraBagConfig } from "./CreateCarts";
import * as BABYLON from "@babylonjs/core";
import { vec3DegToRad } from "./utils";


export type LoadingState = "startLoading" | "leftSideLoading" | "rightSideLoading";

class VehicleLoadingManager {
  private currentState: LoadingState = "startLoading";
  private firstEntry = true;
  private listeners: (() => void)[] = [];

  public enter() {
    this.setState("startLoading");
    this.firstEntry = true;
  }

  public exit() {
    this.currentState = "startLoading";
    this.firstEntry = true;
    console.log("🚪 Exit cargo loading → stato pulito");
    this.notify();
  }

  public setState(state: LoadingState) {
    this.currentState = state;
    console.log(`🚚 Cargo Loading: stato attivo → ${state}`);
    this.notify();

    if (state === "leftSideLoading") {
      import("./CreateCarts").then(({ CreateCarts }) => {
        const scene = (window as any)._BABYLON_SCENE;
        if (!scene) {
          console.warn("⚠️ Scene Babylon non disponibile.");
          return;
        }

        const carts = new CreateCarts(scene);
        carts.spawnCarts();

        // ✅ Configurazione bag extra con rotazioni
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
      });

      animateToLeftLoading();
    }
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
