// iOS Safari (WebKit) does not implement the Vibration API — Apple restricts
// real haptic taps to native apps, so this is a no-op on every iPhone PWA
// today regardless of how it's called. It's wired up anyway so it activates
// automatically on platforms that do support it (Android Chrome, and iOS if
// WebKit ever adds it), and so every touch point in the app already calls
// the right pattern once that day comes. On iOS the felt "tactile" response
// instead comes entirely from the Pressable press-states.
const supported = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

function fire(pattern) {
  if (!supported) return;
  try { navigator.vibrate(pattern); } catch { /* ignore */ }
}

export const haptic = {
  tap: () => fire(8),
  select: () => fire(10),
  success: () => fire([12, 40, 12]),
  warning: () => fire([20, 30, 20, 30, 20]),
};
