/* src/controllers/branchController.js — الفروع: عرض عام (الشغال بس) + إدارة */

const Branch = require('../models/Branch');
const touchMeta = require('../utils/touchMeta');
const asyncH = require('../middleware/async');

/* ---------- عام (الموقع) ---------- */

// GET /api/branches — الفروع الشغالة بالترتيب
exports.list = asyncH(async (req, res) => {
  const bs = await Branch.find({ active: { $ne: false } }).sort({ order: 1 });
  res.json(bs);
});

/* ---------- أدمن (لوحة التحكم) ---------- */

const cleanBranch = (b = {}) => ({
  name: String(b.name || '').trim(),
  area: String(b.area || '').trim(),
  phone: String(b.phone || '').trim(),
  fee: Math.max(0, Number(b.fee) || 0),
  order: Number(b.order) || 0,
  active: b.active !== false
});

// POST /api/admin/branches — إضافة فرع
exports.adminCreate = asyncH(async (req, res) => {
  const data = cleanBranch(req.body);
  if (!data.name) return res.status(400).json({ code: 'BAD_DATA', message: 'اسم الفرع مطلوب' });
  const br = await Branch.create(data);
  await touchMeta();
  res.status(201).json(br);
});

// PUT /api/admin/branches/:id — تعديل فرع
exports.adminUpdate = asyncH(async (req, res) => {
  const br = await Branch.findById(req.params.id);
  if (!br) return res.status(404).json({ code: 'NOT_FOUND', message: 'الفرع مش موجود' });
  Object.assign(br, cleanBranch({ ...br.toObject(), ...req.body }));
  await br.save();
  await touchMeta();
  res.json(br);
});

// DELETE /api/admin/branches/:id — حذف فرع
exports.adminDelete = asyncH(async (req, res) => {
  const br = await Branch.findByIdAndDelete(req.params.id);
  if (!br) return res.status(404).json({ code: 'NOT_FOUND', message: 'الفرع مش موجود' });
  await touchMeta();
  res.json({ ok: true });
});
