/* server.js — نقطة تشغيل الباك إند:
   1) يحمّل متغيرات البيئة (.env)  2) يتصل بـ MongoDB
   3) يجهّز Express (CORS + JSON + ملفات الفرونت الثابتة)
   4) يركّب نقاط النهاية (الموقع + لوحة التحكم) ومعالج الأخطاء */

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const ensureAdmin = require('./src/utils/bootstrap');

const app = express();

/* الوسيطات (Middleware) */
app.use(cors());                                    // السماح للفرونت إند (أي دومين) بالاتصال بالـ APIs
app.use(express.json({ limit: '10mb' }));   // الصور بتترفع base64 فمحتاجين حد أقصى كبير
app.use(express.static(path.join(__dirname))); // ملفات الموقع الثابتة في الجذر

/* نقاط النهاية */
app.use('/api', require('./src/routes/shop'));      // APIs الموقع للزوار
app.use('/api/admin', require('./src/routes/admin')); // APIs لوحة التحكم (محمية)

/* أي رابط /api مش معروف */
app.use('/api', (req, res) => res.status(404).json({ code: 'NOT_FOUND', message: 'الرابط غير موجود' }));

/* معالج الأخطاء الموحّد (أخطاء غير متوقعة أو بيانات غلط من Mongoose) */
app.use((err, req, res, next) => {
  console.error('✗ خطأ:', err.message);
  if (res.headersSent) return next(err);
  const bad = err.name === 'CastError' || err.name === 'ValidationError';
  res.status(bad ? 400 : 500).json({ code: 'SERVER', message: bad ? 'بيانات غير صحيحة' : 'حصلت مشكلة في السيرفر' });
});

/* الاتصال بقاعدة البيانات لبيئة العمل (محلي أو Vercel Serverless) */
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  connectDB().then(async () => {
    await ensureAdmin();
    app.listen(PORT, () => console.log(`✓ سيرفر حلو الملك شغّال على http://localhost:${PORT}`));
  });
} else {
  // الاتصال في بيئة الإنتاج على Vercel
  connectDB();
}

module.exports = app;
