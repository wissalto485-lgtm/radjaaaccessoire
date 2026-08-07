const API_BASE = (() => {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "http://localhost:5000/api";
    }
    return window.location.origin + "/api";
})();

const UPLOADS_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

function imgUrl(p) {
    if (!p) return PLACEHOLDER_IMG;
    return p.startsWith("http") ? p : UPLOADS_ORIGIN + p;
}

function getToken() {
    return sessionStorage.getItem("adminToken");
}

function setToken(token) {
    sessionStorage.setItem("adminToken", token);
}

function clearToken() {
    sessionStorage.removeItem("adminToken");
}

function fetchWithAuth(url, options = {}) {
    const token = getToken();
    if (!token) {
        return Promise.reject("No token");
    }
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: "Bearer " + token
        }
    });
}

function logout() {
    if (confirm("هل أنت متأكد من تسجيل الخروج؟")) {
        sessionStorage.removeItem("adminToken");
        window.location.href = "/login.html";
    }
}

setInterval(() => {
    const token = getToken();
    if (!token) {
        window.location.href = "/login.html";
    }
}, 5 * 60 * 1000);

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

let allOrders = [];
let allProducts = [];
let categories = [];
let currentLang = "ar";
let processedOrderIds = JSON.parse(localStorage.getItem("processedOrderIds") || "[]");
let sentNotificationIds = JSON.parse(localStorage.getItem("sentNotificationIds") || "[]");
let lastCheckTime = localStorage.getItem("lastNotificationCheck") || (new Date).toISOString();
let notifications = JSON.parse(localStorage.getItem("adminNotifications") || "[]");

const colorOptions = [{
    name: "Bleu",
    hexCode: "#0000FF",
    fr: "Bleu",
    ar: "أزرق"
}, {
    name: "rouge",
    hexCode: "#FF0000",
    fr: "Rouge",
    ar: "أحمر"
}, {
    name: "vert",
    hexCode: "#008000",
    fr: "Vert",
    ar: "أخضر"
}, {
    name: "bleu ciel",
    hexCode: "#87CEEB",
    fr: "Bleu ciel",
    ar: "أزرق سماوي"
}, {
    name: "noir",
    hexCode: "#000000",
    fr: "Noir",
    ar: "أسود"
}, {
    name: "dorée",
    hexCode: "#D4AF37",
    fr: "Doré",
    ar: "ذهبي"
}, {
    name: "argenté",
    hexCode: "#C0C0C0",
    fr: "Argenté",
    ar: "فضي"
}, {
    name: "aubergine",
    hexCode: "#4A0E4E",
    fr: "Aubergine",
    ar: "باذنجاني"
}, {
    name: "maron",
    hexCode: "#8B4513",
    fr: "Marron",
    ar: "بني"
}];

let lastOrderCheck = new Date();
let currentProductForEdit = null;
let imagesToDelete = [];
let selectedColorsList = [];
let editColorsList = [];
let currentEditOrderId = null;
let currentSortField = "createdAt";
let currentSortDir = "desc";
let currentCompletedSortField = "createdAt";
let currentCompletedSortDir = "desc";
let cancelledPhones = JSON.parse(localStorage.getItem("cancelledPhones")) || [];
let addedSizes = [];

function compressImage(file, maxWidth = 1024, quality = 0.7) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            resolve(file);
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = height * maxWidth / width;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(blob => {
                    const compressedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    });
                    resolve(compressedFile);
                }, file.type, quality);
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
}

async function compressImages(files) {
    const compressed = [];
    for (const file of files) {
        const compressedFile = await compressImage(file, 1024, 0.7);
        compressed.push(compressedFile);
    }
    return compressed;
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("open");
}

function showSectionDesktop(sectionId) {
    window.scrollTo(0, 0);
    showSection(sectionId);
}

function showSectionAndCloseSidebar(sectionId) {
    window.scrollTo(0, 0);
    showSection(sectionId);
    if (window.innerWidth <= 768) closeSidebar();
}

function showSection(id) {
    window.scrollTo(0, 0);
    document.querySelectorAll(".admin-section").forEach(s => s.style.display = "none");
    const target = document.getElementById(id);
    if (target) target.style.display = "block";
    document.querySelectorAll(".nav-tab").forEach(btn => btn.classList.remove("active"));
    const tabId = id.replace("-sec", "");
    const activeTab = document.getElementById("tab-" + tabId);
    if (activeTab) activeTab.classList.add("active");
    document.querySelectorAll(".sidebar-menu button").forEach(btn => btn.classList.remove("active"));
    const menuId = id.replace("-sec", "");
    const activeMenu = document.getElementById("menu-" + menuId);
    if (activeMenu) activeMenu.classList.add("active");
    if (id === "orders-sec") {
        markOrderNotificationsAsRead();
    }
    if (id === "products-list-sec") loadProducts();
    if (id === "orders-sec") {
        loadOrders();
    }
    if (id === "reviews-sec") loadPendingReviews();
    if (id === "stats-sec") {
        loadStats();
        loadCompletedOrders();
    }
    if (id === "shipping-sec") loadShippingRates();
    if (id === "about-sec") loadAboutContent();
    if (id === "analytics-sec") {
        loadAnalyticsData();
    }
    if (id === "settings-sec") loadSettings();
}

