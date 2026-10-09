/* src/models/Category.js — أقسام المنتجات (المنيو) */

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true }, // اسم القسم (عربي)
  en:     { type: String, default: '' },                // الاسم (إنجليزي)
  subs:   { type: [String], default: [] },              // الأقسام الفرعية (عربي)
  subsEn: { type: [String], default: [] },              // الأقسام الفرعية (إنجليزي)
  img:    { type: String, default: '' },                // صورة الدايرة في الرئيسية
  circle: { type: Boolean, default: false },            // بيظهر كدايرة في الرئيسية؟
  order:  { type: Number, default: 0 }                  // الترتيب
}, { timestamps: true });

categorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);
