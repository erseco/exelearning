/**
 * Service Worker for eXeLearning Static Mode
 * Provides offline-first caching for PWA
 */

const CACHE_NAME = 'exelearning-static-v0.0.0-pr1333-202602200707-32bf33c';
const STATIC_ASSETS = [
    './',
    './index.html',
    './app/app.bundle.js',
    './app/yjs/exporters.bundle.js',
    './libs/yjs/yjs.min.js',
    './libs/yjs/y-indexeddb.min.js',
    './libs/fflate/fflate.umd.js',
    './libs/jquery/jquery.min.js',
    './libs/bootstrap/bootstrap.bundle.min.js',
    './libs/bootstrap/bootstrap.min.css',
    './style/workarea/main.css',
    './style/workarea/base.css',
    './data/bundle.json',
];

// Install: Cache all static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key.startsWith('exelearning-static-') && key !== CACHE_NAME)
                    .map(key => {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Network-first strategy (always online when possible)
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Network succeeded - update cache and return
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Network failed - try cache (offline fallback)
                return caches.match(event.request).then(cached => {
                    if (cached) {
                        console.log('[SW] Serving from cache (offline):', event.request.url);
                        return cached;
                    }
                    // Navigation fallback
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                    return new Response('Offline', { status: 503 });
                });
            })
    );
});