function showNotification(message, type = "info") {
    const notif = document.createElement("div");
    notif.className = "notification";
    notif.innerHTML = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

function markOrderNotificationsAsRead() {
    let hasChanges = false;
    notifications.forEach((notif, index) => {
        if (notif.type === "order" && !notif.read) {
            notifications[index].read = true;
            hasChanges = true;
        }
    });
    if (hasChanges) {
        saveNotifications();
        const newOrdersEl = document.getElementById("stat-new-orders");
        if (newOrdersEl) {
            loadOrders();
        }
    }
}

function getOrderAge(createdAt) {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "اليوم";
    if (diffDays === 1) return "منذ يوم";
    if (diffDays < 7) return "منذ " + diffDays + " أيام";
    if (diffDays < 30) return "منذ " + Math.floor(diffDays / 7) + " أسابيع";
    return "منذ " + Math.floor(diffDays / 30) + " شهر";
}

function isRepeatCustomer(phone, currentOrderId = null) {
    return allOrders.some(o => o.phone === phone && o._id !== currentOrderId);
}

function calculateOrderTotal(items) {
    if (!items || items.length === 0) return 0;
    let total = 0;
    items.forEach(item => {
        let itemPrice = 0;
        if (item.selectedComponent && item.purchaseType === "component") {
            itemPrice = item.selectedComponent.price || 0;
        } else if (item.selectedComponent && item.purchaseType === "fullWithout") {
            itemPrice = (item.basePrice || 0) - (item.selectedComponent.price || 0);
            if (itemPrice < 0) itemPrice = 0;
        } else if (item.selectedSize && item.selectedSize.price) {
            itemPrice = item.selectedSize.price;
        } else {
            itemPrice = item.unitPrice || item.basePrice || 0;
        }
        if (item.customizationExtra) {
            itemPrice += item.customizationExtra;
        }
        total += itemPrice * (item.quantity || 1);
    });
    return total;
}

function getQuantityString(items) {
    if (!items || items.length === 0) return "-";
    return items.map(item => {
        let addonText = "";
        if (item.selectedAddon && item.selectedAddon.choice === "with") {
            addonText = " + " + (item.selectedAddon.nameAr || "إضافة");
        }
        let customText = "";
        if (item.customizationText) {
            customText = " (مخصص: " + item.customizationText.substring(0, 20) + ")";
        }
        return item.name + addonText + customText + ": " + item.quantity;
    }).join("<br>");
}

function getAddonsDisplay(item) {
    let customAddons = "-";
    if (item && item.customizationText) {
        customAddons = item.customizationText + " (+" + (item.customizationExtra || 0) + " د.ج)";
    }
    let regularAddons = "-";
    if (item && item.selectedAddon && item.selectedAddon.choice === "with") {
        const addonName = item.selectedAddon.nameAr || "إضافة";
        const addonPrice = item.selectedAddon.price || 0;
        regularAddons = addonName + " (+" + addonPrice + " د.ج)";
        if (item.addonCustomValue) {
            regularAddons += "<br><small><i class=\"fas fa-pencil-alt\" style=\"margin-right: 8px;\"></i> " + item.addonCustomValue + "</small>";
        }
    }
    return {
        customAddons: customAddons,
        regularAddons: regularAddons
    };
}

function filterProducts(searchTerm) {
    if (!searchTerm || searchTerm === "") {
        displayProducts(allProducts);
        return;
    }
    const term = searchTerm.toLowerCase().trim();
    const filtered = allProducts.filter(p => {
        const nameAr = (p.nameAr || "").toLowerCase();
        const nameFr = (p.nameFr || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        return nameAr.includes(term) || nameFr.includes(term) || name.includes(term);
    });
    displayProducts(filtered);
}

function clearProductSearch() {
    const inputs = document.querySelectorAll("#product-search-input, #product-search-input-mobile");
    inputs.forEach(input => {
        if (input) input.value = "";
    });
    displayProducts(allProducts);
}

function displayProducts(products) {
    const container = document.getElementById("admin-products-list");
    if (!container) return;
    if (!products || products.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:30px;grid-column:1/-1;">لا توجد إكسسوارات تطابق البحث</div>';
        return;
    }
    let html = "";
    products.forEach(p => {
        const mainImg = p.mainImage || (p.images && p.images[0]) || "";
        let imgSrc = PLACEHOLDER_IMG;
        if (mainImg && mainImg !== "") {
            imgSrc = imgUrl(mainImg);
        }
        html += '<div class="product-card">\n                    <div class="product-card-image">\n                        <img src="' + imgSrc + '" onerror="handleImgError(this)" alt="' + escapeHtml(p.nameAr || p.name) + '">\n                    </div>\n                    <div class="product-card-info">\n                        <div class="product-card-title">' + escapeHtml(p.nameAr || p.name) + '</div>\n                        <div class="product-card-price"><i class="fas fa-coins" style="margin-left: 8px;"></i> ' + p.basePrice + ' د.ج</div>\n                        <div class="product-card-desc">' + escapeHtml((p.descriptionAr || "").substring(0, 80)) + ((p.descriptionAr || "").length > 80 ? "..." : "") + '</div>\n                        <div class="product-card-actions">\n                            <button class="btn-action-product btn-edit-product" onclick="openEditModal(\'' + p._id + '\')"><i class="fas fa-edit"></i> تعديل</button>\n                            <button class="btn-action-product btn-delete-product" onclick="deleteProduct(\'' + p._id + '\')"><i class="fas fa-trash"></i> حذف</button>\n                        </div>\n                    </div>\n                </div>';
    });
    container.innerHTML = html;
}

function filterOrders(searchTerm) {
    let pendingOrders = allOrders.filter(o => o.status === "pending");
    if (searchTerm && searchTerm !== "") {
        const term = searchTerm.toLowerCase().trim();
        pendingOrders = pendingOrders.filter(o => {
            const orderId = (o._id || "").toLowerCase();
            const customerName = (o.customerName || "").toLowerCase();
            const phone = (o.phone || "").toLowerCase();
            return orderId.includes(term) || customerName.includes(term) || phone.includes(term);
        });
    }
    if (currentSortField === "createdAt") {
        pendingOrders.sort((a, b) => currentSortDir === "asc" ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSortField === "customerName") {
        pendingOrders.sort((a, b) => currentSortDir === "asc" ? (a.customerName || "").localeCompare(b.customerName || "") : (b.customerName || "").localeCompare(a.customerName || ""));
    } else if (currentSortField === "totalAmount") {
        pendingOrders.sort((a, b) => currentSortDir === "asc" ? (a.totalAmount || 0) - (b.totalAmount || 0) : (b.totalAmount || 0) - (a.totalAmount || 0));
    } else if (currentSortField === "wilaya") {
        pendingOrders.sort((a, b) => currentSortDir === "asc" ? (a.wilaya || "").localeCompare(b.wilaya || "") : (b.wilaya || "").localeCompare(a.wilaya || ""));
    } else if (currentSortField === "phone") {
        pendingOrders.sort((a, b) => currentSortDir === "asc" ? (a.phone || "").localeCompare(b.phone || "") : (b.phone || "").localeCompare(a.phone || ""));
    }
    displayFilteredOrders(pendingOrders);
}

function clearOrderSearch() {
    const inputs = document.querySelectorAll("#order-search-input, #order-search-input-mobile");
    inputs.forEach(input => {
        if (input) input.value = "";
    });
    loadOrders();
}

function displayFilteredOrders(orders) {
    const tbody = document.getElementById("orders-tbody");
    const noMsg = document.getElementById("no-orders-msg");
    const cardsContainer = document.getElementById("orders-cards-view");
    if (!tbody) return;
    if (!orders.length) {
        tbody.innerHTML = "";
        if (noMsg) noMsg.style.display = "block";
        if (cardsContainer) cardsContainer.innerHTML = "";
        return;
    }
    if (noMsg) noMsg.style.display = "none";
    let tableHtml = "";
    let cardsHtml = "";
    orders.forEach((order, index) => {
        const isRepeated = isPhoneRepeated(order.phone, order._id);
        const hasCancelled = cancelledPhones.includes(order.phone);
        const items = order.items || [];
        const productNames = items.map(item => item.productNameAr || item.name || "-").join("، ");
        const quantities = items.map(item => item.quantity || 1).join("، ");
        let allAdditionalParts = [];
        items.forEach(item => {
            let additionalParts = "-";
            if (item.additionalPartsText && item.additionalPartsText !== "") {
                additionalParts = item.additionalPartsText;
            } else if (item.selectedComponent && item.selectedComponent.nameAr) {
                if (item.selectedComponent.type === "separate" || item.purchaseType === "component" || item.purchaseType === "separate") {
                    additionalParts = item.selectedComponent.nameAr;
                } else if (item.selectedComponent.type === "without" || item.purchaseType === "fullWithout") {
                    additionalParts = "بدون " + item.selectedComponent.nameAr;
                } else {
                    additionalParts = item.selectedComponent.nameAr;
                }
            } else if (item.selectedAddon && item.selectedAddon.nameAr) {
                if (item.selectedAddon.choice === "with") {
                    additionalParts = item.selectedAddon.nameAr;
                } else if (item.selectedAddon.choice === "without") {
                    additionalParts = "بدون " + item.selectedAddon.nameAr;
                }
            } else if (item.componentName) {
                additionalParts = item.componentName;
            } else if (item.purchaseType === "component" || item.purchaseType === "separate") {
                additionalParts = "شراء جزء منفرد";
            } else if (item.purchaseType === "fullWithout") {
                additionalParts = "منتج كامل بدون جزء";
            } else if (item.purchaseType === "full") {
                additionalParts = "المنتج كاملا";
            }
            if (additionalParts !== "-") {
                allAdditionalParts.push(additionalParts);
            }
        });
        const additionalPartsDisplay = allAdditionalParts.length > 0 ? allAdditionalParts.join("، ") : "-";
        const allColors = items.map(item => item.selectedColor?.name || "-").join("، ");
        const allSizes = items.map(item => item.selectedSize?.size || "-").join("، ");
        const customNotes = order.notes || "-";
        const orderTotal = order.totalAmount || order.subtotal || 0;
        const shippingCost = order.shippingCost || 0;
        const orderDate = new Date(order.createdAt).toLocaleDateString("ar-DZ");
        const shippingTypeDisplay = order.shippingType === "home" ? "للمنزل" : order.shippingType === "office" ? "للمكتب" : "-";
        const shippingDisplay = '<div>' + shippingTypeDisplay + '</div><div style="font-size: 0.9rem; color: var(--gold); margin-top: 3px;">' + shippingCost + ' <span style="color: #ffffff;">د.ج</span></div>';
        tableHtml += '\n            <tr id="order-row-' + order._id + '">\n                <td>' + (index + 1) + '</td>\n                <td style="vertical-align: middle;">\n                    <div>' + escapeHtml(order.customerName || "-") + '</div>\n                    <div style="display: flex; gap: 5px; justify-content: center; margin-top: 5px;">\n                        ' + (isRepeated ? '<span class="repeat-badge"><i class="fas fa-repeat"></i></span>' : "") + '\n                        ' + (hasCancelled ? '<span class="cancel-warning"><i class="fas fa-history"></i></span>' : "") + '\n                    </div>\n                </td>\n                <td>' + escapeHtml(order.phone || "-") + '</td>\n                <td>' + escapeHtml(order.wilaya || "-") + '</td>\n                <td>' + escapeHtml(order.commune || "-") + '</td>\n                <td class="additional-details" style="font-size: 0.75rem;">' + escapeHtml(productNames) + '</td>\n                <td class="additional-details" style="color: #4caf50; font-weight: bold; font-size: 0.75rem;">' + escapeHtml(additionalPartsDisplay) + '</td>\n                <td class="additional-details" style="font-size: 0.75rem;">' + escapeHtml(customNotes) + '</td>\n                <td style="font-size: 0.75rem;">' + escapeHtml(allColors) + '</td>\n                <td style="font-size: 0.75rem;">' + escapeHtml(allSizes) + '</td>\n                <td style="font-size: 0.75rem;">' + escapeHtml(quantities) + '</td>\n                <td>' + shippingDisplay + '</td>\n                <td>\n                    <div class="total-with-edit">\n                        <span class="total-amount" id="total-' + order._id + '" style="font-size: 0.9rem; color: var(--gold); font-weight: bold;">' + orderTotal + '</span> <span style="color: #ffffff;">د.ج</span>\n                        <i class="fas fa-pen" style="color: var(--gold); cursor: pointer; font-size: 0.8rem; margin-right: 5px;" onclick="openEditTotalModal(\'' + order._id + '\', ' + orderTotal + ')" title="تعديل السعر"></i>\n                    </div>\n                </td>\n                <td>' + orderDate + '</td>\n                <td class="table-actions">\n                    <div style="display: flex; gap: 5px; justify-content: center; align-items: center;">\n                        <button class="btn-confirm-order" onclick="confirmOrder(\'' + order._id + '\')" title="تأكيد الطلب"><i class="fas fa-check"></i></button>\n                        <button class="btn-edit-order" onclick="openFullEditOrderModal(\'' + order._id + '\')" title="تعديل الطلب"><i class="fas fa-edit"></i></button>\n                        <button class="btn-delete-order" onclick="deleteOrder(\'' + order._id + '\')" title="حذف الطلب"><i class="fas fa-trash"></i></button>\n                    </div>\n                </td>\n            </tr>\n        ';
        cardsHtml += '\n            <div class="order-card" id="order-card-' + order._id + '">\n                <div class="order-card-header">\n                    <span class="order-number">#' + (index + 1) + '</span>\n                    <div class="order-warnings">\n                        ' + (isRepeated ? '<span class="repeat-badge"><i class="fas fa-repeat"></i> مكرر</span>' : "") + '\n                        ' + (hasCancelled ? '<span class="cancel-warning"><i class="fas fa-history"></i> ملغي</span>' : "") + '\n                    </div>\n                </div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-user" style="margin-left: 8px;"></i> الاسم:</span><span class="order-card-value">' + escapeHtml(order.customerName || "-") + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-phone" style="margin-left: 8px;"></i> رقم الهاتف:</span><span class="order-card-value">' + escapeHtml(order.phone || "-") + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-map-marker-alt" style="margin-left: 8px;"></i> الولاية:</span><span class="order-card-value">' + escapeHtml(order.wilaya || "-") + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-city" style="margin-left: 8px;"></i> البلدية:</span><span class="order-card-value">' + escapeHtml(order.commune || "-") + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-boxes" style="margin-left: 8px;"></i> الإكسسوارات:</span><span class="order-card-value" style="font-size: 0.75rem;">' + escapeHtml(productNames) + '</span></div>\n                <div class="order-card-row"><span class="order-card-label" style="color: #4caf50;"><i class="fas fa-cogs" style="margin-left: 8px;"></i> الأجزاء الإضافية:</span><span class="order-card-value" style="color: #4caf50; font-weight: bold; font-size: 0.75rem;">' + escapeHtml(additionalPartsDisplay) + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-sticky-note" style="margin-left: 8px;"></i> إضافات مخصصة:</span><span class="order-card-value" style="font-size: 0.75rem;">' + escapeHtml(customNotes) + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-palette" style="margin-left: 8px;"></i> اللون:</span><span class="order-card-value" style="font-size: 0.75rem;">' + escapeHtml(allColors) + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-ruler-horizontal" style="margin-left: 8px;"></i> المقاس:</span><span class="order-card-value" style="font-size: 0.75rem;">' + escapeHtml(allSizes) + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-box" style="margin-left: 8px;"></i> الكمية:</span><span class="order-card-value" style="font-size: 0.75rem;">' + escapeHtml(quantities) + '</span></div>\n                <div class="order-card-row">\n                    <span class="order-card-label"><i class="fas fa-coins" style="margin-left: 8px;"></i> المبلغ الإجمالي:</span>\n                    <span class="order-card-value" style="font-weight: bold; font-size: 0.8rem;">\n                        <span style="color: var(--gold);">' + orderTotal + '</span> <span style="color: #ffffff;">د.ج</span>\n                        <i class="fas fa-pen" style="color: var(--gold); cursor: pointer; font-size: 0.75rem; margin-right: 5px;" onclick="openEditTotalModal(\'' + order._id + '\', ' + orderTotal + ')" title="تعديل السعر"></i>\n                    </span>\n                </div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-calendar-alt" style="margin-left: 8px;"></i> التاريخ:</span><span class="order-card-value">' + orderDate + '</span></div>\n                <div class="order-card-actions">\n                    <button class="btn-confirm-order" onclick="confirmOrder(\'' + order._id + '\')" title="تأكيد الطلب"><i class="fas fa-check"></i> تأكيد</button>\n                    <button class="btn-edit-order" onclick="openFullEditOrderModal(\'' + order._id + '\')" title="تعديل الطلب"><i class="fas fa-edit"></i> تعديل</button>\n                    <button class="btn-delete-order" onclick="deleteOrder(\'' + order._id + '\')" title="حذف الطلب"><i class="fas fa-trash"></i> حذف</button>\n                </div>\n            </div>\n        ';
    });
    tbody.innerHTML = tableHtml;
    if (cardsContainer) cardsContainer.innerHTML = cardsHtml;
}

function formatPhoneNumber(phone) {
    if (!phone) return "-";
    let formatted = phone.toString();
    if (formatted.startsWith("+213")) {
        formatted = formatted.substring(4);
    } else if (formatted.startsWith("213")) {
        formatted = formatted.substring(3);
    }
    return formatted;
}

function isPhoneRepeated(phone, currentOrderId) {
    return allOrders.some(o => o.phone === phone && o._id !== currentOrderId);
}

function getCustomizationText(order) {
    if (!order.items || order.items.length === 0) return "-";
    const item = order.items[0];
    let text = "";
    if (item.customizationText) text += item.customizationText;
    if (item.addonCustomValue) text += (text ? " | " : "") + item.addonCustomValue;
    return text || "-";
}

function displayFilteredOrdersCards(orders) {
    const container = document.getElementById("orders-cards-view");
    if (!container) return;
    let html = "";
    orders.forEach((o, i) => {
        const product = o.items && o.items[0] ? o.items[0] : null;
        const quantityString = getQuantityString(o.items);
        const orderTotal = o.totalAmount || o.subtotal || 0;
        const orderAge = getOrderAge(o.createdAt);
        const isRepeat = isRepeatCustomer(o.phone, o._id);
        html += '<div class="order-card"><div class="order-card-row"><span class="order-card-label">#:</span><span class="order-card-value">' + (i + 1) + '</span></div><div class="order-card-row"><span class="order-card-label"><i class="fas fa-user" style="margin-left: 8px;"></i>الاسم:</span><span class="order-card-value">' + (o.customerName || "-") + (isRepeat ? " مكرر" : "") + '</span></div><div class="order-card-row"><span class="order-card-label"><i class="fas fa-phone" style="margin-left: 8px;"></i> الهاتف:</span><span class="order-card-value">' + (o.phone || "-") + '</span></div><div class="order-card-row"><span class="order-card-label"><i class="fas fa-map-marker-alt" style="margin-left: 8px;"></i> الولاية:</span><span class="order-card-value">' + (o.wilaya || "-") + ' / ' + (o.commune || "-") + '</span></div><div class="order-card-row"><span class="order-card-label">الإكسسوار:</span><span class="order-card-value">' + (product ? product.name : "-") + '</span></div><div class="order-card-row"><span class="order-card-label">الكمية:</span><span class="order-card-value" style="font-size:0.75rem;">' + quantityString + '</span></div><div class="order-card-row"><span class="order-card-label"><i class="fas fa-coins" style="margin-left: 8px;"></i> الإجمالي:</span><span class="order-card-value">' + orderTotal + ' د.ج</span></div><div class="order-card-row"><span class="order-card-label"><i class="fas fa-calendar-alt" style="margin-left: 8px;"></i> التاريخ:</span><span class="order-card-value">' + new Date(o.createdAt).toLocaleDateString("ar-DZ") + ' (' + orderAge + ')</span></div><div class="order-card-row"><span class="order-card-label">الإجراءات:</span><span class="order-card-value"><button class="btn-action btn-confirm" onclick="confirmOrder(\'' + o._id + '\')">تأكيد</button><button class="btn-action btn-cancel" onclick="cancelOrder(\'' + o._id + '\')">إلغاء</button><button class="btn-action btn-delete" onclick="deleteOrder(\'' + o._id + '\')">حذف</button></span></div></div>';
    });
    container.innerHTML = html;
}

function filterCompletedOrders(searchTerm) {
    let completed = allOrders.filter(o => o.status === "processing" || o.status === "shipped" || o.status === "delivered");
    if (searchTerm && searchTerm !== "") {
        const term = searchTerm.toLowerCase().trim();
        completed = completed.filter(o => {
            const orderId = (o._id || "").toLowerCase();
            const customerName = (o.customerName || "").toLowerCase();
            const phone = (o.phone || "").toLowerCase();
            return orderId.includes(term) || customerName.includes(term) || phone.includes(term);
        });
    }
    if (currentCompletedSortField === "createdAt") {
        completed.sort((a, b) => currentCompletedSortDir === "asc" ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentCompletedSortField === "customerName") {
        completed.sort((a, b) => currentCompletedSortDir === "asc" ? (a.customerName || "").localeCompare(b.customerName || "") : (b.customerName || "").localeCompare(a.customerName || ""));
    } else if (currentCompletedSortField === "totalAmount") {
        completed.sort((a, b) => currentCompletedSortDir === "asc" ? (a.totalAmount || 0) - (b.totalAmount || 0) : (b.totalAmount || 0) - (a.totalAmount || 0));
    } else if (currentCompletedSortField === "wilaya") {
        completed.sort((a, b) => currentCompletedSortDir === "asc" ? (a.wilaya || "").localeCompare(b.wilaya || "") : (b.wilaya || "").localeCompare(a.wilaya || ""));
    } else if (currentCompletedSortField === "phone") {
        completed.sort((a, b) => currentCompletedSortDir === "asc" ? (a.phone || "").localeCompare(b.phone || "") : (b.phone || "").localeCompare(a.phone || ""));
    }
    displayFilteredCompletedOrders(completed);
    displayFilteredCompletedOrdersCards(completed);
}

function clearCompletedOrderSearch() {
    const inputs = document.querySelectorAll("#completed-order-search-input, #completed-order-search-input-mobile");
    inputs.forEach(input => {
        if (input) input.value = "";
    });
    loadCompletedOrders();
}

function displayFilteredCompletedOrders(orders) {
    const tbody = document.getElementById("completed-orders-tbody");
    if (!tbody) return;
    if (!orders.length) {
        tbody.innerHTML = '<tr><td colspan="16" style="text-align:center;">لا توجد طلبات مؤكدة حاليا</td></tr>';
        const cardsView = document.getElementById("completed-orders-cards");
        if (cardsView) cardsView.innerHTML = "";
        return;
    }
    let html = "";
    orders.forEach((order, index) => {
        const isRepeated = isPhoneRepeated(order.phone, order._id);
        const hasCancelled = cancelledPhones.includes(order.phone);
        const items = order.items || [];
        const productNames = items.map(item => item.productNameAr || item.name || "-").join("، ");
        const quantities = items.map(item => item.quantity || 1).join("، ");
        let allAdditionalParts = [];
        items.forEach(item => {
            let additionalParts = "-";
            if (item.additionalPartsText && item.additionalPartsText !== "") {
                additionalParts = item.additionalPartsText;
            } else if (item.selectedComponent && item.selectedComponent.nameAr) {
                if (item.selectedComponent.type === "separate" || item.purchaseType === "component" || item.purchaseType === "separate") {
                    additionalParts = item.selectedComponent.nameAr;
                } else if (item.selectedComponent.type === "without" || item.purchaseType === "fullWithout") {
                    additionalParts = "بدون " + item.selectedComponent.nameAr;
                } else {
                    additionalParts = item.selectedComponent.nameAr;
                }
            } else if (item.selectedAddon && item.selectedAddon.nameAr) {
                if (item.selectedAddon.choice === "with") {
                    additionalParts = item.selectedAddon.nameAr;
                } else if (item.selectedAddon.choice === "without") {
                    additionalParts = "بدون " + item.selectedAddon.nameAr;
                }
            } else if (item.componentName) {
                additionalParts = item.componentName;
            } else if (item.purchaseType === "component" || item.purchaseType === "separate") {
                additionalParts = "شراء جزء منفرد";
            } else if (item.purchaseType === "fullWithout") {
                additionalParts = "منتج كامل بدون جزء";
            } else if (item.purchaseType === "full") {
                additionalParts = "المنتج كاملا";
            }
            if (additionalParts !== "-") {
                allAdditionalParts.push(additionalParts);
            }
        });
        const additionalPartsDisplay = allAdditionalParts.length > 0 ? allAdditionalParts.join("، ") : "-";
        const allColors = items.map(item => item.selectedColor?.name || "-").join("، ");
        const allSizes = items.map(item => item.selectedSize?.size || "-").join("، ");
        const customNotes = order.notes || "-";
        const orderTotal = order.totalAmount || order.subtotal || 0;
        const orderDate = new Date(order.createdAt).toLocaleDateString("ar-DZ");
        const shippingTypeDisplay = order.shippingType === "home" ? "للمنزل" : order.shippingType === "office" ? "للمكتب" : "-";
        const shippingCost = order.shippingCost || 0;
        const shippingDisplay = '<div>' + shippingTypeDisplay + '</div><div style="font-size: 0.9rem; color: var(--gold); margin-top: 3px;">' + shippingCost + ' <span style="color: #ffffff;">د.ج</span></div>';
        let isDelayedForStatus = false;
        if (order.status === "processing") {
            const orderDateObj = new Date(order.createdAt);
            const algeriaOrderDate = new Date(orderDateObj.toLocaleString("en-US", {
                timeZone: "Africa/Algiers"
            }));
            const diffDays = getDaysDifference(algeriaOrderDate, getTodayAlgeria());
            isDelayedForStatus = diffDays >= 8;
        }
        let statusText = "";
        let statusColor = "";
        if (order.status === "delivered") {
            statusText = "تم التوصيل";
            statusColor = "#4caf50";
        } else if (order.status === "shipped") {
            statusText = "قيد الشحن";
            statusColor = "#2196f3";
        } else if (order.status === "processing") {
            if (isDelayedForStatus) {
                statusText = "طلب متأخر";
                statusColor = "#f44336";
            } else {
                statusText = "قيد التجهيز";
                statusColor = "#ff9800";
            }
        } else {
            statusText = order.status || "-";
            statusColor = "#888";
        }
        const delayedRowClass = order.status === "processing" && isDelayedForStatus ? "completed-row-delayed" : "";
        html += '\n            <tr id="completed-row-' + order._id + '" class="' + delayedRowClass + '">\n                <td style="vertical-align: middle;">\n                    ' + (index + 1) + '\n                </td>\n                <td style="vertical-align: middle;">\n                    <div>' + escapeHtml(order.customerName || "-") + '</div>\n                    <div style="display: flex; gap: 5px; justify-content: center; margin-top: 5px;">\n                        ' + (isRepeated ? '<span class="repeat-badge"><i class="fas fa-repeat"></i></span>' : "") + '\n                        ' + (hasCancelled ? '<span class="cancel-warning"><i class="fas fa-history"></i></span>' : "") + '\n                    </div>\n                 </td>\n                <td>' + escapeHtml(order.phone || "-") + '</td>\n                <td>' + escapeHtml(order.wilaya || "-") + '</td>\n                <td>' + escapeHtml(order.commune || "-") + '</td>\n                <td class="additional-details" style="font-size: 0.75rem;">' + escapeHtml(productNames) + '</td>\n                <td class="additional-details" style="color: #4caf50; font-weight: bold; font-size: 0.75rem;">' + escapeHtml(additionalPartsDisplay) + '</td>\n                <td class="additional-details" style="font-size: 0.75rem;">' + escapeHtml(customNotes) + '</td>\n                <td style="font-size: 0.75rem;">' + escapeHtml(allColors) + '</td>\n                <td style="font-size: 0.75rem;">' + escapeHtml(allSizes) + '</td>\n                <td style="font-size: 0.75rem;">' + escapeHtml(quantities) + '</td>\n                <td>' + shippingDisplay + '</td>\n                <td>\n                    <div class="total-with-edit">\n                        <span class="total-amount" id="total-' + order._id + '" style="font-size: 0.9rem; color: var(--gold); font-weight: bold;">' + orderTotal + '</span> <span style="color: #ffffff;">د.ج</span>\n                        <i class="fas fa-pen" style="color: var(--gold); cursor: pointer; font-size: 0.8rem; margin-right: 5px;" onclick="openEditTotalModal(\'' + order._id + '\', ' + orderTotal + ')" title="تعديل السعر"></i>\n                    </div>\n                </td>\n                <td>' + orderDate + '</td>\n                <td style="color:' + statusColor + '; font-weight: ' + (statusText === "طلب متأخر" ? "bold" : "normal") + '">' + statusText + '</td>\n                <td class="completed-actions">\n                    <div style="display: flex; gap: 5px; justify-content: center; align-items: center; flex-wrap: wrap;">\n                        ' + (order.status !== "shipped" && order.status !== "delivered" ? '<button class="btn-ship-order" onclick="shipOrder(\'' + order._id + '\')" title="قيد الشحن"><i class="fas fa-truck"></i></button>' : "") + '\n                        ' + (order.status === "shipped" ? '<button class="btn-deliver-order" onclick="deliverOrder(\'' + order._id + '\')" title="تسليم الطلب"><i class="fas fa-check-double"></i></button>' : "") + '\n                        ' + (order.status === "delivered" ? '<button class="btn-save-order" onclick="saveOrderToAnalytics(\'' + order._id + '\')" title="حفظ الطلب في الإحصائيات"><i class="fas fa-save" style="margin-left: 12px!important;"></i>حفظ</button>' : "") + '\n                        ' + (order.status !== "delivered" ? '<button class="btn-edit-order" onclick="openFullEditOrderModal(\'' + order._id + '\')" title="تعديل الطلب"><i class="fas fa-edit"></i></button>' : "") + '\n                        ' + (order.status !== "delivered" ? '<button class="btn-return-order" onclick="returnOrder(\'' + order._id + '\')" title="إرجاع الطلب"><i class="fas fa-undo"></i></button>' : "") + '\n                        ' + (order.status !== "delivered" ? '<button class="btn-delete-order" onclick="deleteOrder(\'' + order._id + '\')" title="حذف الطلب"><i class="fas fa-trash"></i></button>' : "") + '\n                    <div>\n                </td>\n            </tr>\n        ';
    });
    tbody.innerHTML = html;
}

function getTodayAlgeria() {
    const now = new Date();
    const algeriaTime = new Date(now.toLocaleString("en-US", {
        timeZone: "Africa/Algiers"
    }));
    return algeriaTime;
}

function getDaysDifference(date1, date2) {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const diffTime = Math.abs(d2 - d1);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function isOrderDelayed(order) {
    if (order.status !== "processing") return false;
    const today = getTodayAlgeria();
    const orderDate = new Date(order.createdAt);
    const algeriaOrderDate = new Date(orderDate.toLocaleString("en-US", {
        timeZone: "Africa/Algiers"
    }));
    const diffDays = getDaysDifference(algeriaOrderDate, today);
    return diffDays >= 7;
}

function getDelayedOrdersCount() {
    const delayedOrders = allOrders.filter(order => isOrderDelayed(order));
    return delayedOrders.length;
}

function updateDelayedOrdersCount() {
    const delayedCount = getDelayedOrdersCount();
    const delayedEl = document.getElementById("stat-delayed-orders");
    if (delayedEl) {
        delayedEl.innerText = delayedCount;
    }
}

function applyDelayedRowStyling() {
    document.querySelectorAll("#completed-orders-table tbody tr").forEach(row => {
        const orderId = row.id?.replace("completed-row-", "");
        if (!orderId) return;
        const order = allOrders.find(o => o._id === orderId);
        if (!order) return;
        if (isOrderDelayed(order)) {
            row.classList.add("completed-row-delayed");
        } else {
            row.classList.remove("completed-row-delayed");
        }
    });
}

function updateAllDelayedOrders() {
    updateDelayedOrdersCount();
    applyDelayedRowStyling();
}

function displayFilteredCompletedOrdersCards(orders) {
    const container = document.getElementById("completed-orders-cards");
    if (!container) return;
    if (!orders.length) {
        container.innerHTML = '<div style="text-align:center;padding:20px;">لا توجد طلبات مؤكدة حاليا</div>';
        return;
    }
    const today = getTodayAlgeria();
    let html = "";
    orders.forEach((order, index) => {
        const items = order.items || [];
        const isRepeated = isPhoneRepeated(order.phone, order._id);
        const hasCancelled = cancelledPhones.includes(order.phone);
        const productNames = items.map(item => item.productNameAr || item.name || "-").join("، ");
        const quantities = items.map(item => item.quantity || 1).join("، ");
        let allAdditionalParts = [];
        items.forEach(item => {
            let additionalParts = "-";
            if (item.additionalPartsText && item.additionalPartsText !== "") {
                additionalParts = item.additionalPartsText;
            } else if (item.selectedComponent && item.selectedComponent.nameAr) {
                if (item.selectedComponent.type === "separate" || item.purchaseType === "component" || item.purchaseType === "separate") {
                    additionalParts = item.selectedComponent.nameAr;
                } else if (item.selectedComponent.type === "without" || item.purchaseType === "fullWithout") {
                    additionalParts = "بدون " + item.selectedComponent.nameAr;
                } else {
                    additionalParts = item.selectedComponent.nameAr;
                }
            } else if (item.selectedAddon && item.selectedAddon.nameAr) {
                if (item.selectedAddon.choice === "with") {
                    additionalParts = item.selectedAddon.nameAr;
                } else if (item.selectedAddon.choice === "without") {
                    additionalParts = "بدون " + item.selectedAddon.nameAr;
                }
            } else if (item.componentName) {
                additionalParts = item.componentName;
            } else if (item.purchaseType === "component" || item.purchaseType === "separate") {
                additionalParts = "شراء جزء منفرد";
            } else if (item.purchaseType === "fullWithout") {
                additionalParts = "منتج كامل بدون جزء";
            } else if (item.purchaseType === "full") {
                additionalParts = "المنتج كاملا";
            }
            if (additionalParts !== "-") {
                allAdditionalParts.push(additionalParts);
            }
        });
        const additionalPartsDisplay = allAdditionalParts.length > 0 ? allAdditionalParts.join("، ") : "-";
        const allColors = items.map(item => item.selectedColor?.name || "-").join("، ");
        const allSizes = items.map(item => item.selectedSize?.size || "-").join("، ");
        const customNotes = order.notes || "-";
        const orderTotal = order.totalAmount || order.subtotal || 0;
        const orderDate = new Date(order.createdAt).toLocaleDateString("ar-DZ");
        const shippingCost = order.shippingCost || 0;
        const shippingTypeDisplay = order.shippingType === "home" ? "للمنزل" : order.shippingType === "office" ? "للمكتب" : "-";
        const shippingDisplay = '<div>' + shippingTypeDisplay + '</div><div style="font-size: 0.8rem; color: var(--gold); margin-top: 3px;">' + shippingCost + ' <span style="color: #ffffff;">د.ج</span></div>';
        let isDelayedForStatus = false;
        if (order.status === "processing") {
            const orderDateObj = new Date(order.createdAt);
            const algeriaOrderDate = new Date(orderDateObj.toLocaleString("en-US", {
                timeZone: "Africa/Algiers"
            }));
            const diffDays = getDaysDifference(algeriaOrderDate, getTodayAlgeria());
            isDelayedForStatus = diffDays >= 8;
        }
        const statusText = order.status === "delivered" ? "تم التوصيل" : order.status === "shipped" ? "قيد الشحن" : isDelayedForStatus ? "طلب متأخر" : "قيد التجهيز";
        let statusColor;
        if (order.status === "delivered") {
            statusColor = "#4caf50";
        } else if (order.status === "shipped") {
            statusColor = "#2196f3";
        } else if (order.status === "processing") {
            statusColor = isDelayedForStatus ? "#f44336" : "#ff9800";
        } else {
            statusColor = "#888";
        }
        const delayedClass = order.status === "processing" && isDelayedForStatus ? "order-card-delayed" : "";
        html += '\n            <div class="order-card ' + delayedClass + '" id="completed-card-' + order._id + '">\n                <div class="order-card-header">\n                    <span class="order-number">#' + (index + 1) + '</span>\n                    <div class="order-warnings">\n                        ' + (isRepeated ? '<span class="repeat-badge"><i class="fas fa-repeat"></i> مكرر</span>' : "") + '\n                        ' + (hasCancelled ? '<span class="cancel-warning"><i class="fas fa-history"></i> ملغي</span>' : "") + '\n                    </div>\n                </div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-user" style="margin-left: 8px;"></i> الاسم:</span><span class="order-card-value">' + escapeHtml(order.customerName || "-") + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-phone" style="margin-left: 8px;"></i> رقم الهاتف:</span><span class="order-card-value">' + escapeHtml(order.phone || "-") + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-map-marker-alt" style="margin-left: 8px;"></i> الولاية:</span><span class="order-card-value">' + escapeHtml(order.wilaya || "-") + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-city" style="margin-left: 8px;"></i> البلدية:</span><span class="order-card-value">' + escapeHtml(order.commune || "-") + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-boxes" style="margin-left: 8px;"></i> الإكسسوارات:</span><span class="order-card-value" style="font-size: 0.75rem;">' + escapeHtml(productNames) + '</span></div>\n                <div class="order-card-row"><span class="order-card-label" style="color: #4caf50;"><i class="fas fa-cogs" style="margin-left: 8px;"></i> الأجزاء الإضافية:</span><span class="order-card-value" style="color: #4caf50; font-weight: bold; font-size: 0.75rem;">' + escapeHtml(additionalPartsDisplay) + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-sticky-note" style="margin-left: 8px;"></i> إضافات مخصصة:</span><span class="order-card-value" style="font-size: 0.75rem;">' + escapeHtml(customNotes) + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-palette" style="margin-left: 8px;"></i> اللون:</span><span class="order-card-value" style="font-size: 0.75rem;">' + escapeHtml(allColors) + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-ruler-horizontal" style="margin-left: 8px;"></i> المقاس:</span><span class="order-card-value" style="font-size: 0.75rem;">' + escapeHtml(allSizes) + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-box" style="margin-left: 8px;"></i> الكمية:</span><span class="order-card-value" style="font-size: 0.75rem;">' + escapeHtml(quantities) + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-truck" style="margin-left: 8px;"></i> نوع التوصيل:</span><span class="order-card-value">' + shippingDisplay + '</span></div>\n                <div class="order-card-row">\n                    <span class="order-card-label"><i class="fas fa-coins" style="margin-left: 8px;"></i> المبلغ الإجمالي:</span>\n                    <span class="order-card-value" style="font-weight: bold; font-size: 0.8rem;">\n                        <span style="color: var(--gold);">' + orderTotal + '</span> <span style="color: #ffffff;">د.ج</span>\n                        <i class="fas fa-pen" style="color: var(--gold); cursor: pointer; font-size: 0.75rem; margin-right: 5px;" onclick="openEditTotalModal(\'' + order._id + '\', ' + orderTotal + ')" title="تعديل السعر"></i>\n                    </span>\n                </div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-calendar" style="margin-left: 8px;"></i> التاريخ:</span><span class="order-card-value">' + orderDate + '</span></div>\n                <div class="order-card-row"><span class="order-card-label"><i class="fas fa-cog" style="margin-left: 8px;"></i> الحالة:</span><span class="order-card-value" style="color:' + statusColor + '">' + statusText + '</span></div>\n                <div class="order-card-actions">\n                    ' + (order.status !== "shipped" && order.status !== "delivered" ? '<button class="btn-ship-order" onclick="shipOrder(\'' + order._id + '\')" title="قيد الشحن"><i class="fas fa-truck"></i></button>' : "") + '\n                    ' + (order.status === "shipped" ? '<button class="btn-deliver-order" onclick="deliverOrder(\'' + order._id + '\')" title="تم التوصيل"><i class="fas fa-check-double"></i></button>' : "") + '\n                    ' + (order.status === "delivered" ? '<button class="btn-save-order" onclick="saveOrderToAnalytics(\'' + order._id + '\')" title="حفظ الطلب في الإحصائيات"><i class="fas fa-save" style="margin-left: 8px;"></i>حفظ</button>' : "") + '\n                    ' + (order.status !== "delivered" ? '<button class="btn-edit-order" onclick="openFullEditOrderModal(\'' + order._id + '\')" title="تعديل"><i class="fas fa-edit"></i></button>' : "") + '\n                    ' + (order.status !== "delivered" ? '<button class="btn-return-order" onclick="returnOrder(\'' + order._id + '\')" title="إرجاع"><i class="fas fa-undo"></i></button>' : "") + '\n                    ' + (order.status !== "delivered" ? '<button class="btn-delete-order" onclick="deleteOrder(\'' + order._id + '\')" title="حذف"><i class="fas fa-trash"></i></button>' : "") + '\n                </div>\n            </div>\n        ';
    });
    container.innerHTML = html;
}

function sortOrders(field) {
    if (currentSortField === field) {
        currentSortDir = currentSortDir === "asc" ? "desc" : "asc";
    } else {
        currentSortField = field;
        currentSortDir = "asc";
    }
    filterOrders(document.getElementById("order-search-input")?.value || "");
}

function sortCompletedOrders(field) {
    if (currentCompletedSortField === field) {
        currentCompletedSortDir = currentCompletedSortDir === "asc" ? "desc" : "asc";
    } else {
        currentCompletedSortField = field;
        currentCompletedSortDir = "asc";
    }
    filterCompletedOrders(document.getElementById("completed-order-search-input")?.value || "");
}

function openEditPendingTotalModal(orderId, currentTotal) {
    document.getElementById("edit-total-order-id").value = orderId;
    document.getElementById("edit-total-amount").value = currentTotal;
    document.getElementById("edit-total-modal").style.display = "flex";
}

async function loadProducts() {
    try {
        const res = await fetchWithAuth(API_BASE + "/all");
        if (!res.ok) {
            if (res.status === 401) {
                window.location.href = "/login.html";
                return;
            }
            throw new Error("Failed to load products");
        }
        const data = await res.json();
        const products = data.products || data || [];
        allProducts = products;
        displayProducts(products);
        updateStatsCounters();
    } catch (error) {
        if (error === "No token") {
            window.location.href = "/login.html";
        } else {
            console.error("خطأ في تحميل المنتجات:", error);
            showNotification("فشل تحميل المنتجات", "error");
        }
    }
}

async function deleteProduct(id) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
        const res = await fetchWithAuth(API_BASE + "/" + id, {
            method: "DELETE"
        });
        if (res.ok) {
            showNotification("تم حذف الإكسسوار");
            loadProducts();
            loadStats();
        } else {
            showNotification("فشل الحذف", "error");
        }
    } catch (e) {
        showNotification("فشل الحذف", "error");
    }
}

async function openEditModal(productId) {
    try {
        const res = await fetchWithAuth(API_BASE + "/" + productId);
        const data = await res.json();
        const p = data.product;
        currentProductForEdit = p;
        document.getElementById("edit-product-id").value = p._id;
        document.getElementById("edit-name-ar").value = p.nameAr || "";
        document.getElementById("edit-name-fr").value = p.nameFr || "";
        document.getElementById("edit-price").value = p.basePrice;
        document.getElementById("edit-desc-ar").value = p.descriptionAr || "";
        document.getElementById("edit-desc-fr").value = p.descriptionFr || "";
        document.getElementById("edit-category").value = p.category || "";
        editColorsList = p.colors || [];
        updateEditColorsDisplay();
        const editColorSelect = document.getElementById("edit-color-select");
        if (editColorSelect) {
            editColorSelect.innerHTML = '<option value="" disabled selected hidden>اختاري لونا</option>';
            colorOptions.forEach(color => {
                const option = document.createElement("option");
                option.value = color.hexCode;
                option.textContent = currentLang === "ar" ? color.ar : color.fr;
                editColorSelect.appendChild(option);
            });
        }
        const hasSizesCheckbox = document.getElementById("edit-has-sizes");
        hasSizesCheckbox.checked = p.sizes && p.sizes.length > 0;
        if (p.sizes && p.sizes.length > 0) {
            loadEditSizes(p.sizes);
        } else {
            editAddedSizes = [];
            displayEditAddedSizes();
        }
        toggleEditSizesSection();
        const hasComponentsCheckbox = document.getElementById("edit-has-components");
        const editComponentsSection = document.getElementById("edit-components-section");
        const editComponentsList = document.getElementById("edit-components-list");
        if (p.components && p.components.length > 0) {
            hasComponentsCheckbox.checked = true;
            editComponentsSection.style.display = "block";
            editComponentsList.innerHTML = "";
            const componentSettings = p.componentSettings || [];
            p.components.forEach((comp, idx) => {
                const setting = componentSettings.find(s => s.componentIndex === idx) || {
                    sellSeparately: false,
                    allowFullWithout: false
                };
                const div = document.createElement("div");
                div.className = "component-item";
                div.innerHTML = '\n                    <div class="component-fields-row">\n                        <input type="text" placeholder="اسم الجزء (عربي)" class="edit-component-name-ar" value="' + (comp.nameAr || "").replace(/"/g, "&quot;") + '">\n                        <input type="text" placeholder="Nom (Français)" class="edit-component-name-fr" value="' + (comp.nameFr || "").replace(/"/g, "&quot;") + '">\n                        <input type="number" placeholder="السعر (د.ج)" class="edit-component-price component-price-field" value="' + comp.price + '">\n                    </div>\n                    <div class="component-image-row" style="display:flex;align-items:center;gap:10px;margin-top:8px;">\n                        <div class="component-image-preview" style="position:relative;">' + (comp.image ? '<img src="' + imgUrl(comp.image) + '" onerror="handleImgError(this)" style="width:35px;height:35px;object-fit:cover;border-radius:6px;"><button type="button" onclick="event.stopPropagation(); removeEditComponentImage(this)" style="position: absolute; top: -8px; right: -8px; background: #f44336; color: white; width: 18px; height: 18px; border-radius: 50%; border: none; cursor: pointer; font-size: 10px; font-weight: bold; line-height:1; padding:0;">X</button>' : "") + '</div>\n                        <input type="file" class="edit-component-image" accept="image/*" style="display:none;">\n                    </div>\n                    <div class="component-actions-row">\n                        <div class="component-checkboxes">\n                            <label>\n                                <input type="checkbox" class="edit-sell-separately" ' + (setting.sellSeparately ? "checked" : "") + '> شراء منفرد\n                            </label>\n                            <label>\n                                <input type="checkbox" class="edit-allow-full-without" ' + (setting.allowFullWithout ? "checked" : "") + '> شراء كامل بدونه\n                            </label>\n                        </div>\n                        <div class="component-buttons">\n                            <button type="button" class="btn-remove-component" onclick="this.closest(\'.component-item\').remove()"><i class="fas fa-trash"></i></button>\n                            <button type="button" class="btn-add-component" onclick="addEditComponentLine()"><i class="fas fa-plus"></i></button>\n                            <button type="button" class="btn-upload-image" onclick="uploadEditComponentImage(this)"><i class="fas fa-image"></i></button>\n                        </div>\n                    </div>\n                ';
                editComponentsList.appendChild(div);
            });
        } else {
            hasComponentsCheckbox.checked = false;
            editComponentsSection.style.display = "none";
        }
        const imagesList = document.getElementById("current-images-list");
        imagesList.innerHTML = "";
        imagesToDelete = [];
        let allImages = [];
        if (p.mainImage && p.mainImage !== "") allImages.push(p.mainImage);
        if (p.images && p.images.length) {
            p.images.forEach(img => {
                if (img && img !== "" && img !== p.mainImage && !allImages.includes(img)) allImages.push(img);
            });
        }
        allImages.forEach(img => {
            const div = document.createElement("div");
            div.className = "current-image-item";
            div.style.cssText = "position: relative; display: inline-block; margin: 8px; border-radius: 12px; overflow: hidden; transition: 0.3s;";
            div.innerHTML = '\n                <img src="' + imgUrl(img) + '" onerror="handleImgError(this)" style="width: 80px; height: 80px; object-fit: cover; border: 2px solid var(--gold); border-radius: 12px; transition: 0.3s;">\n                <button type="button" class="delete-image-btn" onclick="markImageForDeletion(\'' + img + '\', this)" style="position: absolute; top: 0px; right: 0px; background: #f44336; color: white; width: 24px; height: 24px; border-radius: 50%; border: none; cursor: pointer; font-size: 12px; font-weight: bold; transition: 0.2s;">X</button>\n            ';
            imagesList.appendChild(div);
        });
        document.getElementById("edit-images").value = "";
        document.getElementById("new-images-preview").innerHTML = "";
        document.getElementById("replace-all-images").checked = false;
        const modal = document.getElementById("edit-product-modal");
        modal.style.display = "flex";
        modal.onclick = function(e) {
            if (e.target === modal) {
                closeEditModal();
            }
        };
    } catch (e) {
        showNotification("فشل تحميل بيانات الإكسسوار", "error");
    }
    setTimeout(function() {
        const editPriceInputs = document.querySelectorAll('#edit-product-modal input[type="number"]');
        editPriceInputs.forEach(input => {
            if (!input.readOnly) {
                input.setAttribute("oninput", "validatePriceOnInput(this)");
                input.setAttribute("onchange", "validatePrice(this)");
                input.setAttribute("onblur", "validatePriceOnBlur(this)");
            }
        });
    }, 100);
}

function markImageForDeletion(imagePath, btnElement) {
    if (confirm("حذف هذه الصورة نهائياً؟")) {
        if (!imagesToDelete.includes(imagePath)) imagesToDelete.push(imagePath);
        const imageContainer = btnElement.parentElement;
        imageContainer.style.opacity = "0.4";
        imageContainer.style.filter = "grayscale(0.8)";
        imageContainer.style.border = "2px solid #f44336";
        btnElement.innerHTML = "✓";
        btnElement.style.background = "#4caf50";
        btnElement.style.color = "white";
        showNotification("تم تحديد الصورة للحذف عند حفظ الإكسسوار");
    }
}

function closeEditModal() {
    document.getElementById("edit-product-modal").style.display = "none";
}

async function loadOrders() {
    try {
        const res = await fetchWithAuth(API_BASE + "/orders/all");
        if (!res.ok) {
            if (res.status === 401) {
                window.location.href = "/login.html";
                return;
            }
            throw new Error("Failed to load orders");
        }
        const data = await res.json();
        allOrders = data.orders || data || [];
        filterOrders(document.getElementById("order-search-input")?.value || "");
        updateStatsCounters();
    } catch (error) {
        if (error === "No token") {
            window.location.href = "/login.html";
        } else {
            console.error("خطأ في تحميل الطلبات:", error);
            showNotification("فشل تحميل الطلبات", "error");
        }
    }
}

async function confirmOrder(id) {
    try {
        const res = await fetchWithAuth(API_BASE + "/orders/" + id + "/status", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: "processing"
            })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            showNotification("تم تأكيد الطلب");
            const orderIndex = processedOrderIds.indexOf(id);
            if (orderIndex !== -1) {
                processedOrderIds.splice(orderIndex, 1);
                localStorage.setItem("processedOrderIds", JSON.stringify(processedOrderIds));
            }
            await loadOrders();
            await loadCompletedOrders();
            await loadStats();
            await updateAllDelayedOrders();
        } else {
            showNotification("فشل تأكيد الطلب: " + (data.error || data.message || "خطأ غير معروف"), "error");
        }
    } catch (error) {
        if (error === "No token") {
            window.location.href = "/login.html";
        } else {
            console.error("خطأ في تأكيد الطلب:", error);
            showNotification("خطأ في الاتصال", "error");
        }
    }
}

async function cancelOrder(id) {
    if (confirm("هل تريد إلغاء هذا الطلب؟")) await deleteOrder(id);
}

async function loadCompletedOrders() {
    try {
        const res = await fetchWithAuth(API_BASE + "/orders/all");
        const data = await res.json();
        allOrders = data.orders || data || [];
        filterCompletedOrders(document.getElementById("completed-order-search-input")?.value || "");
        updateStatsCounters();
        await updateShippedOrdersCount();
        await updateAllDelayedOrders();
    } catch (error) {
        if (error === "No token") {
            window.location.href = "/login.html";
        } else {
            console.error("خطأ في تحميل الطلبات المكتملة:", error);
        }
    }
}

let editCurrentProduct = null;
let editCurrentSizePrice = 0;
let editCurrentComponentPrice = 0;
let editSelectedComponentData = null;
let editCurrentOrderId = null;
let editCurrentOrder = null;

async function openFullEditOrderModal(orderId) {
    editCurrentOrderId = orderId;
    const modal = document.getElementById("edit-order-modal");
    modal.style.display = "flex";
    try {
        const res = await fetchWithAuth(API_BASE + "/orders/" + orderId);
        const data = await res.json();
        const order = data.order;
        if (!order) {
            showNotification("الطلب غير موجود", "error");
            return;
        }
        editCurrentOrder = order;
        const orderItem = order.items?.[0] || {};
        document.getElementById("edit-name").value = order.customerName || "";
        document.getElementById("edit-phone").value = order.phone || "";
        document.getElementById("edit-commune").value = order.commune || "";
        const shippingType = order.shippingType || "home";
        document.querySelector('input[name="edit-shipping-type"][value="' + shippingType + '"]').checked = true;
        document.getElementById("edit-quantity").value = orderItem.quantity || 1;
        const customizationText = orderItem.customizationText || order.notes || "";
        document.getElementById("edit-customization").value = customizationText;
        await loadEditWilayas(order.wilaya);
        await loadEditProducts(orderItem.productId, orderItem);
        await calculateEditTotal();
        modal.onclick = function(e) {
            if (e.target === modal) {
                closeEditOrderModal();
            }
        };
    } catch (e) {
        console.error("خطأ في تحميل الطلب:", e);
        showNotification("فشل تحميل بيانات الطلب", "error");
    }
    setTimeout(function() {
        const orderPriceInputs = document.querySelectorAll('#edit-order-modal input[type="number"]');
        orderPriceInputs.forEach(input => {
            if (!input.readOnly) {
                input.setAttribute("oninput", "validatePriceOnInput(this)");
                input.setAttribute("onchange", "validatePrice(this)");
                input.setAttribute("onblur", "validatePriceOnBlur(this)");
            }
        });
    }, 100);
}

async function loadEditWilayas(selectedWilaya) {
    try {
        const res = await fetchWithAuth(API_BASE + "/shipping-rates");
        const data = await res.json();
        const select = document.getElementById("edit-wilaya");
        if (data.success && data.rates) {
            select.innerHTML = "";
            data.rates.forEach(rate => {
                select.innerHTML += '<option value="' + escapeHtml(rate.wilayaName) + '" data-home="' + rate.homePrice + '" data-office="' + rate.officePrice + '" ' + (selectedWilaya === rate.wilayaName ? "selected" : "") + '>' + escapeHtml(rate.wilayaName) + '</option>';
            });
        }
    } catch (e) {
        console.error("Error loading wilayas:", e);
    }
}

async function loadEditProducts(selectedProduct, orderItem) {
    try {
        const res = await fetchWithAuth(API_BASE + "/all");
        const data = await res.json();
        const products = data.products || data || [];
        const select = document.getElementById("edit-product");
        if (!select) {
            console.error("عنصر edit-product غير موجود في DOM");
            return;
        }
        let selectedProductId = null;
        if (typeof selectedProduct === "string") {
            selectedProductId = selectedProduct;
        } else if (selectedProduct && selectedProduct._id) {
            selectedProductId = selectedProduct._id;
        } else if (selectedProduct && typeof selectedProduct === "object") {
            selectedProductId = selectedProduct.toString();
        }
        select.innerHTML = "";
        let foundSelected = false;
        products.forEach(p => {
            const option = document.createElement("option");
            option.value = p._id;
            option.setAttribute("data-product", JSON.stringify(p));
            option.textContent = p.nameAr || p.name;
            if (selectedProductId && selectedProductId.toString() === p._id.toString()) {
                option.selected = true;
                foundSelected = true;
            }
            select.appendChild(option);
        });
        if (!foundSelected) {
            if (products.length > 0) {
                select.selectedIndex = 0;
                const firstProduct = products[0];
                const emptyOrderItem = orderItem || {};
                await loadEditProductDetails(firstProduct, emptyOrderItem);
            }
            return;
        }
        const selectedProductObj = products.find(p => p._id === selectedProductId);
        if (selectedProductObj) {
            await loadEditProductDetails(selectedProductObj, orderItem || {});
        } else {
            console.error("الإكسسوار غير موجود في قاعدة البيانات");
        }
        select.onchange = async function() {
            const selectedOption = select.options[select.selectedIndex];
            if (selectedOption && selectedOption.value) {
                const product = JSON.parse(selectedOption.getAttribute("data-product"));
                await loadEditProductDetails(product, orderItem || {});
            }
        };
    } catch (e) {
        console.error("خطأ في تحميل الإكسسوار:", e);
        showNotification("فشل تحميل الإكسسوار", "error");
    }
}

async function loadEditProductDetails(product, orderItem) {
    editCurrentProduct = product;
    const colorContainer = document.getElementById("edit-color-container");
    const colorSelect = document.getElementById("edit-color");
    const colorCircle = document.getElementById("edit-color-circle");
    if (product.colors && product.colors.length > 0) {
        colorContainer.style.display = "block";
        colorSelect.innerHTML = "";
        product.colors.forEach(color => {
            const selected = orderItem.selectedColor?.name === color.name ? "selected" : "";
            colorSelect.innerHTML += '<option value="' + escapeHtml(color.name) + '" data-hex="' + escapeHtml(color.hexCode) + '" ' + selected + '>' + escapeHtml(color.name) + '</option>';
        });
        if (orderItem.selectedColor?.hexCode) {
            colorCircle.style.backgroundColor = orderItem.selectedColor.hexCode;
        } else if (product.colors[0]) {
            colorCircle.style.backgroundColor = product.colors[0].hexCode;
        }
        colorSelect.onchange = function() {
            const selectedOption = colorSelect.options[colorSelect.selectedIndex];
            const hexCode = selectedOption?.getAttribute("data-hex") || "#D4AF37";
            colorCircle.style.backgroundColor = hexCode;
            calculateEditTotal();
        };
    } else {
        colorContainer.style.display = "none";
    }
    const sizeContainer = document.getElementById("edit-size-container");
    const sizeSelect = document.getElementById("edit-size");
    if (product.sizes && product.sizes.length > 0) {
        sizeContainer.style.display = "block";
        sizeSelect.innerHTML = "";
        product.sizes.forEach(size => {
            const selected = orderItem.selectedSize?.size === size.size ? "selected" : "";
            sizeSelect.innerHTML += '<option value="' + size.size + '" data-price="' + size.price + '" ' + selected + '>' + size.size + ' - ' + size.price + ' د.ج</option>';
        });
        if (orderItem.selectedSize?.price) {
            editCurrentSizePrice = orderItem.selectedSize.price;
        } else {
            editCurrentSizePrice = 0;
        }
        sizeSelect.onchange = function() {
            const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
            const sizePrice = selectedOption?.getAttribute("data-price");
            if (sizePrice) {
                editCurrentSizePrice = parseFloat(sizePrice);
            }
            calculateEditTotal();
        };
    } else {
        sizeContainer.style.display = "none";
        editCurrentSizePrice = 0;
    }
    const componentContainer = document.getElementById("edit-component-container");
    const componentOptions = document.getElementById("edit-component-options");
    if (product.components && product.components.length > 0) {
        componentContainer.style.display = "block";
        const componentSettings = product.componentSettings || [];
        let optionsHtml = "";
        const isFullSelected = !orderItem.selectedComponent || orderItem.purchaseType === "full";
        optionsHtml += '\n            <div class="purchase-option-btn ' + (isFullSelected ? "selected" : "") + '" data-type="full" data-price="' + product.basePrice + '" data-component-index="-1" data-name="">\n                <span class="option-name"><i class="fas fa-box"></i> الإكسسوار كامل</span>\n                <span class="option-price">' + product.basePrice + ' د.ج</span>\n            </div>\n        ';
        product.components.forEach((comp, idx) => {
            const setting = componentSettings.find(s => s.componentIndex === idx);
            if (setting && setting.sellSeparately) {
                const isSelected = orderItem.selectedComponent && orderItem.selectedComponent.index === idx && orderItem.purchaseType === "component";
                optionsHtml += '\n                    <div class="purchase-option-btn ' + (isSelected ? "selected" : "") + '" data-type="component" data-price="' + comp.price + '" data-component-index="' + idx + '" data-name="' + comp.nameAr + '">\n                        <span class="option-name"><i class="fas fa-cube"></i> ' + comp.nameAr + ' (فقط)</span>\n                        <span class="option-price">' + comp.price + ' د.ج</span>\n                    </div>\n                ';
            }
            if (setting && setting.allowFullWithout) {
                const newPrice = product.basePrice - comp.price;
                const isSelected = orderItem.selectedComponent && orderItem.selectedComponent.index === idx && orderItem.purchaseType === "fullWithout";
                optionsHtml += '\n                    <div class="purchase-option-btn ' + (isSelected ? "selected" : "") + '" data-type="fullWithout" data-price="' + newPrice + '" data-component-index="' + idx + '" data-name="' + comp.nameAr + '">\n                        <span class="option-name"><i class="fas fa-box-open"></i> الإكسسوار كامل بدون ' + comp.nameAr + '</span>\n                        <span class="option-price">' + newPrice + ' د.ج</span>\n                    </div>\n                ';
            }
        });
        componentOptions.innerHTML = optionsHtml;
        componentOptions.querySelectorAll(".purchase-option-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                componentOptions.querySelectorAll(".purchase-option-btn").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                const type = btn.dataset.type;
                const price = parseFloat(btn.dataset.price);
                const componentIndex = parseInt(btn.dataset.componentIndex);
                editCurrentComponentPrice = price;
                if (type === "component" && componentIndex >= 0 && product.components[componentIndex]) {
                    const comp = product.components[componentIndex];
                    editSelectedComponentData = {
                        index: componentIndex,
                        nameAr: comp.nameAr,
                        nameFr: comp.nameFr,
                        price: comp.price,
                        type: "separate"
                    };
                } else if (type === "fullWithout" && componentIndex >= 0 && product.components[componentIndex]) {
                    const comp = product.components[componentIndex];
                    editSelectedComponentData = {
                        index: componentIndex,
                        nameAr: comp.nameAr,
                        nameFr: comp.nameFr,
                        price: comp.price,
                        type: "without"
                    };
                } else {
                    editSelectedComponentData = null;
                }
                calculateEditTotal();
            });
        });
        if (orderItem.selectedComponent) {
            if (orderItem.purchaseType === "component") {
                const comp = product.components[orderItem.selectedComponent.index];
                if (comp) editCurrentComponentPrice = comp.price;
            } else if (orderItem.purchaseType === "fullWithout") {
                const comp = product.components[orderItem.selectedComponent.index];
                if (comp) editCurrentComponentPrice = product.basePrice - comp.price;
            }
        } else {
            editCurrentComponentPrice = product.basePrice;
        }
    } else {
        componentContainer.style.display = "none";
        editCurrentComponentPrice = product.basePrice;
    }
    let unitPrice = product.basePrice;
    if (orderItem.unitPrice) {
        unitPrice = orderItem.unitPrice;
    } else if (orderItem.selectedSize?.price) {
        unitPrice = orderItem.selectedSize.price;
    } else if (orderItem.basePrice) {
        unitPrice = orderItem.basePrice;
    }
    document.getElementById("edit-order-price").value = unitPrice;
    await calculateEditTotal();
}

