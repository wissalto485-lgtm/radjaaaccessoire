const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif|bmp|jfif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('فقط الصور مسموحة (jpeg, jpg, png, webp, gif, bmp, jfif)'));
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
        files: 10
    },
    fileFilter: fileFilter
});

const EXT_TO_TYPE = {
    '.jpg': 'jpg', '.jpeg': 'jpg', '.png': 'png',
    '.gif': 'gif', '.bmp': 'bmp', '.webp': 'webp'
};

function detectImageType(buffer) {
    if (!buffer || buffer.length < 12) return null;
    const b = buffer;
    if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return 'jpg';
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47 &&
        b[4] === 0x0D && b[5] === 0x0A && b[6] === 0x1A && b[7] === 0x0A) return 'png';
    if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 &&
        (b[4] === 0x37 || b[4] === 0x39) && b[5] === 0x61) return 'gif';
    if (b[0] === 0x42 && b[1] === 0x4D) return 'bmp';
    if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'webp';
    return null;
}

function collectFiles(req) {
    if (Array.isArray(req.files)) return req.files;
    if (req.files && typeof req.files === 'object') return Object.values(req.files).flat();
    if (req.file) return [req.file];
    return [];
}

function verifyUploadedImages(req, res, next) {
    const files = collectFiles(req);
    if (files.length === 0) return next();

    for (const file of files) {
        const detectedType = detectImageType(file.buffer);
        const expectedExt = path.extname(file.originalname).toLowerCase();
        const expectedType = EXT_TO_TYPE[expectedExt];

        if (!detectedType || (expectedType && detectedType !== expectedType)) {
            return res.status(400).json({
                success: false,
                error: 'محتوى الملف لا يطابق نوعه المعلن (الملف ليس صورة صالحة فعلياً)'
            });
        }
    }
    next();
}

function uploadToCloudinary(folder) {
    return async function (req, res, next) {
        const files = collectFiles(req);
        if (files.length === 0) return next();

        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            return res.status(500).json({
                success: false,
                error: 'إعدادات Cloudinary غير مكتملة في .env (تحقق من CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET)'
            });
        }

        try {
            await Promise.all(files.map(file => new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: folder, resource_type: 'image' },
                    (err, result) => {
                        if (err || !result) return reject(err || new Error('Cloudinary upload failed'));
                        file.cloudinaryUrl = result.secure_url;
                        file.cloudinaryPublicId = result.public_id;
                        resolve();
                    }
                );
                uploadStream.end(file.buffer);
            })));
            next();
        } catch (err) {
            console.error('خطأ في رفع الصورة إلى Cloudinary:', err.message);
            return res.status(500).json({ success: false, error: 'فشل رفع الصورة، حاول مرة أخرى' });
        }
    };
}

async function deleteFromCloudinary(url) {
    try {
        if (!url || !url.includes('res.cloudinary.com')) return;
        const parts = url.split('/upload/')[1];
        if (!parts) return;
        const withoutVersion = parts.replace(/^v\d+\//, '');
        const publicId = withoutVersion.replace(/\.[a-zA-Z0-9]+$/, '');
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (err) {
        console.error('تعذّر حذف الصورة من Cloudinary:', err.message);
    }
}

upload.verifyUploadedImages = verifyUploadedImages;
upload.uploadToCloudinary = uploadToCloudinary;
upload.deleteFromCloudinary = deleteFromCloudinary;

module.exports = upload;
