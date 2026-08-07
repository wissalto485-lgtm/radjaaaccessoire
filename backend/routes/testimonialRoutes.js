const express = require('express');
const router = express.Router();
const CustomerTestimonial = require('../models/CustomerTestimonial');
const { auth, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const escapeHtml = (str) => String(str).replace(/[&<>"'/]/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;'
}[c]));

router.get('/testimonials', async (req, res) => {
    try {
        const testimonials = await CustomerTestimonial.find()
            .sort({ order: 1 })
            .select('customerName wilaya image order createdAt');
        
        res.json({ 
            success: true, 
            count: testimonials.length,
            testimonials 
        });
    } catch (error) {
        console.error('خطأ في جلب الشهادات:', error);
        res.status(500).json({ 
            success: false, 
            error: 'فشل جلب الشهادات' 
        });
    }
});

router.post('/testimonials', auth, isAdmin, upload.single('image'), upload.verifyUploadedImages, upload.uploadToCloudinary('radjaa/testimonials'), async (req, res) => {
    try {
        const { customerName, wilaya } = req.body;
        
        if (!customerName) {
            return res.status(400).json({ 
                success: false, 
                error: 'اسم الزبون مطلوب' 
            });
        }
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'الصورة مطلوبة' 
            });
        }
        
        const count = await CustomerTestimonial.countDocuments();
        if (count >= 50) {
            upload.deleteFromCloudinary(req.file.cloudinaryUrl);
            return res.status(400).json({ 
                success: false, 
                error: 'الحد الأقصى 50 شهادة' 
            });
        }
        
        const newTestimonial = new CustomerTestimonial({
            customerName: escapeHtml(customerName.trim()),
            wilaya: wilaya ? escapeHtml(wilaya.trim()) : '',
            image: req.file.cloudinaryUrl
        });
        
        await newTestimonial.save();

        res.status(201).json({ 
            success: true, 
            message: 'تم إضافة الشهادة بنجاح',
            testimonial: newTestimonial 
        });

    } catch (error) {
        if (req.file && req.file.cloudinaryUrl) {
            upload.deleteFromCloudinary(req.file.cloudinaryUrl);
        }
        console.error('خطأ في إضافة الشهادة:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

router.delete('/testimonials/:id', auth, isAdmin, async (req, res) => {
    try {
        const testimonial = await CustomerTestimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ 
                success: false, 
                error: 'الشهادة غير موجودة' 
            });
        }
        
        upload.deleteFromCloudinary(testimonial.image);
        
        await testimonial.deleteOne();

        const remaining = await CustomerTestimonial.find().sort({ order: 1 });
        for (let i = 0; i < remaining.length; i++) {
            remaining[i].order = i;
            await remaining[i].save();
        }

        res.json({ 
            success: true, 
            message: 'تم حذف الشهادة بنجاح' 
        });

    } catch (error) {
        console.error('خطأ في حذف الشهادة:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