async function updateEditProductDetails() {
    const select = document.getElementById("edit-product");
    const selectedOption = select.options[select.selectedIndex];
    if (!selectedOption || !selectedOption.value) return;
    const product = JSON.parse(selectedOption.getAttribute("data-product"));
    await loadEditProductDetails(product, {});
}

function updateEditColorCircle() {
    const colorSelect = document.getElementById("edit-color");
    const colorCircle = document.getElementById("edit-color-circle");
    const selectedOption = colorSelect.options[colorSelect.selectedIndex];
    if (selectedOption && selectedOption.value) {
        const hexCode = selectedOption.getAttribute("data-hex") || "#D4AF37";
        colorCircle.style.backgroundColor = hexCode;
    } else {
        colorCircle.style.backgroundColor = "#ccc";
    }
}

async function calculateEditTotal() {
    let finalPrice = editCurrentProduct ? editCurrentProduct.basePrice : 0;
    if (editCurrentSizePrice > 0) {
        finalPrice = (editCurrentProduct?.basePrice || 0) + editCurrentSizePrice;
    }
    if (editCurrentComponentPrice > 0) {
        finalPrice = editCurrentComponentPrice;
    }
    const quantity = parseInt(document.getElementById("edit-quantity").value) || 1;
    const subtotal = finalPrice * quantity;
    const wilayaSelect = document.getElementById("edit-wilaya");
    const shippingTypeRadios = document.querySelectorAll('input[name="edit-shipping-type"]');
    let shippingType = "home";
    for (let radio of shippingTypeRadios) {
        if (radio.checked) {
            shippingType = radio.value;
            break;
        }
    }
    const selectedOption = wilayaSelect.options[wilayaSelect.selectedIndex];
    let shippingCost = 0;
    if (selectedOption && selectedOption.value) {
        const homePrice = parseFloat(selectedOption.getAttribute("data-home")) || 0;
        const officePrice = parseFloat(selectedOption.getAttribute("data-office")) || 0;
        shippingCost = shippingType === "home" ? homePrice : officePrice;
    }
    const total = subtotal + shippingCost;
    const currencySymbol = " د.ج";
    const priceInput = document.getElementById("edit-order-price");
    if (priceInput) {
        priceInput.value = finalPrice;
    }
    const subtotalDisplay = document.getElementById("edit-subtotal-display");
    const shippingDisplay = document.getElementById("edit-shipping-cost-display");
    const totalDisplay = document.getElementById("edit-total-display");
    if (subtotalDisplay) subtotalDisplay.innerText = subtotal + currencySymbol;
    if (shippingDisplay) shippingDisplay.innerText = shippingCost + currencySymbol;
    if (totalDisplay) totalDisplay.innerHTML = total + currencySymbol;
}

