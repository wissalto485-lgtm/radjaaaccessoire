const CACHE_NAME = 'radjaa-v3.1.0';
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
                STATIC_ASSETS.map((url) =>
                    cache.add(new Request(url, { mode: 'no-cors' })).catch((err) => {
                        console.warn('[SW] تعذّر تخزين:', url, err);
                    })
                )
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

    // 1. تجاهل الطلبات غير المدعومة
    if (request.method !== 'GET') return;

    // 2. تجاهل كل ما ليس http/https (chrome-extension, moz-extension, data, ...)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    // 3. لا تعترضي طلبات API
    if (url.pathname.startsWith('/api/')) return;

    // 4. لا تعترضي Cloudinary
    if (url.hostname.includes('cloudinary.com')) return;

    // 5. اسمحي فقط بنطاقات محددة
    const isSameOrigin = url.origin === self.location.origin;
    const isAllowedExternal = ALLOWED_EXTERNAL_HOSTS.includes(url.hostname);
    if (!isSameOrigin && !isAllowedExternal) return;

    // 6. استراتيجية: network-first مع cache fallback
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