/**
 * أداة لتوليد Hash آمن (bcrypt) لكلمة مرور الأدمن، لوضعه في ADMIN_PASSWORD داخل .env
 * بدلاً من كتابة كلمة المرور كنص صريح.
 *
 * الاستخدام:
 *   node scripts/generateAdminPasswordHash.js "كلمة_المرور_الحالية"
 *
 * ثم انسخ القيمة الناتجة وضعها في .env هكذا:
 *   ADMIN_PASSWORD=$2b$12$..........................................
 *
 * ملاحظة: بعد هذا التعديل يبقى الموقع يعمل بشكل طبيعي فوراً — لا حاجة لإعادة تشغيل
 * أي شيء آخر غير السيرفر (npm start)، لأن مسار تسجيل الدخول يدعم كلا الشكلين
 * (Hash أو نص صريح) تلقائياً حتى تقوم بهذا التبديل بنفسك.
 */

const bcrypt = require('bcryptjs');

const plainPassword = process.argv[2];

if (!plainPassword) {
    console.error('يرجى تمرير كلمة المرور كوسيط:');
    console.error('  node scripts/generateAdminPasswordHash.js "كلمة_المرور"');
    process.exit(1);
}

const SALT_ROUNDS = 12;

bcrypt.hash(plainPassword, SALT_ROUNDS).then((hash) => {
    console.log('\nضع هذا السطر في ملف .env بدلاً من ADMIN_PASSWORD الحالي:\n');
    console.log(`ADMIN_PASSWORD=${hash}`);
    console.log('\n(لا تشارك هذا الـ hash مع أحد رغم أنه ليس النص الصريح لكلمة المرور)\n');
});