async function saveEditOrderEnhanced() {
    const orderId = editCurrentOrderId;
    if (!orderId) {
        showNotification("خطأ: لم يتم العثور على رقم الطلب", "error");
        return;
    }
    const name = document.getElementById("edit-name").value.trim();
    const phone = document.getElementById("edit-phone").value.trim();
    const wilaya = document.getElementById("edit-wilaya").value;
    const commune = document.getElementById("edit-commune").value.trim();
    const quantity = parseInt(document.getElementById("edit-quantity").value) || 1;
    const customizationText = document.getElementById("edit-customization").value || "";
    const phoneRegex = /^(05|06|07)[0-9]{8}$/;
    if (!phone || !phoneRegex.test(phone)) {
        showNotification("رقم الهاتف غير صالح! يجب أن يبدأ بـ 05، 06، أو 07 ويتكون من 10 أرقام", "error");
        return;
    }
    if (!name || !wilaya || !commune) {
        showNotification("الرجاء ملء جميع الحقول المطلوبة", "error");
        return;
    }
    const productSelect = document.getElementById("edit-product");
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    if (!selectedOption || !selectedOption.value) {
        showNotification("الرجاء اختيار إكسسوار", "error");
        return;
    }
    const product = JSON.parse(selectedOption.getAttribute("data-product"));
    if (!product) {
        showNotification("الإكسسوار غير موجود", "error");
        return;
    }
    const shippingTypeRadios = document.querySelectorAll('input[name="edit-shipping-type"]');
    let shippingType = "home";
    for (let radio of shippingTypeRadios) {
        if (radio.checked) {
            shippingType = radio.value;
            break;
        }
    }
    const wilayaSelect = document.getElementById("edit-wilaya");
    const selectedWilaya = wilayaSelect.options[wilayaSelect.selectedIndex];
    let shippingCost = 0;
    if (selectedWilaya && selectedWilaya.value) {
        shippingCost = shippingType === "home" ? parseFloat(selectedWilaya.getAttribute("data-home")) || 0 : parseFloat(selectedWilaya.getAttribute("data-office")) || 0;
    }
    const unitPrice = parseFloat(document.getElementById("edit-order-price").value) || product.basePrice;
    const subtotal = unitPrice * quantity;
    const totalAmount = subtotal + shippingCost;
    const colorSelect = document.getElementById("edit-color");
    let selectedColor = null;
    if (colorSelect && colorSelect.style.display !== "none" && colorSelect.value) {
        const selectedColorOption = colorSelect.options[colorSelect.selectedIndex];
        selectedColor = {
            name: colorSelect.value,
            hexCode: selectedColorOption?.getAttribute("data-hex") || "#D4AF37"
        };
    }
    const sizeSelect = document.getElementById("edit-size");
    let selectedSize = null;
    if (sizeSelect && sizeSelect.style.display !== "none" && sizeSelect.value) {
        const selectedSizeOption = sizeSelect.options[sizeSelect.selectedIndex];
        const sizePrice = selectedSizeOption?.getAttribute("data-price") || unitPrice;
        selectedSize = {
            size: sizeSelect.value,
            price: parseFloat(sizePrice)
        };
    }
    let purchaseType = "full";
    let selectedComponentData = null;
    if (editSelectedComponentData) {
        if (editSelectedComponentData.type === "separate") {
            purchaseType = "component";
            selectedComponentData = {
                index: editSelectedComponentData.index,
                nameAr: editSelectedComponentData.nameAr,
                nameFr: editSelectedComponentData.nameFr,
                price: editSelectedComponentData.price,
                type: "separate"
            };
        } else if (editSelectedComponentData.type === "without") {
            purchaseType = "fullWithout";
            selectedComponentData = {
                index: editSelectedComponentData.index,
                nameAr: editSelectedComponentData.nameAr,
                nameFr: editSelectedComponentData.nameFr,
                price: editSelectedComponentData.price,
                type: "without"
            };
        }
    }
    const orderData = {
        customerName: name,
        phone: phone,
        wilaya: wilaya,
        commune: commune,
        address: commune,
        shippingType: shippingType,
        shippingCost: shippingCost,
        items: [{
            productId: product._id,
            productNameAr: product.nameAr || product.name,
            productNameFr: product.nameFr || product.name,
            name: product.nameAr || product.name,
            quantity: quantity,
            unitPrice: unitPrice,
            basePrice: product.basePrice,
            selectedColor: selectedColor,
            selectedSize: selectedSize,
            selectedComponent: selectedComponentData,
            purchaseType: purchaseType,
            customizationText: customizationText,
            customizationExtra: 0,
            selectedAddon: null,
            addonCustomValue: ""
        }],
        subtotal: subtotal,
        totalAmount: totalAmount,
        notes: customizationText,
        status: editCurrentOrder?.status || "pending",
        updatedAt: new Date()
    };
    try {
        const res = await fetchWithAuth(API_BASE + "/orders/" + orderId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });
        if (res.ok) {
            showNotification("تم تحديث الطلب بنجاح");
            closeEditOrderModal();
            await loadOrders();
            await loadCompletedOrders();
            await loadStats();
        } else {
            const error = await res.json();
            showNotification("فشل تحديث الطلب: " + (error.error || "خطأ غير معروف"), "error");
        }
    } catch (e) {
        console.error("Save error:", e);
        showNotification("خطأ في الاتصال", "error");
    }
}

function closeEditOrderModal() {
    const modal = document.getElementById("edit-order-modal");
    if (modal) {
        modal.style.display = "none";
        modal.onclick = null;
    }
    editCurrentOrderId = null;
    editCurrentOrder = null;
    editCurrentProduct = null;
    editSelectedComponentData = null;
}

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        const modal = document.getElementById("edit-order-modal");
        if (modal && modal.style.display === "flex") {
            closeEditOrderModal();
        }
    }
});

async function deliverOrder(id) {
    const order = allOrders.find(o => o._id === id);
    if (!order) {
        showNotification("الطلب غير موجود", "error");
        return;
    }
    if (order.status !== "shipped") {
        let errorMsg = "";
        if (order.status === "processing") {
            errorMsg = 'يجب تغيير الحالة إلى "قيد الشحن" أولاً';
        } else if (order.status === "pending") {
            errorMsg = "الطلب لا يزال معلقاً، يرجى تأكيده أولاً";
        } else if (order.status === "delivered") {
            errorMsg = "الطلب تم تسليمه بالفعل";
        } else {
            errorMsg = "لا يمكن تسليم الطلب في حالته الحالية";
        }
        showNotification(errorMsg, "error");
        return;
    }
    showNotification("جاري تسليم الطلب...", "info");
    try {
        const res = await fetchWithAuth(API_BASE + "/orders/" + id + "/status", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: "delivered"
            })
        });
        const responseText = await res.text();
        let data = null;
        try {
            data = JSON.parse(responseText);
        } catch (e) {}
        await loadCompletedOrders();
        await loadOrders();
        await loadStats();
        await updateShippedOrdersCount();
        await updateAllDelayedOrders();
        const updatedOrder = allOrders.find(o => o._id === id);
        if (updatedOrder && updatedOrder.status === "delivered") {
            showNotification("تم تسليم الطلب بنجاح");
        } else if (res.ok) {
            showNotification("تم تسليم الطلب بنجاح");
        } else {
            try {
                const retryRes = await fetchWithAuth(API_BASE + "/orders/" + id + "/status", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: "delivered"
                    })
                });
                if (retryRes.ok) {
                    await loadCompletedOrders();
                    await loadOrders();
                    await loadStats();
                    await updateShippedOrdersCount();
                    await updateAllDelayedOrders();
                    showNotification("تم تسليم الطلب بنجاح (محاولة ثانية)");
                } else {
                    showNotification("فشل تسليم الطلب، يرجى المحاولة مرة أخرى", "error");
                }
            } catch (retryError) {
                showNotification("فشل تسليم الطلب، يرجى المحاولة مرة أخرى", "error");
            }
        }
    } catch (error) {
        console.error("خطأ في تسليم الطلب:", error);
        try {
            await loadCompletedOrders();
            const updatedOrder = allOrders.find(o => o._id === id);
            if (updatedOrder && updatedOrder.status === "delivered") {
                showNotification("تم تسليم الطلب بنجاح");
                await loadStats();
                await updateShippedOrdersCount();
                await updateAllDelayedOrders();
                return;
            }
        } catch (e) {
            console.error("خطأ في تحديث البيانات:", e);
        }
        showNotification("خطأ في الاتصال، يرجى المحاولة مرة أخرى", "error");
    }
}

async function returnOrder(id) {
    if (!confirm("هل تريد إرجاع هذا الطلب إلى الطلبات الجديدة؟")) {
        return;
    }
    try {
        const order = allOrders.find(o => o._id === id);
        const res = await fetchWithAuth(API_BASE + "/orders/" + id + "/status", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: "pending"
            })
        });
        if (res.ok) {
            if (order && order.phone) {
                let cancelledPhones = JSON.parse(localStorage.getItem("cancelledPhones")) || [];
                if (!cancelledPhones.includes(order.phone)) {
                    cancelledPhones.push(order.phone);
                    localStorage.setItem("cancelledPhones", JSON.stringify(cancelledPhones));
                }
            }
            showNotification("تم إرجاع الطلب إلى الطلبات الجديدة");
            await loadOrders();
            await loadCompletedOrders();
            await loadStats();
            await updateAllDelayedOrders();
        } else {
            showNotification("فشل إرجاع الطلب", "error");
        }
    } catch (e) {
        console.error("خطأ في إرجاع الطلب:", e);
        showNotification("خطأ في الاتصال", "error");
    }
}

let currentEditTotalOrderId = null;

function openEditTotalModal(orderId, currentTotal) {
    currentEditTotalOrderId = orderId;
    document.getElementById("edit-total-order-id").value = orderId;
    document.getElementById("edit-total-amount").value = currentTotal;
    document.getElementById("edit-total-modal").style.display = "flex";
}

function closeEditTotalModal() {
    document.getElementById("edit-total-modal").style.display = "none";
    currentEditTotalOrderId = null;
}

async function saveTotalAmount() {
    const orderId = currentEditTotalOrderId;
    const newTotal = parseFloat(document.getElementById("edit-total-amount").value);
    if (isNaN(newTotal) || newTotal < 0) {
        showNotification("قيمة غير صحيحة", "error");
        return;
    }
    try {
        const resGet = await fetchWithAuth(API_BASE + "/orders/" + orderId);
        const data = await resGet.json();
        const order = data.order;
        if (!order) {
            showNotification("الطلب غير موجود", "error");
            return;
        }
        let itemsTotal = 0;
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                itemsTotal += (item.unitPrice || 0) * (item.quantity || 1);
            });
        }
        const currentShippingCost = order.shippingCost || 0;
        const newRevenue = newTotal - currentShippingCost;
        const updatedData = {
            subtotal: itemsTotal,
            shippingCost: currentShippingCost,
            totalAmount: newTotal,
            revenue: newRevenue,
            updatedAt: new Date()
        };
        const res = await fetchWithAuth(API_BASE + "/orders/" + orderId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });
        if (res.ok) {
            showNotification("تم تعديل المبلغ الإجمالي إلى " + newTotal + " د.ج");
            closeEditTotalModal();
            await loadOrders();
            await loadCompletedOrders();
            await loadStats();
        } else {
            const error = await res.json();
            showNotification("فشل التعديل: " + (error.error || "خطأ غير معروف"), "error");
        }
    } catch (e) {
        console.error("خطأ في حفظ السعر:", e);
        showNotification("خطأ في الاتصال", "error");
    }
}

function openAddManualOrderModal() {
    document.getElementById("add-manual-order-modal").style.display = "flex";
    loadWilayasForManual();
    loadProductsForManual();
    calculateManualTotal();
}

function closeAddManualOrderModal() {
    document.getElementById("add-manual-order-modal").style.display = "none";
    resetManualOrderForm();
}

async function loadWilayasForManual() {
    try {
        const res = await fetchWithAuth(API_BASE + "/shipping-rates");
        const data = await res.json();
        const select = document.getElementById("manual-wilaya");
        if (data.success && data.rates) {
            select.innerHTML = '<option value="" disabled selected hidden>اختاري الولاية</option>';
            data.rates.forEach(rate => {
                select.innerHTML += '<option value="' + escapeHtml(rate.wilayaName) + '" data-home="' + rate.homePrice + '" data-office="' + rate.officePrice + '">' + escapeHtml(rate.wilayaName) + '</option>';
            });
            select.onchange = calculateManualTotal;
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadProductsForManual() {
    try {
        const res = await fetchWithAuth(API_BASE + "/all");
        const data = await res.json();
        const products = data.products || data || [];
        const select = document.getElementById("manual-product");
        if (!select) {
            console.error("عنصر manual-product غير موجود");
            return;
        }
        select.innerHTML = '<option value="" disabled selected hidden>اختاري الإكسسوار</option>';
        products.forEach(product => {
            const option = document.createElement("option");
            option.value = product._id;
            option.textContent = currentLang === "ar" ? product.nameAr || product.name : product.nameFr || product.name;
            select.appendChild(option);
        });
        const priceInput = document.getElementById("manual-price");
        if (priceInput) {
            priceInput.setAttribute("oninput", "validatePriceOnInput(this)");
            priceInput.setAttribute("onchange", "validatePrice(this)");
            priceInput.setAttribute("onblur", "validatePriceOnBlur(this)");
        }
    } catch (error) {
        console.error("خطأ في تحميل المنتجات للطلب اليدوي:", error);
        const select = document.getElementById("manual-product");
        if (select) {
            select.innerHTML = '<option value="" disabled selected hidden>فشل تحميل المنتجات</option>';
        }
    }
}

async function deleteOrder(id) {
    if (!confirm("هل تريد حذف هذا الطلب نهائياً؟")) return;
    try {
        const res = await fetchWithAuth(API_BASE + "/orders/" + id, {
            method: "DELETE"
        });
        if (res.ok) {
            const orderIndex = processedOrderIds.indexOf(id);
            if (orderIndex !== -1) {
                processedOrderIds.splice(orderIndex, 1);
                localStorage.setItem("processedOrderIds", JSON.stringify(processedOrderIds));
            }
            showNotification("تم حذف الطلب");
            loadOrders();
            loadStats();
            loadCompletedOrders();
        } else {
            const error = await res.json();
            showNotification("فشل الحذف: " + (error.error || "خطأ غير معروف"), "error");
        }
    } catch (error) {
        if (error === "No token") {
            window.location.href = "/login.html";
        } else {
            console.error("خطأ في الحذف:", error);
            showNotification("خطأ في الاتصال", "error");
        }
    }
}

function getNewRepeatOrdersCount() {
    const pendingOrders = allOrders.filter(o => o.status === "pending");
    const phoneCounts = new Map();
    pendingOrders.forEach(order => {
        if (order.phone) {
            phoneCounts.set(order.phone, (phoneCounts.get(order.phone) || 0) + 1);
        }
    });
    let totalRepeatOrders = 0;
    phoneCounts.forEach((count, phone) => {
        if (count > 1) {
            totalRepeatOrders += count;
        }
    });
    return totalRepeatOrders;
}

function getCancelledRepeatOrdersCount() {
    const cancelledPhones = JSON.parse(localStorage.getItem("cancelledPhones")) || [];
    const pendingOrders = allOrders.filter(o => o.status === "pending");
    let totalCancelledRepeatOrders = 0;
    pendingOrders.forEach(order => {
        if (order.phone && cancelledPhones.includes(order.phone)) {
            totalCancelledRepeatOrders++;
        }
    });
    return totalCancelledRepeatOrders;
}

function updateRepeatStatsCounters() {
    const repeatOrdersEl = document.getElementById("stat-repeat-orders");
    const cancelledRepeatEl = document.getElementById("stat-cancelled-repeat");
    if (repeatOrdersEl) {
        repeatOrdersEl.innerText = getNewRepeatOrdersCount();
    }
    if (cancelledRepeatEl) {
        cancelledRepeatEl.innerText = getCancelledRepeatOrdersCount();
    }
}

function updateStatsCounters() {
    const newOrders = allOrders.filter(o => o.status === "pending").length;
    const confirmedOrders = allOrders.filter(o => o.status === "processing" || o.status === "shipped").length;
    const deliveredOrders = allOrders.filter(o => o.status === "delivered").length;
    const totalRevenue = allOrders.filter(o => o.status === "delivered").reduce((sum, o) => sum + (o.revenue || 0), 0);
    const newOrdersEl = document.getElementById("stat-new-orders");
    if (newOrdersEl) newOrdersEl.innerText = newOrders;
    updateRepeatStatsCounters();
    const confirmedEl = document.getElementById("stat-confirmed-orders");
    const deliveredEl = document.getElementById("stat-delivered-orders");
    const revenueEl = document.getElementById("stat-total-revenue");
    const productsEl = document.getElementById("stat-products-count");
    if (confirmedEl) confirmedEl.innerText = confirmedOrders;
    if (deliveredEl) deliveredEl.innerText = deliveredOrders;
    if (revenueEl) revenueEl.innerText = totalRevenue + " د.ج";
    if (productsEl) productsEl.innerText = allProducts.length;
}

async function shipOrder(orderId) {
    try {
        const res = await fetchWithAuth(API_BASE + "/orders/" + orderId + "/status", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: "shipped"
            })
        });
        if (res.ok) {
            showNotification("تم تغيير الحالة إلى قيد الشحن");
            await loadCompletedOrders();
            await loadOrders();
            await updateShippedOrdersCount();
            await updateAllDelayedOrders();
            await loadStats();
        } else {
            showNotification("فشل تغيير الحالة", "error");
        }
    } catch (e) {
        showNotification("خطأ في الاتصال", "error");
    }
}

async function updateShippedOrdersCount() {
    try {
        const res = await fetchWithAuth(API_BASE + "/orders/all");
        const data = await res.json();
        const orders = data.orders || data || [];
        const shippedOrders = orders.filter(o => o.status === "shipped").length;
        const shippedCountEl = document.getElementById("stat-shipped-orders");
        if (shippedCountEl) {
            shippedCountEl.innerText = shippedOrders;
        }
    } catch (e) {
        console.error("خطأ في تحديث عدد الطلبات قيد الشحن:", e);
    }
}

async function loadStats() {
    try {
        const res = await fetchWithAuth(API_BASE + "/stats/dashboard");
        const data = await res.json();
        if (data.success) {
            updateStatsCounters();
        }
    } catch (error) {
        if (error === "No token") {
            window.location.href = "/login.html";
        } else {
            console.error("خطأ في تحميل الإحصائيات:", error);
        }
    }
}

async function exportOrdersToPDF() {
    try {
        const res = await fetchWithAuth(API_BASE + "/orders/all");
        const data = await res.json();
        const allOrdersData = data.orders || data || [];
        const shippedOrders = allOrdersData.filter(o => o.status === "shipped");
        if (!shippedOrders.length) {
            showNotification("لا توجد طلبات قيد الشحن للتصدير", "error");
            return;
        }
        let htmlContent = '\n        <html dir="rtl">\n        <head>\n            <meta charset="UTF-8">\n            <title>تقرير الطلبات قيد الشحن</title>\n            <style>\n                body { font-family: \'Arial\', sans-serif; padding: 30px; background: #fff; color: #333; }\n                h1 { color: #D4AF37; text-align: center; font-size: 24px; margin-bottom: 10px; }\n                .subtitle { text-align: center; color: #666; font-size: 14px; margin-bottom: 30px; }\n                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }\n                th { background: linear-gradient(135deg, #2D1A24, #1A0F14); color: #D4AF37; padding: 12px 10px; text-align: center; border: 1px solid #D4AF37; font-weight: bold; }\n                td { padding: 10px; text-align: center; border: 1px solid #ddd; color: #333; }\n                tr:nth-child(even) { background: #f9f9f9; }\n                tr:hover { background: #f0e6d3; }\n                .total-row { background: #D4AF37 !important; color: #1A0F14 !important; font-weight: bold; }\n                .total-row td { border-color: #D4AF37; }\n                .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }\n                .logo-text { font-size: 18px; color: #D4AF37; font-weight: bold; }\n            </style>\n        </head>\n        <body>\n            <div style="text-align: center; margin-bottom: 20px;">\n                <div class="logo-text">Radjaa Accessoire</div>\n                <h1>تقرير الطلبات قيد الشحن</h1>\n                <div class="subtitle">\n                    تاريخ التقرير: ' + (new Date()).toLocaleDateString("ar-DZ") + ' &nbsp;|&nbsp;\n                    عدد الطلبات: ' + shippedOrders.length + '\n                </div>\n            </div>\n            <table>\n                <thead>\n                    <tr>\n                        <th>رقم الطلب</th>\n                        <th>الاسم</th>\n                        <th>رقم الهاتف</th>\n                        <th>الولاية</th>\n                        <th>البلدية</th>\n                        <th>الإكسسوار</th>\n                        <th>نوع التوصيل</th>\n                        <th>الإجمالي (د.ج)</th>\n                    </tr>\n                </thead>\n                <tbody>';
        shippedOrders.forEach((order, index) => {
            const orderItem = order.items?.[0] || {};
            let productName = orderItem.productNameAr || orderItem.name || "-";
            let additionalParts = "";
            if (orderItem.additionalPartsText && orderItem.additionalPartsText !== "") {
                additionalParts = orderItem.additionalPartsText;
            } else if (orderItem.selectedComponent && orderItem.selectedComponent.nameAr) {
                if (orderItem.purchaseType === "component" || orderItem.purchaseType === "separate") {
                    additionalParts = orderItem.selectedComponent.nameAr;
                } else if (orderItem.purchaseType === "fullWithout") {
                    additionalParts = "بدون " + orderItem.selectedComponent.nameAr;
                } else {
                    additionalParts = orderItem.selectedComponent.nameAr;
                }
            } else if (orderItem.selectedAddon && orderItem.selectedAddon.nameAr) {
                if (orderItem.selectedAddon.choice === "with") {
                    additionalParts = orderItem.selectedAddon.nameAr;
                } else if (orderItem.selectedAddon.choice === "without") {
                    additionalParts = "بدون " + orderItem.selectedAddon.nameAr;
                }
            }
            const displayProductName = additionalParts ? productName + " (" + additionalParts + ")" : productName;
            const shippingTypeDisplay = order.shippingType === "home" ? "للمنزل" : order.shippingType === "office" ? "للمكتب" : "-";
            htmlContent += '\n                <tr>\n                    <td>' + (index + 1) + '</td>\n                    <td>' + (order.customerName || "-") + '</td>\n                    <td>' + (order.phone || "-") + '</td>\n                    <td>' + (order.wilaya || "-") + '</td>\n                    <td>' + (order.commune || "-") + '</td>\n                    <td style="text-align: right; font-weight: bold; color: #D4AF37;">' + displayProductName + '</td>\n                    <td>' + shippingTypeDisplay + '</td>\n                    <td style="font-weight: bold; color: #E91E63;">' + (order.subtotal || 0) + '</td>\n                </tr>\n            ';
        });
        const totalRevenue = shippedOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
        htmlContent += '\n                </tbody>\n                <tfoot>\n                    <tr class="total-row">\n                        <td colspan="7" style="text-align: left; font-size: 16px;">\n                            إجمالي قيمة الطلبات قيد الشحن:\n                        </td>\n                        <td style="font-size: 16px; font-weight: bold;">' + totalRevenue + ' د.ج</td>\n                    </tr>\n                </tfoot>\n            </table>\n            <div class="footer">\n                <p>تم إنشاء هذا التقرير بواسطة <strong>Radjaa Accessoire Manager</strong> &copy; ' + (new Date()).getFullYear() + '</p>\n                <p style="font-size: 11px; color: #bbb;">جميع الحقوق محفوظة</p>\n            </div>\n        </body>\n        </html>';
        const blob = new Blob([htmlContent], {
            type: "text/html; charset=utf-8"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "طلبات_قيد_الشحن_" + (new Date()).toISOString().slice(0, 19).replace(/[:.]/g, "-") + ".html";
        a.click();
        URL.revokeObjectURL(url);
        showNotification("تم تصدير " + shippedOrders.length + " طلب قيد الشحن");
    } catch (e) {
        console.error("خطأ في التصدير:", e);
        showNotification("فشل التصدير: " + e.message, "error");
    }
}

function loadCategories() {
    const saved = localStorage.getItem("productCategories");
    if (saved) categories = JSON.parse(saved);
    else {
        categories = ["تيجان وإكسسوارات الشعر", "طقم بالأحجار الكريمة والجوهر", "إكسسوارات العروس", "إكسسوارات تقليدية", "أطقم المروحة والمشوارة", "خواتم بالأحجار", "حقائب اللؤلؤ"];
        localStorage.setItem("productCategories", JSON.stringify(categories));
    }
    updateCategorySelects();
    displayCategoriesList();
}

function populateColorSelect() {
    const colorSelect = document.getElementById("color-select");
    if (!colorSelect) return;
    colorSelect.innerHTML = '<option value="" disabled selected hidden>اختاري لونا</option>';
    colorOptions.forEach(color => {
        const option = document.createElement("option");
        option.value = color.hexCode;
        option.textContent = currentLang === "ar" ? color.ar : color.fr;
        colorSelect.appendChild(option);
    });
}

populateColorSelect();

function updateCategorySelects() {
    const selects = [document.getElementById("p-category"), document.getElementById("edit-category")];
    selects.forEach(select => {
        if (select) {
            const currentVal = select.value;
            select.innerHTML = '<option value="" disabled selected hidden>اختاري فئة</option>';
            categories.forEach(cat => {
                select.innerHTML += '<option value="' + cat + '">' + cat + "</option>";
            });
            if (currentVal && categories.includes(currentVal)) select.value = currentVal;
        }
    });
}

function displayCategoriesList() {
    const container = document.getElementById("categories-list");
    if (!container) return;
    let html = "";
    categories.forEach((cat, i) => {
        html += '<div class="category-item"><span>' + cat + '</span><div class="category-actions"><button class="edit-cat" onclick="editCategory(' + i + ')"><i class="fas fa-edit"></i></button><button class="delete-cat" onclick="deleteCategory(' + i + ')"><i class="fas fa-trash"></i></button></div></div>';
    });
    container.innerHTML = html;
}

function toggleCategoriesSection() {
    const hasCategories = document.getElementById("p-has-categories").checked;
    const categoriesSection = document.getElementById("categories-section");
    if (categoriesSection) {
        categoriesSection.style.display = hasCategories ? "block" : "none";
    }
}

function addCategory() {
    const input = document.getElementById("new-category-name");
    const newCat = input.value.trim();
    if (!newCat) return showNotification("الرجاء إدخال اسم الفئة", "error");
    if (categories.includes(newCat)) return showNotification("هذه الفئة موجودة مسبقاً", "error");
    categories.push(newCat);
    localStorage.setItem("productCategories", JSON.stringify(categories));
    updateCategorySelects();
    displayCategoriesList();
    input.value = "";
    showNotification("تم إضافة الفئة بنجاح");
}

function editCategory(index) {
    const newName = prompt("أدخل الاسم الجديد للفئة:", categories[index]);
    if (newName && newName.trim()) {
        if (categories.includes(newName.trim())) return showNotification("هذا الاسم موجود مسبقاً", "error");
        categories[index] = newName.trim();
        localStorage.setItem("productCategories", JSON.stringify(categories));
        updateCategorySelects();
        displayCategoriesList();
        showNotification("تم تعديل الفئة بنجاح");
    }
}

function deleteCategory(index) {
    const categoryName = categories[index];
    const hasProducts = allProducts.some(p => p.category === categoryName);
    if (hasProducts) {
        showNotification('لا يمكن حذف فئة "' + categoryName + '" لأن هناك إكسسوارات ضمنها! قومي بحذف المنتجات أولا.', "error");
        return;
    }
    if (confirm('هل أنت متأكد من حذف الفئة "' + categoryName + '"؟')) {
        categories.splice(index, 1);
        localStorage.setItem("productCategories", JSON.stringify(categories));
        updateCategorySelects();
        displayCategoriesList();
        showNotification('تم حذف الفئة "' + categoryName + '"');
    }
}

function addColorFromSelect() {
    const select = document.getElementById("color-select");
    const selectedOption = select.options[select.selectedIndex];
    const colorValue = select.value;
    const colorText = selectedOption.textContent;
    if (!colorValue || !colorText) return;
    if (colorValue === "unified") {
        if (selectedColorsList.some(c => c.isUnified)) {
            return showNotification("لون موحد مضاف بالفعل", "error");
        }
        selectedColorsList.push({
            name: colorText,
            hexCode: "#D4AF37",
            isUnified: true
        });
    } else if (colorValue === "all") {
        if (selectedColorsList.some(c => c.isAllColors)) {
            return showNotification("جميع الألوان مضاف بالفعل", "error");
        }
        selectedColorsList.push({
            name: colorText,
            hexCode: "#D4AF37",
            isAllColors: true
        });
    } else {
        if (selectedColorsList.some(c => c.hexCode === colorValue && !c.isUnified && !c.isAllColors)) {
            return showNotification("هذا اللون مضاف بالفعل", "error");
        }
        const color = colorOptions.find(c => c.hexCode === colorValue);
        if (color) {
            const displayName = currentLang === "ar" ? color.ar : color.fr;
            selectedColorsList.push({
                name: displayName,
                hexCode: color.hexCode
            });
        } else {
            selectedColorsList.push({
                name: colorText,
                hexCode: colorValue
            });
        }
    }
    updateColorsDisplay();
    select.value = "";
}

function addEditColor() {
    const select = document.getElementById("edit-color-select");
    const color = select.value;
    const text = select.options[select.selectedIndex].text;
    if (!color || !text) return;
    if (editColorsList.some(c => c.hexCode === color)) return showNotification("هذا اللون مضاف بالفعل", "error");
    editColorsList.push({
        name: text,
        hexCode: color
    });
    updateEditColorsDisplay();
    select.value = "";
}

function removeColor(hexCode) {
    selectedColorsList = selectedColorsList.filter(c => c.hexCode !== hexCode);
    updateColorsDisplay();
}

function removeEditColor(hexCode) {
    editColorsList = editColorsList.filter(c => c.hexCode !== hexCode);
    updateEditColorsDisplay();
}

function updateColorsDisplay() {
    const display = document.getElementById("selected-colors-display");
    if (!display) return;
    let html = "";
    selectedColorsList.forEach((color, index) => {
        html += '\n            <div class="selected-color-swatch" style="position: relative; display: inline-flex; align-items: center; justify-content: center;">\n                <div class="color-circle" style="width: 40px; height: 40px; border-radius: 50%; background-color: ' + color.hexCode + '; border: 2px solid var(--gold); cursor: pointer; transition: 0.2s;"></div>\n                <span class="remove-color-swatch" onclick="removeColor(' + index + ')" style="position: absolute; top: -5px; right: -5px; background: #f44336; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer; font-weight: bold; border: 1px solid white;">X</span>\n            </div>\n        ';
    });
    display.innerHTML = html;
    document.getElementById("selected-colors").value = JSON.stringify(selectedColorsList);
}

function removeColor(index) {
    selectedColorsList.splice(index, 1);
    updateColorsDisplay();
}

function updateEditColorsDisplay() {
    const display = document.getElementById("edit-colors-display");
    if (!display) return;
    let html = "";
    editColorsList.forEach((color, index) => {
        html += '\n            <div class="selected-color-swatch" style="position: relative; display: inline-flex; align-items: center; justify-content: center;">\n                <div class="color-circle" style="width: 40px; height: 40px; border-radius: 50%; background-color: ' + color.hexCode + '; border: 2px solid var(--gold); cursor: pointer; transition: 0.2s;"></div>\n                <span class="remove-color-swatch" onclick="removeEditColor(' + index + ')" style="position: absolute; top: -5px; right: -5px; background: #f44336; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer; font-weight: bold; border: 1px solid white;">X</span>\n            </div>\n        ';
    });
    display.innerHTML = html;
    document.getElementById("edit-colors").value = JSON.stringify(editColorsList);
}

function removeEditColor(index) {
    editColorsList.splice(index, 1);
    updateEditColorsDisplay();
}

function toggleSizesSection(sectionId, checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    if (!checkbox) return;
    const hasSizes = checkbox.checked;
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = hasSizes ? "block" : "none";
    }
}

function toggleEditSizesSection() {
    toggleSizesSection("edit-sizes-section", "edit-has-sizes");
}

function toggleComponentsSection(sectionId, checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    if (!checkbox) return;
    const hasComponents = checkbox.checked;
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = hasComponents ? "block" : "none";
    }
}

