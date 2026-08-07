const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Order = require('../models/Order');
const SavedOrder = require('../models/SavedOrder');
const ShippingRate = require('../models/ShippingRate');
const upload = require('../middleware/upload');
const { auth, isAdmin } = require('../middleware/auth');
const { 
    validate, 
    productValidation, 
    orderValidation, 
    wilayaValidation,
    reviewValidation,
    validateObjectId
} = require('../middleware/validate');
const mongoSanitize = require('express-mongo-sanitize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

router.use(mongoSanitize());

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: 'عدد كبير جداً من محاولات تسجيل الدخول، يرجى المحاولة بعد 15 دقيقة'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

function timingSafeStringEqual(a, b) {
    const bufA = Buffer.from(String(a || ''));
    const bufB = Buffer.from(String(b || ''));
    if (bufA.length !== bufB.length) {
        // still run a comparison of equal length to avoid a length-based timing signal
        crypto.timingSafeEqual(bufA, Buffer.alloc(bufA.length));
        return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
}

// Supports ADMIN_PASSWORD being either a bcrypt hash (recommended — generate one with
// `node scripts/generateAdminPasswordHash.js "yourPassword"`) or, for backward compatibility
// until you rotate it, the old plaintext value. This means deploying this fix will not lock
// you out even if .env hasn't been updated yet — but you should switch to a hash ASAP.
async function verifyAdminPassword(inputPassword, storedPassword) {
    if (typeof inputPassword !== 'string' || !storedPassword) return false;
    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedPassword);
    if (isBcryptHash) {
        try {
            return await bcrypt.compare(inputPassword, storedPassword);
        } catch (e) {
            return false;
        }
    }
    return timingSafeStringEqual(inputPassword, storedPassword);
}

const uploadDir = './uploads';
const componentsDir = './uploads/components';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
}

