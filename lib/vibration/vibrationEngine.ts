import type { VibrationPatternDefinition } from "@/lib/vibration/vibrationPatterns";

let activeTimeoutId: ReturnType<typeof setTimeout> | null = null;
let activeSessionId = 0;

function clearActiveTimeout() {
  if (activeTimeoutId !== null) {
    clearTimeout(activeTimeoutId);
    activeTimeoutId = null;
  }
}

function vibrateOnce(pattern: number[]) {
  return navigator.vibrate(pattern);
}

function scheduleNextCycle(
  protocol: VibrationPatternDefinition,
  sessionId: number,
  repeatsRemaining: number,
) {
  clearActiveTimeout();

  activeTimeoutId = setTimeout(() => {
    activeTimeoutId = null;

    if (sessionId !== activeSessionId) {
      return;
    }

    if (repeatsRemaining <= 0) {
      stopVibration();
      return;
    }

    try {
      const didStart = vibrateOnce(protocol.pattern);

      if (!didStart) {
        stopVibration();
        return;
      }
    } catch {
      stopVibration();
      return;
    }

    scheduleNextCycle(protocol, sessionId, repeatsRemaining - 1);
  }, protocol.cycleDurationMs);
}

export function isVibrationSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

export function playVibration(protocol: VibrationPatternDefinition): boolean {
  if (
    !isVibrationSupported() ||
    protocol.pattern.length === 0 ||
    protocol.repeatCount <= 0
  ) {
    return false;
  }

  stopVibration();

  try {
    const didStart = vibrateOnce(protocol.pattern);

    if (!didStart) {
      return false;
    }

    const sessionId = activeSessionId + 1;
    activeSessionId = sessionId;

    scheduleNextCycle(protocol, sessionId, protocol.repeatCount - 1);
    return true;
  } catch {
    return false;
  }
}

export function stopVibration(): void {
  clearActiveTimeout();
  activeSessionId = 0;

  if (!isVibrationSupported()) {
    return;
  }

  navigator.vibrate(0);
}