function toggleEditComponentsSection() {
    toggleComponentsSection("edit-components-section", "edit-has-components");
}

function uploadComponentImage(btn, isEdit) {
    const item = btn.closest(".component-item");
    if (!item) return;
    const prefix = isEdit ? "edit-" : "";
    const fileInput = item.querySelector("." + prefix + "component-image");
    const previewDiv = item.querySelector(".component-image-preview");
    if (fileInput && fileInput.type === "file") {
        fileInput.click();
        fileInput.onchange = function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    if (previewDiv) {
                        previewDiv.innerHTML = '<img src="' + ev.target.result + '" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid #d4af37;">';
                    }
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };
    }
}

function uploadEditComponentImage(btn) {
    uploadComponentImage(btn, true);
}

function addComponentLine(containerId, isEdit) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const prefix = isEdit ? "edit-" : "";
    const newItem = document.createElement("div");
    newItem.className = "component-item";
    newItem.innerHTML = '\n        <div class="component-fields-row">\n            <input type="text" placeholder="اسم الجزء (عربي)" class="' + prefix + 'component-name-ar">\n            <input type="text" placeholder="Nom (Français)" class="' + prefix + 'component-name-fr">\n            <input type="number" placeholder="السعر (د.ج)" class="' + prefix + 'component-price component-price-field">\n        </div>\n        <div class="component-image-row" style="display:flex;align-items:center;gap:10px;margin-top:8px;">\n            <div class="component-image-preview" onclick="var i=this.closest(\'.component-item\').querySelector(\'.' + prefix + 'component-image\'); if(i) i.click();" style="cursor:pointer;"></div>\n            <input type="file" class="' + prefix + 'component-image" accept="image/*" style="display:none;">\n        </div>\n        <div class="component-actions-row">\n            <div class="component-checkboxes">\n                <label>\n                    <input type="checkbox" class="' + prefix + 'sell-separately"> شراء منفرد\n                </label>\n                <label>\n                    <input type="checkbox" class="' + prefix + 'allow-full-without"> شراء كامل بدونه\n                </label>\n            </div>\n            <div class="component-buttons">\n                <button type="button" class="btn-remove-component" onclick="this.closest(\'.component-item\').remove()">\n                    <i class="fas fa-trash"></i>\n                </button>\n                <button type="button" class="btn-add-component" onclick="addComponentLine(\'' + containerId + '\', ' + isEdit + ')">\n                    <i class="fas fa-plus"></i>\n                </button>\n                <button type="button" class="btn-upload-image" onclick="uploadComponentImage(this, ' + isEdit + ')">\n                    <i class="fas fa-image"></i>\n                </button>\n            </div>\n        </div>\n    ';
    container.appendChild(newItem);
}

function addEditComponentLine() {
    addComponentLine("edit-components-list", true);
}

function collectComponents(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return { components: [], settings: [] };
    const components = [];
    const settings = [];
    const items = container.querySelectorAll(".component-item");
    const isEdit = containerId.includes("edit");
    const prefix = isEdit ? "edit-" : "";
    items.forEach((item, idx) => {
        const nameAr = item.querySelector("." + prefix + "component-name-ar")?.value.trim();
        const nameFr = item.querySelector("." + prefix + "component-name-fr")?.value.trim();
        const price = parseFloat(item.querySelector("." + prefix + "component-price")?.value);
        const imageFile = item.querySelector("." + prefix + "component-image")?.files[0] || null;
        const previewImg = item.querySelector(".component-image-preview img");
        const existingImage = previewImg ? previewImg.src : null;
        const sellSeparately = item.querySelector("." + prefix + "sell-separately")?.checked || false;
        const allowFullWithout = item.querySelector("." + prefix + "allow-full-without")?.checked || false;
        if (nameAr && nameFr && !isNaN(price) && price > 0) {
            components.push({
                nameAr: nameAr,
                nameFr: nameFr,
                price: price,
                imageFile: imageFile,
                existingImage: existingImage
            });
            settings.push({
                componentIndex: idx,
                sellSeparately: sellSeparately,
                allowFullWithout: allowFullWithout
            });
        }
    });
    return { components: components, settings: settings };
}

function collectEditComponents() {
    return collectComponents("edit-components-list");
}

function addNewSize(selectId, priceId, displayId, sizesArray) {
    const sizeSelect = document.getElementById(selectId);
    const priceInput = document.getElementById(priceId);
    const selectedSize = sizeSelect.value;
    const price = priceInput.value;
    if (!selectedSize || selectedSize === "") {
        showNotification("الرجاء اختيار المقاس", "error");
        return;
    }
    if (!price || parseFloat(price) <= 0) {
        showNotification("الرجاء إدخال سعر صحيح", "error");
        return;
    }
    if (sizesArray.some(s => s.size === selectedSize)) {
        showNotification("هذا المقاس مضاف مسبقاً", "error");
        return;
    }
    sizesArray.push({
        size: selectedSize,
        price: parseFloat(price)
    });
    displaySizes(displayId, sizesArray);
    sizeSelect.value = "";
    priceInput.value = "";
}

function addEditNewSize() {
    addNewSize("edit-new-size-select", "edit-new-size-price", "edit-sizes-display", editAddedSizes);
}

function displaySizes(containerId, sizesArray) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (sizesArray.length === 0) {
        container.innerHTML = "";
        return;
    }
    let html = "";
    sizesArray.forEach((item, index) => {
        html += '\n            <div class="size-display-row">\n                <div class="size-display-item">\n                    <span class="size-display-name">' + item.size + '</span>\n                    <span class="size-display-price">' + item.price + ' د.ج</span>\n                </div>\n                <button type="button" class="size-display-remove" onclick="removeSize(' + index + ', \'' + containerId + '\', sizesArray)">\n                    <i class="fas fa-trash"></i>\n                </button>\n            </div>\n        ';
    });
    container.innerHTML = html;
}

function removeSize(index, containerId, sizesArray) {
    sizesArray.splice(index, 1);
    displaySizes(containerId, sizesArray);
}

function displayAddedSizes() {
    displaySizes("sizes-display", addedSizes);
}

function displayEditAddedSizes() {
    displaySizes("edit-sizes-display", editAddedSizes);
}

function removeAddedSize(index) {
    removeSize(index, "sizes-display", addedSizes);
}

function removeEditAddedSize(index) {
    removeSize(index, "edit-sizes-display", editAddedSizes);
}

function collectSizes(checkboxId, sizesArray) {
    const checkbox = document.getElementById(checkboxId);
    if (!checkbox || !checkbox.checked) return [];
    return sizesArray.map(item => ({
        size: item.size,
        price: item.price
    }));
}

function collectEditSizes() {
    return collectSizes("edit-has-sizes", editAddedSizes);
}

function loadEditSizes(sizes) {
    if (!sizes || sizes.length === 0) return;
    editAddedSizes = [...sizes];
    displayEditAddedSizes();
}

let editAddedSizes = [];

async function loadPendingReviews() {
    try {
        const res = await fetchWithAuth(API_BASE + "/all");
        const products = await res.json();
        const allProductsData = products.products || products || [];
        let pendingReviewsHtml = "";
        allProductsData.forEach(product => {
            if (product.reviews && product.reviews.length > 0) {
                product.reviews.forEach((review, idx) => {
                    if (!review.approved) {
                        pendingReviewsHtml += '<div class="review-item-pending" id="review-' + product._id + '-' + idx + '">\n    <div><strong><i class="fas fa-box" style="margin-left: 8px; color: #d4af37;"></i> الإكسسوار:</strong> ' + escapeHtml(product.nameAr || product.name) + '</div>\n    <div><strong><i class="fas fa-user" style="margin-left: 8px; color: #d4af37;"></i> الزبون:</strong> ' + escapeHtml(review.customerName || "زبون") + '</div>\n    <div><strong><i class="fas fa-star" style="margin-left: 8px; color: #d4af37;"></i> التقييم:</strong> ' + review.rating + '/5</div>\n    <div><strong><i class="fas fa-comment" style="margin-left: 8px; color: #d4af37;"></i> التعليق:</strong> ' + escapeHtml(review.comment) + '</div>\n    <div><strong><i class="fas fa-calendar-alt" style="margin-left: 8px; color: #d4af37;"></i> التاريخ:</strong> ' + new Date(review.date).toLocaleDateString("ar-DZ") + '</div>\n    <div class="review-actions" style="margin-top: 10px;">\n        <button class="btn-approve" onclick="approveReview(\'' + product._id + '\', ' + idx + ')"><i class="fas fa-check-circle" style="margin-left: 6px;"></i> موافقة</button>\n        <button class="btn-reject" onclick="rejectReview(\'' + product._id + '\', ' + idx + ')"><i class="fas fa-times-circle" style="margin-left: 6px;"></i> رفض</button>\n    </div>\n</div>';
                    }
                });
            }
        });
        if (pendingReviewsHtml === "") {
            pendingReviewsHtml = '<div style="text-align:center; padding:20px;">لا توجد مراجعات منتظرة للموافقة</div>';
        }
        document.getElementById("reviews-approval-container").innerHTML = pendingReviewsHtml;
    } catch (e) {
        console.error(e);
    }
}

async function approveReview(productId, reviewIndex) {
    try {
        const res = await fetchWithAuth(API_BASE + "/" + productId + "/reviews/" + reviewIndex + "/approve", {
            method: "POST"
        });
        const data = await res.json();
        if (res.ok && data.success) {
            showNotification("تم الموافقة على المراجعة");
            const el = document.getElementById("review-" + productId + "-" + reviewIndex);
            if (el) el.remove();
            loadPendingReviews();
        } else {
            showNotification("فشل الموافقة: " + (data.error || "خطأ غير معروف"), "error");
        }
    } catch (e) {
        console.error("خطأ في الموافقة على التقييم:", e);
        showNotification("فشل الموافقة: " + (e?.message || "خطأ في الاتصال"), "error");
    }
}

async function rejectReview(productId, reviewIndex) {
    if (confirm("هل تريد حذف هذه المراجعة؟")) {
        try {
            const res = await fetchWithAuth(API_BASE + "/" + productId + "/reviews/" + reviewIndex, {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok && data.success) {
                showNotification("تم حذف المراجعة");
                const el = document.getElementById("review-" + productId + "-" + reviewIndex);
                if (el) el.remove();
                loadPendingReviews();
            } else {
                showNotification("فشل الحذف: " + (data.error || "خطأ غير معروف"), "error");
            }
        } catch (e) {
            console.error("خطأ في حذف التقييم:", e);
            showNotification("فشل الحذف: " + (e?.message || "خطأ في الاتصال"), "error");
        }
    }
}

function loadAboutContent() {
    const savedAr = localStorage.getItem("aboutContentAr");
    const savedFr = localStorage.getItem("aboutContentFr");
    if (savedAr) {
        document.getElementById("about-content-ar").value = savedAr;
        document.getElementById("preview-about-ar").innerHTML = savedAr.replace(/\n/g, "<br>");
    }
    if (savedFr) {
        document.getElementById("about-content-fr").value = savedFr;
        document.getElementById("preview-about-fr").innerHTML = savedFr.replace(/\n/g, "<br>");
    }
}

function saveAboutContent() {
    const contentAr = document.getElementById("about-content-ar").value;
    const contentFr = document.getElementById("about-content-fr").value;
    localStorage.setItem("aboutContentAr", contentAr);
    localStorage.setItem("aboutContentFr", contentFr);
    document.getElementById("preview-about-ar").innerHTML = contentAr.replace(/\n/g, "<br>");
    document.getElementById("preview-about-fr").innerHTML = contentFr.replace(/\n/g, "<br>");
    showNotification('تم حفظ محتوى "من نحن" بنجاح');
}

let shippingRatesCache = [];

async function getShippingFee(wilayaName, shippingType) {
    if (!shippingRatesCache.length) {
        try {
            const res = await fetchWithAuth(API_BASE + "/shipping-rates");
            const data = await res.json();
            if (data.success) shippingRatesCache = data.rates;
        } catch (e) {
            console.error("Error loading shipping rates:", e);
        }
    }
    if (!wilayaName || !shippingRatesCache.length) {
        return shippingType === "office" ? 400 : 1000;
    }
    const rate = shippingRatesCache.find(r => r.wilayaName === wilayaName);
    if (!rate) return shippingType === "office" ? 400 : 1000;
    return shippingType === "office" ? rate.officePrice : rate.homePrice;
}

function displayShippingRates(rates, isMobile) {
    if (isMobile) {
        const container = document.getElementById("shipping-mobile-view");
        if (!container) return;
        let html = "";
        rates.forEach(r => {
            html += '<div class="shipping-card"><div class="shipping-card-row"><strong>' + r.wilayaName + '</strong></div><div class="shipping-card-row"><label> للمنزل:</label><input type="number" id="mobile-home-' + r.wilayaCode + '" value="' + r.homePrice + '"></div><div class="shipping-card-row"><label> للمكتب:</label><input type="number" id="mobile-office-' + r.wilayaCode + '" value="' + r.officePrice + '"></div><div class="shipping-card-row"><button onclick="updateMobileShippingRate(\'' + r.wilayaName + '\', ' + r.wilayaCode + ')" class="btn-action" style="background:#4caf50;"><i class="fas fa-save" style="margin-left: 8px;"></i> حفظ</button></div></div>';
        });
        container.innerHTML = html;
        return;
    }
    const tbody = document.getElementById("shipping-rates-tbody");
    let html = "";
    rates.forEach(r => {
        html += '<tr><td style="font-weight:bold;">' + r.wilayaName + '</td><td><input type="number" id="home-' + r.wilayaCode + '" value="' + r.homePrice + '" style="width:90px;padding:5px;border-radius:5px;background:rgba(0,0,0,0.5);color:white;"></td><td><input type="number" id="office-' + r.wilayaCode + '" value="' + r.officePrice + '" style="width:90px;padding:5px;border-radius:5px;background:rgba(0,0,0,0.5);color:white;"></td><td><button onclick="updateShippingRate(\'' + r.wilayaName + '\', ' + r.wilayaCode + ')" class="btn-action" style="background:#4caf50;"><i class="fas fa-save" style="margin-left: 8px;"></i> حفظ</button></td></tr>';
    });
    tbody.innerHTML = html;
}

async function updateShippingRate(wilayaName, wilayaCode) {
    const homePrice = document.getElementById("home-" + wilayaCode)?.value;
    const officePrice = document.getElementById("office-" + wilayaCode)?.value;
    if (!homePrice || !officePrice || isNaN(homePrice) || isNaN(officePrice)) return showNotification("قيم غير صحيحة", "error");
    try {
        const res = await fetchWithAuth(API_BASE + "/shipping-rate/" + encodeURIComponent(wilayaName), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                homePrice: Number(homePrice),
                officePrice: Number(officePrice)
            })
        });
        const data = await res.json();
        if (data.success) showNotification("تم تحديث " + wilayaName);
        else showNotification("فشل التحديث", "error");
    } catch (e) {
        showNotification("خطأ", "error");
    }
}

async function updateMobileShippingRate(wilayaName, wilayaCode) {
    const homePrice = document.getElementById("mobile-home-" + wilayaCode)?.value;
    const officePrice = document.getElementById("mobile-office-" + wilayaCode)?.value;
    if (!homePrice || !officePrice || isNaN(homePrice) || isNaN(officePrice)) return showNotification("قيم غير صحيحة", "error");
    try {
        const res = await fetchWithAuth(API_BASE + "/shipping-rate/" + encodeURIComponent(wilayaName), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                homePrice: Number(homePrice),
                officePrice: Number(officePrice)
            })
        });
        const data = await res.json();
        if (data.success) showNotification("تم تحديث " + wilayaName);
        else showNotification("فشل التحديث", "error");
    } catch (e) {
        showNotification("خطأ", "error");
    }
}

async function addNewWilaya() {
    const name = document.getElementById("new-wilaya-name")?.value.trim();
    const code = document.getElementById("new-wilaya-code")?.value;
    const home = document.getElementById("new-home-price")?.value;
    const office = document.getElementById("new-office-price")?.value;
    if (!name) return showNotification("اسم الولاية مطلوب", "error");
    if (!code || isNaN(code)) return showNotification("Code صحيح مطلوب", "error");
    if (!home || isNaN(home) || home < 0) return showNotification("سعر التوصيل للمنزل مطلوب", "error");
    if (!office || isNaN(office) || office < 0) return showNotification("سعر التوصيل للمكتب مطلوب", "error");
    try {
        const res = await fetchWithAuth(API_BASE + "/shipping-rate/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                wilayaName: name,
                wilayaCode: Number(code),
                homePrice: Number(home),
                officePrice: Number(office)
            })
        });
        const data = await res.json();
        if (data.success) {
            showNotification("تم إضافة " + name);
            document.getElementById("new-wilaya-name").value = "";
            document.getElementById("new-wilaya-code").value = "";
            document.getElementById("new-home-price").value = "";
            document.getElementById("new-office-price").value = "";
            loadShippingRates();
        } else {
            showNotification("فشل الإضافة: " + (data.error || "خطأ"), "error");
        }
    } catch (e) {
        showNotification("خطأ في الاتصال", "error");
    }
}

