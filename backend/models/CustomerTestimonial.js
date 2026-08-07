const mongoose = require('mongoose');

const customerTestimonialSchema = new mongoose.Schema({
    customerName: { 
        type: String, 
        required: [true, 'اسم الزبون مطلوب'],
        trim: true,
        maxlength: [100, 'اسم الزبون لا يزيد عن 100 حرف']
    },
    wilaya: { 
        type: String, 
        required: false,
        trim: true,
        maxlength: [100, 'اسم الولاية لا يزيد عن 100 حرف']
    },
    image: { 
        type: String, 
        required: [true, 'الصورة مطلوبة'],
        maxlength: [500, 'مسار الصورة طويل جداً']
    },
    order: { 
        type: Number, 
        default: 0,
        index: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

customerTestimonialSchema.pre('save', async function(next) {
    if (this.isNew) {
        const count = await mongoose.model('CustomerTestimonial').countDocuments();
        if (count >= 50) {
            const error = new Error('الحد الأقصى 50 شهادة');
            error.status = 400;
            return next(error);
        }
        this.order = count;
    }
    next();
});

module.exports = mongoose.model('CustomerTestimonial', customerTestimonialSchema);