const mongoose = require('mongoose');

const savedOrderSchema = new mongoose.Schema({
    wilaya: { type: String, required: true },
    productName: { type: String, required: true },
    productNameAr: { type: String, default: '' },
    productNameFr: { type: String, default: '' },
    subtotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    revenue: { type: Number, default: 0 },
    orderDate: { type: Date, required: true },
    savedAt: { type: Date, default: Date.now },
    year: { type: Number, required: true },
    items: { type: Array, default: [] },
});

savedOrderSchema.index({ year: 1 });

module.exports = mongoose.model('SavedOrder', savedOrderSchema);