document.getElementById("add-product-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    const nameAr = document.getElementById("p-name-ar")?.value;
    const nameFr = document.getElementById("p-name-fr")?.value;
    const basePrice = document.getElementById("p-base-price")?.value;
    const descAr = document.getElementById("p-desc-ar")?.value;
    const descFr = document.getElementById("p-desc-fr")?.value;
    const cat = document.getElementById("p-category")?.value;
    if (!nameAr || !nameFr || !basePrice) return showNotification("الاسم والسعر مطلوبان", "error");
    const imgs = document.getElementById("p-images");
    if (!addProductImageFiles.length) return showNotification("الصورة مطلوبة!", "error");
    const colors = selectedColorsList;
    const sizes = collectSizes("p-has-sizes", addedSizes);
    const hasSizes = document.getElementById("p-has-sizes")?.checked || false;
    const hasComponents = document.getElementById("p-has-components")?.checked || false;
    const componentsData = hasComponents ? collectComponents("components-list") : { components: [], settings: [] };
    const components = componentsData.components;
    const componentSettings = componentsData.settings;
    const fd = new FormData();
    fd.append("nameAr", nameAr);
    fd.append("nameFr", nameFr);
    fd.append("basePrice", Number(basePrice));
    fd.append("descriptionAr", descAr || "");
    fd.append("descriptionFr", descFr || "");
    fd.append("category", cat);
    const colorsArray = Array.isArray(colors) ? colors : [];
    const sizesArray = Array.isArray(sizes) ? sizes : [];
    fd.append("colors", JSON.stringify(colorsArray));
    fd.append("sizes", JSON.stringify(sizesArray));
    fd.append("isBestSeller", false);
    fd.append("isNewArrival", false);
    fd.append("stock", 10);
    fd.append("hasSizes", sizes.length > 0);
    fd.append("hasComponents", components.length > 0);
    fd.append("allowReviews", true);
    if (hasComponents && components.length > 0) {
        fd.append("components", JSON.stringify(components.map(c => ({
            nameAr: c.nameAr,
            nameFr: c.nameFr,
            price: c.price
        }))));
        fd.append("componentSettings", JSON.stringify(componentSettings));
        for (let i = 0; i < components.length; i++) {
            if (components[i].imageFile) {
                const compressedComponentImg = await compressImage(components[i].imageFile, 500, 0.7);
                fd.append("component_image_" + i, compressedComponentImg);
            }
        }
    }
    const compressedMainImages = await compressImages(addProductImageFiles);
    for (let i = 0; i < compressedMainImages.length; i++) {
        fd.append("images", compressedMainImages[i]);
    }
    const btn = document.querySelector('#add-product-form button[type="submit"]');
    const orig = btn.innerText;
    btn.innerText = "جاري...";
    btn.disabled = true;
    try {
        const res = await fetchWithAuth(API_BASE + "/add", {
            method: "POST",
            body: fd
        });
        const responseText = await res.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseErr) {
            console.error("فشل تحليل رد السيرفر:", parseErr, responseText);
            showNotification("رد غير صالح من السيرفر (راجع الـ Console)", "error");
            return;
        }
        if (res.ok && data.success) {
            showNotification("تم إضافة الإكسسوار بنجاح!");
            document.getElementById("add-product-form").reset();
            document.getElementById("images-preview").innerHTML = "";
            document.getElementById("p-images").value = "";
            addProductImageFiles = [];
            selectedColorsList = [];
            try {
                updateColorsDisplay();
                addedSizes = [];
                displayAddedSizes();
                document.getElementById("p-has-sizes").checked = true;
                document.getElementById("p-has-components").checked = false;
                document.getElementById("components-section").style.display = "none";
                toggleSizesSection("sizes-section", "p-has-sizes");
            } catch (cleanupErr) {
                console.warn("خطأ بسيط أثناء تنظيف الفورم (لا يؤثر على إضافة المنتج):", cleanupErr);
            }
            loadProducts();
            loadStats();
        } else {
            showNotification("فشل الإضافة: " + (data.error || data.errors && data.errors.map(e => e.message).join("، ") || "خطأ"), "error");
        }
    } catch (e) {
        console.error("خطأ فعلي أثناء إضافة المنتج:", e);
        showNotification("خطأ في الاتصال: " + (e?.message || ""), "error");
    } finally {
        btn.innerText = orig;
        btn.disabled = false;
    }
});

let addProductImageFiles = [];

function renderAddProductImagesPreview() {
    const preview = document.getElementById("images-preview");
    preview.innerHTML = "";
    addProductImageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = ev => {
            const wrap = document.createElement("div");
            wrap.style.cssText = "position:relative;width:90px;height:90px;";
            const img = document.createElement("img");
            img.src = ev.target.result;
            img.className = "preview-image";
            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.innerHTML = "X";
            delBtn.style.cssText = "position: absolute; top: 0px; right: 0px; background: #f44336; color: white; width: 24px; height: 24px; border-radius: 50%; border: none; cursor: pointer; font-size: 12px; font-weight: bold; transition: 0.2s;";
            delBtn.onclick = function() {
                addProductImageFiles.splice(index, 1);
                renderAddProductImagesPreview();
            };
            wrap.appendChild(img);
            wrap.appendChild(delBtn);
            preview.appendChild(wrap);
        };
        reader.readAsDataURL(file);
    });
}

document.getElementById("p-images").addEventListener("change", function(e) {
    addProductImageFiles = Array.from(e.target.files);
    renderAddProductImagesPreview();
});

document.getElementById("edit-images").addEventListener("change", function(e) {
    const preview = document.getElementById("new-images-preview");
    preview.innerHTML = "";
    Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = ev => {
            const img = document.createElement("img");
            img.src = ev.target.result;
            img.style.cssText = "width:60px;height:60px;object-fit:cover;border-radius:8px;border:2px solid #d4af37;";
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

document.getElementById("edit-product-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    const id = document.getElementById("edit-product-id").value;
    const fd = new FormData();
    fd.append("nameAr", document.getElementById("edit-name-ar").value);
    fd.append("nameFr", document.getElementById("edit-name-fr").value);
    fd.append("basePrice", document.getElementById("edit-price").value);
    fd.append("descriptionAr", document.getElementById("edit-desc-ar").value);
    fd.append("descriptionFr", document.getElementById("edit-desc-fr").value);
    fd.append("category", document.getElementById("edit-category").value);
    fd.append("colors", JSON.stringify(editColorsList));
    fd.append("sizes", JSON.stringify(collectEditSizes()));
    fd.append("hasSizes", document.getElementById("edit-has-sizes").checked);
    const hasComponents = document.getElementById("edit-has-components")?.checked || false;
    let components = [];
    let componentSettings = [];
    if (hasComponents) {
        const componentsData = collectEditComponents();
        components = componentsData.components || [];
        componentSettings = componentsData.settings || [];
    }
    fd.append("hasComponents", hasComponents);
    fd.append("components", JSON.stringify(components));
    fd.append("componentSettings", JSON.stringify(componentSettings));
    const newImgs = document.getElementById("edit-images").files;
    for (let i = 0; i < newImgs.length; i++) fd.append("images", newImgs[i]);
    if (imagesToDelete.length) fd.append("deleteImages", JSON.stringify(imagesToDelete));
    if (document.getElementById("replace-all-images").checked) fd.append("replaceImages", "true");
    try {
        const res = await fetchWithAuth(API_BASE + "/" + id, {
            method: "PUT",
            body: fd
        });
        if (res.ok) {
            showNotification("تم تحديث الإكسسوار");
            closeEditModal();
            loadProducts();
            loadStats();
        } else {
            showNotification("فشل التحديث", "error");
        }
    } catch (e) {
        showNotification("خطأ في الاتصال", "error");
    }
});

setInterval(async () => {
    try {
        const res = await fetchWithAuth(API_BASE + "/orders/check-new?lastCheck=" + lastOrderCheck.toISOString());
        const data = await res.json();
        if (data.newOrders?.length) {
            showNotification(" " + data.newOrders.length + " طلب جديد!");
            loadOrders();
            loadStats();
            lastOrderCheck = new Date();
        }
    } catch (e) {}
}, 30000);

async function loadShippingRates() {
    try {
        const res = await fetchWithAuth(API_BASE + "/shipping-rates");
        if (!res.ok) {
            if (res.status === 401) {
                window.location.href = "/login.html";
                return;
            }
            throw new Error("Failed to load shipping rates");
        }
        const data = await res.json();
        if (data.success && data.rates?.length) {
            displayShippingRatesWithActions(data.rates);
            displayShippingCardsWithActions(data.rates);
        } else {
            document.getElementById("shipping-rates-tbody").innerHTML = '<tr><td colspan="5">لا توجد بيانات</td></tr>';
        }
    } catch (error) {
        if (error === "No token") {
            window.location.href = "/login.html";
        } else {
            console.error("خطأ في تحميل أسعار الشحن:", error);
            document.getElementById("shipping-rates-tbody").innerHTML = '<tr><td colspan="5">خطأ في الاتصال</td></tr>';
        }
    }
}

function displayShippingRatesWithActions(rates) {
    const tbody = document.getElementById("shipping-rates-tbody");
    if (!tbody) return;
    let html = "";
    rates.forEach(rate => {
        const rowId = "row-" + rate.wilayaCode;
        html += '\n            <tr id="' + rowId + '" class="shipping-row">\n                <td>\n                    <span class="display-name">' + rate.wilayaName + '</span>\n                    <input type="text" class="shipping-edit-input edit-name" value="' + rate.wilayaName + '" style="display:none;">\n                </td>\n                <td>\n                    <span class="display-code">' + rate.wilayaCode + '</span>\n                    <input type="number" class="shipping-edit-input edit-code" value="' + rate.wilayaCode + '" style="display:none;">\n                </td>\n                <td>\n                    <span class="display-home">' + rate.homePrice + '</span>\n                    <input type="number" class="shipping-edit-input edit-home" value="' + rate.homePrice + '" style="display:none;" oninput="validatePriceOnInput(this)" onchange="validatePrice(this)" onblur="validatePriceOnBlur(this)">\n                </td>\n                <td>\n                    <span class="display-office">' + rate.officePrice + '</span>\n                    <input type="number" class="shipping-edit-input edit-office" value="' + rate.officePrice + '" style="display:none;" oninput="validatePriceOnInput(this)" onchange="validatePrice(this)" onblur="validatePriceOnBlur(this)">\n                </td>\n                <td class="shipping-actions">\n                    <button class="btn-shipping-edit" onclick="editShippingRow(\'' + rate.wilayaName + '\', ' + rate.wilayaCode + ')">\n                        <i class="fas fa-edit"></i> تعديل\n                    </button>\n                    <button class="btn-shipping-delete" onclick="deleteShippingRate(\'' + rate.wilayaName + '\', ' + rate.wilayaCode + ')">\n                        <i class="fas fa-trash"></i> حذف\n                    </button>\n                    <button class="btn-shipping-save" onclick="saveShippingRow(\'' + rate.wilayaName + '\', ' + rate.wilayaCode + ')" style="display:none;">\n                        <i class="fas fa-save"></i> حفظ\n                    </button>\n                </td>\n            </tr>\n        ';
    });
    tbody.innerHTML = html;
}

function displayShippingCardsWithActions(rates) {
    const container = document.getElementById("shipping-mobile-view");
    if (!container) return;
    let html = "";
    rates.forEach(rate => {
        const cardId = "card-" + rate.wilayaCode;
        html += '\n            <div class="shipping-card" id="' + cardId + '" data-name="' + rate.wilayaName + '" data-code="' + rate.wilayaCode + '">\n                <div class="shipping-card-header">\n                    <div style="display: flex; align-items: center; gap: 8px;">\n                        <i class="fas fa-hashtag" style="color: var(--gold);"></i>\n                        <span class="shipping-card-code display-code">' + rate.wilayaCode + '</span>\n                        <input type="number" class="shipping-card-input edit-code hidden-on-view" value="' + rate.wilayaCode + '" style="display:none;">\n                    </div>\n                    <div style="display: flex; align-items: center; gap: 8px;">\n                        <i class="fas fa-map-marker-alt" style="color: var(--gold);"></i>\n                        <span class="shipping-card-name display-name">' + rate.wilayaName + '</span>\n                        <input type="text" class="shipping-card-input edit-name hidden-on-view" value="' + rate.wilayaName + '" style="display:none;">\n                    </div>\n                </div>\n                <div class="shipping-card-row">\n                    <label><i class="fas fa-home" style="margin-left: 8px; color: var(--gold);"></i> للمنزل:</label>\n                    <span class="shipping-card-value display-home">' + rate.homePrice + '</span>\n                    <input type="number" class="shipping-card-input edit-home hidden-on-view" value="' + rate.homePrice + '" style="display:none;">\n                </div>\n                <div class="shipping-card-row">\n                    <label><i class="fas fa-building" style="margin-left: 8px; color: var(--gold);"></i> للمكتب:</label>\n                    <span class="shipping-card-value display-office">' + rate.officePrice + '</span>\n                    <input type="number" class="shipping-card-input edit-office hidden-on-view" value="' + rate.officePrice + '" style="display:none;">\n                </div>\n                <div class="shipping-card-actions view-actions">\n                    <button class="btn-card-edit" onclick="editShippingCard(\'' + cardId + '\')">\n                        <i class="fas fa-edit"></i> تعديل\n                    </button>\n                    <button class="btn-card-delete" onclick="deleteShippingRate(\'' + rate.wilayaName + '\', ' + rate.wilayaCode + ')">\n                        <i class="fas fa-trash"></i> حذف\n                    </button>\n                </div>\n                <div class="shipping-card-actions edit-actions hidden-on-view" style="display:none;">\n                    <button class="btn-card-save" onclick="saveShippingCard(\'' + cardId + '\', \'' + rate.wilayaName + '\', ' + rate.wilayaCode + ')">\n                        <i class="fas fa-save"></i> حفظ\n                    </button>\n                    <button class="btn-card-delete" onclick="deleteShippingRate(\'' + rate.wilayaName + '\', ' + rate.wilayaCode + ')">\n                        <i class="fas fa-trash"></i> حذف\n                    </button>\n                </div>\n            </div>\n        ';
    });
    container.innerHTML = html;
}

function editShippingRow(oldName, oldCode) {
    const row = document.querySelector("#row-" + oldCode);
    if (!row) return;
    row.querySelectorAll(".display-name, .display-code, .display-home, .display-office").forEach(el => {
        el.style.display = "none";
    });
    row.querySelectorAll(".edit-name, .edit-code, .edit-home, .edit-office").forEach(el => {
        el.style.display = "block";
    });
    const editBtn = row.querySelector(".btn-shipping-edit");
    const deleteBtn = row.querySelector(".btn-shipping-delete");
    const saveBtn = row.querySelector(".btn-shipping-save");
    if (editBtn) editBtn.style.display = "none";
    if (deleteBtn) deleteBtn.style.display = "none";
    if (saveBtn) saveBtn.style.display = "inline-flex";
    row.classList.add("shipping-row-editing");
}

function editShippingCard(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    card.querySelectorAll(".display-name, .display-home, .display-office, .display-code").forEach(el => {
        el.style.display = "none";
    });
    card.querySelectorAll(".edit-name, .edit-home, .edit-office, .edit-code").forEach(el => {
        el.style.display = "inline-block";
        el.classList.remove("hidden-on-view");
    });
    const viewActions = card.querySelector(".view-actions");
    if (viewActions) viewActions.style.display = "none";
    const editActions = card.querySelector(".edit-actions");
    if (editActions) {
        editActions.style.display = "flex";
        editActions.classList.remove("hidden-on-view");
    }
}

async function saveShippingRow(oldName, oldCode) {
    const row = document.querySelector("#row-" + oldCode);
    if (!row) return;
    const newName = row.querySelector(".edit-name").value.trim();
    const newCode = parseInt(row.querySelector(".edit-code").value);
    const newHomePrice = parseFloat(row.querySelector(".edit-home").value);
    const newOfficePrice = parseFloat(row.querySelector(".edit-office").value);
    if (!newName || isNaN(newCode) || isNaN(newHomePrice) || isNaN(newOfficePrice)) {
        showNotification("الرجاء إدخال قيم صحيحة", "error");
        return;
    }
    try {
        const res = await fetchWithAuth(API_BASE + "/shipping-rate/" + encodeURIComponent(oldName), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                wilayaName: newName,
                wilayaCode: newCode,
                homePrice: newHomePrice,
                officePrice: newOfficePrice
            })
        });
        const data = await res.json();
        if (data.success) {
            showNotification("تم تحديث ولاية " + newName);
            loadShippingRates();
        } else {
            showNotification("فشل التحديث", "error");
        }
    } catch (e) {
        showNotification("خطأ في الاتصال", "error");
    }
}

async function saveShippingCard(cardId, oldName, oldCode) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const newName = card.querySelector(".edit-name").value.trim();
    const newCode = parseInt(card.querySelector(".edit-code").value);
    const newHomePrice = parseFloat(card.querySelector(".edit-home").value);
    const newOfficePrice = parseFloat(card.querySelector(".edit-office").value);
    if (!newName || isNaN(newCode) || isNaN(newHomePrice) || isNaN(newOfficePrice)) {
        showNotification("الرجاء إدخال قيم صحيحة", "error");
        return;
    }
    try {
        const res = await fetchWithAuth(API_BASE + "/shipping-rate/" + encodeURIComponent(oldName), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                wilayaName: newName,
                wilayaCode: newCode,
                homePrice: newHomePrice,
                officePrice: newOfficePrice
            })
        });
        const data = await res.json();
        if (data.success) {
            showNotification("تم تحديث ولاية " + newName);
            loadShippingRates();
        } else {
            showNotification("فشل التحديث", "error");
        }
    } catch (e) {
        showNotification("خطأ في الاتصال", "error");
    }
}

async function deleteShippingRate(wilayaName, wilayaCode) {
    if (!confirm("هل أنت متأكد من حذف ولاية \"" + wilayaName + "\"؟")) return;
    try {
        const res = await fetchWithAuth(API_BASE + "/shipping-rate/" + encodeURIComponent(wilayaName), {
            method: "DELETE"
        });
        const data = await res.json();
        if (data.success) {
            showNotification("تم حذف ولاية " + wilayaName);
            loadShippingRates();
        } else {
            showNotification("فشل الحذف", "error");
        }
    } catch (e) {
        showNotification("خطأ في الاتصال", "error");
    }
}

window.onload = () => {
    const token = getToken();
    if (!token) {
        window.location.href = "/login.html";
        return;
    }
    if (!localStorage.getItem("processedOrderIds")) {
        localStorage.setItem("processedOrderIds", JSON.stringify([]));
    }
    processedOrderIds = JSON.parse(localStorage.getItem("processedOrderIds")) || [];
    if (!localStorage.getItem("sentNotificationIds")) {
        localStorage.setItem("sentNotificationIds", JSON.stringify([]));
    }
    sentNotificationIds = JSON.parse(localStorage.getItem("sentNotificationIds")) || [];
    loadCategories();
    loadProducts();
    loadOrders();
    loadStats();
    loadShippingRates();
    loadCompletedOrders();
    loadAboutContent();
    loadPendingReviews();
    document.getElementById("tab-add").classList.add("active");
    toggleSizesSection("sizes-section", "p-has-sizes");
    populateColorSelect();
    updateAllDelayedOrders();
    setTimeout(() => {
        checkForNewNotifications();
    }, 3000);
};

function saveNotifications() {
    localStorage.setItem("adminNotifications", JSON.stringify(notifications));
    updateNotificationBadge();
    renderNotificationsList();
}

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badges = document.querySelectorAll(".notification-badge");
    badges.forEach(badge => {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? "flex" : "none";
    });
}

function renderNotificationsList() {
    const containers = document.querySelectorAll(".notifications-list");
    containers.forEach(container => {
        const unreadCount = notifications.filter(n => !n.read).length;
        let headerHtml = "";
        if (notifications.length > 0 && unreadCount > 0) {
            headerHtml = '\n                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 15px; border-bottom: 1px solid rgba(212,175,55,0.2); background: rgba(0,0,0,0.2);">\n                    <span style="color: var(--text-muted); font-size: 0.8rem;">' + unreadCount + ' إشعار غير مقروء</span>\n                    <button onclick="markAllNotificationsAsRead()" style="background: rgba(212,175,55,0.15); border: 1px solid var(--gold); color: var(--gold); padding: 4px 12px; border-radius: 20px; cursor: pointer; font-size: 0.7rem; transition: 0.3s;">\n                        <i class="fas fa-check-double" style="margin-left: 5px;"></i> تعليم الكل كمقروء\n                    </button>\n                </div>\n            ';
        }
        if (!notifications.length) {
            container.innerHTML = headerHtml + '<div class="no-notifications">لا توجد إشعارات حاليا</div>';
            return;
        }
        let listHtml = notifications.map((notif, idx) => '\n            <div class="notification-item ' + (!notif.read ? "unread" : "") + '" data-idx="' + idx + '" data-type="' + notif.type + '" data-link="' + (notif.link || "") + '">\n                <div class="notification-header">\n                    <div class="notification-actions">\n                        ' + (!notif.read ? '<button class="notification-read-btn" data-idx="' + idx + '" data-action="mark-read" title="تعليم كمقروء"><i class="fas fa-check-circle"></i></button>' : "") + '\n                        <button class="notification-delete" data-idx="' + idx + '" data-action="delete" title="حذف الإشعار"><i class="fas fa-trash-alt"></i></button>\n                    </div>\n                    <div class="notification-title">' + notif.title + '</div>\n                </div>\n                <div class="notification-desc">' + notif.desc + '</div>\n                <div class="notification-time"><i class="fas fa-calendar-alt" style="margin-right: 5px;"></i> ' + notif.time + '</div>\n            </div>\n        ').join("");
        container.innerHTML = headerHtml + listHtml;
        container.querySelectorAll(".notification-item").forEach(item => {
            const idx = parseInt(item.dataset.idx);
            const link = item.dataset.link;
            item.addEventListener("click", e => {
                if (e.target.closest(".notification-delete") || e.target.closest(".notification-read-btn")) return;
                if (notifications[idx] && !notifications[idx].read) {
                    notifications[idx].read = true;
                    saveNotifications();
                    showToast("تم تعليم الإشعار كمقروء");
                }
                if (link && link !== "#") {
                    const dropdown = document.getElementById("notificationsDropdown");
                    if (dropdown) dropdown.classList.remove("open");
                    document.querySelectorAll(".admin-section").forEach(section => {
                        section.style.display = "none";
                    });
                    const sectionId = link.replace("#", "");
                    const targetSection = document.getElementById(sectionId);
                    if (targetSection) {
                        targetSection.style.display = "block";
                    }
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }
            });
            const deleteBtn = item.querySelector(".notification-delete");
            if (deleteBtn) {
                deleteBtn.addEventListener("click", e => {
                    e.stopPropagation();
                    notifications.splice(idx, 1);
                    saveNotifications();
                    showToast("تم حذف الإشعار");
                });
            }
            const readBtn = item.querySelector(".notification-read-btn");
            if (readBtn) {
                readBtn.addEventListener("click", e => {
                    e.stopPropagation();
                    if (notifications[idx]) {
                        notifications[idx].read = true;
                        saveNotifications();
                        showToast("تم تعليم الإشعار كمقروء");
                    }
                });
            }
        });
    });
}

function markAllNotificationsAsRead() {
    let hasChanges = false;
    notifications.forEach((notif, index) => {
        if (!notif.read) {
            notifications[index].read = true;
            hasChanges = true;
        }
    });
    if (hasChanges) {
        saveNotifications();
        showToast("تم تعليم جميع الإشعارات كمقروءة");
        document.querySelectorAll(".notifications-dropdown").forEach(d => {
            d.classList.remove("open");
        });
    } else {
        showToast("لا توجد إشعارات غير مقروءة");
    }
}

function addNotification(title, desc, type, link = null, uniqueId = null) {
    const notificationId = uniqueId || type + "_" + Date.now() + "_" + Math.random();
    if (sentNotificationIds.includes(notificationId)) {
        return null;
    }
    const now = new Date();
    const time = now.toLocaleDateString("en-GB");
    notifications.unshift({
        id: notificationId,
        title: title,
        desc: desc,
        type: type,
        link: link,
        time: time,
        read: false,
        createdAt: now.toISOString()
    });
    sentNotificationIds.push(notificationId);
    localStorage.setItem("sentNotificationIds", JSON.stringify(sentNotificationIds.slice(-100)));
    saveNotifications();
    showToast(title, "notification");
    return notifications[0];
}

