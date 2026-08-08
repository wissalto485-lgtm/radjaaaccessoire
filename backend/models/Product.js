const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 50 
    },
    hexCode: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                if (v === 'all' || v === 'unified' || v === 'custom') return true;
                return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
            },
            message: props => `${props.value} ليس رمز لون صالح`
        }
    }
});

const sizeSchema = new mongoose.Schema({
    size: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 50 
    },
    price: { 
        type: Number, 
        required: true,
        min: 0 
    }
});

const materialSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 50 
    },
    extraPrice: { 
        type: Number, 
        default: 0,
        min: 0 
    }
});

const customizationSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 100 
    },
    price: { 
        type: Number, 
        required: true,
        min: 0 
    },
    maxLength: { 
        type: Number, 
        default: 20,
        min: 1,
        max: 500 
    }
});

const reviewSchema = new mongoose.Schema({
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    comment: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 1000
    },
    customerName: { 
        type: String, 
        default: 'زبون',
        trim: true,
        maxlength: 100
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    approved: { 
        type: Boolean, 
        default: true 
    }
});

const componentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 100 
    },
    nameAr: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 100 
    },
    nameFr: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 100 
    },
    price: { 
        type: Number, 
        required: true,
        min: 0 
    },
    image: { 
        type: String, 
        default: '',
        maxlength: 500 
    }
});

const productCustomizationSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: false },
    labelAr: { 
        type: String, 
        default: 'تفاصيل إضافية',
        maxlength: 100 
    },
    labelFr: { 
        type: String, 
        default: 'Détails supplémentaires',
        maxlength: 100 
    },
    extraPrice: { 
        type: Number, 
        default: 0,
        min: 0 
    }
});

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true,
        maxlength: 100 
    },
    nameAr: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 100 
    },
    nameFr: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 100 
    },
    description: { 
        type: String, 
        default: '',
        maxlength: 2000 
    },
    descriptionAr: { 
        type: String, 
        default: '',
        maxlength: 2000 
    },
    descriptionFr: { 
        type: String, 
        default: '',
        maxlength: 2000 
    },
    basePrice: { 
        type: Number, 
        required: true,
        min: 0 
    },
    stock: { 
        type: Number, 
        default: 1,
        min: 0,
        max: 9999 
    },
    mainImage: { 
        type: String, 
        default: '',
        maxlength: 500 
    },
    images: { 
        type: [String], 
        default: [],
        validate: {
            validator: function(v) {
                return v.length <= 10;
            },
            message: 'الحد الأقصى للصور هو 10'
        }
    },
    category: { 
        type: String, 
        default: 'غير مصنف',
        trim: true,
        maxlength: 50 
    },
    colors: { 
        type: [colorSchema], 
        default: [],
        validate: {
            validator: function(v) {
                return v.length <= 20;
            },
            message: 'الحد الأقصى للألوان هو 20'
        }
    },
    sizes: { 
        type: [sizeSchema], 
        default: [],
        validate: {
            validator: function(v) {
                return v.length <= 20;
            },
            message: 'الحد الأقصى للمقاسات هو 20'
        }
    },
    materialOptions: { 
        type: [materialSchema], 
        default: [] 
    },
    customizations: { 
        type: [customizationSchema], 
        default: [] 
    },
    isBestSeller: { 
        type: Boolean, 
        default: false 
    },
    isNewArrival: { 
        type: Boolean, 
        default: false 
    },
    addons: [{
        id: { 
            type: String, 
            default: () => new mongoose.Types.ObjectId().toString() 
        },
        nameAr: { 
            type: String, 
            required: true,
            trim: true,
            maxlength: 100 
        },
        nameFr: { 
            type: String, 
            required: true,
            trim: true,
            maxlength: 100 
        },
        price: { 
            type: Number, 
            required: true,
            min: 0 
        },
        isRequired: { 
            type: Boolean, 
            default: false 
        },
        hasCustomField: { 
            type: Boolean, 
            default: false 
        },
        customFieldLabelAr: { 
            type: String, 
            default: 'اللون/الطول',
            maxlength: 100 
        },
        customFieldLabelFr: { 
            type: String, 
            default: 'Couleur/Longueur',
            maxlength: 100 
        }
    }],
    reviews: { 
        type: [reviewSchema], 
        default: [],
        validate: {
            validator: function(v) {
                return v.length <= 500;
            },
            message: 'الحد الأقصى للتقييمات هو 500'
        }
    },
    averageRating: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 5 
    },
    allowReviews: { 
        type: Boolean, 
        default: true 
    },
    hasComponents: { 
        type: Boolean, 
        default: false 
    },
    components: { 
        type: [componentSchema], 
        default: [],
        validate: {
            validator: function(v) {
                return v.length <= 50;
            },
            message: 'الحد الأقصى للأجزاء هو 50'
        }
    },
    componentSettings: [{
        componentIndex: { 
            type: Number, 
            required: true,
            min: 0 
        },
        sellSeparately: { 
            type: Boolean, 
            default: false 
        },
        allowFullWithout: { 
            type: Boolean, 
            default: false 
        }
    }],
    hasSizes: { 
        type: Boolean, 
        default: false 
    },
    hasCustomization: { 
        type: Boolean, 
        default: false 
    },
    customization: { 
        type: productCustomizationSchema, 
        default: () => ({ enabled: false }) 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

productSchema.virtual('priceRange').get(function() {
    if (this.sizes && this.sizes.length > 0) {
        const prices = this.sizes.map(s => s.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (min === max) return `${min}`;
        return `${min} - ${max}`;
    }
    return `${this.basePrice}`;
});

productSchema.virtual('inStock').get(function() {
    return this.stock > 0;
});

productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    if (this.sizes && this.sizes.length > 0) {
        this.hasSizes = true;
    } else {
        this.hasSizes = false;
    }
    
    if (this.components && this.components.length > 0) {
        this.hasComponents = true;
    } else {
        this.hasComponents = false;
    }
    
    if (this.customization && this.customization.enabled) {
        this.hasCustomization = true;
    } else {
        this.hasCustomization = false;
    }
    
    this.calculateAverageRating();
    next();
});

