/* src/controllers/authController.js — الحسابات: عملاء وأدمن (بديل Firebase Auth كامل)
   - العميل بيسجّل برقم الموبايل + كلمة مرور
   - الأدمن بيدخل بنفس الشكل (رقم أو إيميل) والسيرفر بيميّز نوعه في التوكن */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');
const Order = require('../models/Order');

const PHONE_RE = /^01[0125]\d{8}$/;

/* توقيع توكن شايل: { id, phone, kind } — kind = customer أو admin */
const signToken = (user, kind) =>
  jwt.sign({ id: user._id.toString(), phone: user.phone, kind }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '30d' });

/* POST /api/auth/register — إنشاء حساب عميل جديد */
exports.register = async (req, res) => {
  try {
    const phone = String(req.body.phone || '').trim();
    const pass = String(req.body.pass || '');
    if (!PHONE_RE.test(phone)) return res.status(400).json({ code: 'BAD_PHONE', message: 'رقم الموبايل غير صحيح' });
    if (pass.length < 6) return res.status(400).json({ code: 'WEAK_PASS', message: 'كلمة المرور لازم 6 حروف على الأقل' });
    if (await Customer.findOne({ phone })) return res.status(409).json({ code: 'PHONE_USED', message: 'الرقم ده مسجّل قبل كده' });
    const c = await Customer.create({ phone, password: await bcrypt.hash(pass, 10) });
    res.status(201).json({ token: signToken(c, 'customer'), kind: 'customer', phone: c.phone });
  } catch {
    res.status(500).json({ code: 'SERVER', message: 'حصلت مشكلة، حاول تاني' });
  }
};

/* POST /api/auth/login — دخول موحّد (عميل أو أدمن): بنجرّب الأدمن الأول وبعدين العميل */
exports.login = async (req, res) => {
  try {
    const raw = String(req.body.phone || '').trim();
    const pass = String(req.body.pass || '');
    // 1) أدمن؟ (بيكتب رقم الموبايل أو الإيميل)
    const admin = await Admin.findOne({ phone: raw });
    if (admin && (await bcrypt.compare(pass, admin.password))) {
      return res.json({ token: signToken(admin, 'admin'), kind: 'admin', phone: admin.phone });
    }
    // 2) عميل؟ (رقم موبايل مصري)
    if (PHONE_RE.test(raw)) {
      const c = await Customer.findOne({ phone: raw });
      if (c && (await bcrypt.compare(pass, c.password))) {
        return res.json({ token: signToken(c, 'customer'), kind: 'customer', phone: c.phone });
      }
    }
    res.status(401).json({ code: 'BAD_CRED', message: 'الرقم أو كلمة المرور غلط' });
  } catch {
    res.status(500).json({ code: 'SERVER', message: 'حصلت مشكلة، حاول تاني' });
  }
};

/* GET /api/auth/me — بيانات الحساب الحالي من التوكن (بديل onAuthStateChanged) */
exports.me = async (req, res) => {
  try {
    if (req.user.kind === 'admin') return res.json({ kind: 'admin', phone: req.user.phone });
    const hasOrders = await Order.exists({ uid: req.user.id });
    res.json({ kind: 'customer', phone: req.user.phone, hasOrders: !!hasOrders });
  } catch {
    res.status(500).json({ code: 'SERVER', message: 'حصلت مشكلة في السيرفر' });
  }
};

/* POST /api/auth/password — تغيير كلمة المرور للحساب الحالي (عميل أو أدمن) */
exports.changePassword = async (req, res) => {
  try {
    const cur = String(req.body.cur || ''), nw = String(req.body.nw || '');
    const Model = req.user.kind === 'admin' ? Admin : Customer;
    const u = await Model.findById(req.user.id);
    if (!u) return res.status(404).json({ code: 'NOT_FOUND', message: 'الحساب مش موجود' });
    if (!(await bcrypt.compare(cur, u.password))) return res.status(400).json({ code: 'BAD_PASS', message: 'كلمة المرور الحالية غلط' });
    if (nw.length < 6) return res.status(400).json({ code: 'WEAK_PASS', message: 'كلمة المرور ضعيفة' });
    u.password = await bcrypt.hash(nw, 10);
    await u.save();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ code: 'SERVER', message: 'تعذّر التنفيذ' });
  }
};

/* POST /api/auth/admin — إضافة أدمن جديد (من لوحة التحكم) مع خيار شيل صلاحية الحساب الحالي */
exports.addAdmin = async (req, res) => {
  try {
    const phone = String(req.body.phone || '').trim();
    const pass = String(req.body.pass || '');
    if (!PHONE_RE.test(phone)) return res.status(400).json({ code: 'BAD_PHONE', message: 'رقم الموبايل غير صحيح' });
    if (pass.length < 6) return res.status(400).json({ code: 'WEAK_PASS', message: 'كلمة المرور ضعيفة' });
    if (await Admin.findOne({ phone })) return res.status(409).json({ code: 'PHONE_USED', message: 'الرقم ده مسجّل قبل كده' });
    await Admin.create({ phone, password: await bcrypt.hash(pass, 10) });
    if (req.body.removeMe) await Admin.findByIdAndDelete(req.user.id); // تغيير رقم الأدمن: الصلاحية بتشال من الحساب الحالي
    res.json({ ok: true });
  } catch {
    res.status(500).json({ code: 'SERVER', message: 'تعذّر التنفيذ' });
  }
};