router.post('/add', auth, isAdmin, upload.any(), upload.verifyUploadedImages, upload.uploadToCloudinary('radjaa/products'), productValidation, validate, async (req, res) => {
    console.log(' body:', req.body);
    console.log(' files:', req.files);
    try {
        const mainImages = [];
        const componentImages = {};
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false,
                error: "الصورة مطلوبة! يرجى رفع صورة للمنتج" 
            });
        }
        
        req.files.forEach(file => {
            if (file.fieldname === 'images') {
                mainImages.push(file.cloudinaryUrl);
            } else if (file.fieldname && file.fieldname.startsWith('component_image_')) {
                const index = file.fieldname.split('_')[2];
                componentImages[index] = file.cloudinaryUrl;
            }
        });
        
        const mainImage = mainImages[0];
        
        const cleanString = (str) => {
            if (!str) return '';
            return str.replace(/[<>]/g, '');
        };
        
        let colors = [];
        let sizes = [];
        let materialOptions = [];
        let customizations = [];
        let addons = [];
        let components = [];
        let componentSettings = [];
        
        try {
            colors = req.body.colors && req.body.colors !== 'undefined' && req.body.colors !== '[]' 
                ? (typeof req.body.colors === 'string' ? JSON.parse(req.body.colors) : req.body.colors) 
                : [];
            if (!Array.isArray(colors)) colors = [];
        } catch (e) { colors = []; }
        
        try {
            sizes = req.body.sizes && req.body.sizes !== 'undefined' && req.body.sizes !== '[]' 
                ? (typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes) 
                : [];
            if (!Array.isArray(sizes)) sizes = [];
        } catch (e) { sizes = []; }
        
        try {
            materialOptions = req.body.materialOptions && req.body.materialOptions !== 'undefined' 
                ? (typeof req.body.materialOptions === 'string' ? JSON.parse(req.body.materialOptions) : req.body.materialOptions) 
                : [];
        } catch (e) { materialOptions = []; }
        
        try {
            customizations = req.body.customizations && req.body.customizations !== 'undefined' 
                ? (typeof req.body.customizations === 'string' ? JSON.parse(req.body.customizations) : req.body.customizations) 
                : [];
        } catch (e) { customizations = []; }
        
        try {
            addons = req.body.addons && req.body.addons !== 'undefined' && req.body.addons !== '[]' 
                ? (typeof req.body.addons === 'string' ? JSON.parse(req.body.addons) : req.body.addons) 
                : [];
            if (!Array.isArray(addons)) addons = [];
        } catch (e) { addons = []; }
        
        const hasComponents = req.body.hasComponents === 'true';
        
        if (hasComponents && req.body.components && req.body.components !== 'undefined' && req.body.components !== '[]') {
            try {
                components = typeof req.body.components === 'string' ? JSON.parse(req.body.components) : req.body.components;
                if (!Array.isArray(components)) components = [];
                components = components.map((comp, idx) => ({
                    name: cleanString(comp.nameAr || comp.name),
                    nameAr: cleanString(comp.nameAr || comp.name),
                    nameFr: cleanString(comp.nameFr || comp.name),
                    price: Number(comp.price) || 0,
                    image: componentImages[idx] || comp.existingImage || ''
                }));
            } catch (e) {
                components = [];
            }
        }
        
        try {
            componentSettings = req.body.componentSettings && req.body.componentSettings !== 'undefined' && req.body.componentSettings !== '[]' 
                ? (typeof req.body.componentSettings === 'string' ? JSON.parse(req.body.componentSettings) : req.body.componentSettings) 
                : [];
            if (!Array.isArray(componentSettings)) componentSettings = [];
        } catch (e) { componentSettings = []; }
        
        if (!req.body.nameAr && !req.body.nameFr && !req.body.name) {
            return res.status(400).json({ 
                success: false,
                error: "اسم المنتج مطلوب (عربي أو فرنسي)" 
            });
        }
        
        const basePrice = Number(req.body.basePrice);
        if (!basePrice || isNaN(basePrice) || basePrice < 0) {
            return res.status(400).json({ 
                success: false,
                error: "السعر مطلوب وقيمة رقمية صحيحة (أكبر من 0)" 
            });
        }
        
        const newProduct = new Product({
            name: cleanString(req.body.nameAr || req.body.nameFr || req.body.name),
            description: cleanString(req.body.descriptionAr || req.body.descriptionFr || req.body.description || ''),
            nameAr: cleanString(req.body.nameAr || ''),
            nameFr: cleanString(req.body.nameFr || ''),
            descriptionAr: cleanString(req.body.descriptionAr || ''),
            descriptionFr: cleanString(req.body.descriptionFr || ''),
            basePrice: basePrice,
            mainImage: mainImage,
            images: mainImages,
            category: cleanString(req.body.category || 'غير مصنف'),
            colors: colors,
            sizes: sizes,
            materialOptions: materialOptions,
            customizations: customizations,
            addons: addons,
            hasComponents: hasComponents && components.length > 0,
            components: components,
            componentSettings: componentSettings,
            hasSizes: sizes && sizes.length > 0,
            isBestSeller: req.body.isBestSeller === 'true' || req.body.isBestSeller === true,
            isNewArrival: req.body.isNewArrival === 'true' || req.body.isNewArrival === true,
            stock: Number(req.body.stock) || 10
        });
        
        await newProduct.save();
        
        console.log('تم إضافة المنتج بنجاح:', newProduct.nameAr || newProduct.name);
        if (components.length > 0) {
            console.log(`   مع ${components.length} جزء/أجزاء`);
        }
        
        res.status(201).json({ 
            success: true,
            message: "تمت إضافة المنتج بنجاح",
            product: newProduct
        });
    } catch (error) {
        console.error("خطأ في إضافة المنتج:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

router.get('/all', async (req, res) => {
    try {
        const { search, category } = req.query;
        let filter = {};
        
        if (search) {
            const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [
                { name: { $regex: safeSearch, $options: 'i' } },
                { nameAr: { $regex: safeSearch, $options: 'i' } },
                { nameFr: { $regex: safeSearch, $options: 'i' } },
                { description: { $regex: safeSearch, $options: 'i' } }
            ];
        }
        
        if (category && category !== 'all') {
            filter.category = category.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '');
        }
        
        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (err) {
        console.error("خطأ في جلب المنتجات:", err);
        res.status(500).json({ 
            success: false,
            error: "فشل جلب البيانات: " + err.message 
        });
    }
});

router.get('/filter', async (req, res) => {
    try {
        const { category, sort, minPrice, maxPrice } = req.query;
        let filter = {};
        
        if (category && category !== 'all' && category !== 'undefined') {
            filter.category = category.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '');
        }
        
        if (minPrice || maxPrice) {
            filter.basePrice = {};
            if (minPrice && minPrice > 0) filter.basePrice.$gte = Number(minPrice);
            if (maxPrice && maxPrice !== 'Infinity' && maxPrice > 0) filter.basePrice.$lte = Number(maxPrice);
        }
        
        let query = Product.find(filter);
        if (sort === 'price_asc') {
            query = query.sort({ basePrice: 1 });
        } else if (sort === 'price_desc') {
            query = query.sort({ basePrice: -1 });
        } else {
            query = query.sort({ createdAt: -1 });
        }
        
        const products = await query;
        res.json({
            success: true,
            products: products,
            count: products.length
        });
    } catch (error) {
        console.error('خطأ في مسار الفلترة:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            products: [],
            count: 0
        });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ success: true, products: [] });
        }
        
        const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        const products = await Product.find({
            $or: [
                { name: { $regex: safeQuery, $options: 'i' } },
                { nameAr: { $regex: safeQuery, $options: 'i' } },
                { nameFr: { $regex: safeQuery, $options: 'i' } },
                { description: { $regex: safeQuery, $options: 'i' } }
            ]
        }).limit(10).select('name nameAr nameFr basePrice mainImage images components hasComponents');
        
        res.json({ success: true, products });
    } catch (error) {
        console.error('خطأ في البحث:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/shipping-rates', async (req, res) => {
    try {
        const rates = await ShippingRate.find().sort({ wilayaCode: 1 });
        res.json({ success: true, rates });
    } catch (error) {
        console.error('خطأ في جلب أسعار الشحن:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/shipping-rate/:wilayaName', async (req, res) => {
    try {
        const { wilayaName } = req.params;
        const rate = await ShippingRate.findOne({ wilayaName });
        if (!rate) {
            return res.status(404).json({ success: false, error: 'الولاية غير موجودة' });
        }
        res.json({ success: true, rate });
    } catch (error) {
        console.error('خطأ في جلب سعر الشحن:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/shipping-rate/:wilayaName', auth, isAdmin, wilayaValidation, validate, async (req, res) => {
    try {
        const { wilayaName } = req.params;
        const { homePrice, officePrice } = req.body;
        
        const updated = await ShippingRate.findOneAndUpdate(
            { wilayaName },
            { homePrice, officePrice, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );
        
        if (!updated) {
            return res.status(404).json({ success: false, error: 'الولاية غير موجودة' });
        }
        
        res.json({ success: true, message: 'تم تحديث سعر الشحن', rate: updated });
    } catch (error) {
        console.error('خطأ في تحديث سعر الشحن:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/shipping-rate/add', auth, isAdmin, wilayaValidation, validate, async (req, res) => {
    try {
        const { wilayaName, wilayaCode, homePrice, officePrice } = req.body;
        
        const existing = await ShippingRate.findOne({ $or: [{ wilayaName }, { wilayaCode }] });
        if (existing) {
            return res.status(400).json({ success: false, error: 'الولاية أو الـ Code موجود مسبقاً' });
        }
        
        const newRate = new ShippingRate({
            wilayaName,
            wilayaCode: Number(wilayaCode),
            homePrice: Number(homePrice) || 0,
            officePrice: Number(officePrice) || 0
        });
        
        await newRate.save();
        res.json({ success: true, message: 'تم إضافة الولاية بنجاح', rate: newRate });
    } catch (error) {
        console.error('خطأ في إضافة الولاية:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/shipping-rate/:wilayaCode', auth, isAdmin, async (req, res) => {
    try {
        const { wilayaCode } = req.params;
        const deleted = await ShippingRate.findOneAndDelete({ wilayaCode: Number(wilayaCode) });
        
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'الولاية غير موجودة' });
        }
        
        res.json({ success: true, message: 'تم حذف الولاية بنجاح' });
    } catch (error) {
        console.error('خطأ في حذف الولاية:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/order/new', orderValidation, validate, async (req, res) => {
    try {
        const {
            customerName, phone, email, wilaya, commune, address,
            deliveryNotes, shippingType, items,
            generalCustomizations, notes
        } = req.body;
        
        const phoneRegex = /^(05|06|07)[0-9]{8}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                error: 'رقم هاتف غير صالح (يجب أن يبدأ بـ 05, 06, 07 ويتكون من 10 أرقام)'
            });
        }
        
        let shippingCost = 0;
        const shippingRate = await ShippingRate.findOne({ wilayaName: wilaya });
        if (shippingRate) {
            shippingCost = shippingType === 'office' ? shippingRate.officePrice : shippingRate.homePrice;
        } else {
            shippingCost = shippingType === 'office' ? 400 : 1000;
            console.warn(`لم يتم العثور على سعر توصيل لولاية: ${wilaya}، تم استخدام القيمة الافتراضية ${shippingCost}`);
        }
        
        console.log(` ${wilaya} - ${shippingType}: ${shippingCost} د.ج`);
        
        let subtotal = 0;
        const processedItems = [];
        
        for (const item of items) {
            if (item.quantity > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'الكمية المطلوبة كبيرة جداً (الحد الأقصى 100 قطعة)'
                });
            }
            
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    error: `المنتج ${item.productId} غير موجود` 
                });
            }
            
            if (!product.isAvailable(item.quantity)) {
                return res.status(400).json({
                    success: false,
                    error: `المخزون غير كافٍ للمنتج ${product.nameAr || product.name} (المتبقي: ${product.stock})`
                });
            }
            
            let unitPrice = product.basePrice;
            
            if (item.selectedSize && item.selectedSize.size) {
                const sizeObj = product.sizes.find(s => s.size === item.selectedSize.size);
                if (sizeObj) {
                    unitPrice = sizeObj.price;
                }
            }
            
            let selectedComponentData = null;
            let additionalPartsText = '';
            
            if (item.selectedComponent && (item.purchaseType === 'component' || item.purchaseType === 'separate')) {
                const compObj = product.components?.find(c => c.nameAr === item.selectedComponent.nameAr || c.name === item.selectedComponent.name);
                if (compObj) {
                    unitPrice = compObj.price;
                    selectedComponentData = {
                        index: item.selectedComponent.index || 0,
                        nameAr: compObj.nameAr || item.selectedComponent.nameAr,
                        nameFr: compObj.nameFr || item.selectedComponent.nameFr,
                        price: compObj.price,
                        type: 'separate'
                    };
                    additionalPartsText = compObj.nameAr || item.selectedComponent.nameAr;
                }
            } else if (item.selectedComponent && item.purchaseType === 'fullWithout') {
                const compObj = product.components?.find(c => c.nameAr === item.selectedComponent.nameAr || c.name === item.selectedComponent.name);
                if (compObj) {
                    unitPrice = product.basePrice - (compObj.price || 0);
                    if (unitPrice < 0) unitPrice = 0;
                    selectedComponentData = {
                        index: item.selectedComponent.index || 0,
                        nameAr: compObj.nameAr || item.selectedComponent.nameAr,
                        nameFr: compObj.nameFr || item.selectedComponent.nameFr,
                        price: compObj.price,
                        type: 'without'
                    };
                    additionalPartsText = `المنتج كامل بدون ${compObj.nameAr || item.selectedComponent.nameAr}`;
                }
            }
            
            let addonPrice = 0;
            let trustedAddon = null;
            if (item.selectedAddon && item.selectedAddon.choice === 'with' && item.selectedAddon.id) {
                const addonObj = product.addons?.find(a => a.id === item.selectedAddon.id);
                if (addonObj) {
                    addonPrice = addonObj.price || 0;
                    trustedAddon = {
                        id: addonObj.id,
                        choice: 'with',
                        price: addonPrice,
                        hasCustomField: !!addonObj.hasCustomField
                    };
                }
            }
            
            const finalUnitPrice = unitPrice + addonPrice;
            const itemTotal = finalUnitPrice * item.quantity;
            subtotal += itemTotal;
            
            processedItems.push({
                productId: item.productId,
                productNameAr: product.nameAr || product.name,
                productNameFr: product.nameFr || product.name,
                name: item.name || product.name,
                quantity: item.quantity,
                basePrice: product.basePrice,
                selectedColor: item.selectedColor || null,
                selectedSize: item.selectedSize || null,
                selectedComponent: selectedComponentData,
                additionalPartsText: additionalPartsText,
                purchaseType: item.purchaseType || 'full',
                selectedAddon: trustedAddon,
                addonCustomValue: item.addonCustomValue || '',
                unitPrice: finalUnitPrice,
                customizationText: item.customizationText || '',
                customizationExtra: item.customizationExtra || 0,
                customizations: item.customizations || []
            });
        }
        
        const totalAmount = subtotal + shippingCost;
        const revenue = totalAmount - shippingCost;
        
        let customizationsTotal = 0;
        if (generalCustomizations && generalCustomizations.length > 0) {
            customizationsTotal = generalCustomizations.reduce((sum, c) => sum + (c.price || 0), 0);
        }
        
        const newOrder = new Order({
            customerName,
            phone,
            email: email || '',
            wilaya,
            commune,
            address,
            deliveryNotes: deliveryNotes || '',
            shippingType,
            shippingCost,
            items: processedItems,
            generalCustomizations: generalCustomizations || [],
            subtotal,
            customizationsTotal: customizationsTotal,
            totalAmount,
            revenue: revenue,
            notes: notes || '',
            guestCheckout: true,
            status: 'pending',
            statusHistory: [{
                status: 'pending',
                note: 'تم استلام الطلب بنجاح'
            }]
        });
        
        await newOrder.save();
        
        console.log(`تم تسجيل طلب جديد: ${newOrder._id} - المجموع: ${totalAmount} د.ج`);
        
        res.status(201).json({ 
            success: true,
            message: "تم تسجيل طلبك بنجاح",
            orderId: newOrder._id
        });
    } catch (error) {
        console.error("خطأ في الطلب:", error);
        res.status(500).json({ 
            success: false,
            error: "فشل في تسجيل الطلبية: " + error.message 
        });
    }
});

router.get('/orders/all', auth, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('items.productId', 'name nameAr nameFr mainImage');
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        console.error("خطأ في جلب الطلبات:", error);
        res.status(500).json({ success: false, error: "فشل جلب الطلبات" });
    }
});

router.get('/orders/check-new', auth, isAdmin, async (req, res) => {
    try {
        const lastCheck = req.query.lastCheck ? new Date(req.query.lastCheck) : new Date(Date.now() - 60000);
        const newOrders = await Order.find({ createdAt: { $gt: lastCheck } }).sort({ createdAt: -1 });
        res.json({ success: true, newOrders, count: newOrders.length });
    } catch (error) {
        console.error("خطأ في جلب الطلبات الجديدة:", error);
        res.status(500).json({ success: false, error: "فشل جلب الطلبات الجديدة" });
    }
});

router.put('/orders/:id/status', auth, isAdmin, validateObjectId('id'), validate, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: "حالة غير صالحة" });
        }
        
        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: "الطلب غير موجود" });
        }
        
        const shippingCost = existingOrder.shippingCost || 0;
        const totalAmount = existingOrder.totalAmount || 0;
        const revenue = totalAmount - shippingCost;
        
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { 
                status: status,
                revenue: revenue,
                updatedAt: Date.now()
            }, 
            { new: true, runValidators: true }
        );
        
        res.json({ success: true, message: `تم تحديث الحالة إلى ${status}`, order: updatedOrder });
    } catch (error) {
        console.error("خطأ في تحديث الحالة:", error);
        res.status(500).json({ success: false, error: "فشل تحديث الحالة" });
    }
});

