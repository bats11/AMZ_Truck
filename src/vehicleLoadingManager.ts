// src/logic/vehicleLoadingManager.ts

export type LoadingState = "startLoading" | "leftSideLoading" | "rightSideLoading";

class VehicleLoadingManager {
  private currentState: LoadingState = "startLoading";

  public enter() {
    this.setState("startLoading");
  }

  public exit() {
    this.currentState = "startLoading"; // oppure un valore neutro se lo supporti in futuro
    console.log("🚪 Uscita da cargo loading → reset stato interno");
  }

  public setState(state: LoadingState) {
    this.currentState = state;
    console.log(`🚚 Cargo Loading: stato attivo → ${state}`);
  }

  public getState(): LoadingState {
    return this.currentState;
  }
}

export const vehicleLoadingManager = new VehicleLoadingManager();
