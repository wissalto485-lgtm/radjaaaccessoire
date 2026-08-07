const mongoose = require('mongoose');
const ShippingRate = require('../models/ShippingRate');
require('dotenv').config();

const shippingData = [
    { wilayaName: "وهران", wilayaCode: 31, homePrice: 450, officePrice: 300 },
    { wilayaName: "الجزائر", wilayaCode: 16, homePrice: 650, officePrice: 450 },
    { wilayaName: "معسكر", wilayaCode: 29, homePrice: 650, officePrice: 450 },
    { wilayaName: "تلمسان", wilayaCode: 13, homePrice: 700, officePrice: 500 },
    { wilayaName: "سيدي بلعباس", wilayaCode: 22, homePrice: 700, officePrice: 500 },
    { wilayaName: "مستغانم", wilayaCode: 27, homePrice: 700, officePrice: 500 },
    { wilayaName: "عين تيموشنت", wilayaCode: 46, homePrice: 700, officePrice: 500 },
    { wilayaName: "غليزان", wilayaCode: 48, homePrice: 700, officePrice: 500 },
    { wilayaName: "الشلف", wilayaCode: 2, homePrice: 750, officePrice: 550 },
    { wilayaName: "بجاية", wilayaCode: 6, homePrice: 750, officePrice: 550 },
    { wilayaName: "البليدة", wilayaCode: 9, homePrice: 750, officePrice: 550 },
    { wilayaName: "البويرة", wilayaCode: 10, homePrice: 750, officePrice: 550 },
    { wilayaName: "تيارت", wilayaCode: 14, homePrice: 750, officePrice: 550 },
    { wilayaName: "سعيدة", wilayaCode: 20, homePrice: 750, officePrice: 550 },
    { wilayaName: "قسنطينة", wilayaCode: 25, homePrice: 750, officePrice: 550 },
    { wilayaName: "المدية", wilayaCode: 26, homePrice: 750, officePrice: 550 },
    { wilayaName: "بومرداس", wilayaCode: 35, homePrice: 750, officePrice: 550 },
    { wilayaName: "تيسمسيلت", wilayaCode: 38, homePrice: 750, officePrice: 550 },
    { wilayaName: "تيبازة", wilayaCode: 42, homePrice: 750, officePrice: 550 },
    { wilayaName: "عين الدفلى", wilayaCode: 44, homePrice: 750, officePrice: 550 },
    { wilayaName: "أم البواقي", wilayaCode: 4, homePrice: 800, officePrice: 600 },
    { wilayaName: "باتنة", wilayaCode: 5, homePrice: 800, officePrice: 600 },
    { wilayaName: "تيزي وزو", wilayaCode: 15, homePrice: 800, officePrice: 600 },
    { wilayaName: "جيجل", wilayaCode: 18, homePrice: 800, officePrice: 600 },
    { wilayaName: "سطيف", wilayaCode: 19, homePrice: 800, officePrice: 600 },
    { wilayaName: "سكيكدة", wilayaCode: 21, homePrice: 800, officePrice: 600 },
    { wilayaName: "عنابة", wilayaCode: 23, homePrice: 800, officePrice: 600 },
    { wilayaName: "قالمة", wilayaCode: 24, homePrice: 800, officePrice: 600 },
    { wilayaName: "المسيلة", wilayaCode: 28, homePrice: 800, officePrice: 600 },
    { wilayaName: "برج بوعريريج", wilayaCode: 34, homePrice: 800, officePrice: 600 },
    { wilayaName: "خنشلة", wilayaCode: 40, homePrice: 800, officePrice: 600 },
    { wilayaName: "سوق أهراس", wilayaCode: 41, homePrice: 800, officePrice: 600 },
    { wilayaName: "ميلة", wilayaCode: 43, homePrice: 800, officePrice: 600 },
    { wilayaName: "تبسة", wilayaCode: 12, homePrice: 850, officePrice: 650 },
    { wilayaName: "الطارف", wilayaCode: 36, homePrice: 850, officePrice: 650 },
    { wilayaName: "الأغواط", wilayaCode: 3, homePrice: 950, officePrice: 750 },
    { wilayaName: "بسكرة", wilayaCode: 7, homePrice: 950, officePrice: 750 },
    { wilayaName: "بشار", wilayaCode: 8, homePrice: 950, officePrice: 750 },
    { wilayaName: "الجلفة", wilayaCode: 17, homePrice: 950, officePrice: 750 },
    { wilayaName: "ورقلة", wilayaCode: 30, homePrice: 950, officePrice: 750 },
    { wilayaName: "البيض", wilayaCode: 32, homePrice: 950, officePrice: 750 },
    { wilayaName: "الوادي", wilayaCode: 39, homePrice: 950, officePrice: 750 },
    { wilayaName: "النعامة", wilayaCode: 45, homePrice: 950, officePrice: 750 },
    { wilayaName: "غرداية", wilayaCode: 47, homePrice: 950, officePrice: 750 },
    { wilayaName: "أولاد جلال", wilayaCode: 51, homePrice: 950, officePrice: 750 },
    { wilayaName: "بني عباس", wilayaCode: 52, homePrice: 950, officePrice: 750 },
    { wilayaName: "تقرت", wilayaCode: 55, homePrice: 950, officePrice: 750 },
    { wilayaName: "المغير", wilayaCode: 57, homePrice: 950, officePrice: 750 },
    { wilayaName: "المنيعة", wilayaCode: 58, homePrice: 950, officePrice: 750 },
    { wilayaName: "أدرار", wilayaCode: 1, homePrice: 1300, officePrice: 1000 },
    { wilayaName: "تيميمون", wilayaCode: 49, homePrice: 1300, officePrice: 1000 },
    { wilayaName: "تمنراست", wilayaCode: 11, homePrice: 1400, officePrice: 1100 },
    { wilayaName: "تندوف", wilayaCode: 37, homePrice: 1400, officePrice: 1100 },
    { wilayaName: "برج باجي مختار", wilayaCode: 50, homePrice: 1500, officePrice: 1200 },
    { wilayaName: "عين صالح", wilayaCode: 53, homePrice: 1500, officePrice: 1200 },
    { wilayaName: "عين قزام", wilayaCode: 54, homePrice: 1500, officePrice: 1200 },
    { wilayaName: "جانت", wilayaCode: 56, homePrice: 1500, officePrice: 1200 },
    { wilayaName: "إليزي", wilayaCode: 33, homePrice: 1500, officePrice: 1200 }
];

