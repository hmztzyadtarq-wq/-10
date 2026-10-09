/* src/config/db.js — الاتصال بقاعدة البيانات MongoDB باستخدام Mongoose
   الرابط بيجي من ملف .env تحت اسم MONGO_URI (قاعدة محلية أو MongoDB Atlas) */

const mongoose = require('mongoose');

/* تنبيه لو الاتصال انقطع بعد ما كان شغال (Mongoose بيعيد المحاولة لوحده) */
mongoose.connection.on('disconnected', () => {
  console.warn('⚠ انقطع الاتصال بقاعدة البيانات — بيحاول يتصل تاني...');
});

/* الاتصال بقاعدة البيانات مرة واحدة عند تشغيل السيرفر */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000 // مدة الانتظار قبل اعتبار القاعدة مش متاحة (10 ثواني)
    });

    console.log(`✓ متصل بقاعدة البيانات MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('✗ فشل الاتصال بقاعدة البيانات:', error.message);
    console.error('  تأكد إن MongoDB شغالة، أو إن الرابط في ملف .env صح');
    process.exit(1); // من غير قاعدة بيانات مفيش لازمة نكمل تشغيل
  }
};

module.exports = connectDB;
