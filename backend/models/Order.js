const mongoose = require('mongoose');

const validatePhone = (phone) => {
    return /^(05|06|07)[0-9]{8}$/.test(phone);
};

const statusHistorySchema = new mongoose.Schema({
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        required: true 
    },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' }
});

const customizationItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true },
    price: { type: Number, required: true }
});

const selectedAddonSchema = new mongoose.Schema({
    id: { type: String, default: '' },
    choice: { type: String, enum: ['without', 'with'], default: 'without' },
    price: { type: Number, default: 0 },
    hasCustomField: { type: Boolean, default: false }
});

const selectedComponentSchema = new mongoose.Schema({
    index: { type: Number },
    nameAr: { type: String },
    nameFr: { type: String },
    price: { type: Number },
    type: { type: String, enum: ['separate', 'without'] }
});

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productNameAr: { type: String, default: '' },
    productNameFr: { type: String, default: '' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedColor: {
        name: String,
        hexCode: String
    },
    selectedSize: {
        size: String,
        price: Number
    },
    selectedMaterial: {
        name: String,
        extraPrice: Number
    },
    selectedComponent: { type: selectedComponentSchema, default: null },
    additionalPartsText: { type: String, default: '' },
    purchaseType: { type: String, enum: ['full', 'component', 'separate', 'fullWithout'], default: 'full' },
    selectedAddon: { type: selectedAddonSchema, default: () => ({}) },
    addonCustomValue: { type: String, default: '' },
    basePrice: { type: Number, default: 0 },
    unitPrice: { type: Number, required: true },
    customizations: { type: [customizationItemSchema], default: [] },
    customizationText: { type: String, default: '' },
    customizationExtra: { type: Number, default: 0 }
});

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true, trim: true },
    phone: { 
        type: String, 
        required: true,
        validate: {
            validator: validatePhone,
            message: 'رقم هاتف غير صالح (يجب أن يبدأ بـ 05, 06, 07 ويتكون من 10 أرقام)'
        }
    },
    email: { 
        type: String, 
        trim: true, 
        lowercase: true,
        validate: {
            validator: function(v) {
                return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'بريد إلكتروني غير صالح'
        }
    },
    wilaya: { type: String, required: true },
    commune: { type: String, required: true },
    address: { type: String, required: true },
    deliveryNotes: { type: String, default: '' },
    shippingType: { 
        type: String, 
        enum: ['office', 'home'], 
        required: true 
    },
    shippingCost: { 
        type: Number, 
        required: true,
        min: 0
    },
    items: { 
        type: [orderItemSchema], 
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'يجب أن تحتوي الطلبية على منتج واحد على الأقل'
        }
    },
    generalCustomizations: { type: [customizationItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    customizationsTotal: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    revenue: { type: Number, default: 0 },
    paymentMethod: { 
        type: String, 
        enum: ['cod'], 
        default: 'cod',
        required: true 
    },
    notes: { type: String, default: '' },
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending' 
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    guestCheckout: { type: Boolean, default: true },
    adminNotes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    let itemsTotal = 0;
    if (this.items && this.items.length > 0) {
        for (const item of this.items) {
            const unitPrice = item.unitPrice || 0;
            const quantity = item.quantity || 1;
            itemsTotal += unitPrice * quantity;
            
            if (item.customizations && item.customizations.length > 0) {
                for (const custom of item.customizations) {
                    itemsTotal += custom.price || 0;
                }
            }
        }
    }
    
    let customizationsTotal = 0;
    if (this.generalCustomizations && this.generalCustomizations.length > 0) {
        for (const gen of this.generalCustomizations) {
            customizationsTotal += gen.price || 0;
        }
    }
    this.customizationsTotal = customizationsTotal;
    this.subtotal = itemsTotal;
    
    const shippingCost = this.shippingCost || 0;
    const calculatedTotal = itemsTotal + customizationsTotal + shippingCost;
    if (!this.isModified('totalAmount') || this.totalAmount === 0) {
        this.totalAmount = calculatedTotal;
    }
    
    this.revenue = (this.totalAmount || 0) - (this.shippingCost || 0);
    if (this.revenue < 0) this.revenue = 0;
    
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date(),
            note: `تم تحديث الحالة إلى ${this.status}`
        });
    }
    
    next();
});

orderSchema.methods.calculateTotal = function() {
    let itemsTotal = 0;
    for (const item of this.items) {
        itemsTotal += item.unitPrice * item.quantity;
        for (const customization of item.customizations) {
            itemsTotal += customization.price;
        }
    }
    this.subtotal = itemsTotal;
    this.totalAmount = this.subtotal + this.customizationsTotal + this.shippingCost;
    return this.totalAmount;
};

orderSchema.methods.getStatusTimeline = function() {
    return this.statusHistory.map(entry => ({
        status: entry.status,
        date: entry.changedAt,
        note: entry.note
    }));
};

orderSchema.virtual('isNew').get(function() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.createdAt > oneHourAgo;
});

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ phone: 1 });

module.exports = mongoose.model('Order', orderSchema);