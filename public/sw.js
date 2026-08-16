const CACHE = 'overload-shell-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Cache-first for same-origin built assets and fonts, so the installed app
// keeps working with no network. Never cache the Anthropic API — that always
// needs a live connection. Navigation requests fall back to the cached shell
// when offline.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (url.hostname === 'api.anthropic.com') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put('/', copy));
        return resp;
      }).catch(() => caches.match('/'))
    );
    return;
  }

  if (url.origin === self.location.origin || url.hostname.includes('fonts.g')) {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request).then(resp => {
          if (resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(request, copy));
          }
          return resp;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
