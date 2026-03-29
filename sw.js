const CACHE_NAME = 'huella-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles/main.css',
  './app/auth.js',
  './app/chat.js',
  './app/modules.js',
  './app/ui.js',
  './data/manuales.js',
  './data/faqs.js',
  './data/sanciones.js',
  './data/collaborators.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});
