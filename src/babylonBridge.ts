export let moveCameraTo = (label: string) => {
  console.warn("moveCameraTo not connected");
};

export function setMoveCameraTo(fn: (label: string) => void) {
  moveCameraTo = fn;
}
