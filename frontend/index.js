let currentLang = localStorage.getItem("lang") || "ar";

function getSwatchBorderColor(hex) {
    try {
        let h = String(hex).replace("#", "").trim();
        if (h.length === 3) h = h.split("").map(c => c + c).join("");
        if (!/^[0-9a-fA-F]{6}$/.test(h)) return hex;
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        const luminance = (.299 * r + .587 * g + .114 * b) / 255;
        return luminance > .92 ? "rgba(0,0,0,0.2)" : hex;
    } catch (e) {
        return hex;
    }
}

const colorOptions = [ {
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
    hexCode: "#00FF00",
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
    hexCode: "#800000",
    fr: "Marron",
    ar: "بني"
} ];

const translations = {
    ar: {
        search: " ابحثي عن إكسسوار",
        filter: "فلترة",
        cart: "السلة",
        total: "الإجمالي",
        submitOrder: "تأكيد الطلب",
        contactUs: "اتصلي بنا",
        aboutUs: "من نحن",
        aboutUsTitle: "من نحن",
        home: "الرئيسية",
        categories: "الفئات",
        followUs: "تابعينا",
        followUsTitle: "تابعينا على مواقع التواصل",
        addToCart: "أضيفي للسلة",
        orderNow: "اطلبي الآن",
        reviews: "آراؤكم",
        price: "السعر",
        colors: "الألوان المتوفرة",
        sizes: "المقاسات المتوفرة",
        quantity: "الكمية",
        unifiedColor: "لون موحد",
        unifiedSize: "مقاس موحد",
        cartEmpty: "سلة فارغة",
        subtotal: "المجموع الفرعي:",
        shippingFee: "رسوم التوصيل:",
        deliveryInfo: "معلومات التوصيل",
        wilaya: "الولاية",
        commune: "البلدية",
        fullName: "الاسم الكامل",
        phone: "رقم الهاتف",
        shippingType: "نوع التوصيل:",
        officePickup: "الاستلام من مكتب البريد",
        homeDelivery: "التوصيل إلى المنزل",
        availableWith: "متوفر مع",
        withoutAddon: "طلب الإكسسوار بدون",
        withAddon: "طلب الإكسسوار مع",
        details: "التفاصيل (اللون/الطول)",
        requiredChoice: "يرجى اختيار أحد الخيارات للمتابعة",
        requiredDetails: "الرجاء كتابة التفاصيل",
        handmade: "صنع يدوي بأنامل جزائرية",
        newCollection: "إكسسوارات عصرية وتقليدية تناسب جمالك",
        fastDelivery: "توصيل سريع لجميع الولايات والبلديات",
        allStates: "الشحن داخل الجزائر فقط",
        yourStyle: "إطلالتك ستكون أجمل بأناملنا",
        excellentRatings: "أنت ملكة الحفل بإكسسواراتنا",
        support247: "أكثر من 600 زبونة راضية عن إكسسواراتنا",
        callok: "ثقة زبائننا غايتنا",
        heroCta: "تسوقي الآن",
        fillRequired: "الرجاء ملء جميع المعلومات المطلوبة",
        cartEmptyError: "السلة فارغة",
        connectionError: "خطأ في الاتصال",
        orderSuccess: "تم استلام طلبك بنجاح! شكراً لتسوقك معنا",
        addedToCart: "تمت إضافة الإكسسوار إلى السلة",
        removedFromCart: "تم إزالة الإكسسوار من السلة",
        category: "الفئة",
        allCategories: "جميع الفئات",
        sortByPrice: "الترتيب حسب السعر:",
        defaultSort: "الترتيب الافتراضي",
        priceAsc: "من الأقل للأعلى",
        priceDesc: "من الأعلى للأقل",
        priceRange: "نطاق السعر:",
        applyFilter: "تطبيق الفلترة",
        resetFilter: "إعادة تعيين",
        selectWilaya: "اختاري الولاية",
        componentSingle: "شراء مكون واحد فقط",
        fullProduct: "الإكسسوار كامل",
        customizationLabel: "تفاصيل إضافية",
        customizationExtra: "عند إضافة تفاصيل، سيزيد السعر بمقدار",
        customizationPlaceholder: "أدخل التفاصيل المطلوبة (الطول، اللون، النقش...)",
        invalidPhone: "رقم الهاتف غير صالح! يجب أن يكون 10 أرقام",
        share: "مشاركة",
        description: "الوصف",
        minPrice: "أقل سعر",
        maxPrice: "أقصى سعر",
        customerReviews: "آراء الزبائن",
        addYourReview: "أضيفي تقييمك",
        yourComment: "شاركينا رأيك في هذا الإكسسوار",
        yourName: "اسمك (اختياري)",
        submitReview: "إرسال التقييم",
        reviewPending: "سيتم نشر تقييمك بعد موافقة إدارة الموقع",
        noReviewsYet: "لا توجد تقييمات بعد. كن أول من يقيم هذا الإكسسوار!",
        rating: "تقييم",
        followers: "متابع",
        follow: "متابعة",
        languageLabel: "اللغة",
        choosePurchaseType: "اختر نوع الشراء",
        loadingProducts: "جاري تحميل المنتجات...",
        noProducts: "لا توجد منتجات حاليا",
        noResults: "لا توجد نتائج",
        cashOnDeliveryLabel: "الدفع عند الاستلام",
        deliveryAllStates: "التوصيل لـ 69 ولاية",
        willCallLabel: "الشحن داخل الجزائر فقط",
        beforeShipping: "سنتصل بك لتأكيد الطلبية قبل الشحن",
        notesLabel: "تفاصيل إضافية (اختياري)",
        notesPlaceholder: "أي تفاصيل إضافية تودينها، لون حسب الطلب، مقاس معين ...",
        notesWarning: "إضافة تفاصيل خاصة قد تزيد من السعر النهائي",
        availableParts: "متوفر البيع بأجزاء منفردة",
        djSymbol: "د.ج",
        withoutComponent: "بدون",
        favorites: "المفضلة",
        favoritesTitle: "قائمة المفضلات",
        emptyFavorites: "لا توجد منتجات في المفضلة",
        sizeNote: "المقاسات حسب طول الشعر",
        footerBrandDesc: "إكسسوارات راقية تصنع بعناية بأنامل جزائرية، تجمع بين جودة الصنع وجمال التصميم، وتفخر بثقة ورضا أكثر من 600 زبونة اخترن تصاميمنا",
        quickLinks: "روابط سريعة",
        products: "المنتجات",
        contactUsTitle: "تواصل معنا",
        deliveryTime: "24h / 48h",
        allRightsReserved: "جميع الحقوق محفوظة",
        customOrder: "حسب الطلب"
    },
    fr: {
        search: "Rechercher un produit",
        filter: "Filtrer",
        cart: "Panier",
        total: "Total :",
        submitOrder: "Confirmer la commande",
        contactUs: "Contactez-nous",
        aboutUs: "À propos",
        aboutUsTitle: "À propos de nous",
        home: "Accueil",
        categories: "Catégories",
        followUs: "Suivez-nous",
        followUsTitle: "Suivez-nous sur les réseaux",
        addToCart: "Au panier",
        orderNow: "Commander",
        reviews: "Vos avis",
        price: "Prix",
        colors: "Couleurs disponibles",
        sizes: "Tailles disponibles",
        quantity: "Quantité",
        unifiedColor: "Couleur unique",
        unifiedSize: "Taille unique",
        cartEmpty: "Panier vide",
        subtotal: "Sous-total :",
        shippingFee: "Frais de livraison :",
        deliveryInfo: "Informations de livraison",
        wilaya: "Wilaya",
        commune: "Commune",
        fullName: "Nom complet",
        phone: "Téléphone",
        shippingType: "Type de livraison :",
        officePickup: "Retrait au bureau de poste",
        homeDelivery: "Livraison à domicile",
        availableWith: "Disponible avec",
        withoutAddon: "Commander sans",
        withAddon: "Commander avec",
        details: "Détails (couleur/longueur)",
        requiredChoice: "Veuillez choisir une option pour continuer",
        requiredDetails: "Veuillez entrer les détails",
        handmade: "Fabriqué à la main par des Algériennes",
        newCollection: "Accessoires modernes et traditionnels pour sublimer votre beauté",
        fastDelivery: "Livraison rapide pour tous les wilayas et les communes",
        allStates: "Livraison uniquement en Algérie",
        yourStyle: "Votre style sublimé par nos mains",
        excellentRatings: "Vous êtes la reine de la fête avec nos accessoires",
        support247: "Plus de 600 clients satisfaits de nos accessoires",
        callok: "La confiance de nos clients est notre priorité",
        heroCta: "Achetez maintenant",
        fillRequired: "Veuillez remplir toutes les informations requises",
        cartEmptyError: "Panier vide",
        connectionError: "Erreur de connexion",
        orderSuccess: "Commande confirmée ! Merci pour votre achat",
        addedToCart: "accessoire ajouté au panier",
        removedFromCart: "accessoire retiré du panier",
        category: "Catégorie",
        allCategories: "Toutes les catégories",
        sortByPrice: "Trier par prix :",
        defaultSort: "Par défaut",
        priceAsc: "Prix croissant",
        priceDesc: "Prix décroissant",
        priceRange: "Fourchette de prix :",
        applyFilter: "Appliquer le filtre",
        resetFilter: "Réinitialiser",
        selectWilaya: "Sélectionnez la wilaya",
        componentSingle: "Acheter un seul composant",
        fullProduct: "Accessoire complet",
        customizationLabel: "Détails supplémentaires",
        customizationExtra: "L'ajout de détails spéciaux peut augmenter le prix final",
        customizationPlaceholder: "Entrez les détails (longueur, couleur, gravure...)",
        invalidPhone: "Numéro de téléphone invalide ! Il doit comporter 10 chiffres",
        share: "Partager",
        description: "Description",
        minPrice: "Prix min",
        maxPrice: "Prix max",
        customerReviews: "Avis clients",
        addYourReview: "Ajoutez votre avis",
        yourComment: "Partagez votre avis sur cet accessoire",
        yourName: "Votre nom (optionnel)",
        submitReview: "Envoyer l'avis",
        reviewPending: "Votre avis sera publié après approbation de l'administration",
        noReviewsYet: "Aucun avis pour le moment. Soyez le premier à évaluer ce produit !",
        rating: "Note",
        followers: "abonnés",
        follow: "Suivre",
        languageLabel: "Langue",
        choosePurchaseType: "Choisissez le type d'achat",
        loadingProducts: "Chargement des produits...",
        noProducts: "Aucun produit disponible pour le moment",
        noResults: "Aucun résultat",
        cashOnDeliveryLabel: "Paiement à la livraison",
        deliveryAllStates: "Livraison dans 69 wilayas",
        willCallLabel: "Livraison uniquement en Algérie",
        beforeShipping: "Nous vous contacterons pour confirmer la commande avant l'expédition.",
        notesLabel: "Détails supplémentaires (optionnel)",
        notesPlaceholder: "Toute précision supplémentaire souhaitée, couleur personnalisée, taille spécifique… ",
        notesWarning: "L'ajout de détails spéciaux peut augmenter le prix final",
        availableParts: "Disponible à la vente en pièces séparées",
        djSymbol: "DA",
        withoutComponent: "sans",
        favorites: "Favoris",
        favoritesTitle: "Liste des favoris",
        emptyFavorites: "Aucun produit dans les favoris",
        sizeNote: "Les tailles sont basées sur la longueur des cheveux",
        footerBrandDesc: "Des accessoires raffinés, créés avec passion par des mains algériennes, où la qualité de fabrication rencontre l'élégance du design. Plus de 600 clientes satisfaites nous font déjà confiance",
        quickLinks: "Liens rapides",
        products: "Produits",
        contactUsTitle: "Contactez-nous",
        deliveryTime: "24h / 48h",
        allRightsReserved: "Tous droits réservés",
        customOrder: "Sur commande"
    }
};

function t(key) {
    return translations[currentLang][key] || translations["ar"][key] || key;
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

let currentPurchaseType = "full";
let currentComponentIndex = -1;

function selectPurchaseOption(element, type, componentIndex, price) {
    const currencySymbol = currentLang === "fr" ? " DA" : " د.ج";
    document.querySelectorAll(".purchase-option").forEach(opt => {
        opt.classList.remove("selected");
        opt.style.background = "";
        opt.style.color = "";
    });
    element.classList.add("selected");
    element.style.background = "#d4af37";
    element.style.color = "#3A0D28";
    currentPurchaseType = type;
    currentComponentIndex = componentIndex;
    currentFinalPrice = price;
    let componentImage = null;
    if (type === "component" && currentProduct && currentProduct.components && currentProduct.components[componentIndex]) {
        const comp = currentProduct.components[componentIndex];
        currentSelectedComponent = {
            index: componentIndex,
            nameAr: comp.nameAr,
            nameFr: comp.nameFr,
            name: currentLang === "fr" ? comp.nameFr || comp.nameAr : comp.nameAr || comp.name,
            price: comp.price,
            type: "separate"
        };
        componentImage = comp.image || null;
    } else if (type === "full") {
        currentSelectedComponent = null;
        componentImage = null;
    } else if (type === "fullWithout" && currentProduct && currentProduct.components && currentProduct.components[componentIndex]) {
        const comp = currentProduct.components[componentIndex];
        currentSelectedComponent = {
            index: componentIndex,
            nameAr: comp.nameAr,
            nameFr: comp.nameFr,
            name: currentLang === "fr" ? comp.nameFr || comp.nameAr : comp.nameAr || comp.name,
            price: price,
            type: "without",
            isFullWithout: true
        };
        componentImage = comp.image || null;
    }
    if (componentImage) {
        const sliderContainer = document.getElementById("detail-slider-container");
        if (sliderContainer) {
            const currentSlide = sliderContainer.querySelector(".img-slider-slide.active, .img-slider-slide:first-child");
            if (currentSlide) {
                const img = currentSlide.querySelector("img");
                if (img) {
                    img.src = componentImage;
                }
            }
        }
    } else {
        if (currentProduct) {
            let defaultImage = currentProduct.mainImage;
            if (!defaultImage && currentProduct.images && currentProduct.images.length > 0) {
                defaultImage = currentProduct.images[0];
            }
            if (defaultImage) {
                const sliderContainer = document.getElementById("detail-slider-container");
                if (sliderContainer) {
                    const currentSlide = sliderContainer.querySelector(".img-slider-slide.active, .img-slider-slide:first-child");
                    if (currentSlide) {
                        const img = currentSlide.querySelector("img");
                        if (img) {
                            img.src = defaultImage;
                        }
                    }
                }
            }
        }
    }
    const priceEl = document.getElementById("detail-price");
    if (priceEl) {
        priceEl.innerText = price + currencySymbol;
        priceEl.classList.add("price-blink");
        setTimeout(() => priceEl.classList.remove("price-blink"), 500);
    }
}

const categoriesData = [ {
    ar: "تيجان وإكسسوارات الشعر",
    fr: "Tiaras et accessoires pour cheveux"
}, {
    ar: "طقم بالأحجار الكريمة والجوهر",
    fr: "Ensemble avec pierres précieuses et bijoux"
}, {
    ar: "إكسسوارات العروس",
    fr: "Accessoires de mariée"
}, {
    ar: "إكسسوارات تقليدية",
    fr: "Accessoires traditionnels"
}, {
    ar: "أطقم المروحة والمشوارة",
    fr: "Ensembles éventail et machouara"
}, {
    ar: "خواتم بالأحجار",
    fr: "Bagues avec pierres précieuses"
}, {
    ar: "حقائب اللؤلؤ",
    fr: "Sacs en perles"
} ];

function buildCategoriesDropdowns() {
    const dropdownList = document.getElementById("categories-dropdown-list");
    if (dropdownList) {
        dropdownList.innerHTML = '<a onclick="filterByCategoryAndClose(\'all\')" data-i18n="allCategories">جميع الفئات</a>';
        categoriesData.forEach(cat => {
            const a = document.createElement("a");
            a.textContent = currentLang === "ar" ? cat.ar : cat.fr;
            a.setAttribute("data-category-ar", cat.ar);
            a.setAttribute("data-category-fr", cat.fr);
            a.onclick = () => filterByCategoryAndClose(cat.ar);
            dropdownList.appendChild(a);
        });
    }
    const sidebarDropdownList = document.getElementById("sidebar-categories-dropdown-list");
    if (sidebarDropdownList) {
        sidebarDropdownList.innerHTML = '<a onclick="filterByCategoryAndCloseSidebar(\'all\')" data-i18n="allCategories">جميع الفئات</a>';
        categoriesData.forEach(cat => {
            const a = document.createElement("a");
            a.textContent = currentLang === "ar" ? cat.ar : cat.fr;
            a.setAttribute("data-category-ar", cat.ar);
            a.setAttribute("data-category-fr", cat.fr);
            a.onclick = () => filterByCategoryAndCloseSidebar(cat.ar);
            sidebarDropdownList.appendChild(a);
        });
    }
}

function toggleCategoriesDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById("categories-dropdown-list");
    dropdown.classList.toggle("show");
}

function toggleSidebarCategoriesDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById("sidebar-categories-dropdown-list");
    dropdown.classList.toggle("show");
}

function filterByCategoryAndClose(category) {
    filterByCategoryName(category);
    document.getElementById("categories-dropdown-list").classList.remove("show");
}

function filterByCategoryAndCloseSidebar(category) {
    filterByCategoryName(category);
    document.getElementById("sidebar-categories-dropdown-list").classList.remove("show");
    const sidebar = document.getElementById("sidebar");
    if (sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
    }
}

function filterByCategoryName(category) {
    const heroEl = document.getElementById("hero-slider");
    if (category === "all") {
        currentFilter.category = "all";
        document.getElementById("filter-category").value = "all";
        loadProducts();
        if (heroEl) {
            heroEl.style.display = "";
            if (heroSwiper) heroSwiper.update();
        }
        const productsContainerAll = document.getElementById("products-container");
        if (productsContainerAll) productsContainerAll.classList.remove("category-view");
    } else {
        currentFilter.category = category;
        const filterSelect = document.getElementById("filter-category");
        if (filterSelect) {
            let found = false;
            for (let i = 0; i < filterSelect.options.length; i++) {
                if (filterSelect.options[i].value === category) {
                    filterSelect.selectedIndex = i;
                    found = true;
                    break;
                }
            }
            if (!found) {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                filterSelect.appendChild(option);
                filterSelect.value = category;
            }
        }
        filterProducts(currentFilter.category, currentFilter.sort, currentFilter.minPrice, currentFilter.maxPrice);
        if (heroEl) heroEl.style.display = "none";
        const productsContainerCat = document.getElementById("products-container");
        if (productsContainerCat) productsContainerCat.classList.add("category-view");
    }
    scrollToProducts();
}

function updateCategoriesDropdownTranslation() {
    const dropdownItems = document.querySelectorAll("#categories-dropdown-list a");
    dropdownItems.forEach(item => {
        const catAr = item.getAttribute("data-category-ar");
        const catFr = item.getAttribute("data-category-fr");
        if (catAr && catFr) {
            item.textContent = currentLang === "ar" ? catAr : catFr;
        } else if (item.getAttribute("data-i18n")) {
            item.textContent = t("allCategories");
        }
    });
    const sidebarItems = document.querySelectorAll("#sidebar-categories-dropdown-list a");
    sidebarItems.forEach(item => {
        const catAr = item.getAttribute("data-category-ar");
        const catFr = item.getAttribute("data-category-fr");
        if (catAr && catFr) {
            item.textContent = currentLang === "ar" ? catAr : catFr;
        } else if (item.getAttribute("data-i18n")) {
            item.textContent = t("allCategories");
        }
    });
}

document.addEventListener("click", function(event) {
    const dropdown = document.getElementById("categories-dropdown-list");
    const sidebarDropdown = document.getElementById("sidebar-categories-dropdown-list");
    if (dropdown && !event.target.closest(".categories-dropdown")) {
        dropdown.classList.remove("show");
    }
    if (sidebarDropdown && !event.target.closest(".sidebar-categories-dropdown")) {
        sidebarDropdown.classList.remove("show");
    }
});

document.addEventListener("click", function(event) {
    const sidebar = document.getElementById("sidebar");
    if (sidebar && sidebar.classList.contains("open") && !event.target.closest("#sidebar") && !event.target.closest(".menu-toggle")) {
        sidebar.classList.remove("open");
    }
    const cartPanel = document.getElementById("cart-panel");
    if (cartPanel && cartPanel.classList.contains("open") && !event.target.closest(".cart-panel") && !event.target.closest(".cart-info")) {
        cartPanel.classList.remove("open");
    }
    const favoritesPanel = document.getElementById("favorites-panel");
    if (favoritesPanel && favoritesPanel.classList.contains("open") && !event.target.closest(".favorites-panel") && !event.target.closest(".favorites-icon")) {
        favoritesPanel.classList.remove("open");
    }
});

// السحب للإغلاق (Swipe to close) على الهاتف: السلة، المفضلة، والقائمة الجانبية
// كلها تنزلق من اليمين، لذا السحب نحو اليمين (خارج الشاشة) يُغلقها.
function enableSwipeToClose(panelId, closeFn) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    let startX = 0;
    let startY = 0;
    let tracking = false;
    const SWIPE_THRESHOLD = 60;
    panel.addEventListener("touchstart", function(e) {
        if (!panel.classList.contains("open") || !e.touches || !e.touches.length) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
    }, { passive: true });
    panel.addEventListener("touchmove", function(e) {
        if (!tracking || !e.touches || !e.touches.length) return;
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (Math.abs(dy) > Math.abs(dx)) {
            tracking = false;
        }
    }, { passive: true });
    panel.addEventListener("touchend", function(e) {
        if (!tracking) return;
        tracking = false;
        const touch = e.changedTouches && e.changedTouches[0];
        const endX = touch ? touch.clientX : startX;
        if (endX - startX > SWIPE_THRESHOLD) {
            closeFn();
        }
    }, { passive: true });
}

enableSwipeToClose("cart-panel", function() {
    document.getElementById("cart-panel")?.classList.remove("open");
});
enableSwipeToClose("favorites-panel", function() {
    document.getElementById("favorites-panel")?.classList.remove("open");
});
enableSwipeToClose("sidebar", function() {
    document.getElementById("sidebar")?.classList.remove("open");
});

function updateDetailPageTranslation() {
    const detailContainer = document.getElementById("product-detail-container");
    if (!detailContainer || detailContainer.style.display !== "block") return;
    if (!currentProduct) return;
    const nameEl = document.querySelector(".product-detail-info h1");
    if (nameEl) {
        nameEl.textContent = currentLang === "ar" ? currentProduct.nameAr || currentProduct.name : currentProduct.nameFr || currentProduct.name;
    }
    const descDiv = document.querySelector(".product-detail-info div:has(strong)");
    if (descDiv) {
        const desc = currentLang === "ar" ? currentProduct.descriptionAr || currentProduct.description || "" : currentProduct.descriptionFr || currentProduct.description || "";
        descDiv.innerHTML = '<strong style="color:#d4af37;"><i class="fas fa-edit" style="margin-inline-end: 8px;"></i>' + t("description") + ':</strong><br>' + desc;
    }
    const addBtn = document.querySelector(".btn-add-cart-detail");
    if (addBtn) addBtn.innerHTML = '<i class="fas fa-cart-plus" style="margin-inline-end: 8px;"></i>' + t("addToCart");
    const orderBtn = document.querySelector(".btn-order-now-detail");
    if (orderBtn) orderBtn.innerHTML = '<i class="fas fa-rocket" style="margin-inline-end: 8px;"></i>' + t("orderNow");
}

function updateReviewsTranslation() {
    const detailContainer = document.getElementById("product-detail-container");
    if (!detailContainer || detailContainer.style.display !== "block") return;
    const reviewsTitle = document.querySelector("#reviews-section h3");
    if (reviewsTitle) reviewsTitle.innerHTML = '<i class="fas fa-star" style="margin-inline-end: 8px;"></i>' + t("customerReviews");
    const addReviewTitle = document.querySelector("#reviews-section h4");
    if (addReviewTitle) addReviewTitle.innerHTML = '<i class="fas fa-edit" style="margin-inline-end: 8px;"></i>' + t("addYourReview");
    const commentField = document.getElementById("detail-review-comment");
    if (commentField) commentField.placeholder = t("yourComment");
    const nameField = document.getElementById("detail-review-name");
    if (nameField) nameField.placeholder = t("yourName");
    const submitBtn = document.querySelector("#reviews-section button:last-child");
    if (submitBtn && submitBtn.textContent.includes("إرسال")) {
        submitBtn.textContent = t("submitReview");
    }
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    if (typeof reinitHeroSlider === "function") reinitHeroSlider();
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
            el.placeholder = t(key);
        } else {
            el.textContent = t(key);
        }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });
    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.classList.remove("active");
        const btnText = btn.textContent.trim();
        if (lang === "ar" && (btnText === "AR" || btnText === "العربية") || lang === "fr" && (btnText === "FR" || btnText === "Français")) {
            btn.classList.add("active");
        }
    });
    const filterCategory = document.getElementById("filter-category");
    if (filterCategory) {
        filterCategory.querySelectorAll("option").forEach(opt => {
            const key = opt.getAttribute("data-i18n");
            if (key && t(key)) {
                opt.textContent = t(key);
            } else if (lang === "fr") {
                const frMap = {
                    "تيجان وإكسسوارات الشعر": "Tiaras et accessoires pour cheveux",
                    "طقم بالأحجار الكريمة والجوهر": "Ensemble avec pierres précieuses et bijoux",
                    "إكسسوارات العروس": "Accessoires de mariée",
                    "إكسسوارات تقليدية": "Accessoires traditionnels",
                    "أطقم المروحة والمشوارة": "Ensembles éventail et machouara",
                    "خواتم بالأحجار": "Bagues avec pierres précieuses",
                    "حقائب اللؤلؤ": "Sacs en perles"
                };
                if (frMap[opt.value]) opt.textContent = frMap[opt.value];
            } else {
                const arMap = {
                    "تيجان وإكسسوارات الشعر": "تيجان وإكسسوارات الشعر",
                    "طقم بالأحجار الكريمة والجوهر": "طقم بالأحجار الكريمة والجوهر",
                    "إكسسوارات العروس": "إكسسوارات العروس",
                    "إكسسوارات تقليدية": "إكسسوارات تقليدية",
                    "أطقم المروحة والمشوارة": "أطقم المروحة والمشوارة",
                    "خواتم بالأحجار": "خواتم بالأحجار",
                    "حقائب اللؤلؤ": "حقائب اللؤلؤ"
                };
                if (arMap[opt.value]) opt.textContent = arMap[opt.value];
            }
        });
    }
    const filterSort = document.getElementById("filter-sort");
    if (filterSort) {
        filterSort.querySelectorAll("option").forEach(opt => {
            const key = opt.getAttribute("data-i18n");
            if (key && t(key)) opt.textContent = t(key);
        });
    }
    updateProductsLanguage();
    updateCategoriesDropdownTranslation();
    if (currentProduct) {
        const nameEl = document.querySelector(".product-detail-info h1");
        if (nameEl) {
            nameEl.textContent = lang === "ar" ? currentProduct.nameAr || currentProduct.name : currentProduct.nameFr || currentProduct.name;
        }
    }
    const currencySymbol = lang === "fr" ? " DA" : " د.ج";
    document.querySelectorAll(".product-price, #detail-price, .cart-item-price").forEach(el => {
        if (el && el.innerText) {
            let match = el.innerText.match(/(\d+(?:\.\d+)?)/);
            if (match) {
                el.innerText = match[1] + currencySymbol;
            }
        }
    });
    const subEl = document.getElementById("cart-subtotal");
    const sfEl = document.getElementById("cart-shipping-fee");
    const totalEl = document.getElementById("cart-total");
    if (subEl && subEl.innerText) {
        let match = subEl.innerText.match(/(\d+(?:\.\d+)?)/);
        if (match) subEl.innerText = match[1] + currencySymbol;
    }
    if (sfEl && sfEl.innerText) {
        let match = sfEl.innerText.match(/(\d+(?:\.\d+)?)/);
        if (match) sfEl.innerText = match[1] + currencySymbol;
    }
    if (totalEl && totalEl.innerText) {
        let match = totalEl.innerText.match(/(\d+(?:\.\d+)?)/);
        if (match) totalEl.innerText = match[1] + currencySymbol;
    }
    const cartList = document.getElementById("cart-items-list");
    if (cartList && cart.length === 0) {
        cartList.innerHTML = '<div style="text-align:center; padding:30px; color:rgba(249,234,241,0.5);">' + t("cartEmpty") + '</div>';
    }
    const detailContainer = document.getElementById("product-detail-container");
    if (detailContainer && detailContainer.style.display === "block" && currentProduct) {
        showProductDetail(currentProduct._id);
    }
    updateReviewsTranslation();
    if (typeof loadWilayas === "function") {
        loadWilayas();
    }
    updateFavoritesLanguage();
    if (typeof updateCartUI === "function") {
        updateCartUI();
    }
    if (allProducts.length > 0) {
        displayProducts(allProducts);
    }
    if (detailContainer && detailContainer.style.display === "block" && currentProduct) {
        const sizeElements = document.querySelectorAll(".detail-size-option .size-name");
        sizeElements.forEach(el => {
            const originalSize = el.getAttribute("data-original-size") || el.innerText;
            if (!el.hasAttribute("data-original-size")) {
                el.setAttribute("data-original-size", originalSize);
            }
            el.innerText = lang === "fr" ? translateSize(originalSize, "fr") : originalSize;
        });
    }
    document.querySelectorAll(".sidebar-lang-btn").forEach(btn => {
        btn.classList.remove("active");
        if (lang === "ar" && btn.textContent.trim() === "العربية" || lang === "fr" && btn.textContent.trim() === "Français") {
            btn.classList.add("active");
        }
    });

    document.querySelectorAll(".color-swatch.custom-order-swatch").forEach(el => {
        el.textContent = t("customOrder");
        if (currentLang === "fr" && el.textContent.length > 10) {
            el.style.fontSize = "0.35rem";
            el.style.padding = "1px 2px";
        } else {
            el.style.fontSize = "";
            el.style.padding = "";
        }
    });

    document.querySelectorAll(".detail-color-swatch.custom-order-swatch").forEach(el => {
        el.textContent = t("customOrder");
    });
}

