/* src/models/Customer.js — حسابات العملاء (تسجيل برقم الموبايل + كلمة مرور) */

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  phone:     { type: String, required: true, unique: true, trim: true }, // 01xxxxxxxxx
  password:  { type: String, required: true },                           // مشفّرة بـ bcrypt
  name:      { type: String, default: '' },                              // اختياري — بيتعبّى من آخر طلب
  createdAt: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true } });

customerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Customer', customerSchema);
