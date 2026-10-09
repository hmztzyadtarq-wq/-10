/* src/models/Admin.js — حسابات أدمن لوحة التحكم (بديل مجموعة admins في Firebase) */

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  phone:     { type: String, required: true, unique: true, trim: true }, // رقم الموبايل (أو إيميل)
  password:  { type: String, required: true },                           // مشفّرة بـ bcrypt
  createdAt: { type: Date, default: Date.now }
});

adminSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Admin', adminSchema);
