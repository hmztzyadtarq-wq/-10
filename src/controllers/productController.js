/* src/controllers/productController.js — المنتجات: عرض عام + إدارة كاملة من اللوحة */

const Product = require('../models/Product');
const touchMeta = require('../utils/touchMeta');
const asyncH = require('../middleware/async');

/* ---------- عام (الموقع) ---------- */

// GET /api/products — المنتجات الظاهرة للزوار
exports.list = asyncH(async (req, res) => {
  const prods = await Product.find({ active: { $ne: false } }).sort({ order: 1, createdAt: -1 });
  res.json(prods);
});

/* ---------- أدمن (لوحة التحكم) ---------- */

// توحيد شكل بيانات المنتج القادمة من الفورم (وتحوّل الأرقام والقيم الفاضية)
const cleanProduct = (b = {}) => ({
  name: String(b.name || '').trim(),
  en: String(b.en || '').trim() || String(b.name || '').trim(),
  cat: String(b.cat || '').trim(),
  sub: String(b.sub || '').trim(),
  price: Math.max(0, Number(b.price) || 0),
  oldPrice: b.oldPrice === '' || b.oldPrice == null ? null : Math.max(0, Number(b.oldPrice) || 0),
  unit: String(b.unit || '').trim(),
  stock: b.stock === '' || b.stock == null ? null : Math.max(0, Number(b.stock) || 0),
  section: String(b.section || '').trim(),
  img: String(b.img || ''),
  badge: String(b.badge || '').trim(),
  desc: String(b.desc || '').trim(),
  ingredients: String(b.ingredients || '').trim(),
  sizes: Array.isArray(b.sizes)
    ? b.sizes.filter(s => s && s.label && s.price != null).map(s => ({ label: String(s.label), price: Number(s.price) || 0 }))
    : [],
  active: b.active !== false
});

// POST /api/admin/products — إضافة منتج
exports.adminCreate = asyncH(async (req, res) => {
  const data = cleanProduct(req.body);
  if (!data.name || !data.cat) return res.status(400).json({ code: 'BAD_DATA', message: 'الاسم والقسم مطلوبين' });
  const p = await Product.create({ ...data, rating: 0, reviews: 0, order: -Date.now() });
  await touchMeta();
  res.status(201).json(p);
});

// PUT /api/admin/products/:id — تعديل منتج (الفورم بيبعت كل البيانات، وتحديث المخزون أو الإظهار بيبعت حقل واحد — بندمج مع القديم)
exports.adminUpdate = asyncH(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ code: 'NOT_FOUND', message: 'المنتج مش موجود' });
  Object.assign(p, cleanProduct({ ...p.toObject(), ...req.body }));
  await p.save();
  await touchMeta();
  res.json(p);
});

// DELETE /api/admin/products/:id — حذف منتج
exports.adminDelete = asyncH(async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ code: 'NOT_FOUND', message: 'المنتج مش موجود' });
  await touchMeta();
  res.json({ ok: true });
});

// DELETE /api/admin/products/all — حذف كل المنتجات (زرار "حذف كل المنتجات")
exports.adminWipe = asyncH(async (req, res) => {
  await Product.deleteMany({});
  await touchMeta();
  res.json({ ok: true });
});
