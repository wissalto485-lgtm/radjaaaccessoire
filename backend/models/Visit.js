const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({

    deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'unknown'],
        default: 'unknown',
        index: true
    },

   source: {
    type: String,
    enum: ['instagram', 'tiktok', 'telegram', 'other'],
    default: 'other',
    index: true
    },

    referrer: { type: String, default: '' },

    createdAt: { type: Date, default: Date.now, index: true }
});


visitSchema.index({ deviceType: 1, source: 1, createdAt: -1 });

module.exports = mongoose.model('Visit', visitSchema);