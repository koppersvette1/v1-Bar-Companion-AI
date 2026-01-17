/**
 * Haptic Feedback Utility for Mobile Interactions
 * Uses the Web Vibration API to provide tactile feedback
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [10, 100, 10, 100, 10],
  error: [30, 50, 30, 50, 30],
  selection: 5,
};

export function haptic(pattern: HapticPattern = 'light'): void {
  if (!('vibrate' in navigator)) return;

  try {
    const vibrationPattern = patterns[pattern];
    navigator.vibrate(vibrationPattern);
  } catch (error) {
    // Silently fail if vibration is not supported
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Haptic feedback for button/link clicks
 */
export function hapticClick(): void {
  haptic('light');
}

/**
 * Haptic feedback for successful actions
 */
export function hapticSuccess(): void {
  haptic('success');
}

/**
 * Haptic feedback for errors
 */
export function hapticError(): void {
  haptic('error');
}

/**
 * Haptic feedback for selections/toggles
 */
export function hapticSelection(): void {
  haptic('selection');
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator;
}
