const CACHE_NAME = 'xianxia-offline-v1';
const APP_ROOT = new URL('./', self.location.href);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(APP_ROOT, { cache: 'reload' });
    if (!response.ok) throw new Error('Unable to cache app shell');
    const html = await response.clone().text();
    await cache.put(APP_ROOT, response);
    const assetPaths = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((path) => /\.(?:js|css|svg|webmanifest)(?:\?|$)/i.test(path))
      .map((path) => new URL(path, APP_ROOT).href);
    await Promise.all(assetPaths.map(async (url) => {
      try {
        const asset = await fetch(url);
        if (asset.ok) await cache.put(url, asset);
      } catch {
        // Keep installing if an optional icon or manifest is unavailable.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('xianxia-offline-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(APP_ROOT, response.clone());
        return response;
      } catch {
        return (await caches.match(APP_ROOT)) || (await caches.match(new URL('index.html', APP_ROOT).href));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response('Offline: this resource is not cached yet.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
