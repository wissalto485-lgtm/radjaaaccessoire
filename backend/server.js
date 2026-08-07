require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const multer = require('multer');

const productRoutes = require('./routes/productRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');

const app = express();

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src-attr": ["'unsafe-inline'"],
            "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            "connect-src": ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            "style-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https:"],
            "font-src": ["'self'", "https://cdnjs.cloudflare.com", "data:"],
            "img-src": ["'self'", "data:", "https:", "blob:"],
        },
    },
    // HSTS يخبر المتصفح بعدم استخدام HTTP إطلاقاً لهذا الدومين مستقبلاً — يُفعَّل فقط في
    // production (حيث يُفترض أن الموقع يعمل فعلياً عبر HTTPS)؛ المتصفحات تتجاهل هذا الترويسة
    // أصلاً عند استقبالها عبر HTTP العادي، لذا لا ضرر من تركه false محلياً على localhost.
    hsts: process.env.NODE_ENV === 'production' ? {
        maxAge: 63072000, // سنتان
        includeSubDomains: true,
        preload: true
    } : false,
}));

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://localhost:5000',
            'http://127.0.0.1:5000'
        ];
        if (process.env.CLIENT_URL) {
            allowedOrigins.push(process.env.CLIENT_URL);
        }
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('غير مسموح بالوصول من هذا المصدر (CORS)'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 300,
    message: {
        success: false,
        error: 'عدد كبير جداً من الطلبات، يرجى المحاولة لاحقاً'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

app.use(compression());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// xss()/mongoSanitize() must run AFTER the body parsers above — otherwise
// req.body doesn't exist yet when they run and nothing gets sanitized.
app.use(xss());
app.use(mongoSanitize());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const frontendPath = path.join(__dirname, '../frontend');
if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
}

const uploadDir = path.join(__dirname, 'uploads');
const componentsDir = path.join(__dirname, 'uploads/components');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/RadjaaAccessoires';

async function connectDB(retries = 5) {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Successfully connected to the database');
        console.log(`Database: RadjaaAccessoires`);
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        if (retries > 0) {
            console.log(` Retrying connection... (${retries} attempts remaining)`);
            setTimeout(() => connectDB(retries - 1), 5000);
        } else {
            console.log('تأكد من تشغيل MongoDB على جهازك');
            process.exit(1);
        }
    }
}

connectDB();

app.use('/api', settingsRoutes);
app.use('/api', testimonialRoutes);
app.use('/api', productRoutes);

const upload = require('./middleware/upload');
const { auth } = require('./middleware/auth');

app.post('/api/upload', auth, upload.any(), upload.verifyUploadedImages, upload.uploadToCloudinary('radjaa/products'), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'لم يتم رفع أي صورة' });
        }
        
        const mainImages = [];
        const componentImages = {};
        
        req.files.forEach(file => {
            if (file.fieldname === 'images') {
                mainImages.push(file.cloudinaryUrl);
            } else if (file.fieldname && file.fieldname.startsWith('component_image_')) {
                const index = file.fieldname.split('_')[2];
                componentImages[index] = file.cloudinaryUrl;
            }
        });
        
        res.json({
            success: true,
            message: 'تم رفع الصور بنجاح',
            images: mainImages,
            componentImages: componentImages
        });
    } catch (error) {
        console.error('خطأ:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'المسار غير موجود'
    });
});

app.use((err, req, res, next) => {
    console.error('خطأ:', err.stack);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'عدد الملفات كبير جداً (الحد الأقصى 10 صور)'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        error: 'حدث خطأ داخلي في السيرفر'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('=========================================');
    console.log(`Radjaa Accessoires - Backend Server`);
    console.log('=========================================');
    console.log(`The server is working on: http://localhost:${PORT}`);
    console.log(`Database: MongoDB`);
    console.log(` API available at: http://localhost:${PORT}/api`);
    console.log(` Admin panel: http://localhost:${PORT}/login.html`);
    console.log('=========================================');
    console.log(' Ready to accept requests');
    console.log('=========================================');
});