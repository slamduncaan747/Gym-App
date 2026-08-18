// Screen Wake Lock API — supported in iOS Safari 16.4+, including installed
// home-screen PWAs. Keeps the screen from auto-locking mid-set so a rest
// timer or "reps completed" screen doesn't go dark between sets.
let sentinel = null;

export async function acquireWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    sentinel = await navigator.wakeLock.request('screen');
  } catch {
    // permission/state errors (e.g. tab hidden) — silently skip, not critical
  }
}

export function releaseWakeLock() {
  if (sentinel) {
    sentinel.release().catch(() => {});
    sentinel = null;
  }
}

// iOS releases the lock whenever the tab/app is backgrounded; re-acquire on
// return so a phone call or quick app-switch mid-workout doesn't leave the
// screen unlocked for the rest of the session.
export function reacquireOnVisible() {
  const onVisible = () => {
    if (document.visibilityState === 'visible' && sentinel) acquireWakeLock();
  };
  document.addEventListener('visibilitychange', onVisible);
  return () => document.removeEventListener('visibilitychange', onVisible);
}