function showToast(message, type = "info") {
    const existingToast = document.querySelector(".toast-notification");
    if (existingToast) existingToast.remove();
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    let icon = '<i class="fas fa-bell"></i>';
    if (type === "order") icon = '<i class="fas fa-shopping-cart"></i>';
    else if (type === "review") icon = '<i class="fas fa-star"></i>';
    else if (type === "info") icon = '<i class="fas fa-info-circle" style="margin-left: 10px;"></i>';
    toast.innerHTML = '\n    <div class="toast-title">' + icon + ' ' + message + '</div>\n';
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("hide");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function clearAllNotifications() {
    if (confirm(currentLang === "ar" ? "هل تريد حذف جميع الإشعارات؟" : "Supprimer toutes les notifications ?")) {
        notifications = [];
        sentNotificationIds = [];
        localStorage.setItem("sentNotificationIds", JSON.stringify([]));
        saveNotifications();
        updateNotificationBadge();
        renderNotificationsList();
        showToast("تم حذف جميع الإشعارات");
    }
}

function toggleNotificationsDropdown(dropdownId, iconId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains("open");
    const isMobile = window.innerWidth <= 768;
    document.querySelectorAll(".notifications-dropdown").forEach(d => {
        d.classList.remove("open");
    });
    if (!isOpen) {
        if (isMobile) {
            dropdown.style.transition = "none";
            dropdown.classList.add("open");
            setTimeout(() => {
                dropdown.style.transition = "";
            }, 10);
        } else {
            dropdown.classList.add("open");
        }
    }
}

document.addEventListener("click", function(e) {
    if (!e.target.closest(".notification-icon-wrapper")) {
        document.querySelectorAll(".notifications-dropdown").forEach(d => {
            d.classList.remove("open");
        });
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const icon = document.getElementById("notificationIcon");
    const iconMobile = document.getElementById("notificationIconMobile");
    const dropdown = document.getElementById("notificationsDropdown");
    const dropdownMobile = document.getElementById("notificationsDropdownMobile");
    if (icon && dropdown) {
        icon.addEventListener("click", () => toggleNotificationsDropdown("notificationsDropdown", "notificationIcon"));
    }
    if (iconMobile && dropdownMobile) {
        iconMobile.addEventListener("click", () => toggleNotificationsDropdown("notificationsDropdownMobile", "notificationIconMobile"));
    }
    const clearBtns = document.querySelectorAll(".clear-all-notifications");
    clearBtns.forEach(btn => {
        btn.addEventListener("click", clearAllNotifications);
    });
    updateNotificationBadge();
    renderNotificationsList();
});

async function checkForNewNotifications() {
    try {
        const ordersRes = await fetchWithAuth(API_BASE + "/orders/all");
        const ordersData = await ordersRes.json();
        const allOrdersData = ordersData.orders || ordersData || [];
        const pendingOrders = allOrdersData.filter(o => o.status === "pending");
        let sentIds = JSON.parse(localStorage.getItem("sentNotificationIds") || "[]");
        const reallyNewOrders = pendingOrders.filter(o => {
            const uniqueId = "order_" + o._id;
            return !sentIds.includes(uniqueId);
        });
        reallyNewOrders.forEach(order => {
            const uniqueId = "order_" + order._id;
            sentIds.push(uniqueId);
            const customerName = order.customerName || "زبون";
            addNotification("طلب جديد", "تم استلام طلب جديد من العميل " + customerName, "order", "#orders-sec", uniqueId);
            const newOrdersEl = document.getElementById("stat-new-orders");
            if (newOrdersEl) {
                const currentCount = parseInt(newOrdersEl.innerText) || 0;
                newOrdersEl.innerText = currentCount + 1;
            }
            showToast("طلب جديد من " + customerName, "order");
        });
        localStorage.setItem("sentNotificationIds", JSON.stringify(sentIds));
        lastCheckTime = (new Date()).toISOString();
        localStorage.setItem("lastNotificationCheck", lastCheckTime);
        updateNotificationBadge();
    } catch (e) {
        console.error("خطأ في فحص الإشعارات:", e);
    }
}

setInterval(() => {
    checkForNewNotifications();
}, 30000);

setTimeout(() => {
    checkForNewNotifications();
}, 30000);

document.querySelectorAll(".sidebar-menu button, .sidebar-lang-btn, .sidebar-social a").forEach(el => {
    el.addEventListener("click", function() {
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById("sidebar");
            if (sidebar) sidebar.classList.remove("open");
        }
    });
});

document.addEventListener("click", function(event) {
    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.querySelector(".menu-toggle");
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains("open")) {
        if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
            sidebar.classList.remove("open");
        }
    }
});

let scrollTimeout;
window.addEventListener("scroll", function() {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar && sidebar.classList.contains("open")) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                sidebar.classList.remove("open");
            }, 100);
        }
    }
});

let manualSelectedProduct = null;
let manualSelectedComponent = null;
let manualPurchaseType = "full";
let isCustomizationFilled = false;

async function updateManualProductDetails() {
    const productId = document.getElementById("manual-product").value;
    if (!productId) {
        manualSelectedProduct = null;
        document.getElementById("manual-price").value = "";
        document.getElementById("manual-color").innerHTML = '<option value="">اختر لون</option>';
        document.getElementById("manual-size-container").style.display = "none";
        document.getElementById("manual-component-container").style.display = "none";
        calculateManualTotal();
        return;
    }
    try {
        const res = await fetchWithAuth(API_BASE + "/" + productId);
        if (!res.ok) {
            throw new Error("فشل تحميل المنتج");
        }
        const data = await res.json();
        const product = data.product;
        if (!product) {
            throw new Error("المنتج غير موجود");
        }
        manualSelectedProduct = product;
        const colorSelect = document.getElementById("manual-color");
        colorSelect.innerHTML = '<option value="" disabled selected hidden>اختاري لون</option>';
        if (product.colors && product.colors.length > 0) {
            product.colors.forEach(color => {
                colorSelect.innerHTML += '<option value="' + escapeHtml(color.name) + '">' + escapeHtml(color.name) + '</option>';
            });
        }
        document.getElementById("manual-color-container").style.display = "block";
        const sizeContainer = document.getElementById("manual-size-container");
        const sizeSelect = document.getElementById("manual-size");
        if (product.sizes && product.sizes.length > 0) {
            sizeContainer.style.display = "block";
            sizeSelect.innerHTML = '<option value="" disabled selected hidden>اختاري مقاس</option>';
            product.sizes.forEach(size => {
                sizeSelect.innerHTML += '<option value="' + size.size + '" data-price="' + size.price + '">' + size.size + ' - ' + size.price + ' د.ج</option>';
            });
            sizeSelect.onchange = function() {
                const selected = sizeSelect.options[sizeSelect.selectedIndex];
                if (selected.value) {
                    const price = selected.getAttribute("data-price");
                    if (price && !isCustomizationFilled) {
                        document.getElementById("manual-price").value = price;
                    }
                }
                calculateManualTotal();
            };
        } else {
            sizeContainer.style.display = "none";
            sizeSelect.innerHTML = '<option value="" disabled selected hidden>اختاري مقاس</option>';
        }
        const componentContainer = document.getElementById("manual-component-container");
        const componentOptions = document.getElementById("manual-component-options");
        if (product.hasComponents && product.components && product.components.length > 0) {
            componentContainer.style.display = "block";
            const componentSettings = product.componentSettings || [];
            let optionsHtml = '\n                <div class="purchase-option-btn selected" data-type="full" data-price="' + product.basePrice + '" data-component-index="-1" data-name="">\n                    <span class="option-name"><i class="fas fa-box"></i> الإكسسوار كامل</span>\n                    <span class="option-price">' + product.basePrice + ' د.ج</span>\n                </div>\n            ';
            product.components.forEach((comp, idx) => {
                const setting = componentSettings.find(s => s.componentIndex === idx);
                if (setting && setting.sellSeparately) {
                    optionsHtml += '\n                        <div class="purchase-option-btn" data-type="component" data-price="' + comp.price + '" data-component-index="' + idx + '" data-name="' + comp.nameAr + '">\n                            <span class="option-name"><i class="fas fa-cube"></i> ' + comp.nameAr + ' (فقط)</span>\n                            <span class="option-price">' + comp.price + ' د.ج</span>\n                        </div>\n                    ';
                }
                if (setting && setting.allowFullWithout) {
                    const newPrice = product.basePrice - comp.price;
                    optionsHtml += '\n                        <div class="purchase-option-btn" data-type="fullWithout" data-price="' + newPrice + '" data-component-index="' + idx + '" data-name="' + comp.nameAr + '">\n                            <span class="option-name"><i class="fas fa-box-open" style="margin-left: 8px;"></i> الإكسسوار كامل بدون ' + comp.nameAr + '</span>\n                            <span class="option-price">' + newPrice + ' د.ج</span>\n                        </div>\n                    ';
                }
            });
            componentOptions.innerHTML = optionsHtml;
            componentOptions.querySelectorAll(".purchase-option-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    componentOptions.querySelectorAll(".purchase-option-btn").forEach(b => b.classList.remove("selected"));
                    btn.classList.add("selected");
                    const type = btn.dataset.type;
                    const price = parseFloat(btn.dataset.price);
                    const componentIndex = parseInt(btn.dataset.componentIndex);
                    if (type === "component" && componentIndex >= 0 && product.components[componentIndex]) {
                        const comp = product.components[componentIndex];
                        manualSelectedComponent = {
                            index: componentIndex,
                            nameAr: comp.nameAr,
                            nameFr: comp.nameFr,
                            price: comp.price
                        };
                        manualPurchaseType = "component";
                        document.getElementById("manual-price").value = comp.price;
                    } else if (type === "fullWithout" && componentIndex >= 0 && product.components[componentIndex]) {
                        const comp = product.components[componentIndex];
                        manualSelectedComponent = {
                            index: componentIndex,
                            nameAr: comp.nameAr,
                            nameFr: comp.nameFr,
                            price: comp.price
                        };
                        manualPurchaseType = "fullWithout";
                        const newPrice = product.basePrice - comp.price;
                        document.getElementById("manual-price").value = newPrice;
                    } else {
                        manualSelectedComponent = null;
                        manualPurchaseType = "full";
                        document.getElementById("manual-price").value = product.basePrice;
                    }
                    calculateManualTotal();
                });
            });
            manualSelectedComponent = null;
            manualPurchaseType = "full";
            document.getElementById("manual-price").value = product.basePrice;
        } else {
            componentContainer.style.display = "none";
            document.getElementById("manual-price").value = product.basePrice;
        }
        const priceInput = document.getElementById("manual-price");
        if (priceInput) {
            priceInput.setAttribute("oninput", "validatePriceOnInput(this)");
            priceInput.setAttribute("onchange", "validatePrice(this)");
            priceInput.setAttribute("onblur", "validatePriceOnBlur(this)");
        }
        calculateManualTotal();
    } catch (e) {
        console.error("خطأ في تحميل تفاصيل الإكسسوار:", e);
        showNotification("فشل تحميل تفاصيل الإكسسوار", "error");
    }
}

async function calculateManualTotal() {
    let finalPrice = 0;
    if (isCustomizationFilled) {
        finalPrice = parseFloat(document.getElementById("manual-price").value) || 0;
    } else {
        if (manualSelectedProduct) {
            finalPrice = manualSelectedProduct.basePrice;
        }
        const sizeSelect = document.getElementById("manual-size");
        if (sizeSelect && sizeSelect.style.display !== "none" && sizeSelect.value) {
            const selectedSizeOption = sizeSelect.options[sizeSelect.selectedIndex];
            const sizePrice = selectedSizeOption?.getAttribute("data-price");
            if (sizePrice) {
                finalPrice = (manualSelectedProduct?.basePrice || 0) + parseFloat(sizePrice);
            }
        }
        if (manualSelectedComponent) {
            if (manualPurchaseType === "component") {
                finalPrice = manualSelectedComponent.price;
            } else if (manualPurchaseType === "fullWithout") {
                finalPrice = finalPrice - manualSelectedComponent.price;
                if (finalPrice < 0) finalPrice = 0;
            }
        }
        document.getElementById("manual-price").value = finalPrice;
    }
    const quantity = parseInt(document.getElementById("manual-quantity")?.value) || 1;
    const subtotal = finalPrice * quantity;
    const wilayaSelect = document.getElementById("manual-wilaya");
    const shippingTypeRadios = document.querySelectorAll('input[name="manual-shipping-type"]');
    let shippingType = "home";
    for (let radio of shippingTypeRadios) {
        if (radio.checked) {
            shippingType = radio.value;
            break;
        }
    }
    const selectedOption = wilayaSelect.options[wilayaSelect.selectedIndex];
    let shippingCost = 0;
    if (selectedOption && selectedOption.value) {
        const homePrice = parseFloat(selectedOption.getAttribute("data-home")) || 0;
        const officePrice = parseFloat(selectedOption.getAttribute("data-office")) || 0;
        shippingCost = shippingType === "home" ? homePrice : officePrice;
    }
    const total = subtotal + shippingCost;
    const currencySymbol = " د.ج";
    document.getElementById("manual-subtotal-display").innerText = subtotal + currencySymbol;
    document.getElementById("manual-shipping-cost-display").innerText = shippingCost + currencySymbol;
    document.getElementById("manual-total").innerHTML = total + currencySymbol;
}

async function saveManualOrder() {
    const name = document.getElementById("manual-name").value;
    const phone = document.getElementById("manual-phone").value;
    const wilaya = document.getElementById("manual-wilaya").value;
    const commune = document.getElementById("manual-commune").value;
    const productId = document.getElementById("manual-product").value;
    const color = document.getElementById("manual-color").value;
    const size = document.getElementById("manual-size").value;
    const customization = document.getElementById("manual-customization").value;
    let price = parseFloat(document.getElementById("manual-price").value);
    const quantity = parseInt(document.getElementById("manual-quantity").value);
    const shippingType = document.querySelector('input[name="manual-shipping-type"]:checked')?.value || "home";
    const total = parseFloat(document.getElementById("manual-total").value);
    if (!validatePhone(phone)) {
        showNotification("رقم الهاتف غير صالح! يجب أن يبدأ بـ 05، 06، أو 07 ويتكون من 10 أرقام", "error");
        document.getElementById("manual-phone").focus();
        return;
    }
    if (!name || !wilaya || !commune || !productId) {
        showNotification("الرجاء ملء جميع الحقول المطلوبة", "error");
        return;
    }
    const product = allProducts.find(p => p._id === productId);
    if (!product) {
        showNotification("الإكسسوار غير موجود", "error");
        return;
    }
    const wilayaSelect = document.getElementById("manual-wilaya");
    const selectedOption = wilayaSelect.options[wilayaSelect.selectedIndex];
    let shippingCost = 0;
    if (selectedOption && selectedOption.value) {
        shippingCost = shippingType === "home" ? parseFloat(selectedOption.getAttribute("data-home")) || 0 : parseFloat(selectedOption.getAttribute("data-office")) || 0;
    }
    let selectedComponentData = null;
    let additionalPartsText = "";
    let purchaseType = "full";
    if (manualSelectedComponent && manualPurchaseType === "component") {
        selectedComponentData = {
            index: manualSelectedComponent.index,
            nameAr: manualSelectedComponent.nameAr,
            nameFr: manualSelectedComponent.nameFr,
            price: manualSelectedComponent.price,
            type: "separate"
        };
        additionalPartsText = manualSelectedComponent.nameAr;
        purchaseType = "component";
    } else if (manualSelectedComponent && manualPurchaseType === "fullWithout") {
        selectedComponentData = {
            index: manualSelectedComponent.index,
            nameAr: manualSelectedComponent.nameAr,
            nameFr: manualSelectedComponent.nameFr,
            price: manualSelectedComponent.price,
            type: "without"
        };
        additionalPartsText = "الإكسسوار كامل بدون " + manualSelectedComponent.nameAr;
        purchaseType = "fullWithout";
    }
    const orderData = {
        customerName: name,
        phone: phone,
        wilaya: wilaya,
        commune: commune,
        address: commune,
        shippingType: shippingType,
        shippingCost: shippingCost,
        items: [{
            productId: product._id,
            productNameAr: product.nameAr || product.name,
            productNameFr: product.nameFr || product.name,
            name: product.nameAr || product.name,
            quantity: quantity,
            unitPrice: price,
            basePrice: product.basePrice,
            selectedColor: color ? {
                name: color,
                hexCode: "#D4AF37"
            } : null,
            selectedSize: size ? {
                size: size,
                price: price
            } : null,
            selectedComponent: selectedComponentData,
            additionalPartsText: additionalPartsText,
            purchaseType: purchaseType,
            customizationText: customization,
            customizationExtra: 0,
            selectedAddon: null,
            addonCustomValue: ""
        }],
        subtotal: price * quantity,
        totalAmount: total,
        notes: customization,
        status: "pending"
    };
    try {
        const res = await fetchWithAuth(API_BASE + "/order/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });
        if (res.ok) {
            showNotification("تم إضافة الطلب بنجاح");
            closeAddManualOrderModal();
            resetManualOrderForm();
            await loadOrders();
            await loadCompletedOrders();
            await loadStats();
            document.getElementById("manual-name").value = "";
            document.getElementById("manual-phone").value = "";
            document.getElementById("manual-commune").value = "";
            document.getElementById("manual-color").value = "";
            document.getElementById("manual-size").value = "";
            document.getElementById("manual-customization").value = "";
            document.getElementById("manual-price").value = "";
            document.getElementById("manual-quantity").value = "1";
        } else {
            const error = await res.json();
            showNotification("فشل إضافة الطلب: " + (error.error || "خطأ غير معروف"), "error");
        }
    } catch (e) {
        console.error("Save error:", e);
        showNotification("خطأ في الاتصال", "error");
    }
}

function resetManualOrderForm() {
    document.getElementById("manual-name").value = "";
    document.getElementById("manual-phone").value = "";
    document.getElementById("manual-commune").value = "";
    document.getElementById("manual-customization").value = "";
    document.getElementById("manual-quantity").value = "1";
    document.getElementById("manual-product").value = "";
    document.getElementById("manual-wilaya").value = "";
    const colorSelect = document.getElementById("manual-color");
    colorSelect.innerHTML = '<option value="" disabled selected hidden>اختاري لون</option>';
    const sizeSelect = document.getElementById("manual-size");
    sizeSelect.innerHTML = '<option value="" disabled selected hidden>اختاري مقاس</option>';
    document.getElementById("manual-size-container").style.display = "none";
    document.getElementById("manual-component-container").style.display = "none";
    document.getElementById("manual-price").value = "";
    document.getElementById("manual-subtotal-display").innerText = "0 د.ج";
    document.getElementById("manual-shipping-cost-display").innerText = "0 د.ج";
    document.getElementById("manual-total").innerHTML = "0 د.ج";
    manualSelectedProduct = null;
    manualSelectedComponent = null;
    isCustomizationFilled = false;
    const priceInput = document.getElementById("manual-price");
    if (priceInput) {
        priceInput.readOnly = true;
        priceInput.style.background = "rgba(0,0,0,0.5)";
        priceInput.style.cursor = "not-allowed";
    }
}

document.getElementById("manual-phone")?.addEventListener("input", function(e) {
    const phone = e.target.value;
    const errorSpan = document.getElementById("phone-error");
    if (phone && !validatePhone(phone)) {
        errorSpan.style.display = "block";
    } else {
        errorSpan.style.display = "none";
    }
});

function onManualCustomizationInput() {
    const customization = document.getElementById("manual-customization").value.trim();
    const priceInput = document.getElementById("manual-price");
    if (customization !== "") {
        isCustomizationFilled = true;
        priceInput.readOnly = false;
        priceInput.style.background = "rgba(13, 8, 11, 0.8)";
        priceInput.style.cursor = "text";
    } else {
        isCustomizationFilled = false;
        priceInput.readOnly = true;
        priceInput.style.background = "rgba(0,0,0,0.5)";
        priceInput.style.cursor = "not-allowed";
        calculateManualTotal();
    }
}

function filterCompletedOrdersMobile() {
    const searchInput = document.getElementById("completed-order-search-input-mobile");
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
    filterCompletedOrders(searchTerm);
}

function clearCompletedOrderSearchMobile() {
    const input = document.getElementById("completed-order-search-input-mobile");
    if (input) input.value = "";
    filterCompletedOrders("");
}

function getDisplayStatus(order) {
    if (order.status === "delivered") return "تم التوصيل";
    if (order.status === "shipped") return "قيد الشحن";
    if (order.status === "processing") {
        const orderDate = new Date(order.createdAt);
        const algeriaOrderDate = new Date(orderDate.toLocaleString("en-US", {
            timeZone: "Africa/Algiers"
        }));
        const today = getTodayAlgeria();
        const diffDays = getDaysDifference(algeriaOrderDate, today);
        if (diffDays >= 8) {
            return "طلب متأخر";
        }
        return "قيد التجهيز";
    }
    return order.status || "-";
}

function getStatusOrder(order) {
    const displayStatus = getDisplayStatus(order);
    switch (displayStatus) {
        case "طلب متأخر":
            return 1;
        case "قيد التجهيز":
            return 2;
        case "قيد الشحن":
            return 3;
        case "تم التوصيل":
            return 4;
        default:
            return 5;
    }
}

let currentCompletedStatusSortDir = "asc";

function sortCompletedOrdersByStatus() {
    currentCompletedStatusSortDir = currentCompletedStatusSortDir === "asc" ? "desc" : "asc";
    let completed = allOrders.filter(o => o.status === "processing" || o.status === "shipped" || o.status === "delivered");
    completed.sort((a, b) => {
        const orderA = getStatusOrder(a);
        const orderB = getStatusOrder(b);
        if (currentCompletedStatusSortDir === "asc") {
            return orderA - orderB;
        } else {
            return orderB - orderA;
        }
    });
    displayFilteredCompletedOrders(completed);
    displayFilteredCompletedOrdersCards(completed);
}

let currentMobileStatusSortDir = "asc";
let currentMobileDateSortDir = "desc";

function sortCompletedOrdersByStatusMobile() {
    currentMobileStatusSortDir = currentMobileStatusSortDir === "asc" ? "desc" : "asc";
    let completed = allOrders.filter(o => o.status === "processing" || o.status === "shipped" || o.status === "delivered");
    completed.sort((a, b) => {
        const orderA = getStatusOrder(a);
        const orderB = getStatusOrder(b);
        if (currentMobileStatusSortDir === "asc") {
            return orderA - orderB;
        } else {
            return orderB - orderA;
        }
    });
    displayFilteredCompletedOrders(completed);
    displayFilteredCompletedOrdersCards(completed);
}

function sortCompletedOrdersByDateMobile() {
    currentMobileDateSortDir = currentMobileDateSortDir === "asc" ? "desc" : "asc";
    let completed = allOrders.filter(o => o.status === "processing" || o.status === "shipped" || o.status === "delivered");
    completed.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        if (currentMobileDateSortDir === "asc") {
            return dateA - dateB;
        } else {
            return dateB - dateA;
        }
    });
    displayFilteredCompletedOrders(completed);
    displayFilteredCompletedOrdersCards(completed);
}