router.put('/orders/:id', auth, isAdmin, validateObjectId('id'), async (req, res) => {
    try {
        const { 
            customerName, phone, wilaya, commune, address, 
            items, subtotal, totalAmount, notes, shippingCost,
            shippingType, status
        } = req.body;
        
        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: "الطلب غير موجود" });
        }
        
        const phoneRegex = /^(05|06|07)[0-9]{8}$/;
        if (phone && !phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                error: 'رقم هاتف غير صالح'
            });
        }
        
        let calculatedSubtotal = subtotal;
        let calculatedTotal = totalAmount;
        let calculatedShippingCost = shippingCost !== undefined ? shippingCost : existingOrder.shippingCost;
        let calculatedShippingType = shippingType || existingOrder.shippingType;
        
        if (items && items.length > 0) {
            calculatedSubtotal = 0;
            for (const item of items) {
                const unitPrice = item.unitPrice || 0;
                const quantity = item.quantity || 1;
                calculatedSubtotal += unitPrice * quantity;
            }
        }
        
        if (totalAmount !== undefined && totalAmount !== null) {
            calculatedTotal = totalAmount;
        } else {
            calculatedTotal = calculatedSubtotal + calculatedShippingCost;
        }
        
        const calculatedRevenue = calculatedTotal - calculatedShippingCost;
        
        const updateData = {
            customerName: customerName || existingOrder.customerName,
            phone: phone || existingOrder.phone,
            wilaya: wilaya || existingOrder.wilaya,
            commune: commune || existingOrder.commune,
            address: address || existingOrder.address,
            shippingType: calculatedShippingType,
            shippingCost: calculatedShippingCost,
            items: items || existingOrder.items,
            subtotal: calculatedSubtotal,
            totalAmount: calculatedTotal,
            revenue: calculatedRevenue,
            notes: notes !== undefined ? notes : existingOrder.notes,
            updatedAt: Date.now()
        };
        
        if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            updateData.status = status;
        }
        
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        res.json({ 
            success: true, 
            message: "تم تحديث معلومات الطلب", 
            order: updatedOrder 
        });
    } catch (error) {
        console.error("خطأ في تحديث الطلب:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/orders/:id', auth, isAdmin, validateObjectId('id'), validate, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.productId', 'name nameAr nameFr mainImage');
        if (!order) {
            return res.status(404).json({ success: false, message: "الطلب غير موجود" });
        }
        res.json({ success: true, order });
    } catch (error) {
        console.error("خطأ في جلب الطلب:", error);
        res.status(500).json({ success: false, error: "فشل جلب الطلب" });
    }
});

