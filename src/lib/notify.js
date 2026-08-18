// Two small native-adjacent iOS PWA capabilities, both real and both
// supported on iOS 16.4+ for a home-screen-installed app:
//
// - Notification (via the service worker registration) so "rest's over"
//   reaches you even if the screen has locked or you've swapped apps.
// - navigator.setAppBadge, which puts a number on the home-screen icon
//   itself — used here for unread Coach messages, the same way a native
//   app's badge works.
//
// Neither requires a backend: both fire from code already running in the
// installed app, not a server push.

export function notificationsSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export async function notifyRestComplete(exerciseName) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification('Rest is up', {
      body: exerciseName ? `Back to ${exerciseName}.` : 'Time for your next set.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'overload-rest',
      silent: false
    });
  } catch {
    // no-op — notification is a nice-to-have, never block the rest timer on it
  }
}

export function badgeSupported() {
  return 'setAppBadge' in navigator;
}

export function setAppBadge(count) {
  if (!badgeSupported()) return;
  try {
    if (count > 0) navigator.setAppBadge(count).catch(() => {});
    else navigator.clearAppBadge?.().catch(() => {});
  } catch {
    // no-op
  }
}
