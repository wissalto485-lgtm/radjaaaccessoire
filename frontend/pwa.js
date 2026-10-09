// ✅ تسجيل Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
            .then((registration) => {
                console.log('✅ Service Worker registered:', registration.scope);

                // ✅ التحقق من التحديثات
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

// ✅ إضافة زر التثبيت (Android/Desktop)
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('📱 App installable');

    // ✅ إظهار زر التثبيت (اختياري)
    showInstallButton();
});

function showInstallButton() {
    // التحقق من عدم وجود زر سابق
    if (document.getElementById('pwa-install-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'pwa-install-btn';
    btn.innerHTML = '<i class="fas fa-download"></i> تثبيت التطبيق';
    btn.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: linear-gradient(135deg, #D4AF37, #B89B3C);
        color: #1A0F14;
        border: none;
        padding: 12px 20px;
        border-radius: 50px;
        font-weight: bold;
        font-size: 0.9rem;
        cursor: pointer;
        z-index: 9998;
        box-shadow: 0 5px 20px rgba(212, 175, 55, 0.5);
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'UnifiedFont', sans-serif;
    `;

    btn.onclick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('👤 User choice:', outcome);
            deferredPrompt = null;
            btn.remove();
        }
    };

    document.body.appendChild(btn);

    // إخفاء الزر بعد 15 ثانية إذا لم يُنقر
    setTimeout(() => {
        if (document.getElementById('pwa-install-btn')) {
            btn.remove();
        }
    }, 15000);
}

window.addEventListener('appinstalled', () => {
    console.log('✅ App installed');
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.remove();
});

// ✅ Badging API - عدد المنتجات الجديدة
async function updateAppBadge() {
    try {
        // التحقق من دعم Badging API
        if (!('setAppBadge' in navigator)) {
            console.log('⚠️ Badging API not supported');
            return;
        }

        // ✅ جلب عدد المنتجات الجديدة من API
        const res = await fetch('/api/products/new-count');
        if (!res.ok) return;
        
        const data = await res.json();
        const count = data.count || 0;

        if (count > 0) {
            await navigator.setAppBadge(count);
            console.log('🔔 Badge set to:', count);
        } else {
            await navigator.clearAppBadge();
            console.log('🔕 Badge cleared');
        }
    } catch (err) {
        console.warn('⚠️ Badge update failed:', err);
    }
}

// ✅ استدعاء Badging API عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAppBadge);
} else {
    updateAppBadge();
}

// ✅ مراقبة التحديثات كل 5 دقائق
setInterval(updateAppBadge, 5 * 60 * 1000);