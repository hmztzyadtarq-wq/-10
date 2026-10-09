/* src/models/Branch.js — فروع المتجر */

const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true }, // اسم الفرع
  area:   { type: String, default: '' },                // المنطقة / العنوان
  phone:  { type: String, default: '' },                // رقم واتساب استلام الطلبات
  fee:    { type: Number, default: 0 },                 // رسوم التوصيل
  order:  { type: Number, default: 0 },                 // الترتيب
  active: { type: Boolean, default: true }              // الفرع شغال؟
}, { timestamps: true });

branchSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Branch', branchSchema);
