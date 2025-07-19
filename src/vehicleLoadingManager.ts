// src/logic/vehicleLoadingManager.ts

export type LoadingState = "startLoading" | "leftSideLoading" | "rightSideLoading";

class VehicleLoadingManager {
  private currentState: LoadingState = "startLoading";

  public enter() {
    this.setState("startLoading");
  }

  public setState(state: LoadingState) {
    this.currentState = state;
    console.log(`🚚 Vehicle Loading: stato attivo → ${state}`);

    // ⚠️ Rimosso: placeholder UI
    // La gestione visiva è ora completamente affidata alla UI React
  }

  public getState(): LoadingState {
    return this.currentState;
  }
}

export const vehicleLoadingManager = new VehicleLoadingManager();
