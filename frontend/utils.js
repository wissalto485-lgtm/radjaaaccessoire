const PLACEHOLDER_IMG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#333"/><text x="50" y="55" text-anchor="middle" fill="#d4af37" font-size="40">Image</text></svg>');

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function sanitizeText(text) {
    if (!text) return "";
    return text.replace(/[<>]/g, "");
}

function validatePhone(phone) {
    return /^(05|06|07)[0-9]{8}$/.test(phone);
}

function handleImgError(el) {
    if (!el) return;
    el.onerror = null;
    el.src = PLACEHOLDER_IMG;
}

function getSwatchBorderColor(hex) {
    try {
        let h = String(hex).replace("#", "").trim();
        if (h.length === 3) h = h.split("").map(c => c + c).join("");
        if (!/^[0-9a-fA-F]{6}$/.test(h)) return hex;
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.92 ? "rgba(0,0,0,0.2)" : hex;
    } catch (e) {
        return hex;
    }
}

function translateSize(size, lang) {
    if (lang === "fr") {
        const sizeMap = {
            "قصير": "Court",
            "متوسط": "Moyen",
            "طويل": "Long",
            "صغير": "Petit",
            "كبير": "Grand"
        };
        return sizeMap[size] || size;
    }
    return size;
}