function updateProductsLanguage() {
    if (!allProducts || allProducts.length === 0) return;
    document.querySelectorAll(".product-card").forEach(card => {
        const pid = card.getAttribute("data-id");
        if (!pid) return;
        const product = allProducts.find(p => p._id === pid);
        if (!product) return;
        const nameEl = card.querySelector(".product-name");
        if (nameEl) {
            nameEl.textContent = currentLang === "ar" ? product.nameAr || product.name : product.nameFr || product.name;
        }
        const descEl = card.querySelector(".product-desc");
        if (descEl) {
            const desc = currentLang === "ar" ? product.descriptionAr || product.description || "" : product.descriptionFr || product.description || "";
            descEl.textContent = desc;
        }
        const sizeEls = card.querySelectorAll(".size-square");
        if (sizeEls.length && product.sizes && product.sizes.length) {
            const sizesToShow = product.sizes.slice(0, 3);
            sizeEls.forEach((el, i) => {
                if (sizesToShow[i]) {
                    el.textContent = currentLang === "fr" ? translateSize(sizesToShow[i].size, "fr") : sizesToShow[i].size;
                }
            });
        }
        const addBtn = card.querySelector(".btn-add-cart");
        if (addBtn) addBtn.innerHTML = '<i class="fas fa-shopping-cart" style="margin-inline-end: 8px;"></i>' + t("addToCart");
        const orderBtn = card.querySelector(".btn-order-now");
        if (orderBtn) orderBtn.textContent = t("orderNow");
        const shareBtn = card.querySelector(".btn-share");
        if (shareBtn) shareBtn.innerHTML = '<i class="fas fa-share-alt"></i><span>' + t("share") + '</span>';
        const partsEl = card.querySelector(".parts-available");
        if (partsEl) partsEl.textContent = t("availableParts");
    });
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

function closeSidebarAndScrollTo(section) {
    toggleSidebar();
    if (section === "products") scrollToProducts();
    else if (section === "home") scrollToHome();
}

function scrollToHome() {
    currentFilter = {
        sort: "default",
        category: "all",
        minPrice: 0,
        maxPrice: Infinity
    };
    const filterSelect = document.getElementById("filter-category");
    if (filterSelect) filterSelect.value = "all";
    const filterSort = document.getElementById("filter-sort");
    if (filterSort) filterSort.value = "default";
    const filterMin = document.getElementById("filter-min");
    if (filterMin) filterMin.value = "";
    const filterMax = document.getElementById("filter-max");
    if (filterMax) filterMax.value = "";
    window.productsDisplayedOnce = false;
    loadProducts();
    const heroElHome = document.getElementById("hero-slider");
    if (heroElHome) {
        heroElHome.style.display = "";
        if (heroSwiper) heroSwiper.update();
    }
    const detailContainer = document.getElementById("product-detail-container");
    if (detailContainer) {
        detailContainer.style.display = "none";
        detailContainer.innerHTML = "";
    }
    const productsContainer = document.getElementById("products-container");
    if (productsContainer) {
        productsContainer.style.display = "grid";
        productsContainer.classList.remove("category-view");
    }
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    const dropdown = document.getElementById("categories-dropdown-list");
    if (dropdown) dropdown.classList.remove("show");
    const sidebarDropdown = document.getElementById("sidebar-categories-dropdown-list");
    if (sidebarDropdown) sidebarDropdown.classList.remove("show");
}

function scrollToProducts() {
    const target = document.getElementById("products-container");
    if (!target) return;
    const navbar = document.querySelector(".navbar");
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const offset = navbarHeight + 30;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
    });
}

function goToAllProductsFromFooter() {
    currentFilter = {
        sort: "default",
        category: "all",
        minPrice: 0,
        maxPrice: Infinity
    };
    const filterSelect = document.getElementById("filter-category");
    if (filterSelect) filterSelect.value = "all";
    const filterSort = document.getElementById("filter-sort");
    if (filterSort) filterSort.value = "default";
    const filterMin = document.getElementById("filter-min");
    if (filterMin) filterMin.value = "";
    const filterMax = document.getElementById("filter-max");
    if (filterMax) filterMax.value = "";
    window.productsDisplayedOnce = false;
    loadProducts();
    const heroElFooter = document.getElementById("hero-slider");
    if (heroElFooter) {
        heroElFooter.style.display = "";
        if (heroSwiper) heroSwiper.update();
    }
    const detailContainer = document.getElementById("product-detail-container");
    if (detailContainer) {
        detailContainer.style.display = "none";
        detailContainer.innerHTML = "";
    }
    const productsContainer = document.getElementById("products-container");
    if (productsContainer) {
        productsContainer.style.display = "grid";
        productsContainer.classList.remove("category-view");
    }
    scrollToProducts();
}

function showAboutModal() {
    const aboutAr = localStorage.getItem("aboutContentAr");
    const aboutFr = localStorage.getItem("aboutContentFr");
    const content = currentLang === "ar" ? aboutAr || "لا يوجد محتوى بعد" : aboutFr || "Aucun contenu disponible pour le moment";
    document.getElementById("about-modal-text").innerHTML = content.replace(/\n/g, "<br>");
    document.getElementById("about-modal").style.display = "flex";
}

function closeAboutModal() {
    document.getElementById("about-modal").style.display = "none";
}

function openFollowModal() {
    updateFollowersFromSettings();
    document.getElementById("follow-modal").style.display = "flex";
    if (document.getElementById("sidebar").classList.contains("open")) toggleSidebar();
}

function closeFollowModal() {
    document.getElementById("follow-modal").style.display = "none";
}

function scrollToReviews() {
    const reviewsSection = document.querySelector(".reviews-section");
    if (reviewsSection) reviewsSection.scrollIntoView({
        behavior: "smooth"
    });
    else {
        document.getElementById("products-container").scrollIntoView({
            behavior: "smooth"
        });
        const msg = currentLang === "fr" ? "Choisissez d'abord un produit pour laisser un avis" : "اختاري منتجا أولاً لتترك تقييمك";
        showNotification(msg, "info");
    }
}

function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent);
}

function contactUs() {
    const waNumber = (localStorage.getItem("social_whatsapp") || "213775087631").replace(/[^0-9]/g, "");
    window.location.href = "tel:+" + waNumber;
}

const API_URL = (() => {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "/api";
    }
    return window.location.origin + "/api";
})();

function imgUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads')) {
        return API_URL.replace('/api', '') + path;
    }
    return path;
}

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

let allProducts = [];
let cart = [];
let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let ratingValue = 0;
let selectedAddon = null;
let addonCustomValue = "";
let selectedComponent = null;
let customizationText = "";
let customizationExtra = 0;
let currentFinalPrice = 0;
let shippingRates = [];
let currentFilter = {
    sort: "default",
    category: "all",
    minPrice: 0,
    maxPrice: Infinity
};

class ImageSlider {
    constructor(containerEl, images, isDetail = false, autoplay = true, interval = 4000) {
        this.el = containerEl;
        this.images = images.filter(Boolean);
        this.isDetail = isDetail;
        this.autoplay = autoplay;
        this.interval = interval;
        this.idx = 0;
        this.timer = null;
        this.touchStartX = null;
        this.touchDeltaX = 0;
        if (this.images.length === 0) return;
        this._build();
        this._events();
        this._observeVisibility();
    }
    _build() {
        const wrap = document.createElement("div");
        wrap.className = "img-slider-wrap" + (this.isDetail ? " detail-slider-wrap" : "");
        wrap.style.setProperty("direction", "ltr", "important");
        const track = document.createElement("div");
        track.className = "img-slider-track";
        track.style.setProperty("direction", "ltr", "important");
        track.style.flexDirection = "row";
        this.images.forEach((src, i) => {
            const slide = document.createElement("div");
            slide.className = "img-slider-slide";
            slide.style.setProperty("direction", "ltr", "important");
            const img = document.createElement("img");
            if (i === 0) {
                img.src = src;
            } else {
                img.loading = "lazy";
                img.src = src;
            }
            img.style.cssText = "display:block !important; visibility:visible !important; opacity:1 !important; background:transparent !important;";
            img.onerror = () => {
                handleImgError(img);
            };
            img.draggable = false;
            slide.appendChild(img);
            track.appendChild(slide);
        });
        wrap.appendChild(track);
        this.track = track;
        if (this.images.length > 1) {
            const prev = document.createElement("button");
            prev.className = "img-slider-btn img-slider-prev";
            prev.innerHTML = '<i class="fas fa-chevron-right"></i>';
            prev.setAttribute("aria-label", "الصورة السابقة");
            prev.onclick = e => {
                e.stopPropagation();
                this._prev();
                this._restartAutoIfVisible();
            };
            const next = document.createElement("button");
            next.className = "img-slider-btn img-slider-next";
            next.innerHTML = '<i class="fas fa-chevron-left"></i>';
            next.setAttribute("aria-label", "الصورة التالية");
            next.onclick = e => {
                e.stopPropagation();
                this._next();
                this._restartAutoIfVisible();
            };
            wrap.appendChild(prev);
            wrap.appendChild(next);
        }
        this.el.innerHTML = "";
        this.el.appendChild(wrap);
        this.wrap = wrap;
        if (this.images.length > 1) {
            const dotsRow = document.createElement("div");
            dotsRow.className = "img-slider-dots";
            this.images.forEach((_, i) => {
                const d = document.createElement("button");
                d.className = "img-slider-dot" + (i === 0 ? " active" : "");
                d.setAttribute("aria-label", "صورة " + (i + 1));
                d.onclick = e => {
                    e.stopPropagation();
                    this._goto(i);
                    this._restartAutoIfVisible();
                };
                dotsRow.appendChild(d);
            });
            wrap.appendChild(dotsRow);
            this.dotsRow = dotsRow;
        }
    }
    _events() {
        if (this.images.length <= 1) return;
        this.wrap?.addEventListener("mouseenter", () => this._stopAuto());
        this.wrap?.addEventListener("mouseleave", () => this._restartAutoIfVisible());
        this.wrap?.addEventListener("touchstart", e => {
            this.touchStartX = e.touches[0].clientX;
            this.touchDeltaX = 0;
            this._stopAuto();
        }, {
            passive: true
        });
        this.wrap?.addEventListener("touchmove", e => {
            if (this.touchStartX === null) return;
            this.touchDeltaX = e.touches[0].clientX - this.touchStartX;
        }, {
            passive: true
        });
        this.wrap?.addEventListener("touchend", () => {
            if (this.touchStartX === null) return;
            const threshold = 40;
            if (this.touchDeltaX > threshold) {
                this._prev();
            } else if (this.touchDeltaX < -threshold) {
                this._next();
            }
            this.touchStartX = null;
            this.touchDeltaX = 0;
            this._restartAutoIfVisible();
        });
    }
    _observeVisibility() {
        if (this.images.length <= 1 || !("IntersectionObserver" in window)) {
            if (this.autoplay && this.images.length > 1) this._startAuto();
            return;
        }
        this._isVisible = false;
        this._io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                this._isVisible = entry.isIntersecting;
                if (this._isVisible) this._restartAutoIfVisible();
                else this._stopAuto();
            });
        }, {
            threshold: .25
        });
        this._io.observe(this.el);
    }
    _restartAutoIfVisible() {
        if (this.autoplay && this.images.length > 1 && this._isVisible !== false) {
            this._startAuto();
        }
    }
    _goto(i) {
        if (i < 0) i = this.images.length - 1;
        if (i >= this.images.length) i = 0;
        this.idx = i;
        this.track.style.transform = "translateX(-" + (this.idx * 100) + "%)";
        this._updateDots();
        const thumbList = document.getElementById("detail-thumbnail-list");
        if (thumbList) {
            thumbList.querySelectorAll(".thumbnail").forEach((th, ti) => {
                th.classList.toggle("active", ti === this.idx);
                th.style.borderColor = ti === this.idx ? "#d4af37" : "transparent";
            });
        }
    }
    _next() {
        this._goto(this.idx + 1);
    }
    _prev() {
        this._goto(this.idx - 1);
    }
    _updateDots() {
        if (!this.dotsRow) return;
        this.dotsRow.querySelectorAll(".img-slider-dot").forEach((d, i) => {
            d.classList.toggle("active", i === this.idx);
        });
    }
    _startAuto() {
        this._stopAuto();
        if (this.autoplay && this.images.length > 1) this.timer = setInterval(() => this._next(), this.interval);
    }
    _stopAuto() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    destroy() {
        this._stopAuto();
        if (this._io) this._io.disconnect();
    }
    goTo(i) {
        this._goto(i);
        this._restartAutoIfVisible();
    }
}

function initLazyLoading() {
    document.querySelectorAll("img[data-src]").forEach(img => {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add("loaded");
            delete img.dataset.src;
        }
    });
}

async function loadShippingRates() {
    try {
        const res = await fetch(API_URL + "/shipping-rates");
        const data = await res.json();
        if (data.success) {
            shippingRates = data.rates;
            return shippingRates;
        }
    } catch (error) {
        console.error(error);
    }
    return [];
}

async function getShippingFee(wilayaName, shippingType) {
    if (!wilayaName) return 0;
    const rate = shippingRates.find(r => r.wilayaName === wilayaName);
    if (!rate) return shippingType === "office" ? 400 : 1000;
    return shippingType === "office" ? rate.officePrice : rate.homePrice;
}

async function loadWilayas() {
    const select = document.getElementById("cust-wilaya");
    if (!select) return;
    const wilayasTranslation = {
        "أدرار": "Adrar",
        "الشلف": "Chlef",
        "الأغواط": "Laghouat",
        "أم البواقي": "Oum El Bouaghi",
        "باتنة": "Batna",
        "بجاية": "Béjaïa",
        "بسكرة": "Biskra",
        "بشار": "Béchar",
        "البليدة": "Blida",
        "البويرة": "Bouira",
        "تمنراست": "Tamanrasset",
        "تبسة": "Tébessa",
        "تلمسان": "Tlemcen",
        "تيارت": "Tiaret",
        "تيزي وزو": "Tizi Ouzou",
        "الجزائر": "Alger",
        "الجلفة": "Djelfa",
        "جيجل": "Jijel",
        "سطيف": "Sétif",
        "سعيدة": "Saïda",
        "سكيكدة": "Skikda",
        "سيدي بلعباس": "Sidi Bel Abbès",
        "عنابة": "Annaba",
        "قالمة": "Guelma",
        "قسنطينة": "Constantine",
        "المدية": "Médéa",
        "مستغانم": "Mostaganem",
        "المسيلة": "M’Sila",
        "معسكر": "Mascara",
        "ورقلة": "Ouargla",
        "وهران": "Oran",
        "البيض": "El Bayadh",
        "برج بوعريريج": "Bordj Bou Arréridj",
        "بومرداس": "Boumerdès",
        "الطارف": "El Tarf",
        "تندوف": "Tindouf",
        "تيسمسيلت": "Tissemsilt",
        "الوادي": "El Oued",
        "خنشلة": "Khenchela",
        "سوق أهراس": "Souk Ahras",
        "تيبازة": "Tipaza",
        "ميلة": "Mila",
        "عين الدفلى": "Aïn Defla",
        "النعامة": "Naâma",
        "عين تيموشنت": "Aïn Témouchent",
        "غرداية": "Ghardaïa",
        "غليزان": "Relizane",
        "تيميمون": "Timimoun",
        "برج باجي مختار": "Bordj Badji Mokhtar",
        "أولاد جلال": "Ouled Djellal",
        "بني عباس": "Béni Abbès",
        "عين صالح": "In Salah",
        "عين قزام": "In Guezzam",
        "تقرت": "Touggourt",
        "جانت": "Djanet",
        "المغير": "El Meghaier",
        "المنيعة": "El Meniaa",
        "إليزي": "Illizi",
        "آفلو": "Aflou",
        "بريكة": "Barika",
        "قصر الشلالة": "Ksar Chellala",
        "مسعد": "Messaad",
        "عين وسارة": "Aïn Oussera",
        "بوسعادة": "Bou Saâda",
        "لبيض سيد الشيخ": "El Abiodh Sidi Cheikh",
        "القنطرة": "El Kantara",
        "بير العاتر": "Bir El Ater",
        "قصر البخاري": "Ksar El Boukhari",
        "العريشة": "El Ariche"
    };
    try {
        const res = await fetch(API_URL + "/shipping-rates");
        const data = await res.json();
        if (data.success && data.rates && data.rates.length > 0) {
            select.innerHTML = '<option value="">' + t("selectWilaya") + '</option>';
            data.rates.forEach(rate => {
                let displayName = rate.wilayaName;
                if (currentLang === "fr" && wilayasTranslation[rate.wilayaName]) {
                    displayName = wilayasTranslation[rate.wilayaName];
                }
                const wilayaNumber = getWilayaNumber(rate.wilayaName);
                let optionText = wilayaNumber + " - " + displayName;
                select.innerHTML += '<option value="' + escapeHtml(rate.wilayaName) + '">' + escapeHtml(optionText) + '</option>';
            });
        } else {
            select.innerHTML = '<option value="">-- لا توجد ولايات --</option>';
        }
    } catch (error) {
        select.innerHTML = '<option value="">-- خطأ في التحميل --</option>';
    }
}

