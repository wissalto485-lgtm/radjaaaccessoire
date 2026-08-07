const { validationResult, body, param, query } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

const validateObjectId = (paramName) => {
    return param(paramName).isMongoId().withMessage('معرف غير صالح');
};

const isArrayOrJsonArray = (value) => {
    if (Array.isArray(value)) return true;
    if (typeof value === 'string') {
        if (value.trim() === '' || value === 'undefined') return true;
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed);
        } catch (e) {
            return false;
        }
    }
    return false;
};

const productValidation = [
    body('nameAr').notEmpty().withMessage('الاسم بالعربية مطلوب').trim().escape(),
    body('nameFr').notEmpty().withMessage('الاسم بالفرنسية مطلوب').trim().escape(),
    body('basePrice').isNumeric().withMessage('السعر يجب أن يكون رقماً').isFloat({ min: 0 }).withMessage('السعر يجب أن يكون أكبر من 0'),
    body('descriptionAr').optional().trim().escape(),
    body('descriptionFr').optional().trim().escape(),
    body('category').optional().trim().escape(),
    body('stock').optional().isInt({ min: 0 }).withMessage('المخزون يجب أن يكون عدداً صحيحاً غير سالب'),
    body('isBestSeller').optional().isBoolean().withMessage('يجب أن تكون قيمة منطقية'),
    body('isNewArrival').optional().isBoolean().withMessage('يجب أن تكون قيمة منطقية'),
    body('colors').optional().custom(isArrayOrJsonArray).withMessage('يجب أن تكون مصفوفة'),
    body('sizes').optional().custom(isArrayOrJsonArray).withMessage('يجب أن تكون مصفوفة'),
    body('components').optional().custom(isArrayOrJsonArray).withMessage('يجب أن تكون مصفوفة'),
];

const orderValidation = [
    body('customerName').notEmpty().withMessage('اسم العميل مطلوب').trim().escape(),
    body('phone').notEmpty().withMessage('رقم الهاتف مطلوب')
        .matches(/^(05|06|07)[0-9]{8}$/).withMessage('رقم هاتف غير صالح (يجب أن يبدأ بـ 05, 06, 07 ويتكون من 10 أرقام)'),
    body('wilaya').notEmpty().withMessage('الولاية مطلوبة').trim().escape(),
    body('commune').notEmpty().withMessage('البلدية مطلوبة').trim().escape(),
    body('address').notEmpty().withMessage('العنوان مطلوب').trim().escape(),
    body('shippingType').isIn(['home', 'office']).withMessage('نوع التوصيل غير صالح'),
    body('items').isArray({ min: 1 }).withMessage('يجب أن تحتوي الطلبية على منتج واحد على الأقل'),
];

const wilayaValidation = [
    body('wilayaName').notEmpty().withMessage('اسم الولاية مطلوب').trim().escape(),
    body('wilayaCode').isInt({ min: 1, max: 58 }).withMessage('رمز الولاية يجب أن يكون بين 1 و 58'),
    body('homePrice').isFloat({ min: 0 }).withMessage('سعر التوصيل للمنزل يجب أن يكون رقماً موجباً'),
    body('officePrice').isFloat({ min: 0 }).withMessage('سعر التوصيل للمكتب يجب أن يكون رقماً موجباً'),
];

const reviewValidation = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('التقييم يجب أن يكون بين 1 و 5'),
    body('comment').notEmpty().withMessage('التعليق مطلوب').trim().escape(),
    body('customerName').optional().trim().escape(),
];

module.exports = {
    validate,
    validateObjectId,
    productValidation,
    orderValidation,
    wilayaValidation,
    reviewValidation,
    param,
    query,
    body
};