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

    if (state === "startLoading") {
      this.showPlaceholder("🚛 Vehicle Loading – inizio esperienza");
    } else {
      this.clearPlaceholder();
    }

    // TODO: gestione futura per leftSideLoading e rightSideLoading
  }

  public getState(): LoadingState {
    return this.currentState;
  }

  private showPlaceholder(text: string) {
    this.clearPlaceholder();

    const div = document.createElement("div");
    div.id = "vehicle-loading-placeholder";
    div.innerText = text;
    Object.assign(div.style, {
      position: "absolute",
      top: "4rem",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "2.2rem",
      color: "white",
      background: "rgba(0,0,0,0.75)",
      padding: "1rem 2rem",
      borderRadius: "1rem",
      zIndex: "2000",
      pointerEvents: "none",
      fontFamily: "EmberCondensed, sans-serif",
    });

    document.body.appendChild(div);
  }

  private clearPlaceholder() {
    const existing = document.getElementById("vehicle-loading-placeholder");
    if (existing) existing.remove();
  }
}

export const vehicleLoadingManager = new VehicleLoadingManager();
