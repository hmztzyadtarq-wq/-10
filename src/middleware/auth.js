/* src/middleware/auth.js — التحقق من توكن الدخول وصلاحيات الأدمن (بديل Firebase Auth) */

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/* التحقق من التوكن وفتح حساب اللي عامل الطلب
   الفرونت إند بيبعت التوكن في الهيدر: Authorization: Bearer <token> */
const verifyToken = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ code: 'NO_TOKEN', message: 'سجّل دخولك الأول' });
  }

  try {
    // التوكن شايل بيانات الحساب: { id, phone, isAdmin, kind }
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ code: 'BAD_TOKEN', message: 'انتهت الجلسة — سجّل دخولك من جديد' });
  }
};

/* التأكد إن اللي بيعمل الطلب أدمن (للوحة التحكم بس)
   بنرجع لجدول الأدمن كل مرة عشان لو الحساب اتشال صلاحيته يوقف على طول */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.kind !== 'admin') {
      return res.status(403).json({ code: 'NOT_ADMIN', message: 'الحساب ده مش أدمن' });
    }
    const stillAdmin = await Admin.exists({ _id: req.user.id });
    if (!stillAdmin) {
      return res.status(403).json({ code: 'NOT_ADMIN', message: 'الحساب ده مش أدمن' });
    }
    next();
  } catch {
    return res.status(500).json({ code: 'SERVER', message: 'حصلت مشكلة في السيرفر' });
  }
};

module.exports = { verifyToken, requireAdmin };
