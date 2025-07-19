export let moveCameraTo = (
  label: string,
  opts?: { bypassBigToBig?: boolean; bypassCustomSequence?: boolean }
) => {

  console.warn("moveCameraTo not connected");
};

export function setMoveMode(fn: (label: string) => void) {
  moveCameraTo = fn;
}

// === Blocca interazione touch (rotazione) ===
let touchLockedGetter: () => boolean = () => false;

export function setTouchLockedGetter(fn: () => boolean) {
  touchLockedGetter = fn;
}

export function getTouchLocked(): boolean {
  return touchLockedGetter();
}

// === Serve per bloccare/sbloccare i pulsanti della UI
let uiInteractivitySetter: ((disabled: boolean) => void) | null = null;

export function setUiInteractivitySetter(fn: (disabled: boolean) => void) {
  uiInteractivitySetter = fn;
}

export function setUiInteractivity(disabled: boolean) {
  if (uiInteractivitySetter) {
    uiInteractivitySetter(disabled);
  }
}
