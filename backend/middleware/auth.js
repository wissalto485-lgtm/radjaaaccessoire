const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const verifyToken = promisify(jwt.verify);

const auth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'غير مصرح - يرجى تسجيل الدخول'
            });
        }

        const decoded = await verifyToken(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'توكن غير صالح أو منتهي الصلاحية'
        });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'يرجى تسجيل الدخول أولاً'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'غير مصرح - صلاحيات غير كافية (مطلوب صلاحية Admin)'
        });
    }

    next();
};

const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = await verifyToken(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
            req.user = decoded;
        }
    } catch (error) {
    }
    next();
};

module.exports = { auth, optionalAuth, isAdmin };