async function seedShippingRates() {
    try {
        if (process.env.NODE_ENV === 'production') {
            console.error('لا يمكن تشغيل هذا الملف في بيئة الإنتاج!');
            console.error('يرجى تغيير NODE_ENV إلى development أو حذف هذا الملف.');
            process.exit(1);
        }

        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/RadjaaAccessoires';
        console.log(` الاتصال بقاعدة البيانات: ${MONGODB_URI.replace(/\/\/.*@/, '//****:****@')}`);

        await mongoose.connect(MONGODB_URI);
        console.log('متصل بقاعدة البيانات بنجاح');
        
        const existingCount = await ShippingRate.countDocuments();
        if (existingCount > 0) {
            console.log(` يوجد ${existingCount} ولاية في قاعدة البيانات.`);
            console.log('سيتم حذفها واستبدالها بالبيانات الجديدة.');
            
            if (process.env.NODE_ENV === 'development') {
                const readline = require('readline').createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                
                const answer = await new Promise((resolve) => {
                    readline.question('هل تريد المتابعة؟ (y/n): ', resolve);
                });
                readline.close();
                
                if (answer.toLowerCase() !== 'y') {
                    console.log('تم إلغاء العملية.');
                    process.exit(0);
                }
            }
        }
        
        await ShippingRate.deleteMany({});
        console.log('تم حذف البيانات القديمة');
        
        const result = await ShippingRate.insertMany(shippingData);
        console.log(`تم إضافة ${result.length} ولاية مع أسعار التوصيل`);
        
        console.log('\nعينة من الولايات المضافة:');
        result.slice(0, 5).forEach(rate => {
            console.log(`   ${rate.wilayaName} (${rate.wilayaCode}): المنزل ${rate.homePrice} د.ج | المكتب ${rate.officePrice} د.ج`);
        });
        if (result.length > 5) {
            console.log(`   ... و ${result.length - 5} ولاية أخرى`);
        }
        
        console.log('\nتمت العملية بنجاح!');
        process.exit(0);
        
    } catch (error) {
        console.error('خطأ:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('تأكد من تشغيل MongoDB على جهازك');
            console.error('أو تحقق من رابط الاتصال في ملف .env');
        }
        process.exit(1);
    }
}

seedShippingRates();