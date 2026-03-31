/**
 * sw.js — Service Worker mejorado para Huella Conserva PWA
 * 
 * Estrategias:
 *  - App shell (HTML/CSS/JS): Cache First → siempre rápido offline
 *  - Datos (JSON): Network First con fallback a cache → siempre actualizados
 *  - Imágenes: Cache First con expiración larga
 */

const CACHE_VERSION = 'v3';
const CACHE_STATIC = `huella-static-${CACHE_VERSION}`;
const CACHE_DATA   = `huella-data-${CACHE_VERSION}`;
const CACHE_IMG    = `huella-img-${CACHE_VERSION}`;

// Archivos del app shell — se cachean en install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/app/auth.js',
  '/app/chat.js',
  '/app/modules.js',
  '/app/search.js',
  '/app/ui.js',
  '/app/security.js',
  '/app/main.js',
  '/data/manuales.js',
  '/data/faqs.js',
  '/data/sanciones.js',
  '/data/collaborators.js',
  '/manifest.json'
];

// Datos que se actualizan frecuentemente
const DATA_PATTERNS = ['/data/', '/public/data/'];

// ── Install: cachear app shell ────────────────────────────────
self.addEventListener('install', event => {
  self.skipWaiting(); // activar inmediatamente sin esperar
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      // addAll falla si uno falla — usamos add individual para resiliencia
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
});

// ── Activate: limpiar caches viejos ──────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('huella-') && ![CACHE_STATIC, CACHE_DATA, CACHE_IMG].includes(k))
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: estrategia por tipo de recurso ────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Solo manejar misma origin
  if (url.origin !== location.origin) return;

  // Datos JSON → Network First
  if (DATA_PATTERNS.some(p => url.pathname.startsWith(p)) || url.pathname.endsWith('.json')) {
    event.respondWith(networkFirst(event.request, CACHE_DATA));
    return;
  }

  // Imágenes → Cache First con larga vida
  if (/\.(png|jpg|jpeg|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request, CACHE_IMG));
    return;
  }

  // App shell y JS/CSS → Cache First (siempre rápido)
  event.respondWith(cacheFirst(event.request, CACHE_STATIC));
});

// ── Estrategia: Cache First ───────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

// ── Estrategia: Network First ────────────────────────────────
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('{}', { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

// ── Mensaje de actualización a clientes ──────────────────────
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
