const CACHE_NAME = 'confe-pwa-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './login.html',
  './dashboard.html',
  './setup-user-data.html',
  './profile.html',
  './security-lock.js',
  './toast.js',
  './manifest.json',
  './assets/favicon.png',
  'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network first strategy
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Network-First caching strategy
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Cache successful GET responses from our own origin
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async (error) => {
          console.error("SW: Fetch failed for:", event.request.url, error);
          // If network fails, try to return from cache
          try {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) return cachedResponse;
          } catch (e) {
            console.error("SW: Cache match failed:", e);
          }
          
          // If not in cache or cache fails, return a generic error response instead of undefined
          return new Response('Network error occurred: ' + error.message, {
            status: 408,
            statusText: 'Network Error',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        })
    );
});
