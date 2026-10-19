const CACHE_NAME = 'radjaa-v3.1.1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/index.css',
    '/index.js',
    '/utils.js',
    '/pwa.js',
    '/manifest.webmanifest',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.js'
];

const ALLOWED_EXTERNAL_HOSTS = [
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                STATIC_ASSETS.map((url) => {
                    const isExternal = /^https?:\/\//i.test(url);
                    const req = new Request(url, isExternal ? { mode: 'no-cors' } : {});
                    return fetch(req)
                        .then((response) => {
                            if (response && (response.status === 200 || response.type === 'opaque')) {
                                return cache.put(req, response).catch(() => {});
                            }
                        })
                        .catch(() => {}); 
                })
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') return;

    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    if (url.pathname.startsWith('/api/')) return;

    if (url.hostname.includes('cloudinary.com')) return;

    const isSameOrigin = url.origin === self.location.origin;
    const isAllowedExternal = ALLOWED_EXTERNAL_HOSTS.includes(url.hostname);
    if (!isSameOrigin && !isAllowedExternal) return;

    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache).catch(() => {});
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html').then((html) => html || Response.error());
                    }
                    return Response.error();
                });
            })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});