let heroSwiper = null;

function heroLoadSlideMedia(slideEl) {
    if (!slideEl) return;
    const mediaEl = slideEl.querySelector(".hero-slide-media");
    if (!mediaEl) return;
    const url = mediaEl.getAttribute("data-hero-img");
    if (url && mediaEl.dataset.heroLoadedUrl !== url) {
        mediaEl.style.setProperty("--hero-img", "url('" + url + "')");
        mediaEl.dataset.heroLoadedUrl = url;
    }
}

function heroLazyLoadAround(swiper) {
    if (!swiper || !swiper.slides || !swiper.slides.length) return;
    const total = swiper.slides.length;
    [swiper.activeIndex, swiper.activeIndex + 1, swiper.activeIndex - 1].forEach(i => {
        const idx = (i % total + total) % total;
        heroLoadSlideMedia(swiper.slides[idx]);
    });
}

async function applyHeroImagesFromSettings() {
    try {
        const res = await fetch(API_URL + "/settings");
        const data = await res.json();
        const images = data.success && data.settings && data.settings.heroImages || [];
        const mediaEls = document.querySelectorAll("#hero-slider .hero-slide-media");
        mediaEls.forEach((el, i) => {
            if (images[i]) el.setAttribute("data-hero-img", images[i]);
        });
    } catch (e) {
        console.warn("تعذر تحميل صور Hero Slider من الإعدادات (ستظهر الخلفية الافتراضية):", e);
    }
}

function buildHeroSwiper() {
    const heroEl = document.getElementById("hero-slider");
    if (!heroEl || typeof Swiper === "undefined") return;
    heroSwiper = new Swiper("#hero-slider", {
        effect: "fade",
        fadeEffect: {
            crossFade: true
        },
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        speed: 1000,
        pagination: {
            el: "#hero-slider .swiper-pagination",
            clickable: true
        },
        navigation: {
            nextEl: "#hero-slider .swiper-button-next",
            prevEl: "#hero-slider .swiper-button-prev"
        },
        keyboard: {
            enabled: true,
            onlyInViewport: true
        },
        grabCursor: true,
        a11y: {
            enabled: true
        },
        on: {
            init: function() {
                heroLazyLoadAround(this);
            },
            slideChangeTransitionStart: function() {
                heroLazyLoadAround(this);
            }
        }
    });
}

async function initHeroSlider() {
    await applyHeroImagesFromSettings();
    buildHeroSwiper();
}

function reinitHeroSlider() {
    const heroEl = document.getElementById("hero-slider");
    if (!heroEl) return;
    const activeIndex = heroSwiper ? heroSwiper.realIndex || 0 : 0;
    if (heroSwiper) {
        heroSwiper.destroy(true, true);
        heroSwiper = null;
    }
    buildHeroSwiper();
    if (heroSwiper) heroSwiper.slideToLoop(activeIndex, 0);
}

function displayProducts(products) {
    if (window.productsDisplayedOnce === true) {
        updateProductsLanguage();
        return;
    }
    window.productsDisplayedOnce = true;
    const container = document.getElementById("products-container");
    if (!products || products.length === 0) {
        container.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 80px; color: #3B2630;">' + escapeHtml(t("noProducts")) + '</div>';
        return;
    }
    container.innerHTML = products.map(product => {
        const displayName = escapeHtml(currentLang === "ar" ? product.nameAr || product.name : product.nameFr || product.name);
        const displayDesc = escapeHtml(currentLang === "ar" ? product.descriptionAr || product.description : product.descriptionFr || product.description);
        const productId = escapeHtml(product._id);
        const basePrice = product.basePrice || 0;
        const cardCurrencySymbol = currentLang === "fr" ? " DA" : " د.ج";
        let colorsHtml = "";
        if (product.colors && product.colors.length > 0) {
            const totalColors = product.colors.length;
            let swatchSize = 32;
            let gapSize = 8;
            let wrapperClass = "";
            if (totalColors > 6) {
                swatchSize = 24;
                gapSize = 4;
                wrapperClass = "has-many-colors";
            }
            if (totalColors > 8) {
                swatchSize = 20;
                gapSize = 3;
                wrapperClass = "has-many-colors-8";
            }
            if (totalColors >= 10) {
                swatchSize = 18;
                gapSize = 2;
                wrapperClass = "has-many-colors-8";
            }

            colorsHtml = '<div class="colors-wrapper ' + wrapperClass + '" style="display: flex; flex-wrap: nowrap; gap: ' + gapSize + 'px; align-items: center; overflow: visible;">\n                ' + product.colors.map(c => {
                const hexCode = escapeHtml(c.hexCode || "#D4AF37");
                const colorName = escapeHtml(c.name || "");
                const colorImage = escapeHtml(c.image || "");
                if (hexCode === "custom") {
                    return '<span class="color-swatch custom-order-swatch" style="display: inline-flex; align-items: center; justify-content: center; width: ' + Math.max(swatchSize, 28) + 'px; min-width: ' + Math.max(swatchSize, 28) + 'px; height: ' + Math.max(swatchSize, 28) + 'px; min-height: ' + Math.max(swatchSize, 28) + 'px; padding: 2px 4px; border-radius: 50%; border: 2px solid var(--gold); cursor: pointer; flex-shrink: 0; font-size: 0.5rem; line-height: 1.1; color: var(--gold); background: rgba(212,175,55,0.12); text-align: center; white-space: nowrap;" onclick="event.stopPropagation(); changeCardImage(\'' + productId + '\', \'' + colorImage + '\')" title="' + colorName + '">' + t("customOrder") + '</span>';
                }
                return '<span class="color-swatch" style="background-color: ' + hexCode + '; width: ' + swatchSize + 'px; height: ' + swatchSize + 'px; border-radius: 50%; border: 2px solid ' + getSwatchBorderColor(hexCode) + '; cursor: pointer; flex-shrink: 0; display: inline-block;" onclick="event.stopPropagation(); changeCardImage(\'' + productId + '\', \'' + colorImage + '\')" title="' + colorName + '"></span>';
            }).join("") + '\n            </div>';
        } else {
            colorsHtml = "";
        }
        let sizesHtml = "";
        if (product.sizes && product.sizes.length > 0) {
            const sizesToShow = product.sizes.slice(0, 3);
            sizesHtml = '<div class="sizes-wrapper">' + sizesToShow.map(s => {
                const sizeName = escapeHtml(currentLang === "fr" ? translateSize(s.size, "fr") : s.size);
                const sizePrice = s.price || 0;
                return '<div class="size-square" onclick="event.stopPropagation(); selectCardSize(\'' + productId + '\', \'' + escapeHtml(s.size) + '\', ' + sizePrice + ', this)">' + sizeName + '</div>';
            }).join("") + '</div>';
        }
        const hasComponents = product.hasComponents || product.components && product.components.length > 0;
        const partsHtml = hasComponents ? '<div class="parts-available">' + escapeHtml(t("availableParts")) + '</div>' : "";
        const descHtml = displayDesc ? '<div class="product-desc">' + displayDesc + '</div>' : "";
        const buttonsHtml = '\n            <div class="product-buttons">\n                <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(\'' + productId + '\')">\n                    <i class="fas fa-shopping-cart" style="margin-inline-end: 8px;"></i>' + escapeHtml(t("addToCart")) + '\n                </button>\n                <button class="btn-order-now" onclick="event.stopPropagation(); orderNowProduct(\'' + productId + '\')">\n                    ' + escapeHtml(t("orderNow")) + '\n                </button>\n                <button class="btn-favorite ' + (isFavorite(product._id) ? "active" : "") + '" onclick="event.stopPropagation(); toggleFavorite(\'' + productId + '\', this)">\n                    <i class="fas fa-heart"></i>\n                </button>\n                <button class="btn-share" onclick="event.stopPropagation(); shareProduct(\'' + productId + '\', \'' + displayName + '\', ' + basePrice + ')" title="' + escapeHtml(t("share")) + '">\n                    <i class="fas fa-share-alt"></i><span>' + escapeHtml(t("share")) + '</span>\n                </button>\n            </div>';
        return '\n            <div class="product-card" data-id="' + productId + '" onclick="showProductDetail(\'' + productId + '\')">\n                <div id="pslider-' + productId + '" style="height:200px; background:#3A0D28; overflow:hidden;"></div>\n                <div class="product-header">\n                    <span class="product-name">' + displayName + '</span>\n                    <span class="product-price">' + basePrice + cardCurrencySymbol + '</span>\n                </div>\n                <div class="product-options-row">\n                    ' + colorsHtml + '\n                    ' + sizesHtml + '\n                </div>\n                ' + partsHtml + '\n                ' + descHtml + '\n                ' + buttonsHtml + '\n            </div>';
    }).join("");
    setTimeout(() => {
        products.forEach(product => {
            const sliderEl = document.getElementById("pslider-" + product._id);
            if (!sliderEl) return;
            if (sliderEl.hasAttribute("data-slider-initialized")) return;
            sliderEl.setAttribute("data-slider-initialized", "true");
            const imgs = [product.mainImage, ...product.images || []].filter(img => img && img !== "").filter((v, i, a) => a.indexOf(v) === i).map(img => "" + img);
            if (imgs.length === 0) {
                sliderEl.innerHTML = '<img src="' + PLACEHOLDER_IMG + '" style="width:100%;height:200px;object-fit:cover;display:block;">';
                return;
            }
            if (imgs.length === 1) {
                sliderEl.innerHTML = '<img src="' + imgs[0] + '" onerror="handleImgError(this)" style="width:100%;height:200px;object-fit:cover;display:block;direction:ltr;">';
                return;
            }
            new ImageSlider(sliderEl, imgs, false, true, 4000);
        });
        initLazyLoading();
        makeImagesZoomable();
    }, 100);
}

function changeCardImage(productId, imageUrl) {
    if (!imageUrl) return;
    const sliderEl = document.getElementById("pslider-" + productId);
    if (sliderEl) {
        const img = sliderEl.querySelector("img");
        if (img) img.src = "" + imageUrl;
    }
}

function selectCardSize(productId, size, price, element) {
    event.stopPropagation();
    const card = document.querySelector('.product-card[data-id="' + productId + '"]');
    if (card) {
        card.querySelectorAll(".size-square").forEach(s => {
            s.classList.remove("selected");
            s.style.background = "";
            s.style.color = "";
        });
        element.classList.add("selected");
        element.style.background = "#d4af37";
        element.style.color = "#3A0D28";
        const priceEl = card.querySelector(".product-price");
        if (priceEl) {
            const currencySymbol = currentLang === "fr" ? " DA" : " د.ج";
            priceEl.innerText = price + currencySymbol;
        }
    }
}

function shareProduct(id, name, price) {
    const url = window.location.origin + window.location.pathname + "?product=" + id;
    if (navigator.share) {
        navigator.share({
            title: name,
            text: t("price") + ": " + price,
            url: url
        });
    } else {
        navigator.clipboard.writeText(url);
        showNotification(currentLang === "fr" ? "Lien du produit copié" : "تم نسخ رابط الإكسسوار", "success");
    }
}

function orderNowProduct(productId) {
    addToCart(productId, 1);
    openCart();
}

function calculateProductPrice(product, selectedComponent, selectedSize) {
    let price = product.basePrice;
    if (selectedSize && selectedSize.price) {
        price = selectedSize.price;
    }
    if (selectedComponent) {
        const component = product.components?.find(c => c.nameAr === selectedComponent.nameAr);
        if (component) {
            if (selectedComponent.type === "separate") {
                price = component.price;
            } else if (selectedComponent.type === "without") {
                price = price - component.price;
            }
        }
    }
    return price < 0 ? 0 : price;
}

function addToCart(productId, quantity = 1, selectedComponent = null, selectedAddon = null) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) {
        showNotification("" + (currentLang === "fr" ? "Accessoire introuvable" : "الإكسسوار غير موجود"));
        return;
    }
    let finalPrice = product.basePrice;
    if (selectedSize && selectedSize.price) {
        finalPrice = product.basePrice + selectedSize.price;
    }
    let componentName = null;
    let addonChoice = null;
    let addonPrice = 0;
    let purchaseType = null;
    if (selectedComponent) {
        const component = product.components?.find(c => c.nameAr === selectedComponent.nameAr || c.nameFr === selectedComponent.nameFr);
        if (component) {
            componentName = currentLang === "ar" ? component.nameAr : component.nameFr;
            if (selectedComponent.type === "separate") {
                finalPrice = component.price;
                addonChoice = "with";
                addonPrice = component.price;
                purchaseType = "component";
            } else if (selectedComponent.type === "without") {
                finalPrice = product.basePrice - component.price;
                addonChoice = "without";
                addonPrice = component.price;
                purchaseType = "fullWithout";
            }
        }
    }
    if (selectedAddon) {
        addonChoice = selectedAddon.choice;
        addonPrice = selectedAddon.price || 0;
        componentName = selectedAddon.nameAr;
        if (addonChoice === "with") {
            finalPrice = addonPrice;
        } else if (addonChoice === "without") {
            finalPrice = product.basePrice - addonPrice;
        }
    }
    if (finalPrice < 0) finalPrice = 0;
    const existing = cart.find(i => i.productId === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            productId: productId,
            name: currentLang === "ar" ? product.nameAr || product.name : product.nameFr || product.name,
            quantity: quantity,
            unitPrice: finalPrice,
            basePrice: product.basePrice,
            selectedSize: selectedSize || null,
            selectedColor: selectedColor || null,
            selectedComponent: selectedComponent,
            purchaseType: purchaseType,
            customizationText: "",
            customizationExtra: 0,
            customizations: [],
            selectedAddon: selectedComponent ? {
                choice: addonChoice,
                nameAr: componentName,
                nameFr: componentName,
                price: addonPrice
            } : selectedAddon || null,
            addonCustomValue: "",
            componentName: componentName,
            isSeparate: addonChoice === "with"
        });
    }
    updateCartUI();
    showNotification(t("addedToCart"), "success");
}

