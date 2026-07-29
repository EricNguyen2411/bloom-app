const CACHE_NAME = 'bloom-app-v20260729100004';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
const FIREBASE_CACHE_NAME = 'bloom-firebase-sdk-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== FIREBASE_CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isAppShell = APP_SHELL.some((path) => url.pathname.endsWith(path.replace('./', '')));
  if (isAppShell) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
    return;
  }

  // The Firebase SDK files themselves rarely change once loaded — cache them
  // so repeat app opens don't re-download ~3 JS files from Google's CDN
  // before the app can even start talking to Firestore. Actual Firestore
  // data requests (a different domain) are untouched by this and still hit
  // the network normally, since that's real-time data, not static code.
  if (url.hostname === 'www.gstatic.com' && url.pathname.includes('/firebasejs/')) {
    event.respondWith(
      caches.open(FIREBASE_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const fresh = await fetch(event.request);
        cache.put(event.request, fresh.clone());
        return fresh;
      })
    );
    return;
  }
  // else: let Firestore data requests and fonts hit the network normally
});
