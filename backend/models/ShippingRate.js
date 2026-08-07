const mongoose = require('mongoose');

const shippingRateSchema = new mongoose.Schema({
    wilayaName: { type: String, required: true, unique: true },
    wilayaCode: { type: Number, required: true, unique: true },
    homePrice: { type: Number, required: true, default: 0 },
    officePrice: { type: Number, required: true, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ShippingRate', shippingRateSchema);