function updateCartUI() {
    const cartList = document.getElementById("cart-items-list");
    const cartCount = document.getElementById("cart-count");
    const cartCountMobile = document.getElementById("cart-count-mobile");
    const cartSubtotal = document.getElementById("cart-subtotal");
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    if (cartCount) cartCount.innerText = totalItems;
    if (cartCountMobile) cartCountMobile.innerText = totalItems;
    if (!cart.length) {
        cartList.innerHTML = '<div style="text-align:center; padding:30px; color:rgba(249,234,241,0.5);">' + t("cartEmpty") + '</div>';
        if (cartSubtotal) cartSubtotal.innerText = "0";
        updateCartTotal();
        return;
    }
    cartList.innerHTML = cart.map((item, idx) => {
        let optionsHtml = "";
        if (item.selectedColor) {
            const colorHex = item.selectedColor.hexCode || "#D4AF37";
            const colorNameEsc = escapeHtml(item.selectedColor.name || "");
            const colorValueHtml = (colorHex === "custom")
                ? '<span style="color:var(--gold); font-weight:600;">حسب الطلب</span>'
                : '<span class="cart-color-swatch" style="display:inline-block; width:18px; height:18px; border-radius:50%; background-color:' + escapeHtml(colorHex) + '; border:2px solid ' + getSwatchBorderColor(colorHex) + '; vertical-align:middle; margin-inline-start:6px;" title="' + colorNameEsc + '"></span>';
            optionsHtml += '<div class="cart-option-line">\n            <div class="cart-option-badge color-badge">\n                <i class="fas fa-palette" style="margin-inline-end: 8px;"></i> ' + (currentLang === "fr" ? "Couleur" : "اللون") + ': ' + colorValueHtml + '\n            </div>\n        </div>';
        }
        if (item.selectedSize) {
            optionsHtml += '<div class="cart-option-line">\n            <div class="cart-option-badge size-badge">\n                <i class="fas fa-ruler" style="margin-inline-end: 8px;"></i> ' + (currentLang === "fr" ? "Taille" : "المقاس") + ': ' + (typeof translateSize === "function" && currentLang === "fr" ? translateSize(item.selectedSize.size, "fr") : item.selectedSize.size) + '\n            </div>\n        </div>';
        }
        if (item.selectedComponent && item.purchaseType === "component") {
            optionsHtml += '<div class="cart-option-line">\n            <div class="cart-option-badge component-badge">\n                <i class="fas fa-cubes" style="margin-inline-end: 8px;"></i> ' + (currentLang === "fr" ? "Composants" : "الأجزاء") + ': ' + item.selectedComponent.name + '\n            </div>\n        </div>';
        }
        if (item.selectedComponent && item.purchaseType === "fullWithout") {
            optionsHtml += '<div class="cart-option-line">\n            <div class="cart-option-badge component-badge">\n                ' + (currentLang === "fr" ? "Sans composant" : "بدون جزء") + ': ' + item.selectedComponent.name + '\n            </div>\n        </div>';
        }
        if (item.customizationText) {
            optionsHtml += '<div class="cart-option-line">\n            <div class="cart-option-badge customization-badge">\n                <i class="fas fa-edit" style="margin-inline-end: 8px;"></i>' + (currentLang === "fr" ? "Détails" : "التفاصيل") + ': ' + item.customizationText + '\n            </div>\n        </div>';
        }
        if (item.selectedAddon && item.selectedAddon.choice === "with") {
            optionsHtml += '<div class="cart-option-line">\n            <div class="cart-option-badge addon-badge">\n                ' + (currentLang === "fr" ? "Ajout" : "إضافة") + ': +' + item.selectedAddon.price + ' د.ج\n            </div>\n        </div>';
            if (item.addonCustomValue) {
                optionsHtml += '<div class="cart-option-line">\n                <div class="cart-option-badge addon-detail-badge">\n                    <i class="fas fa-file-alt" style="margin-inline-end: 8px;"></i>' + (currentLang === "fr" ? "Détails" : "التفاصيل") + ': ' + item.addonCustomValue + '\n                </div>\n            </div>';
            }
        }
        const totalPrice = item.unitPrice * item.quantity;
        return '\n        <div class="cart-item-card">\n            <div class="cart-item-name-line">\n                <span class="cart-item-name">' + item.name + '</span>\n            </div>\n            <div class="cart-item-price-line">\n                <span class="cart-item-total-price-label">' + (currentLang === "fr" ? "Total" : "الإجمالي") + ':</span>\n                <span class="cart-item-total-price">' + totalPrice + ' ' + (currentLang === "fr" ? "DA" : "د.ج") + '</span>\n            </div>\n            <div class="cart-item-options">\n                ' + (optionsHtml || '<div class="cart-no-options">—</div>') + '\n            </div>\n            <div class="cart-item-footer">\n                <div class="cart-item-actions">\n                    <select class="cart-qty-select" onchange="updateQuantityFromSelect(' + idx + ', this.value)" style="width:60px;border-radius:8px;border:1px solid #d4af37;background:rgba(58,13,40,0.6);color:#F9EAF1;text-align:center;font-size:1rem;cursor:pointer;font-family:\'UnifiedFont\',sans-serif;">\n                        <option value="1" ' + (item.quantity === 1 ? "selected" : "") + '>01</option>\n                        <option value="2" ' + (item.quantity === 2 ? "selected" : "") + '>02</option>\n                        <option value="3" ' + (item.quantity === 3 ? "selected" : "") + '>03</option>\n                        <option value="4" ' + (item.quantity === 4 ? "selected" : "") + '>04</option>\n                        <option value="5" ' + (item.quantity === 5 ? "selected" : "") + '>05</option>\n                    </select>\n                    <button class="cart-remove-btn" onclick="removeFromCart(' + idx + ')">\n                        <i class="fas fa-trash-alt"></i>\n                    </button>\n                </div>\n            </div>\n        </div>\n    ';
    }).join("");
    const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    if (cartSubtotal) cartSubtotal.innerText = subtotal;
    updateCartTotal();
}

function updateQuantityFromSelect(index, newQuantity) {
    const qty = parseInt(newQuantity);
    if (qty < 1 || qty > 5) return;
    cart[index].quantity = qty;
    updateCartUI();
}

function updateQuantity(index, delta) {
    const newQty = cart[index].quantity + delta;
    if (newQty < 1 || newQty > 5) {
        showNotification("الحد الأقصى 5 قطع", "error");
        return;
    }
    cart[index].quantity = newQty;
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
    showNotification(t("removedFromCart"), "info");
}

async function updateCartTotal() {
    const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const wilaya = document.getElementById("cust-wilaya")?.value;
    const shippingType = document.querySelector('input[name="shipping"]:checked')?.value;
    let shippingFee = 0;
    if (wilaya && shippingType) shippingFee = await getShippingFee(wilaya, shippingType);
    const total = subtotal + shippingFee;
    const el = document.getElementById("cart-total");
    const sfEl = document.getElementById("cart-shipping-fee");
    const subEl = document.getElementById("cart-subtotal");
    const currencySymbol = currentLang === "fr" ? " DA" : " د.ج";
    if (subEl) subEl.innerText = subtotal + currencySymbol;
    if (sfEl) sfEl.innerText = shippingFee + currencySymbol;
    if (el) el.innerText = total + currencySymbol;
}

function toggleCart() {
    document.getElementById("cart-panel").classList.toggle("open");
}

function openCart() {
    document.getElementById("cart-panel").classList.add("open");
}

let currentSelectedComponent = null;
let detailSlider = null;

