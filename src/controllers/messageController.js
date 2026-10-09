/* src/controllers/messageController.js — رسائل العملاء (اتصل بنا) */

const Message = require('../models/Message');
const asyncH = require('../middleware/async');

/* ---------- عام (الموقع) ---------- */

// POST /api/messages — إرسال رسالة جديدة
exports.create = asyncH(async (req, res) => {
  const b = req.body || {};
  const m = await Message.create({
    name: String(b.name || '').trim().slice(0, 100),
    phone: String(b.phone || '').trim().slice(0, 20),
    msg: String(b.msg || '').trim().slice(0, 2000)
  });
  res.status(201).json({ ok: true, id: m.id });
});

/* ---------- أدمن (لوحة التحكم) ---------- */

// GET /api/admin/messages — كل الرسائل
exports.adminList = asyncH(async (req, res) => {
  const ms = await Message.find().sort({ createdAt: -1 }).limit(1000);
  res.json(ms);
});

// PUT /api/admin/messages/:id/read — تمت القراءة / غير مقروءة
exports.adminToggleRead = asyncH(async (req, res) => {
  const m = await Message.findById(req.params.id);
  if (!m) return res.status(404).json({ code: 'NOT_FOUND', message: 'الرسالة مش موجودة' });
  m.read = !m.read;
  await m.save();
  res.json(m);
});

// DELETE /api/admin/messages/:id — حذف رسالة
exports.adminDelete = asyncH(async (req, res) => {
  const m = await Message.findByIdAndDelete(req.params.id);
  if (!m) return res.status(404).json({ code: 'NOT_FOUND', message: 'الرسالة مش موجودة' });
  res.json({ ok: true });
});