productSchema.methods.getMinPrice = function() {
    if (this.sizes && this.sizes.length > 0) {
        const prices = this.sizes.map(s => s.price);
        return Math.min(...prices);
    }
    return this.basePrice;
};

productSchema.methods.getMaxPrice = function() {
    if (this.sizes && this.sizes.length > 0) {
        const prices = this.sizes.map(s => s.price);
        return Math.max(...prices);
    }
    return this.basePrice;
};

productSchema.methods.calculateAverageRating = function() {
    if (!this.reviews || this.reviews.length === 0) {
        this.averageRating = 0;
        return 0;
    }
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = total / this.reviews.length;
    return this.averageRating;
};

productSchema.methods.addReview = function(rating, comment, customerName) {
    this.reviews.push({
        rating,
        comment,
        customerName: customerName || 'زبون',
        date: new Date(),
        approved: false
    });
    this.calculateAverageRating();
    return this.save();
};

productSchema.methods.isAvailable = function(quantity = 1) {
    return this.stock >= quantity;
};

productSchema.methods.reduceStock = function(quantity = 1) {
    if (!this.isAvailable(quantity)) {
        throw new Error('المخزون غير كافٍ');
    }
    this.stock -= quantity;
    return this.save();
};

productSchema.statics.findAvailable = function() {
    return this.find({ stock: { $gt: 0 } });
};

productSchema.statics.findBestSellers = function(limit = 10) {
    return this.find({ isBestSeller: true })
        .limit(limit)
        .sort({ createdAt: -1 });
};

productSchema.statics.findNewArrivals = function(limit = 10) {
    return this.find({ isNewArrival: true })
        .limit(limit)
        .sort({ createdAt: -1 });
};

productSchema.statics.findByCategory = function(category) {
    return this.find({ category });
};

productSchema.index({ nameAr: 'text', nameFr: 'text', descriptionAr: 'text', descriptionFr: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ stock: 1 });
productSchema.index({ category: 1, basePrice: 1 });
productSchema.index({ isBestSeller: 1, createdAt: -1 });
productSchema.index({ isNewArrival: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);