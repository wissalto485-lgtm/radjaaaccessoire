function createParticles() {
    const container = document.getElementById("particles");
    const count = 25;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        const size = Math.random() * 4 + 2;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 6;
        const duration = Math.random() * 4 + 4;
        particle.style.cssText = 'width: ' + size + 'px; height: ' + size + 'px; left: ' + x + '%; top: ' + y + '%; animation-delay: ' + delay + 's; animation-duration: ' + duration + 's;';
        container.appendChild(particle);
    }
}

function createGoldenLines() {
    const container = document.getElementById("goldenLines");
    const count = 5;
    for (let i = 0; i < count; i++) {
        const line = document.createElement("div");
        line.className = "golden-line";
        const y = Math.random() * 100;
        const delay = Math.random() * 8;
        const width = Math.random() * 200 + 100;
        line.style.cssText = 'top: ' + y + '%; width: ' + width + 'px; animation-delay: ' + delay + 's;';
        container.appendChild(line);
    }
}

let loginAttempts = 0;
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("loginError");
    const loginBtn = document.getElementById("loginBtn");

    if (loginAttempts >= MAX_ATTEMPTS) {
        const lockTime = localStorage.getItem("loginLockTime");
        if (lockTime && Date.now() - parseInt(lockTime) < LOCK_TIME) {
            const remaining = Math.ceil((LOCK_TIME - (Date.now() - parseInt(lockTime))) / 60000);
            errorEl.style.display = "block";
            errorEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> تم تجاوز عدد المحاولات المسموح. حاول بعد ' + remaining + ' دقيقة';
            return;
        }
        loginAttempts = 0;
        localStorage.removeItem("loginLockTime");
    }

    errorEl.style.display = "none";
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="btn-shine"></span><i class="fas fa-spinner fa-spin" style="margin-left: 8px;"></i> جاري الدخول...';

    try {
        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        const data = await res.json();
        if (data.success) {
            sessionStorage.setItem("adminToken", data.token);
            window.location.href = "/admin.html";
        } else {
            loginAttempts++;
            if (loginAttempts >= MAX_ATTEMPTS) {
                localStorage.setItem("loginLockTime", String(Date.now()));
                errorEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> تم تجاوز عدد المحاولات المسموح. جرب بعد 15 دقيقة';
            } else {
                errorEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> اسم المستخدم أو كلمة المرور غير صحيحة (المحاولة ' + loginAttempts + '/' + MAX_ATTEMPTS + ')';
            }
            errorEl.style.display = "block";
            document.getElementById("password").value = "";
            document.getElementById("password").focus();
        }
    } catch (e) {
        errorEl.style.display = "block";
        errorEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> خطأ في الاتصال، حاول مرة أخرى';
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span class="btn-shine"></span><i class="fas fa-sign-in-alt" style="margin-left: 8px;"></i> Login';
    }
}

window.onload = function() {
    createParticles();
    createGoldenLines();
    if (sessionStorage.getItem("adminToken")) {
        window.location.href = "/admin.html";
    }
    document.getElementById("username").focus();
};

document.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && document.activeElement.tagName === "INPUT") {
        document.getElementById("loginForm").requestSubmit();
    }
});