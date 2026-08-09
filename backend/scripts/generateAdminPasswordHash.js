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
