const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, default: 'general' },
    heroImages: { type: [String], default: [] },
    aboutContentAr: { type: String, default: '' },
    aboutContentFr: { type: String, default: '' },
    socialLinks: {
        instagramName: { type: String, default: 'radjaa_accessoiree' },
        instagramUrl: { type: String, default: 'https://www.instagram.com/radjaa_accessoiree/' },
        facebookName: { type: String, default: 'Radjaa Accessoire' },
        facebookUrl: { type: String, default: 'https://www.facebook.com/radjaa.accessoire/' },
        tiktokName: { type: String, default: 'radjaaaccessoire' },
        tiktokUrl: { type: String, default: 'https://www.tiktok.com/@radjaaaccessoire' },
        whatsapp: { type: String, default: '213775087631' }
    },
    followersCount: {
        instagram: { type: String, default: '35,900+' },
        facebook: { type: String, default: '30,800+' },
        tiktok: { type: String, default: '60,600+' }
    },
    cancelledPhones: { type: [String], default: [] },
    notifications: { type: [{
        id: String,
        title: String,
        desc: String,
        type: String,
        link: String,
        time: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }], default: [] },
    sentNotificationIds: { type: [String], default: [] },
    updatedAt: { type: Date, default: Date.now }
});

settingsSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Settings', settingsSchema);