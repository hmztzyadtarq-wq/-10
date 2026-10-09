/* src/controllers/categoryController.js — الأقسام: عرض عام + إدارة
   عند تغيير اسم قسم، المنتجات بتتنقل للاسم الجديد تلقائيًا (زي ما كان في اللوحة القديمة) */

const Category = require('../models/Category');
const Product = require('../models/Product');
const touchMeta = require('../utils/touchMeta');
const asyncH = require('../middleware/async');

/* ---------- عام (الموقع) ---------- */

// GET /api/categories — كل الأقسام بالترتيب
exports.list = asyncH(async (req, res) => {
  const cats = await Category.find().sort({ order: 1 });
  res.json(cats);
});

/* ---------- أدمن (لوحة التحكم) ---------- */

const cleanCat = (b = {}) => ({
  name: String(b.name || '').trim(),
  en: String(b.en || '').trim(),
  subs: Array.isArray(b.subs) ? b.subs.map(s => String(s).trim()).filter(Boolean) : [],
  subsEn: Array.isArray(b.subsEn) ? b.subsEn.map(s => String(s).trim()).filter(Boolean) : [],
  img: String(b.img || ''),
  circle: !!b.circle,
  order: Number(b.order) || 0
});

// POST /api/admin/categories — إضافة قسم
exports.adminCreate = asyncH(async (req, res) => {
  const data = cleanCat(req.body);
  if (!data.name) return res.status(400).json({ code: 'BAD_DATA', message: 'اسم القسم مطلوب' });
  const c = await Category.create(data);
  await touchMeta();
  res.status(201).json(c);
});

// PUT /api/admin/categories/:id — تعديل قسم (لو الاسم اتغيّر بننقل منتجاته معاه)
exports.adminUpdate = asyncH(async (req, res) => {
  const c = await Category.findById(req.params.id);
  if (!c) return res.status(404).json({ code: 'NOT_FOUND', message: 'القسم مش موجود' });
  const oldName = c.name;
  Object.assign(c, cleanCat({ ...c.toObject(), ...req.body }));
  await c.save();
  const moveFrom = String(req.body.moveFrom || '').trim();
  if (moveFrom && moveFrom !== c.name) await Product.updateMany({ cat: moveFrom }, { $set: { cat: c.name } });
  await touchMeta();
  res.json(c);
});

// DELETE /api/admin/categories/:id — حذف قسم (المنتجات بتفضل باسمه القديم وتختفي من القوائم)
exports.adminDelete = asyncH(async (req, res) => {
  const c = await Category.findByIdAndDelete(req.params.id);
  if (!c) return res.status(404).json({ code: 'NOT_FOUND', message: 'القسم مش موجود' });
  await touchMeta();
  res.json({ ok: true });
});
