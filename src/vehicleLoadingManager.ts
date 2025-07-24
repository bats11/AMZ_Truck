// src/vehicleLoadingManager.ts
import { animateToLeftLoading } from "./vehicleLoadingTransform";
export type LoadingState = "startLoading" | "leftSideLoading" | "rightSideLoading";

class VehicleLoadingManager {
  private currentState: LoadingState = "startLoading";
  private firstEntry = true;

  // ✅ Sistema di listener per React
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
    this.notify(); // 🔔 Notifica i listener React

    if (state === "leftSideLoading") {
      // ✅ Esegui la creazione dei carrelli
      import("./CreateCarts").then(({ CreateCarts }) => {
        const scene = (window as any)._BABYLON_SCENE;
        if (!scene) {
          console.warn("⚠️ Scene Babylon non disponibile.");
          return;
        }
        const carts = new CreateCarts(scene);
        carts.spawnCarts();
        carts.spawnBags(20);
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

  // ✅ Permette a React di iscriversi
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