router.delete('/orders/:id', auth, isAdmin, validateObjectId('id'), validate, async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: "الطلب غير موجود" });
        }
        res.json({ success: true, message: "تم حذف الطلبية بنجاح" });
    } catch (error) {
        console.error("خطأ في الحذف:", error);
        res.status(500).json({ success: false, error: "فشل الحذف" });
    }
});

router.get('/orders/recent', auth, isAdmin, async (req, res) => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentOrders = await Order.find({ createdAt: { $gt: oneHourAgo } }).sort({ createdAt: -1 });
        res.json({ success: true, count: recentOrders.length, orders: recentOrders });
    } catch (error) {
        console.error("خطأ في جلب الطلبات الجديدة:", error);
        res.status(500).json({ success: false, error: "فشل جلب الطلبات الجديدة" });
    }
});

router.get('/stats/dashboard', auth, isAdmin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
        const totalRevenue = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$revenue' } } }
        ]);
        res.json({
            success: true,
            stats: {
                totalOrders,
                pendingOrders,
                deliveredOrders,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        console.error("خطأ في جلب الإحصائيات:", error);
        res.status(500).json({ success: false, error: "فشل جلب الإحصائيات" });
    }
});

router.get('/stats/advanced', auth, isAdmin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const processingOrders = await Order.countDocuments({ status: 'processing' });
        const shippedOrders = await Order.countDocuments({ status: 'shipped' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
        
        const monthlySales = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const sales = await Order.aggregate([
                { $match: { status: 'delivered', createdAt: { $gte: start, $lte: end } } },
                { $group: { _id: null, total: { $sum: '$revenue' } } }
            ]);
            monthlySales.push({
                month: start.toLocaleString('ar', { month: 'long' }),
                total: sales[0]?.total || 0
            });
        }
        
        const topCategories = await Order.aggregate([
            { $unwind: '$items' },
            { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $group: { _id: '$product.category', totalSold: { $sum: '$items.quantity' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);
        
        res.json({
            success: true,
            stats: { totalOrders, pendingOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders },
            monthlySales: monthlySales.reverse(),
            topCategories
        });
    } catch (error) {
        console.error('خطأ في الإحصائيات المتقدمة:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/orders/export', auth, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        const exportData = orders.map(order => ({
            'رقم الطلب': order._id,
            'العميل': order.customerName,
            'الهاتف': order.phone,
            'الولاية': order.wilaya,
            'البلدية': order.commune,
            'العنوان': order.address,
            'المجموع': order.totalAmount,
            'الحالة': order.status,
            'التاريخ': new Date(order.createdAt).toLocaleDateString('ar-DZ')
        }));
        res.json({ success: true, data: exportData, count: exportData.length });
    } catch (error) {
        console.error('خطأ في تصدير الطلبات:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/orders/:id/save', auth, isAdmin, validateObjectId('id'), validate, async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
        }
        if (order.status !== 'delivered') {
            return res.status(400).json({ success: false, error: 'يمكن حفظ الطلبات الموصلة فقط' });
        }
        
        const existingSaved = await SavedOrder.findOne({ orderId: order._id });
        if (existingSaved) {
            return res.status(400).json({ 
                success: false, 
                error: 'هذا الطلب تم حفظه مسبقاً في الإحصائيات' 
            });
        }
        
        const orderDate = order.createdAt || new Date();
        const year = orderDate.getFullYear();
        const savedOrders = [];
        
        const totalItems = order.items.length;
        const totalRevenue = order.revenue || order.totalAmount || 0;
        const revenuePerItem = totalItems > 0 ? totalRevenue / totalItems : 0;
        
        console.log(` الطلب: ${order._id}`);
        console.log(`   إجمالي الإيرادات: ${totalRevenue}`);
        console.log(`   عدد المنتجات: ${totalItems}`);
        
        for (const item of order.items) {
            let itemSubtotal = item.unitPrice * item.quantity;
            const productRevenue = revenuePerItem;
            
            let productDisplayName = item.productNameAr || item.name || 'منتج';
            if (item.selectedColor?.name) {
                productDisplayName += ` (${item.selectedColor.name})`;
            }
            if (item.selectedSize?.size) {
                productDisplayName += ` - ${item.selectedSize.size}`;
            }
            
            const savedOrder = new SavedOrder({
                wilaya: order.wilaya,
                productName: productDisplayName,
                productNameAr: item.productNameAr || item.name || 'منتج',
                productNameFr: item.productNameFr || item.name || 'Produit',
                subtotal: itemSubtotal,
                totalAmount: productRevenue,
                revenue: productRevenue,
                orderDate: orderDate,
                year: year,
                items: [item],
            });
            
            savedOrders.push(savedOrder);
        }
        
        if (savedOrders.length > 0) {
            await SavedOrder.insertMany(savedOrders);
            const totalSavedRevenue = savedOrders.reduce((sum, s) => sum + s.revenue, 0);
            console.log(`تم حفظ ${savedOrders.length} منتج في الإحصائيات`);
            console.log(` الإيرادات الإجمالية المحفوظة: ${totalSavedRevenue} د.ج`);
        }
        
        await Order.findByIdAndDelete(orderId);
        
        res.json({
            success: true,
            message: `تم حفظ ${savedOrders.length} منتج في الإحصائيات`,
            savedCount: savedOrders.length
        });
    } catch (error) {
        console.error('خطأ في حفظ الطلب:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/saved-orders/all', auth, isAdmin, async (req, res) => {
    try {
        const savedOrders = await SavedOrder.find().sort({ savedAt: -1 });
        res.json({ success: true, count: savedOrders.length, orders: savedOrders });
    } catch (error) {
        console.error('خطأ في جلب الطلبات المحفوظة:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/analytics/stats', auth, isAdmin, async (req, res) => {
    try {
        const { year } = req.query;
        const currentYear = new Date().getFullYear();
        const selectedYear = year ? parseInt(year) : currentYear;
        
        let matchFilter = {};
        if (selectedYear) {
            matchFilter = { 
                $or: [
                    { year: selectedYear },
                    ...(selectedYear === currentYear ? [{ year: { $exists: false } }, { year: null }] : [])
                ]
            };
        }
        
        console.log(` البحث عن إحصائيات السنة: ${selectedYear}`);
        
        const totalSavedOrders = await SavedOrder.countDocuments(matchFilter);
        console.log(` عدد الطلبات المحفوظة: ${totalSavedOrders}`);
        
        const topWilayas = await SavedOrder.aggregate([
            { $match: matchFilter },
            { $group: { _id: '$wilaya', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 50 }
        ]);
        
        const topProducts = await SavedOrder.aggregate([
            { $match: matchFilter },
            { $group: { _id: '$productName', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 50 }
        ]);
        
        const monthlySales = await SavedOrder.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: {
                        month: { $month: '$orderDate' }
                    },
                    total: { 
                        $sum: { 
                            $ifNull: ['$revenue', '$totalAmount'] 
                        } 
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.month': 1 } }
        ]);
        
        const totalRevenue = await SavedOrder.aggregate([
            { $match: matchFilter },
            { 
                $group: { 
                    _id: null, 
                    total: { 
                        $sum: { 
                            $ifNull: ['$revenue', '$totalAmount'] 
                        } 
                    } 
                } 
            }
        ]);
        
        const availableYearsRaw = await SavedOrder.distinct('year');
        const availableYears = availableYearsRaw
            .filter(y => y !== null && y !== undefined)
            .sort((a, b) => b - a);
        
        if (!availableYears.includes(currentYear)) {
            availableYears.push(currentYear);
        }
        availableYears.sort((a, b) => b - a);
        
        res.json({
            success: true,
            stats: {
                topWilayas: topWilayas || [],
                topProducts: topProducts || [],
                monthlySales: monthlySales || [],
                totalRevenue: totalRevenue[0]?.total || 0,
                totalSavedOrders: totalSavedOrders || 0,
                availableYears: availableYears.length > 0 ? availableYears : [currentYear],
                selectedYear: selectedYear || currentYear,
                totalAllOrders: totalSavedOrders || 0
            }
        });
    } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stats: {
                topWilayas: [],
                topProducts: [],
                monthlySales: [],
                totalRevenue: 0,
                totalSavedOrders: 0,
                availableYears: [new Date().getFullYear()],
                selectedYear: new Date().getFullYear(),
                totalAllOrders: 0
            }
        });
    }
});

router.post('/admin/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (typeof username !== 'string' || typeof password !== 'string') {
            return res.status(401).json({
                success: false,
                error: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }
        
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
        
        const usernameOk = timingSafeStringEqual(username, ADMIN_USERNAME);
        const passwordOk = await verifyAdminPassword(password, ADMIN_PASSWORD);

        if (!usernameOk || !passwordOk) {
            return res.status(401).json({
                success: false,
                error: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }
        
        const token = jwt.sign(
            { id: 'admin', role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );
        
        res.json({
            success: true,
            token,
            message: 'تم تسجيل الدخول بنجاح'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: "المنتج غير موجود" 
            });
        }
        res.status(200).json({
            success: true,
            product
        });
    } catch (err) {
        console.error("خطأ في جلب المنتج:", err);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

router.delete('/:id', auth, isAdmin, validateObjectId('id'), validate, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ 
                success: false,
                message: "المنتج غير موجود" 
            });
        }
        res.status(200).json({ 
            success: true,
            message: "تم حذف المنتج بنجاح" 
        });
    } catch (err) {
        console.error("خطأ في الحذف:", err);
        res.status(500).json({ 
            success: false,
            error: "فشل الحذف" 
        });
    }
});

router.put('/:id', auth, isAdmin, upload.any(), upload.verifyUploadedImages, upload.uploadToCloudinary('radjaa/products'), productValidation, validate, async (req, res) => {
    try {
        const newMainImages = [];
        const newComponentImages = {};
        
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (file.fieldname === 'images') {
                    newMainImages.push(file.cloudinaryUrl);
                } else if (file.fieldname && file.fieldname.startsWith('component_image_')) {
                    const index = file.fieldname.split('_')[2];
                    newComponentImages[index] = file.cloudinaryUrl;
                }
            });
        }
        
        if (newMainImages.length > 0) {
            if (req.body.replaceImages === 'true') {
                req.body.images = newMainImages;
                req.body.mainImage = newMainImages[0] || '';
            } else {
                const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
                req.body.images = [...existingImages, ...newMainImages];
                req.body.mainImage = req.body.mainImage || req.body.images[0];
            }
        }
        
        const cleanString = (str) => {
            if (!str) return '';
            return str.replace(/[<>]/g, '');
        };
        
        if (req.body.colors) {
            try {
                req.body.colors = typeof req.body.colors === 'string' ? JSON.parse(req.body.colors) : req.body.colors;
                if (!Array.isArray(req.body.colors)) req.body.colors = [];
            } catch (e) {
                req.body.colors = [];
            }
        }
        
        if (req.body.sizes) {
            try {
                req.body.sizes = typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes;
                if (!Array.isArray(req.body.sizes)) req.body.sizes = [];
            } catch (e) {
                req.body.sizes = [];
            }
        }
        
        let hasComponents = req.body.hasComponents === 'true';
        let components = [];
        if (hasComponents && req.body.components && req.body.components !== 'undefined' && req.body.components !== '[]') {
            try {
                components = typeof req.body.components === 'string' ? JSON.parse(req.body.components) : req.body.components;
                if (!Array.isArray(components)) components = [];
                components = components.map((comp, idx) => ({
                    name: cleanString(comp.nameAr || comp.name),
                    nameAr: cleanString(comp.nameAr || comp.name),
                    nameFr: cleanString(comp.nameFr || comp.name),
                    price: Number(comp.price) || 0,
                    image: newComponentImages[idx] || comp.image || comp.existingImage || ''
                }));
            } catch (e) {
                components = [];
            }
        }
        req.body.hasComponents = components.length > 0;
        req.body.components = components;
        
        if (req.body.componentSettings) {
            try {
                req.body.componentSettings = typeof req.body.componentSettings === 'string' 
                    ? JSON.parse(req.body.componentSettings) 
                    : req.body.componentSettings;
                if (!Array.isArray(req.body.componentSettings)) req.body.componentSettings = [];
            } catch (e) {
                req.body.componentSettings = [];
            }
        }
        
        if (req.body.addons) {
            try {
                req.body.addons = typeof req.body.addons === 'string' ? JSON.parse(req.body.addons) : req.body.addons;
                if (!Array.isArray(req.body.addons)) req.body.addons = [];
            } catch (e) {
                req.body.addons = [];
            }
        }
        
        if (req.body.basePrice) req.body.basePrice = Number(req.body.basePrice);
        if (req.body.stock) req.body.stock = Number(req.body.stock);
        
        if (req.body.nameAr) req.body.nameAr = cleanString(req.body.nameAr);
        if (req.body.nameFr) req.body.nameFr = cleanString(req.body.nameFr);
        if (req.body.descriptionAr) req.body.descriptionAr = cleanString(req.body.descriptionAr);
        if (req.body.descriptionFr) req.body.descriptionFr = cleanString(req.body.descriptionFr);
        if (req.body.category) req.body.category = cleanString(req.body.category);
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true, runValidators: true }
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ 
                success: false,
                message: "المنتج غير موجود" 
            });
        }
        
        console.log('تم تحديث المنتج بنجاح:', updatedProduct.nameAr || updatedProduct.name);
        res.status(200).json({ 
            success: true,
            message: "تم تحديث المنتج بنجاح",
            product: updatedProduct
        });
    } catch (err) {
        console.error("خطأ في التحديث:", err);
        res.status(500).json({ 
            success: false,
            error: "فشل التحديث: " + err.message 
        });
    }
});