function showProductDetail(productId) {
    const symbol = currentLang === "fr" ? " DA" : " د.ج";
    const product = allProducts.find(p => p._id === productId);
    if (!product) {
        showNotification("" + (currentLang === "fr" ? "Accessoire introuvable" : "الإكسسوار غير موجود"), "error");
        return;
    }
    currentProduct = product;
    selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
    selectedColor = product.colors?.[0] || null;
    selectedAddon = null;
    addonCustomValue = "";
    selectedComponent = null;
    customizationText = "";
    customizationExtra = 0;
    ratingValue = 0;
    currentSelectedComponent = null;
    if (detailSlider) {
        detailSlider._stopAuto();
    }
    detailSlider = null;
    const productIdClean = escapeHtml(product._id);
    const displayName = escapeHtml(currentLang === "ar" ? product.nameAr || product.name : product.nameFr || product.name);
    const displayDesc = escapeHtml(currentLang === "ar" ? product.descriptionAr || product.description : product.descriptionFr || product.description);
    const basePrice = product.basePrice || 0;
    const basePriceDisplay = escapeHtml(String(basePrice));
    let allImages = [];
    if (product.mainImage && product.mainImage !== "") allImages.push(product.mainImage);
    if (product.images && product.images.length) {
        product.images.forEach(img => {
            if (img && img !== "" && !allImages.includes(img)) allImages.push(img);
        });
    }
    if (allImages.length === 0) allImages = [PLACEHOLDER_IMG];
    const allImagesClean = allImages.map(img => escapeHtml(img));
    let colorsHtml = "";
    if (product.colors && product.colors.length > 0) {
        colorsHtml = '<div class="section-title" style="color:#d4af37;margin:20px 0 10px;"><i class="fas fa-palette" style="margin-inline-end: 8px;"></i>' + escapeHtml(t("colors")) + '</div>\n        <div style="display:flex;gap:15px;flex-wrap:wrap;margin-bottom:20px;">\n            ' + product.colors.map(c => {
            const hexCode = escapeHtml(c.hexCode || "#D4AF37");
            const colorName = escapeHtml(c.name || "");
            const colorImage = escapeHtml(c.image || "");
            if (hexCode === "custom") {
                return '<div class="detail-color-swatch custom-order-swatch" style="width: auto; min-width: 50px; height: 50px; padding: 0 10px; border-radius: 14px; border: 2px solid var(--gold); cursor: pointer; transition: 0.2s; display:flex; align-items:center; justify-content:center; font-size: 0.75rem; color: var(--gold); background: rgba(212,175,55,0.12); white-space:nowrap;" onclick="selectDetailColor(\'custom\',\'' + colorName + '\',\'' + colorImage + '\')" title="' + colorName + '">حسب الطلب</div>';
            }
            return '<div class="detail-color-swatch" style="background-color: ' + hexCode + '; width: 50px; height: 50px; border-radius: 50%; border: 3px solid ' + getSwatchBorderColor(hexCode) + '; cursor: pointer; transition: 0.2s;" onclick="selectDetailColor(\'' + hexCode + '\',\'' + colorName + '\',\'' + colorImage + '\')" title="' + colorName + '"></div>';
        }).join("") + '\n        </div>';
    } else {
        colorsHtml = "";
    }
    let sizesHtml = "";
    if (product.sizes && product.sizes.length > 0) {
        const sizeNoteText = currentLang === "fr" ? "Les tailles sont basées sur la longueur des cheveux" : "المقاسات حسب طول الشعر";
        sizesHtml = '\n            <div class="section-title">' + escapeHtml(t("sizes")) + '</div>\n            <div class="size-note">\n                <i class="fas fa-info-circle"></i>\n                <span>' + escapeHtml(sizeNoteText) + '</span>\n            </div>\n            <div class="detail-size-options">\n                ' + product.sizes.map(s => {
            const sizeName = escapeHtml(currentLang === "fr" ? translateSize(s.size, "fr") : s.size);
            const sizePrice = s.price || 0;
            return '<div class="detail-size-option" onclick="selectDetailSize(\'' + escapeHtml(s.size) + '\', ' + sizePrice + ')">\n                        <span class="size-name">' + sizeName + '</span>\n                        <span class="size-price">' + sizePrice + ' ' + (currentLang === "fr" ? "DA" : "د.ج") + '</span>\n                    </div>';
        }).join("") + '\n            </div>\n        ';
    }
    let componentsHtml = "";
    if (product.components && product.components.length > 0) {
        const componentSettings = product.componentSettings || [];
        const currencySymbol = currentLang === "fr" ? " DA" : " د.ج";
        let optionsHtml = '<div class="component-option purchase-option selected" data-type="full" data-price="' + basePrice + '" data-component-index="-1" onclick="selectPurchaseOption(this, \'full\', -1, ' + basePrice + ')">\n            <span class="component-name">' + escapeHtml(t("fullProduct")) + '</span>\n            <span class="component-price">' + basePrice + currencySymbol + '</span>\n        </div>';
        product.components.forEach((comp, idx) => {
            const setting = componentSettings.find(s => s.componentIndex === idx);
            const compName = escapeHtml(currentLang === "fr" ? comp.nameFr || comp.nameAr : comp.nameAr || comp.name);
            const compPrice = comp.price || 0;
            if (setting && setting.sellSeparately) {
                optionsHtml += '<div class="component-option purchase-option" data-type="component" data-price="' + compPrice + '" data-component-index="' + idx + '" onclick="selectPurchaseOption(this, \'component\', ' + idx + ', ' + compPrice + ')">\n                    <span class="component-name">' + compName + '</span>\n                    <span class="component-price">' + compPrice + currencySymbol + '</span>\n                </div>';
            }
        });
        product.components.forEach((comp, idx) => {
            const setting = componentSettings.find(s => s.componentIndex === idx);
            const compName = escapeHtml(currentLang === "fr" ? comp.nameFr || comp.nameAr : comp.nameAr || comp.name);
            const compPrice = comp.price || 0;
            if (setting && setting.allowFullWithout) {
                const newPrice = basePrice - compPrice;
                optionsHtml += '<div class="component-option purchase-option" data-type="fullWithout" data-price="' + newPrice + '" data-component-index="' + idx + '" onclick="selectPurchaseOption(this, \'fullWithout\', ' + idx + ', ' + newPrice + ')">\n                    <span class="component-name">' + escapeHtml(t("fullProduct")) + ' ' + escapeHtml(t("withoutComponent")) + ' ' + compName + '</span>\n                    <span class="component-price">' + newPrice + currencySymbol + '</span>\n                </div>';
            }
        });
        componentsHtml = '<div class="detail-components-section">\n            <div class="section-title" style="color:#d4af37;margin:20px 0 10px;">' + escapeHtml(t("choosePurchaseType")) + '</div>\n            <div class="components-options" id="purchase-options-container">\n                ' + optionsHtml + '\n            </div>\n        </div>';
    }
    let customizationHtml = "";
    if (product.customization && product.customization.enabled) {
        const labelText = escapeHtml(currentLang === "ar" ? product.customization.labelAr : product.customization.labelFr || product.customization.labelAr);
        const extraPrice = product.customization.extraPrice || 0;
        customizationHtml = '<div class="section-title" style="color:#d4af37;margin:20px 0 10px;"><i class="fas fa-edit" style="margin-inline-end: 8px;"></i>' + (labelText || escapeHtml(t("customizationLabel"))) + '</div>\n            <input type="text" id="customization-input" class="info-input" placeholder="' + escapeHtml(t("customizationPlaceholder")) + '" oninput="updateCustomizationPrice(this.value,' + extraPrice + ')">\n            <small style="color:#d4af37;">' + escapeHtml(t("customizationExtra")) + ' ' + extraPrice + ' د.ج</small>';
    }
    let addonsHtml = "";
    if (product.addons && product.addons.length > 0) {
        const addon = product.addons[0];
        const addonName = escapeHtml(currentLang === "ar" ? addon.nameAr : addon.nameFr || addon.nameAr);
        const addonPrice = addon.price || 0;
        const addonId = escapeHtml(addon._id);
        addonsHtml = '<div style="margin:15px 0;padding:15px;background:rgba(58,13,40,0.4);border-radius:10px;border:1px solid rgba(212,175,55,0.2);">\n            <div class="section-title" style="color:#d4af37;margin-bottom:10px;">' + escapeHtml(t("availableWith")) + ' ' + addonName + ' (+' + addonPrice + ' د.ج)</div>\n            <label style="display:block;margin:10px 0;color:rgba(249,234,241,0.85);">\n                <input type="radio" name="addon-choice" value="without" onchange="selectAddon(\'without\',\'' + addonId + '\',0,false)"> ' + escapeHtml(t("withoutAddon")) + ' ' + addonName + '\n            </label>\n            <label style="display:block;margin:10px 0;color:rgba(249,234,241,0.85);">\n                <input type="radio" name="addon-choice" value="with" onchange="selectAddon(\'with\',\'' + addonId + '\',' + addonPrice + ',' + addon.hasCustomField + ')"> ' + escapeHtml(t("withAddon")) + ' ' + addonName + ' (+' + addonPrice + ' د.ج)\n            </label>\n            <div id="custom-field-' + addonId + '" style="display:none;margin-top:10px;">\n                <input type="text" class="info-input" placeholder="' + escapeHtml(addon.hasCustomField ? currentLang === "ar" ? addon.customFieldLabelAr : addon.customFieldLabelFr || addon.customFieldLabelAr : t("details")) + '" onchange="updateAddonCustomValue(\'' + addonId + '\',this.value)">\n            </div>\n        </div>';
    }
    const approvedReviews = product.reviews ? product.reviews.filter(r => r.approved !== false) : [];
    const reviewsHtml = approvedReviews.length > 0 ? approvedReviews.map(r => {
        const customerName = escapeHtml(r.customerName || (currentLang === "fr" ? "Client" : "زبون"));
        const comment = escapeHtml(r.comment || "");
        const rating = r.rating || 0;
        const date = new Date(r.date).toLocaleDateString(currentLang === "fr" ? "fr-FR" : "ar-DZ");
        return '<div style="background:rgba(58,13,40,0.4);border-radius:10px;padding:15px;margin-bottom:10px;border:1px solid rgba(212,175,55,0.15);">\n                <div style="display:flex;justify-content:space-between;margin-bottom:10px;">\n                    <span style="color:#d4af37;font-weight:bold;">' + customerName + '</span>\n                    <span style="color:#ffc107;"><i class="fas fa-star" style="margin-inline-end: 8px;"></i>' + rating + '/5</span>\n                </div>\n                <div class="review-comment" style="color:rgba(249,234,241,0.85);">' + comment + '</div>\n                <div style="font-size:0.7rem;color:rgba(249,234,241,0.4);margin-top:8px;">' + escapeHtml(date) + '</div>\n            </div>';
    }).join("") : '<div style="text-align:center;padding:20px;color:rgba(249,234,241,0.4);">' + escapeHtml(t("noReviewsYet")) + '</div>';
    const detailHtml = '\n<div onclick="hideProductDetail(); scrollToHome();" style="display:inline-block; margin:20px 25px 10px; color: var(--gold); cursor:pointer; font-weight:bold; padding:10px 20px; border: 1px solid var(--gold); border-radius:30px; background: rgba(212, 175, 55, 0.1); transition:0.3s ease; backdrop-filter: blur(5px);" onmouseover="this.style.background=\'var(--gold)\'; this.style.color=\'#1A0F14\'; this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 5px 15px rgba(212,175,55,0.4)\';" onmouseout="this.style.background=\'rgba(212, 175, 55, 0.1)\'; this.style.color=\'var(--gold)\'; this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'none\';">\n    <i class="fas fa-arrow-' + (currentLang === "fr" ? "left" : "right") + '"></i> ' + escapeHtml(t("")) + '\n</div>\n    <div class="product-detail-main" style="display:grid;grid-template-columns:1fr 1fr;gap:40px;padding:0 25px 25px;">\n        <div class="product-detail-gallery">\n            <div id="detail-slider-container" style="width:100%;"></div>\n            <div class="thumbnail-list" id="detail-thumbnail-list">\n                ' + allImagesClean.map((img, i) => '\n                    <img class="thumbnail ' + (i === 0 ? "active" : "") + '" src="' + img + '" onerror="handleImgError(this)" onclick="handleThumbnailClick(' + i + ', this)" style="border-color:' + (i === 0 ? "#d4af37" : "transparent") + ';">').join("") + '\n            </div>\n        </div>\n        <div class="product-detail-info" style="background:rgba(74,26,53,0.92);backdrop-filter:blur(10px);border-radius:20px;padding:30px;">\n            <h1 style="color:#d4af37;font-size:1.8rem;margin-bottom:15px;">' + displayName + '</h1>\n            <div id="detail-price" style="...">' + basePriceDisplay + symbol + '</div>\n            <div style="color:rgba(249,234,241,0.9);line-height:1.8;margin-bottom:20px;background:rgba(58,13,40,0.4);padding:15px;border-radius:15px;">\n                <strong style="color:#d4af37;"><i class="fas fa-edit" style="margin-inline-end: 8px;"></i>' + escapeHtml(t("description")) + ':</strong><br>\n                ' + (displayDesc || (currentLang === "fr" ? "Aucune description disponible" : "لا يوجد وصف للمنتج")) + '\n            </div>\n            ' + colorsHtml + '\n            ' + sizesHtml + '\n            ' + componentsHtml + '\n            ' + customizationHtml + '\n            ' + addonsHtml + '\n            <div style="display:flex;align-items:center;gap:15px;margin:20px 0;">\n                <label style="color:#d4af37;"><i class="fas fa-boxes" style="margin-inline-end: 8px;"></i> ' + escapeHtml(t("quantity")) + ':</label>\n                <div style="display:flex;align-items:center;gap:8px;">\n                    <select id="detail-quantity" style="width:60px;border-radius:8px;border:1px solid #d4af37;background:rgba(58,13,40,0.6);color:#F9EAF1;text-align:center;font-size:1rem;cursor:pointer;">\n                        <option value="1">01</option>\n                        <option value="2">02</option>\n                        <option value="3">03</option>\n                        <option value="4">04</option>\n                        <option value="5">05</option>\n                    </select>\n                </div>\n            </div>\n            <button class="btn-add-cart-detail" onclick="addToCartFromDetail()" style="background:linear-gradient(135deg,#d4af37,#b8942e);color:#3A0D28;border:none;padding:15px;border-radius:50px;width:100%;font-size:1.1rem;font-weight:bold;cursor:pointer;margin-bottom:10px;">\n                <i class="fas fa-cart-plus" style="margin-inline-end: 8px;"></i>' + escapeHtml(t("addToCart")) + '\n            </button>\n            <button class="btn-order-now-detail" onclick="orderNowFromDetail()" style="background:rgba(212,175,55,0.2);border:1px solid #d4af37;color:#d4af37;padding:15px;border-radius:50px;width:100%;font-size:1.1rem;font-weight:bold;cursor:pointer;margin-bottom:10px;">\n                <i class="fas fa-rocket" style="margin-inline-end: 8px;"></i>' + escapeHtml(t("orderNow")) + '\n            </button>\n            <div style="display: flex; gap: 10px; margin-top: 10px;">\n                <button onclick="shareProduct(\'' + productIdClean + '\',\'' + displayName + '\',' + basePrice + ')" style="background:transparent;border:1px solid #d4af37;color:#d4af37;padding:10px;border-radius:50px;flex:1;cursor:pointer;">\n                    <i class="fas fa-share-alt" style="margin-inline-end: 8px;"></i>' + escapeHtml(t("share")) + '\n                </button>\n                <button onclick="toggleFavoriteFromDetail(\'' + productIdClean + '\')" style="background:transparent;border:1px solid #d4af37;color:#d4af37;padding:10px;border-radius:50px;flex:1;cursor:pointer;">\n                    <i class="fas fa-heart" style="margin-inline-end: 8px;"></i>' + escapeHtml(t("favorites")) + '\n                </button>\n            </div>\n        </div>\n    </div>\n    <div class="reviews-section" id="reviews-section" style="margin:40px 25px;padding:30px;background:rgba(74,26,53,0.6);border-radius:20px;">\n        <h3 style="color:#d4af37;font-size:1.5rem;margin-bottom:20px;text-align:center;"><i class="fas fa-star" style="margin-inline-end: 8px;"></i>' + escapeHtml(t("customerReviews")) + '</h3>\n        <div id="detail-reviews-list">' + reviewsHtml + '</div>\n        <div style="background:rgba(58,13,40,0.5);border-radius:15px;padding:20px;margin-top:30px;border:1px solid rgba(212,175,55,0.15);">\n            <h4 style="color:#d4af37;margin-bottom:15px;"><i class="fas fa-edit" style="margin-inline-end: 8px;"></i>' + escapeHtml(t("addYourReview")) + '</h4>\n            <div id="detail-rating-stars" style="display:flex;gap:10px;margin:15px 0;">\n                ' + [1, 2, 3, 4, 5].map(s => '<span class="star" data-rating="' + s + '" onclick="setDetailRating(' + s + ')" style="font-size:2rem;cursor:pointer;color:rgba(249,234,241,0.3);">★</span>').join("") + '\n            </div>\n            <textarea id="detail-review-comment" rows="3" placeholder="' + escapeHtml(t("yourComment")) + '" style="width:100%;padding:12px;border-radius:10px;border:1px solid rgba(212,175,55,0.3);background:rgba(58,13,40,0.6);color:#F9EAF1;margin:10px 0;resize:vertical;font-family:\'UnifiedFont\',sans-serif;"></textarea>\n            <input type="text" id="detail-review-name" placeholder="' + escapeHtml(t("yourName")) + '" class="info-input" style="margin-top:10px;">\n            <div style="background:rgba(255,152,0,0.15);border-right:3px solid #ff9800;padding:8px;margin:10px 0;border-radius:8px;font-size:0.8rem;color:#ff9800;">\n                <i class="fas fa-hourglass-half" style="margin-inline-end: 8px;"></i>' + escapeHtml(t("reviewPending")) + '\n            </div>\n            <button onclick="submitDetailReview()" style="background:linear-gradient(135deg,#d4af37,#b8942e);color:#3A0D28;border:none;padding:12px;border-radius:10px;width:100%;margin-top:10px;font-weight:bold;cursor:pointer;">\n                ' + escapeHtml(t("submitReview")) + '\n            </button>\n        </div>\n    </div>';
    document.getElementById("products-container").style.display = "none";
    const detailContainer = document.getElementById("product-detail-container");
    detailContainer.style.display = "block";
    detailContainer.innerHTML = detailHtml;
    updateDetailStarsDisplay();
    const heroEl = document.getElementById("hero-slider");
    if (heroEl) {
        heroEl.style.display = "none";
    }
    const sliderContainer = document.getElementById("detail-slider-container");
    if (sliderContainer) {
        const imageUrls = allImages.map(img => "" + img);
        detailSlider = new ImageSlider(sliderContainer, imageUrls, true, true, 5000);
        makeImagesZoomable();
    }
}

function handleThumbnailClick(index, el) {
    if (detailSlider) {
        detailSlider.goTo(index);
    }
    document.querySelectorAll("#detail-thumbnail-list .thumbnail").forEach((th, i) => {
        th.classList.toggle("active", i === index);
        th.style.borderColor = i === index ? "#d4af37" : "transparent";
    });
}

function hideProductDetail() {
    document.getElementById("products-container").style.display = "grid";
    const dc = document.getElementById("product-detail-container");
    dc.style.display = "none";
    dc.innerHTML = "";
    if (detailSlider) {
        detailSlider._stopAuto();
        detailSlider = null;
    }
    const heroEl = document.getElementById("hero-slider");
    if (heroEl) {
        heroEl.style.display = "";
        if (heroSwiper) {
            heroSwiper.update();
        }
    }
}

(function initProductDetailSwipeClose() {
    let touchStartY = null;
    let touchCurrentY = null;
    let isTrackingSwipe = false;
    const SWIPE_CLOSE_THRESHOLD = 90;
    document.addEventListener("touchstart", function(e) {
        if (window.innerWidth > 768) return;
        const dc = document.getElementById("product-detail-container");
        if (!dc || dc.style.display === "none") return;
        if (window.scrollY <= 0 && e.touches && e.touches.length === 1) {
            touchStartY = e.touches[0].clientY;
            touchCurrentY = touchStartY;
            isTrackingSwipe = true;
        } else {
            isTrackingSwipe = false;
        }
    }, {
        passive: true
    });
    document.addEventListener("touchmove", function(e) {
        if (!isTrackingSwipe || touchStartY === null) return;
        const dc = document.getElementById("product-detail-container");
        if (!dc || dc.style.display === "none") return;
        touchCurrentY = e.touches[0].clientY;
        const deltaY = touchCurrentY - touchStartY;
        if (deltaY > 0 && window.scrollY <= 0) {
            const drag = Math.min(deltaY, 220);
            dc.style.transition = "none";
            dc.style.transform = "translateY(" + drag + "px)";
            dc.style.opacity = String(1 - drag / 320);
        } else {
            dc.style.transform = "";
            dc.style.opacity = "";
            isTrackingSwipe = false;
        }
    }, {
        passive: true
    });
    document.addEventListener("touchend", function() {
        const dc = document.getElementById("product-detail-container");
        if (!isTrackingSwipe || touchStartY === null || touchCurrentY === null || !dc) {
            touchStartY = null;
            touchCurrentY = null;
            isTrackingSwipe = false;
            return;
        }
        const deltaY = touchCurrentY - touchStartY;
        dc.style.transition = "transform 0.3s ease, opacity 0.3s ease";
        if (deltaY > SWIPE_CLOSE_THRESHOLD) {
            dc.style.transform = "translateY(100%)";
            dc.style.opacity = "0";
            setTimeout(() => {
                dc.style.transition = "";
                dc.style.transform = "";
                dc.style.opacity = "";
                hideProductDetail();
                scrollToHome();
            }, 280);
        } else {
            dc.style.transform = "";
            dc.style.opacity = "";
        }
        touchStartY = null;
        touchCurrentY = null;
        isTrackingSwipe = false;
    });
})();

function selectDetailColor(hexCode, name, imageUrl) {
    selectedColor = {
        hexCode: hexCode,
        name: name
    };
    document.querySelectorAll(".detail-color-swatch").forEach(el => {
        el.style.border = "2px solid var(--gold)";
        el.classList.remove("selected");
    });
    
    const currentSwatch = event.currentTarget;
    currentSwatch.style.border = "3px solid white";
    currentSwatch.classList.add("selected");
    
    if (hexCode === "custom") {
        const displayName = currentLang === "fr" ? "Sur mesure" : "حسب الطلب";
    }
    
    if (imageUrl && imageUrl !== "" && detailSlider) {
        const imgUrl = "" + imageUrl;
        const idx = detailSlider.images.indexOf(imgUrl);
        if (idx >= 0) detailSlider.goTo(idx);
    }
    updateFinalPrice();
}

function selectDetailSize(size, price) {
    selectedSize = {
        size: size,
        price: price
    };
    document.querySelectorAll(".detail-size-option").forEach(el => {
        const sizeSpan = el.querySelector(".size-name");
        const isSel = sizeSpan && sizeSpan.innerText === size;
        if (isSel) {
            el.classList.add("selected");
        } else {
            el.classList.remove("selected");
        }
    });
    updateFinalPrice();
}

