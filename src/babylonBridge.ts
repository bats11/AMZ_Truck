export let moveCameraTo = (
  label: string,
  opts?: { bypassBigToBig?: boolean; bypassCustomSequence?: boolean }
) => {

  console.warn("moveCameraTo not connected");
};

export function setMoveCameraTo(fn: (label: string) => void) {
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
