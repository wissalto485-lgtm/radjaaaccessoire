// ✅ تسجيل Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
            .then((registration) => {
                console.log('✅ Service Worker registered:', registration.scope);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🔄 New version available');
                            if (confirm('تحديث جديد متوفر! هل تريد إعادة التحميل؟')) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch((err) => {
                console.warn('⚠️ Service Worker registration failed:', err);
            });
    });
}

// ✅ إخفاء الشاشة البيضاء فوراً عند تحميل DOM
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
});

// ✅ Badging API - عدد المنتجات الجديدة
async function updateAppBadge() {
    try {
        if (!('setAppBadge' in navigator)) {
            return;
        }

        const res = await fetch('/api/products/new-count');
        if (!res.ok) return;
        
        const data = await res.json();
        const count = data.count || 0;

        if (count > 0) {
            await navigator.setAppBadge(count);
        } else {
            await navigator.clearAppBadge();
        }
    } catch (err) {
        console.warn('⚠️ Badge update failed:', err);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAppBadge);
} else {
    updateAppBadge();
}

setInterval(updateAppBadge, 5 * 60 * 1000);