function updateCustomizationPrice(value, extraPrice) {
    customizationText = value;
    customizationExtra = value && value.trim() !== "" ? extraPrice : 0;
    updateFinalPrice();
}

function selectAddon(choice, addonId, addonPrice, hasCustomField) {
    selectedAddon = {
        id: addonId,
        choice: choice,
        price: addonPrice,
        hasCustomField: hasCustomField
    };
    const customField = document.getElementById("custom-field-" + addonId);
    if (customField) customField.style.display = choice === "with" && hasCustomField ? "block" : "none";
    updateFinalPrice();
}

function updateAddonCustomValue(addonId, value) {
    addonCustomValue = value;
}

function updateFinalPrice() {
    const priceEl = document.getElementById("detail-price");
    if (!priceEl || !currentProduct) return;
    let base = selectedSize?.price || currentProduct.basePrice || 0;
    let addon = selectedAddon?.choice === "with" ? selectedAddon.price || 0 : 0;
    let comp = currentSelectedComponent ? currentSelectedComponent.price : base;
    let finalPrice = comp + addon + (customizationExtra || 0);
    const currencySymbol = currentLang === "fr" ? " DA" : " د.ج";
    priceEl.innerText = finalPrice + currencySymbol;
    currentFinalPrice = finalPrice;
    priceEl.classList.add("price-blink");
    setTimeout(() => priceEl.classList.remove("price-blink"), 500);
}

function setDetailRating(rating) {
    ratingValue = rating;
    updateDetailStarsDisplay();
}

function updateDetailStarsDisplay() {
    document.querySelectorAll("#detail-rating-stars .star").forEach((star, index) => {
        star.style.color = index < ratingValue ? "#ffc107" : "rgba(249,234,241,0.3)";
    });
}

async function submitDetailReview() {
    const comment = document.getElementById("detail-review-comment")?.value;
    const customerName = document.getElementById("detail-review-name")?.value || (currentLang === "fr" ? "Client" : "زبون");
    const cleanComment = sanitizeText(comment);
    const cleanCustomerName = sanitizeText(customerName);
    const errorComment = currentLang === "fr" ? "Veuillez écrire votre commentaire" : "الرجاء كتابة تعليقك";
    const errorRating = currentLang === "fr" ? "Veuillez choisir une note" : "الرجاء اختيار تقييم";
    if (!cleanComment || cleanComment.trim() === "") {
        showNotification(errorComment, "error");
        return;
    }
    if (ratingValue === 0) {
        showNotification(errorRating, "error");
        return;
    }
    if (!currentProduct || !currentProduct._id) {
        showNotification(currentLang === "fr" ? "Accessoire non trouvé" : "الإكسسوار غير موجود", "error");
        return;
    }
    try {
        const res = await fetch(API_URL + "/" + currentProduct._id + "/review", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rating: ratingValue,
                comment: cleanComment,
                customerName: cleanCustomerName || (currentLang === "fr" ? "Client" : "زبون"),
                approved: false
            })
        });
        if (res.ok) {
            const successMsg = currentLang === "fr" ? "Votre avis a été ajouté ! Il sera publié après vérification" : "تم إضافة تقييمك! سيتم نشره بعد المراجعة";
            showNotification(successMsg, "success");
            ratingValue = 0;
            document.getElementById("detail-review-comment").value = "";
            document.getElementById("detail-review-name").value = "";
            updateDetailStarsDisplay();
        } else {
            const errorData = await res.json().catch(() => ({}));
            const errorMsg = currentLang === "fr" ? "Échec de l'ajout: " + (errorData.error || "Erreur inconnue") : "فشل الإضافة: " + (errorData.error || "خطأ غير معروف");
            showNotification(errorMsg, "error");
        }
    } catch (e) {
        console.error("خطأ في إضافة التقييم:", e);
        showNotification(t("connectionError"), "error");
    }
}

function addToCartFromDetail() {
    const quantity = parseInt(document.getElementById("detail-quantity")?.value || 1);
    const customizationValue = document.getElementById("customization-input")?.value || "";
    let finalPrice = currentFinalPrice || currentProduct.basePrice;
    let productDisplayName = currentLang === "ar" ? currentProduct.nameAr || currentProduct.name : currentProduct.nameFr || currentProduct.name;
    if (currentPurchaseType === "component" && currentSelectedComponent) {
        productDisplayName = currentLang === "ar" ? currentProduct.nameAr || currentProduct.name + " (" + currentSelectedComponent.name + " فقط)" : currentProduct.nameFr || currentProduct.name + " (" + currentSelectedComponent.name + " seulement)";
    } else if (currentPurchaseType === "fullWithout" && currentSelectedComponent) {
        productDisplayName = currentLang === "ar" ? currentProduct.nameAr || currentProduct.name + " (كامل بدون " + currentSelectedComponent.name + ")" : currentProduct.nameFr || currentProduct.name + " (complet sans " + currentSelectedComponent.name + ")";
    } else {
        productDisplayName = currentLang === "ar" ? currentProduct.nameAr || currentProduct.name + " (كامل)" : currentProduct.nameFr || currentProduct.name + " (complet)";
    }
    const cartItem = {
        productId: currentProduct._id,
        productNameAr: currentProduct.nameAr || currentProduct.name,
        productNameFr: currentProduct.nameFr || currentProduct.name,
        name: productDisplayName,
        quantity: quantity,
        unitPrice: finalPrice,
        selectedSize: selectedSize || null,
        selectedColor: selectedColor || null,
        selectedComponent: currentSelectedComponent || null,
        purchaseType: currentPurchaseType,
        selectedComponentIndex: currentComponentIndex,
        customizationText: customizationValue,
        customizationExtra: customizationExtra || 0,
        selectedAddon: selectedAddon || null,
        addonCustomValue: addonCustomValue || ""
    };
    const existingIndex = cart.findIndex(i => i.productId === currentProduct._id && i.selectedSize?.size === selectedSize?.size && i.selectedColor?.hexCode === selectedColor?.hexCode && i.selectedComponent?.index === currentSelectedComponent?.index && i.customizationText === customizationValue);
    if (existingIndex !== -1) cart[existingIndex].quantity += quantity;
    else cart.push(cartItem);
    updateCartUI();
    showNotification(t("addedToCart"), "success");
}

function orderNowFromDetail() {
    addToCartFromDetail();
    openCart();
}

async function loadProducts() {
    delete currentFilter.category;
    currentFilter.category = "all";
    try {
        let params = new URLSearchParams();
        if (currentFilter.sort !== "default") params.append("sort", currentFilter.sort);
        if (currentFilter.category !== "all") params.append("category", currentFilter.category);
        if (currentFilter.minPrice > 0) params.append("minPrice", currentFilter.minPrice);
        if (currentFilter.maxPrice !== Infinity) params.append("maxPrice", currentFilter.maxPrice);
        const res = await fetch(API_URL + "/filter?" + params);
        const data = await res.json();
        allProducts = data.products || [];
        window.productsDisplayedOnce = false;
        displayProducts(allProducts);
    } catch (error) {
        console.error("خطأ:", error);
        const container = document.getElementById("products-container");
        if (container) {
            container.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:50px;color:#ff6b9d;">\n                    ' + (currentLang === "fr" ? "Impossible de se connecter au serveur" : "لا يمكن الاتصال بالخادم") + '<br>\n                    <small style="color:#d4af37;">' + (currentLang === "fr" ? "Assurez-vous que le serveur fonctionne sur le port 5000" : "تأكد من تشغيل الخادم على المنفذ 5000") + '</small>\n                </div>';
        }
    }
}

function openFilterModal() {
    document.getElementById("filter-modal").classList.add("open");
    document.getElementById("filter-overlay").classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeFilterModal() {
    document.getElementById("filter-modal").classList.remove("open");
    document.getElementById("filter-overlay").classList.remove("open");
    document.body.style.overflow = "";
}

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeFilterModal();
});

function applyFilter() {
    const category = document.getElementById("filter-category")?.value || "all";
    const sort = document.getElementById("filter-sort")?.value || "default";
    const minPrice = Number(document.getElementById("filter-min")?.value) || 0;
    const maxPrice = Number(document.getElementById("filter-max")?.value) || Infinity;
    currentFilter = {
        category: category,
        sort: sort,
        minPrice: minPrice,
        maxPrice: maxPrice
    };
    filterProducts(category, sort, minPrice, maxPrice);
    closeFilterModal();
}

function resetFilter() {
    currentFilter = {
        sort: "default",
        category: "all",
        minPrice: 0,
        maxPrice: Infinity
    };
    document.getElementById("filter-category").value = "all";
    document.getElementById("filter-sort").value = "default";
    document.getElementById("filter-min").value = "";
    document.getElementById("filter-max").value = "";
    window.productsDisplayedOnce = false;
    loadProducts();
    closeFilterModal();
}

function filterProducts(category, sort, minPrice, maxPrice) {
    let filtered = [...allProducts];
    if (category !== "all") filtered = filtered.filter(p => p.category === category);
    filtered = filtered.filter(p => p.basePrice >= minPrice && p.basePrice <= maxPrice);
    if (sort === "price_asc") filtered.sort((a, b) => a.basePrice - b.basePrice);
    else if (sort === "price_desc") filtered.sort((a, b) => b.basePrice - a.basePrice);
    window.productsDisplayedOnce = false;
    displayProducts(filtered);
}

function setupSearch() {
    const searchInput = document.getElementById("search-input");
    const searchInputMobile = document.getElementById("search-input-mobile");
    const resultsDiv = document.getElementById("search-results");
    const resultsDivMobile = document.getElementById("search-results-mobile");
    async function handleSearch(e) {
        const query = e.target.value.trim();
        const targetResults = e.target.id === "search-input" ? resultsDiv : resultsDivMobile;
        if (query.length < 2) {
            if (targetResults) targetResults.style.display = "none";
            return;
        }
        try {
            const res = await fetch(API_URL + "/search?q=" + encodeURIComponent(query));
            const data = await res.json();
            if (data.products && data.products.length > 0) {
                const html = data.products.map(p => {
                    const displayName = currentLang === "ar" ? p.nameAr || p.name : p.nameFr || p.name;
                    const imgSrc = p.mainImage ? "" + p.mainImage : PLACEHOLDER_IMG;
                    return '<div class="search-result-item" onclick="showProductDetail(\'' + p._id + '\')">\n                            <img class="search-result-img" src="' + imgSrc + '" onerror="handleImgError(this)">\n                            <div style="flex:1;">\n                                <strong style="color:#d4af37;">' + displayName + '</strong><br>\n                                <span style="color:#E91E63;">' + p.basePrice + ' د.ج</span>\n                            </div>\n                        </div>';
                }).join("");
                targetResults.innerHTML = html;
                targetResults.style.display = "block";
            } else {
                targetResults.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(249,234,241,0.5);">' + t("noResults") + '</div>';
                targetResults.style.display = "block";
            }
        } catch (error) {
            console.error(error);
        }
    }
    if (searchInput) searchInput.addEventListener("input", handleSearch);
    if (searchInputMobile) searchInputMobile.addEventListener("input", handleSearch);
    document.addEventListener("click", e => {
        if (!e.target.closest(".search-container")) {
            if (resultsDiv) resultsDiv.style.display = "none";
            if (resultsDivMobile) resultsDivMobile.style.display = "none";
        }
    });
}

async function submitOrder() {
    if (!cart.length) {
        alert(t("cartEmptyError"));
        return;
    }
    const name = sanitizeText(document.getElementById("cust-name")?.value || "");
    const phone = document.getElementById("cust-phone")?.value || "";
    const wilaya = sanitizeText(document.getElementById("cust-wilaya")?.value || "");
    const commune = sanitizeText(document.getElementById("cust-commune")?.value || "");
    const notes = sanitizeText(document.getElementById("cust-notes")?.value || "");
    if (!name || !phone || !wilaya || !commune) {
        alert(t("fillRequired"));
        return;
    }
    if (!validatePhone(phone)) {
        alert(t("invalidPhone"));
        document.getElementById("cust-phone").focus();
        return;
    }
    const shippingType = document.querySelector('input[name="shipping"]:checked')?.value || "home";
    if (!shippingRates.length) {
        await loadShippingRates();
    }
    let shippingFee = 0;
    const rate = shippingRates.find(r => r.wilayaName === wilaya);
    if (rate) {
        shippingFee = shippingType === "office" ? rate.officePrice : rate.homePrice;
    } else {
        shippingFee = shippingType === "office" ? 400 : 1000;
    }
    const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const totalAmount = subtotal + shippingFee;
    const orderItems = cart.map(i => {
        let componentInfo = null;
        let additionalPartsText = "";
        if (i.selectedComponent) {
            const compNameAr = sanitizeText(i.selectedComponent.nameAr || i.selectedComponent.name || "");
            const compNameFr = sanitizeText(i.selectedComponent.nameFr || i.selectedComponent.name || "");
            componentInfo = {
                index: i.selectedComponent.index || 0,
                nameAr: compNameAr,
                nameFr: compNameFr,
                price: i.selectedComponent.price || 0,
                type: i.purchaseType === "component" ? "separate" : i.purchaseType === "fullWithout" ? "without" : "separate"
            };
            if (i.purchaseType === "component" || i.purchaseType === "separate") {
                additionalPartsText = compNameAr;
            } else if (i.purchaseType === "fullWithout") {
                additionalPartsText = "الإكسسوار كامل بدون " + compNameAr;
            }
        }
        const productNameAr = sanitizeText(i.productNameAr || i.name || "");
        const productNameFr = sanitizeText(i.productNameFr || i.name || "");
        const itemName = sanitizeText(i.name || "");
        const customizationText = sanitizeText(i.customizationText || "");
        const addonCustomValue = sanitizeText(i.addonCustomValue || "");
        return {
            productId: i.productId,
            productNameAr: productNameAr,
            productNameFr: productNameFr,
            name: itemName,
            quantity: i.quantity || 1,
            unitPrice: i.unitPrice || 0,
            basePrice: i.basePrice || 0,
            selectedColor: i.selectedColor || null,
            selectedSize: i.selectedSize || null,
            selectedComponent: componentInfo,
            additionalPartsText: additionalPartsText,
            purchaseType: i.purchaseType || "full",
            customizationText: customizationText,
            customizationExtra: i.customizationExtra || 0,
            selectedAddon: i.selectedAddon || null,
            addonCustomValue: addonCustomValue
        };
    });
    const orderData = {
        customerName: name,
        phone: phone,
        wilaya: wilaya,
        commune: commune,
        address: commune,
        shippingType: shippingType,
        shippingCost: shippingFee,
        items: orderItems,
        subtotal: subtotal,
        totalAmount: totalAmount,
        notes: notes
    };
    const submitBtn = document.querySelector('#cart-panel button[onclick="submitOrder()"]');
    const originalText = submitBtn?.innerHTML || "";
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        submitBtn.disabled = true;
    }
    try {
        const res = await fetch(API_URL + "/order/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });
        const result = await res.json();
        if (res.ok) {
            alert(t("orderSuccess"));
            cart = [];
            updateCartUI();
            toggleCart();
            document.getElementById("cust-name").value = "";
            document.getElementById("cust-phone").value = "";
            document.getElementById("cust-commune").value = "";
            document.getElementById("cust-notes").value = "";
            document.getElementById("cust-wilaya").value = "";
            localStorage.setItem("cart", JSON.stringify(cart));
        } else {
            const errorMsg = result.error || "خطأ غير معروف";
            alert("" + (currentLang === "fr" ? "Échec : " : "فشل: ") + errorMsg);
        }
    } catch (e) {
        alert(t("connectionError"));
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

function showNotification(msg, type = "success") {
    const cleanMsg = escapeHtml(msg);
    const n = document.createElement("div");
    n.className = "notification";
    n.innerText = cleanMsg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2500);
}

window.onload = async () => {
    updateFollowersFromSettings();
    initHeroSlider();
    await loadShippingRates();
    await loadProducts();
    setTimeout(() => {
        if (typeof loadBestsellerSlider === "function") {
            loadBestsellerSlider();
        }
    }, 500);
    await loadWilayas();
    setLanguage(currentLang);
    buildCategoriesDropdowns();
    setupSearch();
    const saved = localStorage.getItem("cart");
    if (saved) {
        try {
            cart = JSON.parse(saved);
            updateCartUI();
        } catch (e) {}
    }
    window.addEventListener("beforeunload", () => {
        localStorage.setItem("cart", JSON.stringify(cart));
        makeImagesZoomable();
    });
};

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavoritesCount();
    updateFavoritesList();
}

