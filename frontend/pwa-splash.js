// ✅ شاشة البداية (Splash Screen) - تظهر فقط في وضع التطبيق المثبت
(function() {
    // ✅ التحقق: هل التطبيق مثبت ويعمل في وضع standalone؟
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone === true ||
                        document.referrer.includes('android-app://');

    // ❌ إذا لم يكن التطبيق مثبتاً (الزائر من المتصفح العادي) → لا نُظهر الشاشة
    if (!isStandalone) {
        console.log('🌐 Browser mode detected - splash screen skipped');
        return;
    }

    // ✅ التحقق: هل تم عرض الشاشة سابقاً في هذه الجلسة؟
    const splashShown = sessionStorage.getItem('pwaSplashShown');
    if (splashShown === 'true') {
        return;
    }

    // ❌ لا نُظهر الشاشة في لوحة الإدارة (لها شاشة خاصة)
    const isAdminPage = window.location.pathname.includes('admin.html') || 
                        window.location.pathname.includes('login.html');
    if (isAdminPage) return;

    // ✅ إنشاء شاشة البداية
    const splash = document.createElement('div');
    splash.id = 'pwa-splash-screen';
    splash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #E891B3 0%, #D97AA6 50%, #C5678E 100%);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 30px;
        opacity: 1;
        transition: opacity 0.8s ease;
        padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    `;

    const logo = document.createElement('img');
    logo.src = 'https://res.cloudinary.com/kiuoxrvp/image/upload/w_300,h_300,c_fit/v1791551402/IMG_20260916_222650_743_tpiwiu.jpg';
    logo.alt = 'Radjaa Accessoire';
    logo.style.cssText = `
        max-width: 60%;
        max-height: 60%;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        animation: splashLogoPulse 2s ease-in-out infinite;
    `;

    const storeName = document.createElement('div');
    storeName.textContent = 'Radjaa Accessoire';
    storeName.style.cssText = `
        font-family: 'StoreFont', 'UnifiedFont', sans-serif;
        font-size: 1.8rem;
        color: #FFF8F4;
        font-weight: 800;
        letter-spacing: 3px;
        text-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        animation: splashTextFade 2s ease-in-out infinite;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes splashLogoPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        @keyframes splashTextFade {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    `;
    document.head.appendChild(style);

    splash.appendChild(logo);
    splash.appendChild(storeName);
    document.body.appendChild(splash);

    sessionStorage.setItem('pwaSplashShown', 'true');

    setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.remove();
            style.remove();
        }, 800);
    }, 3000);
})();