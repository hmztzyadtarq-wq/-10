/* src/controllers/orderController.js — الطلبات:
   - العميل: إنشاء طلب + تتبع طلباته
   - الأدمن: كل الطلبات + تغيير الحالة (مع خصم/إرجاع المخزون تلقائيًا) + حذف */

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Branch = require('../models/Branch');
const Offer = require('../models/Offer');
const touchMeta = require('../utils/touchMeta');
const asyncH = require('../middleware/async');

const STATUSES = ['جديدة', 'قيد التحضير', 'في الطريق', 'تم التسليم', 'ملغي'];

/* ---------- عام (الموقع) ---------- */

// POST /api/orders — تأكيد الطلب. السيرفر بيراجع الأسعار والخصم والرسوم بنفسه (مش بيثق بأرقام العميل)
exports.create = async (req, res) => {
  try {
    const b = req.body || {};
    const name = String(b.name || '').trim();
    const phone = String(b.phone || '').trim();
    const method = b.method === 'pickup' ? 'pickup' : 'delivery';

    // نفس رسائل التحقق اللي كانت بتظهر للعميل في السلة
    if (!name) return res.status(400).json({ code: 'BAD_NAME', message: 'اكتب الاسم بالكامل' });
    if (!/^01[0125]\d{8}$/.test(phone)) return res.status(400).json({ code: 'BAD_PHONE', message: 'رقم الموبايل غير صحيح' });
    if (!mongoose.isValidObjectId(b.branchId || '')) return res.status(400).json({ code: 'BAD_BRANCH', message: 'اختر الفرع الأقرب لك' });
    const branch = await Branch.findById(b.branchId);
    if (!branch || branch.active === false) return res.status(400).json({ code: 'BAD_BRANCH', message: 'اختر الفرع الأقرب لك' });
    if (method === 'delivery' && (!String(b.area || '').trim() || !String(b.addr || '').trim()))
      return res.status(400).json({ code: 'BAD_ADDR', message: 'اكتب المنطقة والعنوان بالتفصيل' });

    // بناء بنود الطلب من منتجات القاعدة نفسها
    const itemsIn = Array.isArray(b.items) ? b.items : [];
    const ids = itemsIn.map(i => i && i.id).filter(id => mongoose.isValidObjectId(id));
    const prods = await Product.find({ _id: { $in: ids } });
    const items = [];
    for (const it of itemsIn) {
      const p = prods.find(x => x.id === it.id);
      if (!p || p.active === false) continue;
      const sz = (p.sizes || []).find(s => s.label === it.size);
      items.push({
        id: p.id, size: String(it.size || ''),
        name: p.name + (it.size ? ' — ' + it.size : ''),
        cat: p.cat, price: sz ? Number(sz.price) : Number(p.price),
        qty: Math.max(1, Math.min(99, Number(it.qty) || 1))
      });
    }
    if (!items.length) return res.status(400).json({ code: 'EMPTY_CART', message: 'السلة فاضية' });

    const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);

    // كود الخصم (لو كتبه العميل): نشوفه شغال ومش منتهي وواصل الحد الأدنى
    let discount = 0, codeUsed = '';
    const codeIn = String(b.code || '').trim().toUpperCase();
    if (codeIn) {
      const o = await Offer.findOne({ code: codeIn });
      const valid = o && o.active !== false &&
        (!o.endsAt || new Date(o.endsAt + 'T23:59:59') >= new Date()) &&
        (!o.minOrder || subtotal >= o.minOrder);
      if (valid) {
        codeUsed = o.code;
        discount = Math.min(subtotal, o.type === 'percent' ? Math.round(subtotal * o.value / 100) : Number(o.value) || 0);
      }
    }

    const fee = method === 'pickup' ? 0 : (Number(branch.fee) || 0);
    const total = Math.max(0, subtotal - discount + fee);
    const orderNo = 1000 + Math.floor(Date.now() / 1000) % 1000000; // نفس معادلة رقم الطلب القديمة

    const order = await Order.create({
      uid: req.user.id, name, phone, method,
      branchId: branch.id, branchName: branch.name,
      gov: method === 'pickup' ? '' : String(b.gov || '').trim(),
      area: method === 'pickup' ? '' : String(b.area || '').trim(),
      addr: method === 'pickup' ? '' : String(b.addr || '').trim(),
      items, subtotal, discount, code: codeUsed, fee, total,
      pay: 'cash', status: 'جديدة', orderNo
    });

    res.status(201).json({ orderNo: order.orderNo, total: order.total, branchName: order.branchName, phone: order.phone });
  } catch {
    res.status(500).json({ code: 'SERVER', message: 'تعذّر إرسال الطلب، حاول تاني' });
  }
};

// GET /api/orders/mine — طلبات العميل الحالي (صفحة تتبع الطلب)
exports.mine = asyncH(async (req, res) => {
  const os = await Order.find({ uid: req.user.id }).sort({ createdAt: -1 }).limit(50);
  res.json(os);
});

/* ---------- أدمن (لوحة التحكم) ---------- */

// GET /api/admin/orders — كل الطلبات (مع فلتر اختياري بالحالة أو الفرع)
exports.adminList = asyncH(async (req, res) => {
  const f = {};
  if (req.query.status) f.status = String(req.query.status);
  if (req.query.branchId) f.branchId = String(req.query.branchId);
  const os = await Order.find(f).sort({ createdAt: -1 }).limit(2000);
  res.json(os);
});

// خصم المخزون (dir = -1) أو إرجاعه (dir = +1) — المنتج من غير مخزون محدد بيتجاهل
const moveStock = async (items, dir) => {
  for (const it of items || []) {
    const p = await Product.findById(it.id);
    if (!p || p.stock == null) continue;
    p.stock = Math.max(0, p.stock + dir * (Number(it.qty) || 0));
    await p.save();
  }
};

// PUT /api/admin/orders/:id/status — تغيير حالة الطلب
// أول ما الطلب يخرج من "جديدة" بيتخصم من المخزون، ولو اتلغى بيرجع
exports.adminSetStatus = asyncH(async (req, res) => {
  const o = await Order.findById(req.params.id);
  if (!o) return res.status(404).json({ code: 'NOT_FOUND', message: 'الطلب مش موجود' });
  const status = String(req.body.status || '');
  if (!STATUSES.includes(status)) return res.status(400).json({ code: 'BAD_STATUS', message: 'حالة غير معروفة' });
  if (status !== 'جديدة' && status !== 'ملغي' && !o.stockDone) { await moveStock(o.items, -1); o.stockDone = true; }
  if (status === 'ملغي' && o.stockDone) { await moveStock(o.items, 1); o.stockDone = false; }
  o.status = status;
  await o.save();
  await touchMeta();
  res.json(o);
});

// DELETE /api/admin/orders/:id — حذف طلب
exports.adminDelete = asyncH(async (req, res) => {
  const o = await Order.findByIdAndDelete(req.params.id);
  if (!o) return res.status(404).json({ code: 'NOT_FOUND', message: 'الطلب مش موجود' });
  res.json({ ok: true });
});

// DELETE /api/admin/orders/all — مسح كل الطلبات (تقارير ← مسح كل الطلبات)
exports.adminWipe = asyncH(async (req, res) => {
  await Order.deleteMany({});
  res.json({ ok: true });
});
