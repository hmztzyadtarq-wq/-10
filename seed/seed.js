/* seed/seed.js — زرع البيانات الأولية من الترمينال بدل زرار اللوحة
   التشغيل: npm run seed */

require('dotenv').config();
const connectDB = require('../src/config/db');
const runSeed = require('../src/utils/seedData');

(async () => {
  await connectDB();
  const r = await runSeed();
  console.log(r.seeded ? '✓ ' + r.message : 'ℹ ' + r.message);
  process.exit(0);
})().catch((e) => { console.error('✗ فشل الزرع:', e.message); process.exit(1); });
