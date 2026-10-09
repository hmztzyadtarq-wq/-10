/* src/utils/bootstrap.js — إنشاء حساب الأدمن الأول تلقائيًا لو مفيش أي أدمن في القاعدة
   البيانات بتيجي من ملف .env (ADMIN_PHONE و ADMIN_PASS) */

const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const ensureAdmin = async () => {
  if (await Admin.exists({})) return; // فيه أدمن بالفعل — مفيش حاجة نعملها
  const phone = (process.env.ADMIN_PHONE || '01000000000').trim();
  const pass = (process.env.ADMIN_PASS || 'admin123');
  await Admin.create({ phone, password: await bcrypt.hash(pass, 10) });
  console.log(`✓ اتولد حساب أدمن افتراضي — الموبايل: ${phone} — كلمة المرور: ${pass}`);
  console.log('  ⚠ غيّر كلمة المرور من لوحة التحكم ← الإعدادات بعد أول دخول');
};

module.exports = ensureAdmin;
