const CACHE_NAME = 'radjaa-v1.0.0';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/index.css',
    '/index.js',
    '/utils.js',
    '/pwa.js',
    '/pwa-splash.js',
    '/manifest.webmanifest',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.js'
];

// ✅ التثبيت - تخزين الملفات الثابتة فقط
self.addEventListener('install', (event) => {
    console.log('✅ Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Caching static assets');
            return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { mode: 'no-cors' }))).catch(err => {
                console.warn('⚠️ بعض الملفات لم تُخزَّن:', err);
            });
        })
    );
    self.skipWaiting();
});

// ✅ التنشيط - حذف الكاشات القديمة
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// ✅ الاعتراض - استراتيجية آمنة
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // ❌ لا نعترض طلبات API (الطلبات، تسجيل الدخول، لوحة الإدارة، البيانات الحساسة)
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // ❌ لا نعترض طلبات POST أو PUT أو DELETE
    if (request.method !== 'GET') {
        return;
    }

    // ❌ لا نعترض Cloudinary (الصور)
    if (url.hostname.includes('cloudinary.com')) {
        return;
    }

    // ✅ استراتيجية Cache First للملفات الثابتة فقط
    if (request.destination === 'style' || 
        request.destination === 'script' || 
        request.destination === 'font' ||
        url.pathname === '/' ||
        url.pathname === '/index.html' ||
        url.pathname === '/manifest.webmanifest') {
        
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    // ✅ تحديث الكاش في الخلفية (Stale-While-Revalidate)
                    fetch(request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, networkResponse.clone());
                            });
                        }
                    }).catch(() => {});
                    return cachedResponse;
                }
                
                return fetch(request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                    return networkResponse;
                }).catch(() => {
                    // في حال فشل الشبكة، نُعيد الصفحة الرئيسية إذا كان الطلب لصفحة HTML
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
        );
        return;
    }

    // ✅ استراتيجية Network First للملفات الأخرى (HTML, JSON)
    event.respondWith(
        fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseToCache);
                });
            }
            return networkResponse;
        }).catch(() => {
            return caches.match(request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                if (request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});

// ✅ استقبال رسائل من الصفحة الرئيسية (للتحديثات)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});