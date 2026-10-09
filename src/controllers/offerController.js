/* src/controllers/offerController.js — العروض وأكواد الخصم:
   - عام: أول عرض شغال (بانر الرئيسية) + التحقق من كود الخصم عند "تطبيق"
   - أدمن: إدارة كاملة */

const Offer = require('../models/Offer');
const touchMeta = require('../utils/touchMeta');
const asyncH = require('../middleware/async');

/* ---------- عام (الموقع) ---------- */

// GET /api/offers/active — أول عرض شغال (بيظهر في بانر الرئيسية)
exports.active = asyncH(async (req, res) => {
  const o = await Offer.findOne({ active: { $ne: false } }).sort({ createdAt: -1 });
  res.json(o || null);
});

// POST /api/offers/validate — التحقق من كود الخصم. الرسائل هنا هي اللي بتظهر في toast العميل
exports.validate = asyncH(async (req, res) => {
  const code = String((req.body || {}).code || '').trim().toUpperCase();
  const subtotal = Number((req.body || {}).subtotal) || 0;
  if (!code) return res.status(400).json({ ok: false, message: 'اكتب كود الخصم' });
  const o = await Offer.findOne({ code });
  if (!o || o.active === false) return res.status(400).json({ ok: false, message: 'الكود غير صحيح' });
  if (o.endsAt && new Date(o.endsAt + 'T23:59:59') < new Date()) return res.status(400).json({ ok: false, message: 'الكود منتهي' });
  if (o.minOrder && subtotal < o.minOrder) return res.status(400).json({ ok: false, message: 'الحد الأدنى للطلب ' + o.minOrder + ' ج.م' });
  res.json({ ok: true, offer: { code: o.code, type: o.type, value: Number(o.value) || 0 } });
});

/* ---------- أدمن (لوحة التحكم) ---------- */

const cleanOffer = (b = {}) => ({
  title: String(b.title || '').trim(),
  code: String(b.code || '').trim().toUpperCase(),
  type: b.type === 'fixed' ? 'fixed' : 'percent',
  value: Math.max(0, Number(b.value) || 0),
  minOrder: Math.max(0, Number(b.minOrder) || 0),
  endsAt: String(b.endsAt || '').trim(),
  active: b.active !== false
});

// POST /api/admin/offers — إضافة عرض
exports.adminCreate = asyncH(async (req, res) => {
  const data = cleanOffer(req.body);
  if (!data.title || !data.code) return res.status(400).json({ code: 'BAD_DATA', message: 'العنوان والكود مطلوبين' });
  const o = await Offer.create(data);
  await touchMeta();
  res.status(201).json(o);
});

// PUT /api/admin/offers/:id — تعديل عرض
exports.adminUpdate = asyncH(async (req, res) => {
  const o = await Offer.findById(req.params.id);
  if (!o) return res.status(404).json({ code: 'NOT_FOUND', message: 'العرض مش موجود' });
  Object.assign(o, cleanOffer({ ...o.toObject(), ...req.body }));
  await o.save();
  await touchMeta();
  res.json(o);
});

// DELETE /api/admin/offers/:id — حذف عرض
exports.adminDelete = asyncH(async (req, res) => {
  const o = await Offer.findByIdAndDelete(req.params.id);
  if (!o) return res.status(404).json({ code: 'NOT_FOUND', message: 'العرض مش موجود' });
  await touchMeta();
  res.json({ ok: true });
});
