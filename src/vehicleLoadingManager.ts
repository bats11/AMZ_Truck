export type LoadingState = "startLoading" | "leftSideLoading" | "rightSideLoading";

class VehicleLoadingManager {
  private currentState: LoadingState = "startLoading";
  private firstEntry = true;

  public enter() {
    this.setState("startLoading");
    this.firstEntry = true; // si entra nell’esperienza → abilita funzione iniziale
  }

  public exit() {
    this.currentState = "startLoading";
    this.firstEntry = true; // reset per future sessioni
    console.log("🚪 Exit cargo loading → stato pulito");
  }

  public setState(state: LoadingState) {
    this.currentState = state;
    console.log(`🚚 Cargo Loading: stato attivo → ${state}`);
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
}

export const vehicleLoadingManager = new VehicleLoadingManager();