async function saveOrderToAnalytics(orderId) {
    try {
        showNotification("جاري حفظ الطلب...", "info");
        const res = await fetchWithAuth(API_BASE + "/orders/" + orderId + "/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await res.json();
        if (data.success) {
            showNotification("تم حفظ الطلب في الإحصائيات", "success");
            await loadCompletedOrders();
            await loadOrders();
            await loadStats();
            const analyticsSection = document.getElementById("analytics-sec");
            if (analyticsSection && analyticsSection.style.display !== "none") {
                loadAnalyticsData();
            }
        } else {
            showNotification("فشل حفظ الطلب: " + (data.error || "خطأ غير معروف"), "error");
        }
    } catch (e) {
        console.error("خطأ في حفظ الطلب:", e);
        showNotification("خطأ في الاتصال", "error");
    }
}

let currentSelectedYear = (new Date()).getFullYear();

async function loadAnalyticsData(year) {
    try {
        const selectedYear = year || currentSelectedYear;
        const url = API_BASE + "/analytics/stats?year=" + selectedYear;
        const res = await fetchWithAuth(url);
        const data = await res.json();
        if (data.success) {
            renderAnalyticsDashboard(data.stats, selectedYear);
        } else {
            console.error("فشل جلب الإحصائيات:", data.error);
            showNotification("فشل تحميل الإحصائيات", "error");
        }
    } catch (e) {
        console.error("خطأ في تحميل الإحصائيات:", e);
        showNotification("خطأ في الاتصال", "error");
    }
}

function renderAnalyticsDashboard(stats, selectedYear) {
    const container = document.getElementById("analytics-content");
    if (!container) return;
    const totalRevenue = stats.totalRevenue || 0;
    const totalSavedOrders = stats.totalSavedOrders || 0;
    const availableYears = stats.availableYears || [selectedYear || (new Date()).getFullYear()];
    const currentYear = selectedYear || (new Date()).getFullYear();
    const hasData = totalSavedOrders > 0;
    let html = '\n        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 25px; background: rgba(0,0,0,0.3); padding: 15px 20px; border-radius: 12px; border: 1px solid rgba(212,175,55,0.2);">\n            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">\n                <label style="color: #d4af37; font-weight: bold; font-size: 1rem;">\n                    <i class="fas fa-calendar-alt" style="margin-left: 8px;"></i> السنة:\n                </label>\n                <select id="year-selector" onchange="onYearChange()" style="background: rgba(13,8,11,0.8); border: 1px solid rgba(212,175,55,0.35); border-radius: 12px; padding: 10px 15px; color: var(--text-body); font-size: 0.95rem; min-width: 120px; cursor: pointer;">\n                    ' + availableYears.map(year => '\n                        <option value="' + year + '" ' + (year === currentYear ? "selected" : "") + '>' + year + '</option>\n                    ').join("") + '\n                </select>\n            </div>\n        </div>\n        <div class="stats-orders-row" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; margin-bottom: 30px; padding: 0 0px;">\n            <div class="new-orders-card" style="background: linear-gradient(135deg, #D4AF37, #B8860B); border-radius: 20px; padding: 20px 25px; display: flex; align-items: center; transition: all 0.3s ease; cursor: pointer; position: relative; overflow: hidden; backdrop-filter: blur(5px); border: 1px solid rgba(255,215,0,0.5); box-shadow: 0 8px 25px rgba(212,175,55,0.25);">\n                <div class="new-orders-content" style="display: flex; align-items: center; justify-content: space-between; gap: 15px; width: 100%; position: relative; z-index: 1;">\n                    <i class="fas fa-coins" style="font-size: 2.5rem; color: #1A0F14; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); transition: transform 0.3s ease; width: 55px; text-align: center;"></i>\n                    <span style="font-size: 1.5rem; font-weight: 700; color: #1A0F14; text-shadow: 0 1px 2px rgba(255,255,255,0.2); flex: 1; text-align: center;">إجمالي الإيرادات</span>\n                    <span class="new-orders-count" style="background: rgba(26,15,20,0.9); backdrop-filter: blur(10px); padding: 8px 22px; border-radius: 50px; font-size: 1.8rem; font-weight: 800; min-width: 75px; text-align: center; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.2); color: #FFD700 !important; text-shadow: 0 0 5px rgba(255,215,0,0.5);">' + totalRevenue.toLocaleString() + ' د.ج</span>\n                </div>\n            </div>\n            <div class="repeat-orders-card" style="background: linear-gradient(135deg, #2196f3, #1976d2); border-radius: 20px; padding: 20px 25px; display: flex; align-items: center; transition: all 0.3s ease; cursor: pointer; position: relative; overflow: hidden; backdrop-filter: blur(5px); border: 1px solid rgba(33,150,243,0.5); box-shadow: 0 8px 25px rgba(33,150,243,0.25);">\n                <div class="repeat-orders-content" style="display: flex; align-items: center; justify-content: space-between; gap: 15px; width: 100%; position: relative; z-index: 1;">\n                    <i class="fas fa-save" style="font-size: 2.5rem; color: #1A0F14; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); transition: transform 0.3s ease; width: 55px; text-align: center;"></i>\n                    <span style="font-size: 1.5rem; font-weight: 700; color: #1A0F14; text-shadow: 0 1px 2px rgba(255,255,255,0.2); flex: 1; text-align: center;">الطلبات المحفوظة</span>\n                    <span class="repeat-orders-count" style="background: rgba(26,15,20,0.9); backdrop-filter: blur(10px); padding: 8px 22px; border-radius: 50px; font-size: 1.8rem; font-weight: 800; min-width: 75px; text-align: center; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.2); color: #FFE0B2 !important; text-shadow: 0 0 5px rgba(255,152,0,0.5);">' + totalSavedOrders + '</span>\n                </div>\n            </div>\n        </div>\n    ';
    if (!hasData) {
        html += '\n            <div style="text-align: center; padding: 60px 20px; background: rgba(0,0,0,0.3); border-radius: 16px; border: 1px dashed rgba(212,175,55,0.3);">\n                <i class="fas fa-chart-pie" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 15px; display: block;"></i>\n                <h3 style="color: var(--text-muted);">لا توجد بيانات للسنة ' + currentYear + '</h3>\n                <p style="color: var(--text-muted); font-size: 0.9rem;">قومي بحفظ الطلبات الموصلة لعرض الإحصائيات</p>\n            </div>\n        ';
    } else {
        const sortedWilayas = [...stats.topWilayas].sort((a, b) => b.count - a.count);
        const sortedProducts = [...stats.topProducts].sort((a, b) => b.count - a.count);
        const totalAllOrders = stats.totalAllOrders || 1;
        html += '\n            <div class="analytics-tables-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">\n                <div style="background: rgba(0,0,0,0.4); border-radius: 16px; padding: 20px; border: 1px solid rgba(212,175,55,0.3);">\n                    <h4 style="color: #d4af37; margin-bottom: 15px; text-align: center; font-size: 1.1rem; border-bottom: 1px solid rgba(212,175,55,0.2); padding-bottom: 10px;">\n                        <i class="fas fa-map-marker-alt" style="margin-left: 8px;"></i> الولايات الأكثر طلبا\n                        <span style="font-size: 0.75rem; color: var(--text-muted); display: block; font-weight: normal;">مرتبة من الأعلى إلى الأسفل</span>\n                    </h4>\n                    <div class="stats-table-scroll" style="overflow-x: auto; max-height: 400px; overflow-y: auto;">\n                        <table style="width: 100%; border-collapse: collapse; background: transparent; font-size: 0.85rem;">\n                            <thead style="position: sticky; top: 0; z-index: 10;">\n                                <tr style="background: linear-gradient(135deg, #1A0F14, #2D1A24);">\n                                    <th style="color: #D4AF37; padding: 10px 8px; text-align: center; border-bottom: 2px solid #D4AF37; font-size: 0.8rem;">#</th>\n                                    <th style="color: #D4AF37; padding: 10px 8px; text-align: right; border-bottom: 2px solid #D4AF37; font-size: 0.8rem;">الولاية</th>\n                                    <th style="color: #D4AF37; padding: 10px 8px; text-align: center; border-bottom: 2px solid #D4AF37; font-size: 0.8rem;">الطلبات</th>\n                                    <th style="color: #D4AF37; padding: 10px 8px; text-align: center; border-bottom: 2px solid #D4AF37; font-size: 0.8rem;">النسبة</th>\n                                </tr>\n                            </thead>\n                            <tbody>\n                                ' + sortedWilayas.map((item, index) => {
            const percentage = Math.round(item.count / totalAllOrders * 100);
            const rowColor = index % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent";
            return '\n                                        <tr style="background: ' + rowColor + '; transition: 0.2s; border-bottom: 1px solid rgba(212,175,55,0.08);">\n                                            <td style="color: #F0D3DF; padding: 8px; text-align: center; font-weight: bold; font-size: 0.8rem;">' + (index + 1) + '</td>\n                                            <td style="color: #F0D3DF; padding: 8px; text-align: right; font-size: 0.8rem;">' + (item._id || "غير معروف") + '</td>\n                                            <td style="color: #F0D3DF; padding: 8px; text-align: center; font-weight: bold; color: #D4AF37; font-size: 0.8rem;">' + item.count + '</td>\n                                            <td style="color: #F0D3DF; padding: 8px; text-align: center;">\n                                                <div style="display: flex; align-items: center; gap: 6px; justify-content: center;">\n                                                    <div style="flex: 1; max-width: 60px; height: 5px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden;">\n                                                        <div style="width: ' + percentage + '%; height: 100%; background: linear-gradient(90deg, #D4AF37, #E6C768); border-radius: 10px; transition: width 0.8s ease;"></div>\n                                                    </div>\n                                                    <span style="font-weight: bold; color: #D4AF37; min-width: 35px; font-size: 0.75rem;">' + percentage + '%</span>\n                                                </div>\n                                            </td>\n                                        </tr>\n                                    ';
        }).join("") + '\n                            </tbody>\n                        </table>\n                    </div>\n                </div>\n                <div style="background: rgba(0,0,0,0.4); border-radius: 16px; padding: 20px; border: 1px solid rgba(212,175,55,0.3);">\n                    <h4 style="color: #d4af37; margin-bottom: 15px; text-align: center; font-size: 1.1rem; border-bottom: 1px solid rgba(212,175,55,0.2); padding-bottom: 10px;">\n                        <i class="fas fa-box" style="margin-left: 8px;"></i> أفضل الإكسسوارات مبيعا\n                        <span style="font-size: 0.75rem; color: var(--text-muted); display: block; font-weight: normal;">مرتبة من الأعلى إلى الأسفل</span>\n                    </h4>\n                    <div class="stats-table-scroll" style="overflow-x: auto; max-height: 400px; overflow-y: auto;">\n                        <table style="width: 100%; border-collapse: collapse; background: transparent; font-size: 0.85rem;">\n                            <thead style="position: sticky; top: 0; z-index: 10;">\n                                <tr style="background: linear-gradient(135deg, #1A0F14, #2D1A24);">\n                                    <th style="color: #D4AF37; padding: 10px 8px; text-align: center; border-bottom: 2px solid #D4AF37; font-size: 0.8rem;">#</th>\n                                    <th style="color: #D4AF37; padding: 10px 8px; text-align: right; border-bottom: 2px solid #D4AF37; font-size: 0.8rem;">الإكسسوار</th>\n                                    <th style="color: #D4AF37; padding: 10px 8px; text-align: center; border-bottom: 2px solid #D4AF37; font-size: 0.8rem;">الطلبات</th>\n                                    <th style="color: #D4AF37; padding: 10px 8px; text-align: center; border-bottom: 2px solid #D4AF37; font-size: 0.8rem;">النسبة</th>\n                                </tr>\n                            </thead>\n                            <tbody>\n                                ' + sortedProducts.map((item, index) => {
            const percentage = Math.round(item.count / totalAllOrders * 100);
            const rowColor = index % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent";
            return '\n                                        <tr style="background: ' + rowColor + '; transition: 0.2s; border-bottom: 1px solid rgba(212,175,55,0.08);">\n                                            <td style="color: #F0D3DF; padding: 8px; text-align: center; font-weight: bold; font-size: 0.8rem;">' + (index + 1) + '</td>\n                                            <td style="color: #F0D3DF; padding: 8px; text-align: right; font-size: 0.8rem;">' + (item._id || "غير معروف") + '</td>\n                                            <td style="color: #F0D3DF; padding: 8px; text-align: center; font-weight: bold; color: #D4AF37; font-size: 0.8rem;">' + item.count + '</td>\n                                            <td style="color: #F0D3DF; padding: 8px; text-align: center;">\n                                                <div style="display: flex; align-items: center; gap: 6px; justify-content: center;">\n                                                    <div style="flex: 1; max-width: 60px; height: 5px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden;">\n                                                        <div style="width: ' + percentage + '%; height: 100%; background: linear-gradient(90deg, #D4AF37, #E6C768); border-radius: 10px; transition: width 0.8s ease;"></div>\n                                                    </div>\n                                                    <span style="font-weight: bold; color: #D4AF37; min-width: 35px; font-size: 0.75rem;">' + percentage + '%</span>\n                                                </div>\n                                            </td>\n                                        </tr>\n                                    ';
        }).join("") + '\n                            </tbody>\n                        </table>\n                    </div>\n                </div>\n            </div>\n            <div class="monthly-sales-table-wrap" style="background: rgba(0,0,0,0.4); border-radius: 16px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(212,175,55,0.3);">\n                <h4 style="color: #d4af37; margin-bottom: 15px; text-align: center; font-size: 1.1rem; border-bottom: 1px solid rgba(212,175,55,0.2); padding-bottom: 10px;">\n                    <i class="fas fa-chart-line" style="margin-left: 8px;"></i> المبيعات الشهرية\n                </h4>\n                <div class="stats-table-scroll">\n                    <table style="width: 100%; border-collapse: collapse; background: transparent; font-size: 0.9rem;">\n                        <thead>\n                            <tr style="background: linear-gradient(135deg, #1A0F14, #2D1A24);">\n                                <th style="color: #D4AF37; padding: 12px 10px; text-align: center; border-bottom: 2px solid #D4AF37; font-size: 0.85rem;">الشهر</th>\n                                <th style="color: #D4AF37; padding: 12px 10px; text-align: center; border-bottom: 2px solid #D4AF37; font-size: 0.85rem;">عدد الطلبات</th>\n                                <th style="color: #D4AF37; padding: 12px 10px; text-align: center; border-bottom: 2px solid #D4AF37; font-size: 0.85rem;">الإيرادات (د.ج)</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            ' + (() => {
            const monthNames = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
            const sortedSales = [...stats.monthlySales].sort((a, b) => a._id.month - b._id.month);
            return sortedSales.map((item, index) => {
                const monthName = monthNames[item._id.month - 1] || item._id.month;
                const rowColor = index % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent";
                return '\n                                        <tr style="background: ' + rowColor + '; border-bottom: 1px solid rgba(212,175,55,0.08);">\n                                            <td style="color: #F0D3DF; padding: 10px; text-align: center; font-weight: bold; color: #D4AF37; font-size: 0.85rem;">' + monthName + '</td>\n                                            <td style="color: #F0D3DF; padding: 10px; text-align: center; font-size: 0.85rem;">' + (item.count || 0) + '</td>\n                                            <td style="color: #F0D3DF; padding: 10px; text-align: center; font-weight: bold; color: #D4AF37; font-size: 0.85rem;">' + (item.total || 0).toLocaleString() + ' د.ج</td>\n                                        </tr>\n                                    ';
            }).join("");
        })() + '\n                        </tbody>\n                        <tfoot>\n                            <tr style="background: rgba(212, 175, 55, 0.15); border-top: 2px solid #D4AF37;">\n                                <td style="color: #D4AF37; padding: 10px; text-align: center; font-weight: bold; font-size: 0.85rem;">الإجمالي</td>\n                                <td style="color: #D4AF37; padding: 10px; text-align: center; font-weight: bold; font-size: 0.85rem;">' + stats.monthlySales.reduce((sum, m) => sum + (m.count || 0), 0) + '</td>\n                                <td style="color: #D4AF37; padding: 10px; text-align: center; font-weight: bold; font-size: 0.85rem;">' + stats.monthlySales.reduce((sum, m) => sum + (m.total || 0), 0).toLocaleString() + ' د.ج</td>\n                            </tr>\n                        </tfoot>\n                    </table>\n                </div>\n            </div>\n        ';
    }
    container.innerHTML = html;
}

function onYearChange() {
    const select = document.getElementById("year-selector");
    if (select) {
        const year = parseInt(select.value);
        currentSelectedYear = year;
        loadAnalyticsData(year);
    }
}

function saveSocialLinks() {
    localStorage.setItem("social_instagram_name", document.getElementById("settings-instagram-name").value);
    localStorage.setItem("social_instagram", document.getElementById("settings-instagram").value);
    localStorage.setItem("social_facebook_name", document.getElementById("settings-facebook-name").value);
    localStorage.setItem("social_facebook", document.getElementById("settings-facebook").value);
    localStorage.setItem("social_tiktok_name", document.getElementById("settings-tiktok-name").value);
    localStorage.setItem("social_tiktok", document.getElementById("settings-tiktok").value);
    localStorage.setItem("social_whatsapp", document.getElementById("settings-whatsapp").value);
    showNotification("تم حفظ جميع الروابط والأسماء");
}

function saveFollowersCount() {
    localStorage.setItem("ig_followers", document.getElementById("settings-ig-followers").value);
    localStorage.setItem("fb_followers", document.getElementById("settings-fb-followers").value);
    localStorage.setItem("tt_followers", document.getElementById("settings-tt-followers").value);
    showNotification("تم حفظ عدد المتابعين");
}

function loadSettings() {
    document.getElementById("settings-instagram-name").value = localStorage.getItem("social_instagram_name") || "radjaa_accessoiree";
    document.getElementById("settings-facebook-name").value = localStorage.getItem("social_facebook_name") || "Radjaa Accessoire";
    document.getElementById("settings-tiktok-name").value = localStorage.getItem("social_tiktok_name") || "radjaaaccessoire";
    document.getElementById("settings-instagram").value = localStorage.getItem("social_instagram") || "https://www.instagram.com/radjaa_accessoiree/";
    document.getElementById("settings-facebook").value = localStorage.getItem("social_facebook") || "https://www.facebook.com/radjaa.accessoire/";
    document.getElementById("settings-tiktok").value = localStorage.getItem("social_tiktok") || "https://www.tiktok.com/@radjaaaccessoire";
    document.getElementById("settings-whatsapp").value = localStorage.getItem("social_whatsapp") || "213775087631";
    document.getElementById("settings-ig-followers").value = localStorage.getItem("ig_followers") || "35,900+";
    document.getElementById("settings-fb-followers").value = localStorage.getItem("fb_followers") || "30,800+";
    document.getElementById("settings-tt-followers").value = localStorage.getItem("tt_followers") || "60,600+";
    loadHeroImagesSettings();
}

let currentHeroImages = [];

async function loadHeroImagesSettings() {
    try {
        const res = await fetch(API_BASE + "/settings");
        const data = await res.json();
        currentHeroImages = data.success && data.settings && data.settings.heroImages || [];
    } catch (e) {
        console.error("تعذر تحميل إعدادات Hero Slider:", e);
        currentHeroImages = [];
    }
    renderHeroImagesPreview();
}

function renderHeroImagesPreview() {
    const box = document.getElementById("hero-images-current");
    if (!box) return;
    if (currentHeroImages.length === 0) {
        box.innerHTML = '<div style="color:#999;font-size:0.85rem;">لا توجد صور مضافة بعد</div>';
        return;
    }
    box.innerHTML = currentHeroImages.map((img, i) => '\n        <div style="position:relative;width:110px;height:75px;">\n            <img src="' + imgUrl(img) + '" onerror="handleImgError(this)" style="width:100%;height:100%;object-fit:cover;border-radius:10px;border:2px solid var(--gold);">\n            <span style="position:absolute;top:3px;left:3px;background:rgba(0,0,0,0.65);color:#D4AF37;font-size:0.65rem;padding:1px 6px;border-radius:8px;">شريحة ' + (i + 1) + '</span>\n            <button type="button" onclick="deleteHeroImage(' + i + ')" style="position:absolute;top:-6px;right:-6px;background:#f44336;color:#fff;width:22px;height:22px;border-radius:50%;border:none;cursor:pointer;font-size:11px;font-weight:bold;">X</button>\n        </div>\n    ').join("");
}

async function deleteHeroImage(index) {
    if (!confirm("حذف هذه الصورة من Hero Slider؟")) return;
    try {
        const res = await fetchWithAuth(API_BASE + "/settings/hero-images/" + index, {
            method: "DELETE"
        });
        const data = await res.json();
        if (data.success) {
            currentHeroImages = data.heroImages || [];
            renderHeroImagesPreview();
            showNotification("تم حذف الصورة");
        } else {
            showNotification("" + (data.error || "فشل الحذف"), "error");
        }
    } catch (e) {
        console.error(e);
        showNotification("خطأ في الاتصال: " + (e?.message || ""), "error");
    }
}

async function uploadHeroImages() {
    const input = document.getElementById("hero-images-input");
    const files = input.files;
    if (!files || files.length === 0) {
        showNotification("اختاري صورة واحدة على الأقل", "error");
        return;
    }
    if (currentHeroImages.length + files.length > 4) {
        showNotification("الحد الأقصى 4 صور إجمالاً (احذفي صورة قديمة أولاً)", "error");
        return;
    }
    const fd = new FormData();
    fd.append("keepImages", JSON.stringify(currentHeroImages));
    for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i], 1920, 0.85);
        fd.append("heroImages", compressed, files[i].name);
    }
    try {
        const res = await fetchWithAuth(API_BASE + "/settings/hero-images", {
            method: "POST",
            body: fd
        });
        const data = await res.json();
        if (data.success) {
            currentHeroImages = data.heroImages || [];
            renderHeroImagesPreview();
            input.value = "";
            showNotification("تم تحديث صور Hero Slider بنجاح");
        } else {
            showNotification("" + (data.error || "فشل الرفع"), "error");
        }
    } catch (e) {
        console.error(e);
        showNotification("خطأ في الاتصال: " + (e?.message || ""), "error");
    }
}

let allTestimonials = [];
let testimonialImageFile = null;

async function loadTestimonials() {
    try {
        const res = await fetchWithAuth(API_BASE + '/testimonials');
        const data = await res.json();
        if (data.success) {
            allTestimonials = data.testimonials || [];
            renderTestimonialsList();
        }
    } catch (error) {
        console.error('خطأ في تحميل الشهادات:', error);
    }
}

function renderTestimonialsList() {
    const container = document.getElementById('testimonials-list');
    if (!container) return;
    if (allTestimonials.length === 0) {
        container.innerHTML = '\n            <div style="text-align: center; color: var(--text-muted); padding: 30px;">\n                <i class="fas fa-image" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>\n                لا توجد شهادات حالياً\n            </div>\n        ';
        return;
    }
    let html = '';
    allTestimonials.forEach((item) => {
        html += '\n            <div style="text-align: center;">\n                <div style="position:relative;width:110px;height:75px;">\n                    <img src="' + imgUrl(item.image) + '" onerror="handleImgError(this)" style="width:100%;height:100%;object-fit:cover;border-radius:10px;border:2px solid var(--gold);">\n                    <button type="button" onclick="deleteTestimonial(\'' + item._id + '\')" style="position:absolute;top:-6px;right:-6px;background:#f44336;color:#fff;width:22px;height:22px;border-radius:50%;border:none;cursor:pointer;font-size:11px;font-weight:bold;">X</button>\n                </div>\n                <div style="color: var(--gold); font-size: 0.75rem; margin-top: 5px; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + escapeHtml(item.customerName) + '</div>\n            </div>\n        ';
    });
    container.innerHTML = html;
}

document.getElementById('testimonial-image-input')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    testimonialImageFile = file;
    const preview = document.getElementById('testimonial-image-preview');
    const reader = new FileReader();
    reader.onload = function(ev) {
        preview.innerHTML = '\n            <div style="position:relative;width:110px;height:75px;">\n                <img src="' + ev.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:10px;border:2px solid var(--gold);">\n                <button type="button" onclick="clearTestimonialImagePreview()" style="position:absolute;top:-6px;right:-6px;background:#f44336;color:#fff;width:22px;height:22px;border-radius:50%;border:none;cursor:pointer;font-size:11px;font-weight:bold;">X</button>\n            </div>\n        ';
    };
    reader.readAsDataURL(file);
});

function clearTestimonialImagePreview() {
    testimonialImageFile = null;
    const input = document.getElementById('testimonial-image-input');
    if (input) input.value = '';
    const preview = document.getElementById('testimonial-image-preview');
    if (preview) preview.innerHTML = '';
}

async function addTestimonial() {
    const name = document.getElementById('testimonial-customer-name')?.value.trim();
    if (!name) {
        showNotification('الرجاء إدخال اسم الزبون', 'error');
        return;
    }
    if (!testimonialImageFile) {
        showNotification('الرجاء اختيار صورة', 'error');
        return;
    }
    if (allTestimonials.length >= 50) {
        showNotification('الحد الأقصى 50 شهادة', 'error');
        return;
    }
    const formData = new FormData();
    formData.append('customerName', name);
    formData.append('image', testimonialImageFile);
    try {
        const res = await fetchWithAuth(API_BASE + '/testimonials', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            showNotification('تم إضافة الشهادة بنجاح');
            document.getElementById('testimonial-customer-name').value = '';
            document.getElementById('testimonial-image-input').value = '';
            document.getElementById('testimonial-image-preview').innerHTML = '';
            testimonialImageFile = null;
            loadTestimonials();
        } else {
            showNotification('' + (data.error || 'فشل الإضافة'), 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال', 'error');
    }
}

async function deleteTestimonial(id) {
    if (!confirm('هل أنت متأكد من حذف هذه الشهادة؟')) return;
    try {
        const res = await fetchWithAuth(API_BASE + '/testimonials/' + id, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            showNotification('تم حذف الشهادة');
            loadTestimonials();
        } else {
            showNotification('' + (data.error || 'فشل الحذف'), 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال', 'error');
    }
}

const originalLoadSettings = window.loadSettings;
if (originalLoadSettings) {
    window.loadSettings = function() {
        originalLoadSettings();
        loadTestimonials();
    };
}

function validatePrice(input) {
    let value = input.value.replace(/[^0-9]/g, "");
    if (value === "" || value === "0") {
        value = "1";
    }
    if (parseInt(value) > 99999) {
        value = "99999";
        showNotification("القيمة القصوى المسموحة هي 99999", "error");
    }
    if (parseInt(value) < 1) {
        value = "1";
    }
    input.value = value;
}

function validatePriceOnInput(input) {
    input.value = input.value.replace(/[^0-9]/g, "");
    if (input.value.startsWith("-")) {
        input.value = input.value.substring(1);
    }
}

function validatePriceOnBlur(input) {
    if (input.value === "" || input.value === "0") {
        input.value = "1";
        showNotification("أقل قيمة مسموحة هي 1", "error");
    } else if (parseInt(input.value) > 99999) {
        input.value = "99999";
        showNotification("القيمة القصوى المسموحة هي 99999", "error");
    }
}

function applyPriceValidationToAllFields() {
    const priceInputs = document.querySelectorAll('input[type="number"], input[class*="price"], input[id*="price"], input[id*="total"], input[id*="amount"]');
    priceInputs.forEach(input => {
        if (!input.readOnly) {
            input.setAttribute("oninput", "validatePriceOnInput(this)");
            input.setAttribute("onchange", "validatePrice(this)");
            input.setAttribute("onblur", "validatePriceOnBlur(this)");
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(applyPriceValidationToAllFields, 1000);
});