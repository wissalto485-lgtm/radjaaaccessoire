const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const upload = require('../middleware/upload');
const { auth, isAdmin } = require('../middleware/auth');

async function getOrCreateSettings() {
    const settings = await Settings.findOneAndUpdate(
        { key: 'general' },
        { $setOnInsert: { key: 'general', heroImages: [] } },
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
                heroImages: settings.heroImages || []
            }
        });
    } catch (err) {
        console.error('خطأ في جلب الإعدادات:', err);
        res.status(500).json({ success: false, error: 'خطأ في جلب الإعدادات' });
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
            } catch (e) {
                keepUrls = [];
            }
        }

        const newUrls = (req.files || []).map(f => f.cloudinaryUrl);

        settings.heroImages = [...keepUrls, ...newUrls].slice(0, 4);
        await settings.save();

        res.json({
            success: true,
            message: 'تم تحديث صور Hero Slider بنجاح',
            heroImages: settings.heroImages
        });
    } catch (err) {
        console.error('خطأ في تحديث صور Hero Slider:', err);
        res.status(500).json({ success: false, error: 'فشل تحديث صور Hero Slider' });
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

        res.json({
            success: true,
            message: 'تم حذف الصورة',
            heroImages: settings.heroImages
        });
    } catch (err) {
        console.error('خطأ في حذف صورة Hero Slider:', err);
        res.status(500).json({ success: false, error: 'فشل حذف الصورة' });
    }
});

module.exports = router;