router.post('/:id/review', reviewValidation, validate, async (req, res) => {
    try {
        const { rating, comment, customerName } = req.body;
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
        }
        
        await product.addReview(rating, comment, customerName);
        
        res.json({ 
            success: true, 
            message: 'تم إضافة التقييم بنجاح، سيتم نشره بعد المراجعة',
            review: product.reviews[product.reviews.length - 1]
        });
    } catch (error) {
        console.error('خطأ في إضافة التقييم:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id/reviews', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).select('reviews averageRating');
        if (!product) {
            return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
        }
        res.json({ 
            success: true, 
            reviews: product.reviews || [],
            averageRating: product.averageRating || 0,
            totalReviews: product.reviews?.length || 0
        });
    } catch (error) {
        console.error('خطأ في جلب التقييمات:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/:id/reviews/:reviewIndex/approve', auth, isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
        }
        const idx = parseInt(req.params.reviewIndex, 10);
        if (isNaN(idx) || idx < 0 || !product.reviews[idx]) {
            return res.status(400).json({ success: false, error: 'التقييم غير موجود' });
        }
        product.reviews[idx].approved = true;
        product.calculateAverageRating();
        await product.save();
        res.json({
            success: true,
            message: 'تمت الموافقة على التقييم بنجاح',
            review: product.reviews[idx],
            averageRating: product.averageRating
        });
    } catch (error) {
        console.error('خطأ في الموافقة على التقييم:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/:id/reviews/:reviewIndex', auth, isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
        }
        const idx = parseInt(req.params.reviewIndex, 10);
        if (isNaN(idx) || idx < 0 || !product.reviews[idx]) {
            return res.status(400).json({ success: false, error: 'التقييم غير موجود' });
        }
        product.reviews.splice(idx, 1);
        product.calculateAverageRating();
        await product.save();
        res.json({
            success: true,
            message: 'تم حذف التقييم بنجاح',
            averageRating: product.averageRating
        });
    } catch (error) {
        console.error('خطأ في حذف التقييم:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;