/* server.js — نقطة تشغيل الباك إند */

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const app = express();

/* الوسيطات (Middleware) */
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

/* نقاط النهاية */
app.use('/api', require('./src/routes/shop'));
app.use('/api/admin', require('./src/routes/admin'));

/* أي رابط /api مش معروف */
app.use('/api', (req, res) => res.status(404).json({ code: 'NOT_FOUND', message: 'الرابط غير موجود' }));

/* معالج الأخطاء الموحّد */
app.use((err, req, res, next) => {
  console.error('✗ خطأ:', err.message);
  if (res.headersSent) return next(err);
  const bad = err.name === 'CastError' || err.name === 'ValidationError';
  res.status(bad ? 400 : 500).json({ code: 'SERVER', message: bad ? 'بيانات غير صحيحة' : 'حصلت مشكلة في السيرفر' });
});

// الاتصال بقاعدة البيانات لكل طلب في بيئة Serverless
connectDB();

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`✓ سيرفر شغّال على http://localhost:${PORT}`));
}

module.exports = app;
