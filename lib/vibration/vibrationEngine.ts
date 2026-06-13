export function isVibrationSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

export function playVibration(pattern: number | number[]): boolean {
  if (!isVibrationSupported()) {
    return false;
  }

  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

export function stopVibration(): void {
  if (!isVibrationSupported()) {
    return;
  }

  navigator.vibrate(0);
}