function toggleFavoriteFromDetail(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;
    const exists = favorites.findIndex(fav => fav.productId === productId);
    if (exists === -1) {
        favorites.push({
            productId: product._id,
            name: currentLang === "ar" ? product.nameAr || product.name : product.nameFr || product.name,
            price: product.basePrice,
            image: product.mainImage,
            category: product.category
        });
        showNotification(currentLang === "fr" ? "Ajouté aux favoris" : "تمت الإضافة إلى المفضلة", "success");
    } else {
        favorites.splice(exists, 1);
        showNotification(currentLang === "fr" ? "Retiré des favoris" : "تمت الإزالة من المفضلة", "info");
    }
    saveFavorites();
}

function goToProductDetail(productId) {
    const panel = document.getElementById("favorites-panel");
    if (panel) {
        panel.classList.remove("open");
    }
    showProductDetail(productId);
}

function updateFavoritesCount() {
    const count = favorites.length;
    const favCount = document.getElementById("favorites-count");
    const favCountMobile = document.getElementById("favorites-count-mobile");
    if (favCount) favCount.innerText = count;
    if (favCountMobile) favCountMobile.innerText = count;
}

function isFavorite(productId) {
    return favorites.some(fav => fav.productId === productId);
}

function toggleFavorite(productId, buttonElement) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;
    const exists = favorites.findIndex(fav => fav.productId === productId);
    if (exists === -1) {
        favorites.push({
            productId: product._id,
            name: currentLang === "ar" ? product.nameAr || product.name : product.nameFr || product.name,
            price: product.basePrice,
            image: product.mainImage,
            category: product.category
        });
        showNotification(currentLang === "fr" ? "Ajouté aux favoris" : "تمت الإضافة إلى المفضلة", "success");
        if (buttonElement) buttonElement.classList.add("active");
    } else {
        favorites.splice(exists, 1);
        showNotification(currentLang === "fr" ? "Retiré des favoris" : "تمت الإزالة من المفضلة", "info");
        if (buttonElement) buttonElement.classList.remove("active");
    }
    saveFavorites();
}

function updateFavoritesList() {
    const container = document.getElementById("favorites-list");
    if (!container) return;
    if (favorites.length === 0) {
        container.innerHTML = '<div class="empty-favorites"> <span data-i18n="emptyFavorites">لا توجد منتجات في المفضلة</span></div>';
        return;
    }
    container.innerHTML = favorites.map((fav, idx) => {
        const imgSrc = fav.image ? "" + fav.image : PLACEHOLDER_IMG;
        return '\n<div class="favorite-item" data-id="' + fav.productId + '" onclick="goToProductDetail(\'' + fav.productId + '\')" style="cursor: pointer;">\n    <div style="display: flex; gap: 15px; align-items: center;">\n        <div style="flex: 1;">\n            <div class="favorite-item-name" style="text-align: right;">' + fav.name + '</div>\n            <div class="favorite-item-price" style="text-align: right; margin-top: 5px;">' + fav.price + ' ' + (currentLang === "fr" ? "DA" : "د.ج") + '</div>\n        </div>\n        <img class="favorite-item-img" src="' + imgSrc + '" onerror="handleImgError(this)">\n    </div>\n    <div class="favorite-item-actions" onclick="event.stopPropagation()">\n        <button class="fav-add-to-cart" onclick="addToCartFromFavorite(\'' + fav.productId + '\')"><i class="fas fa-cart-plus" style="margin-inline-end: 8px;"></i>' + t("addToCart") + '</button>\n        <button class="fav-order-now" onclick="orderNowFromFavorite(\'' + fav.productId + '\')"><i class="fas fa-rocket" style="margin-inline-end: 8px;"></i>' + t("orderNow") + '</button>\n        <button class="fav-remove-btn" onclick="removeFavorite(\'' + fav.productId + '\', ' + idx + ')"><i class="fas fa-trash"></i></button>\n    </div>\n</div>\n            ';
    }).join("");
}

function removeFavorite(productId, index) {
    favorites.splice(index, 1);
    saveFavorites();
    showNotification(currentLang === "fr" ? "Retiré des favoris" : "تمت الإزالة من المفضلة", "info");
    const favButton = document.querySelector('.product-card[data-id="' + productId + '"] .btn-favorite');
    if (favButton) favButton.classList.remove("active");
}

function addToCartFromFavorite(productId) {
    addToCart(productId, 1);
    toggleFavorites();
}

function orderNowFromFavorite(productId) {
    addToCart(productId, 1);
    openCart();
    toggleFavorites();
}

function toggleFavorites() {
    const panel = document.getElementById("favorites-panel");
    if (panel) {
        panel.classList.toggle("open");
        updateFavoritesList();
    }
}

function updateFavoritesLanguage() {
    favorites = favorites.map(fav => {
        const product = allProducts.find(p => p._id === fav.productId);
        if (product) {
            fav.name = currentLang === "ar" ? product.nameAr || product.name : product.nameFr || product.name;
        }
        return fav;
    });
    saveFavorites();
    updateFavoritesList();
}

function incrementDetailQuantity() {
    let input = document.getElementById("detail-quantity");
    let value = parseInt(input.value) || 1;
    input.value = value + 1;
}

function decrementDetailQuantity() {
    let input = document.getElementById("detail-quantity");
    let value = parseInt(input.value) || 1;
    if (value > 1) {
        input.value = value - 1;
    }
}

function showImageModal(imgSrc) {
    const existingModal = document.querySelector(".image-modal");
    if (existingModal) existingModal.remove();
    const modal = document.createElement("div");
    modal.className = "image-modal";
    modal.innerHTML = '<img src="' + imgSrc + '" alt="Zoom">';
    modal.onclick = function() {
        modal.classList.remove("show");
        setTimeout(() => modal.remove(), 300);
    };
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add("show"), 10);
}

function makeImagesZoomable() {
    document.querySelectorAll("#detail-slider-container img, .thumbnail").forEach(img => {
        img.style.cursor = "zoom-in";
        img.onclick = e => {
            e.stopPropagation();
            showImageModal(img.src);
        };
    });
    document.querySelectorAll(".product-card .img-slider-slide img").forEach(img => {
        img.style.cursor = "zoom-in";
        img.onclick = e => {
            e.stopPropagation();
            showImageModal(img.src);
        };
    });
}

function getWilayaNumber(wilayaName) {
    const wilayaNumbers = {
        "أدرار": "01",
        "الشلف": "02",
        "الأغواط": "03",
        "أم البواقي": "04",
        "باتنة": "05",
        "بجاية": "06",
        "بسكرة": "07",
        "بشار": "08",
        "البليدة": "09",
        "البويرة": "10",
        "تمنراست": "11",
        "تبسة": "12",
        "تلمسان": "13",
        "تيارت": "14",
        "تيزي وزو": "15",
        "الجزائر": "16",
        "الجلفة": "17",
        "جيجل": "18",
        "سطيف": "19",
        "سعيدة": "20",
        "سكيكدة": "21",
        "سيدي بلعباس": "22",
        "عنابة": "23",
        "قالمة": "24",
        "قسنطينة": "25",
        "المدية": "26",
        "مستغانم": "27",
        "المسيلة": "28",
        "معسكر": "29",
        "ورقلة": "30",
        "وهران": "31",
        "البيض": "32",
        "إليزي": "33",
        "برج بوعريريج": "34",
        "بومرداس": "35",
        "الطارف": "36",
        "تندوف": "37",
        "تيسمسيلت": "38",
        "الوادي": "39",
        "خنشلة": "40",
        "سوق أهراس": "41",
        "تيبازة": "42",
        "ميلة": "43",
        "عين الدفلى": "44",
        "النعامة": "45",
        "عين تيموشنت": "46",
        "غرداية": "47",
        "غليزان": "48",
        "تيميمون": "49",
        "برج باجي مختار": "50",
        "أولاد جلال": "51",
        "بني عباس": "52",
        "عين صالح": "53",
        "عين قزام": "54",
        "تقرت": "55",
        "جانت": "56",
        "المغير": "57",
        "المنيعة": "58",
        "آفلو": "59",
        "بريكة": "60",
        "قصر الشلالة": "61",
        "مسعد": "62",
        "عين وسارة": "63",
        "بوسعادة": "64",
        "لبيض سيد الشيخ": "65",
        "القنطرة": "66",
        "بير العاتر": "67",
        "قصر البخاري": "68",
        "العريشة": "69"
    };
    return wilayaNumbers[wilayaName] || "00";
}

function updateFollowersFromSettings() {
    const igEl = document.getElementById("ig-followers");
    const fbEl = document.getElementById("fb-followers");
    const ttEl = document.getElementById("tt-followers");
    if (igEl) igEl.innerText = localStorage.getItem("ig_followers") || "35,900+";
    if (fbEl) fbEl.innerText = localStorage.getItem("fb_followers") || "30,800+";
    if (ttEl) ttEl.innerText = localStorage.getItem("tt_followers") || "60,600+";
}

function updateAllSocialInfo() {
    updateFollowersFromSettings();
    const igName = localStorage.getItem("social_instagram_name") || "radjaa_accessoiree";
    const igLink = localStorage.getItem("social_instagram") || "https://www.instagram.com/radjaa_accessoiree/";
    document.querySelectorAll('a[href*="instagram.com"]').forEach(el => {
        el.href = igLink;
    });
    const igNameEl = document.querySelector('#follow-modal p:has(+ a[href*="instagram"]) span');
    if (igNameEl) igNameEl.textContent = igName;
    const fbName = localStorage.getItem("social_facebook_name") || "Radjaa Accessoire";
    const fbLink = localStorage.getItem("social_facebook") || "https://www.facebook.com/radjaa.accessoire/";
    document.querySelectorAll('a[href*="facebook.com"]').forEach(el => {
        el.href = fbLink;
    });
    const ttName = localStorage.getItem("social_tiktok_name") || "radjaaaccessoire";
    const ttLink = localStorage.getItem("social_tiktok") || "https://www.tiktok.com/@radjaaaccessoire";
    document.querySelectorAll('a[href*="tiktok.com"]').forEach(el => {
        el.href = ttLink;
    });
    const waNumber = (localStorage.getItem("social_whatsapp") || "213775087631").replace(/[^0-9]/g, "");
    const waLink = "https://wa.me/" + waNumber;
    document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
        el.href = waLink;
    });
    const igFollowP = document.querySelector('#follow-modal p:has(+ a[href*="instagram"])');
    if (!igFollowP) {
        const igP = document.querySelector("#follow-modal i.fa-instagram")?.closest("div")?.querySelector("p");
        if (igP) igP.innerHTML = '<span style="margin-left: 4px;"></span>' + igName;
    }
    const fbP = document.querySelector("#follow-modal i.fa-facebook")?.closest("div")?.querySelector("p");
    if (fbP) fbP.textContent = fbName;
    const ttP = document.querySelector("#follow-modal i.fa-tiktok")?.closest("div")?.querySelector("p");
    if (ttP) ttP.textContent = ttName;
}

function openFollowModal() {
    updateAllSocialInfo();
    document.getElementById("follow-modal").style.display = "flex";
    if (document.getElementById("sidebar").classList.contains("open")) toggleSidebar();
}

updateAllSocialInfo();

function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("product");
}

let customerTestimonials = [];

function openTestimonialsModal() {
    const modal = document.getElementById('testimonials-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    loadCustomerTestimonials();
}

function closeTestimonialsModal() {
    const modal = document.getElementById('testimonials-modal');
    if (modal) modal.style.display = 'none';
}

async function loadCustomerTestimonials() {
    const container = document.getElementById('testimonials-modal-list');
    if (!container) return;
    try {
        const res = await fetch(API_URL + '/testimonials');
        const data = await res.json();
        if (data.success && data.testimonials && data.testimonials.length > 0) {
            customerTestimonials = data.testimonials;
            let html = '';
            customerTestimonials.forEach((item) => {
                html += '\n                    <div class="testimonial-card">\n                        <div class="testimonial-name">' + escapeHtml(item.customerName) + '</div>\n                        <div class="testimonial-image-frame">\n                            <img src="' + imgUrl(item.image) + '" onerror="handleImgError(this)" alt="' + escapeHtml(item.customerName) + '">\n                        </div>\n                    </div>\n                ';
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '\n                <div style="text-align: center; padding: 40px; color: var(--text-muted);">\n                    <i class="fas fa-image" style="font-size: 3rem; display: block; margin-bottom: 15px; opacity: 0.3;"></i>\n                    لا توجد شهادات حالياً\n                </div>\n            ';
        }
    } catch (error) {
        container.innerHTML = '\n            <div style="text-align: center; padding: 40px; color: #f44336;">\n                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>\n                فشل تحميل الشهادات\n            </div>\n        ';
    }
}

function autoOpenProductFromURL() {
    const productId = getProductIdFromURL();
    if (!productId) return;
    if (typeof allProducts !== "undefined" && allProducts.length > 0) {
        const product = allProducts.find(p => p._id === productId);
        if (product) {
            openProductDetail(productId);
            return;
        }
        return;
    }
    let attempts = 0;
    const maxAttempts = 30;
    const waitInterval = setInterval(() => {
        attempts++;
        if (typeof allProducts !== "undefined" && allProducts.length > 0) {
            clearInterval(waitInterval);
            const product = allProducts.find(p => p._id === productId);
            if (product) {
                openProductDetail(productId);
            }
        } else if (attempts >= maxAttempts) {
            clearInterval(waitInterval);
        }
    }, 200);
}

function openProductDetail(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) {
        showNotification("الإكسسوار غير موجود", "error");
        return;
    }
    const heroEl = document.getElementById("hero-slider");
    if (heroEl) heroEl.style.display = "none";
    const productsContainer = document.getElementById("products-container");
    if (productsContainer) productsContainer.style.display = "none";
    showProductDetail(productId);
    if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

(function initProductFromURL() {
    if (typeof allProducts !== "undefined" && allProducts.length > 0) {
        setTimeout(autoOpenProductFromURL, 100);
    } else {
        const checkProducts = setInterval(() => {
            if (typeof allProducts !== "undefined" && allProducts.length > 0) {
                clearInterval(checkProducts);
                autoOpenProductFromURL();
            }
        }, 100);
    }
})();