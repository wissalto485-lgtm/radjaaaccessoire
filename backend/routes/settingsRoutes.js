const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const upload = require('../middleware/upload');
const { auth, isAdmin } = require('../middleware/auth');

async function getOrCreateSettings() {
    const settings = await Settings.findOneAndUpdate(
        { key: 'general' },
        { $setOnInsert: { key: 'general' } },
        { new: true, upsert: true }
    );
    return settings;
}

router.get('/settings', async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json({
            success: true,
            settings: {
                heroImages: settings.heroImages || [],
                aboutContentAr: settings.aboutContentAr || '',
                aboutContentFr: settings.aboutContentFr || '',
                socialLinks: settings.socialLinks || {},
                followersCount: settings.followersCount || {}
            }
        });
    } catch (err) {
        console.error('خطأ في جلب الإعدادات:', err);
        res.status(500).json({ success: false, error: 'خطأ في جلب الإعدادات' });
    }
});

router.put('/settings/about', auth, isAdmin, async (req, res) => {
    try {
        const { aboutContentAr, aboutContentFr } = req.body;
        const settings = await getOrCreateSettings();
        settings.aboutContentAr = aboutContentAr || '';
        settings.aboutContentFr = aboutContentFr || '';
        await settings.save();
        res.json({
            success: true,
            message: 'تم تحديث محتوى "من نحن"',
            aboutContentAr: settings.aboutContentAr,
            aboutContentFr: settings.aboutContentFr
        });
    } catch (err) {
        console.error('خطأ في تحديث "من نحن":', err);
        res.status(500).json({ success: false, error: 'فشل التحديث' });
    }
});

router.put('/settings/social', auth, isAdmin, async (req, res) => {
    try {
        const { socialLinks, followersCount } = req.body;
        const settings = await getOrCreateSettings();
        if (socialLinks) settings.socialLinks = { ...settings.socialLinks, ...socialLinks };
        if (followersCount) settings.followersCount = { ...settings.followersCount, ...followersCount };
        await settings.save();
        res.json({
            success: true,
            message: 'تم تحديث روابط السوشيال',
            socialLinks: settings.socialLinks,
            followersCount: settings.followersCount
        });
    } catch (err) {
        console.error('خطأ في تحديث السوشيال:', err);
        res.status(500).json({ success: false, error: 'فشل التحديث' });
    }
});

router.post('/settings/cancelled-phones/add', auth, isAdmin, async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ success: false, error: 'رقم الهاتف مطلوب' });
        const settings = await getOrCreateSettings();
        if (!settings.cancelledPhones.includes(phone)) {
            settings.cancelledPhones.push(phone);
            await settings.save();
        }
        res.json({ success: true, cancelledPhones: settings.cancelledPhones });
    } catch (err) {
        res.status(500).json({ success: false, error: 'فشل الإضافة' });
    }
});

router.get('/settings/cancelled-phones', auth, isAdmin, async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json({ success: true, cancelledPhones: settings.cancelledPhones || [] });
    } catch (err) {
        res.status(500).json({ success: false, error: 'فشل الجلب' });
    }
});

router.get('/settings/notifications', auth, isAdmin, async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json({ success: true, notifications: settings.notifications || [], sentNotificationIds: settings.sentNotificationIds || [] });
    } catch (err) {
        res.status(500).json({ success: false, error: 'فشل الجلب' });
    }
});

router.post('/settings/notifications', auth, isAdmin, async (req, res) => {
    try {
        const { notifications, sentNotificationIds } = req.body;
        const settings = await getOrCreateSettings();
        if (notifications) settings.notifications = notifications;
        if (sentNotificationIds) settings.sentNotificationIds = sentNotificationIds;
        await settings.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'فشل التحديث' });
    }
});

router.delete('/settings/notifications', auth, isAdmin, async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        settings.notifications = [];
        settings.sentNotificationIds = [];
        await settings.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'فشل الحذف' });
    }
});

router.post('/settings/hero-images', auth, isAdmin, upload.array('heroImages', 4), upload.verifyUploadedImages, upload.uploadToCloudinary('radjaa/settings'), async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        let keepUrls = [];
        if (req.body.keepImages) {
            try {
                keepUrls = JSON.parse(req.body.keepImages);
                if (!Array.isArray(keepUrls)) keepUrls = [];
            } catch (e) { keepUrls = []; }
        }
        const newUrls = (req.files || []).map(f => f.cloudinaryUrl);
        settings.heroImages = [...keepUrls, ...newUrls].slice(0, 4);
        await settings.save();
        res.json({ success: true, message: 'تم تحديث صور Hero Slider', heroImages: settings.heroImages });
    } catch (err) {
        res.status(500).json({ success: false, error: 'فشل التحديث' });
    }
});

router.delete('/settings/hero-images/:index', auth, isAdmin, async (req, res) => {
    try {
        const idx = parseInt(req.params.index, 10);
        const settings = await getOrCreateSettings();
        if (isNaN(idx) || idx < 0 || idx >= settings.heroImages.length) {
            return res.status(400).json({ success: false, error: 'فهرس صورة غير صالح' });
        }
        const removedUrl = settings.heroImages[idx];
        settings.heroImages.splice(idx, 1);
        await settings.save();
        upload.deleteFromCloudinary(removedUrl);
        res.json({ success: true, message: 'تم حذف الصورة', heroImages: settings.heroImages });
    } catch (err) {
        res.status(500).json({ success: false, error: 'فشل الحذف' });
    }
});

module.exports = router;