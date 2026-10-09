/* src/models/Product.js — منتجات الحلويات اللي بتظهر في المتجر */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true }, // الاسم (عربي)
  en:          { type: String, default: '' },                // الاسم (إنجليزي)
  cat:         { type: String, required: true, trim: true }, // القسم
  sub:         { type: String, default: '' },                // القسم الفرعي
  price:       { type: Number, required: true, min: 0 },     // السعر الحالي
  oldPrice:    { type: Number, default: null },              // السعر قبل الخصم (null = مفيش خصم)
  unit:        { type: String, default: '' },                // الوحدة (كيلو / قطعة / علبة)
  stock:       { type: Number, default: null },              // المخزون (null = غير محدود)
  section:     { type: String, default: '' },                // صف الرئيسية اللي بيظهر فيه
  img:         { type: String, default: '' },                // الصورة (base64 أو لينك)
  badge:       { type: String, default: '' },                // شارة على الصورة (جديد / الأكثر مبيعًا...)
  desc:        { type: String, default: '' },                // الوصف
  ingredients: { type: String, default: '' },                // المكونات
  sizes:       [{ label: String, price: Number }],           // أحجام بأسعار مختلفة
  active:      { type: Boolean, default: true },             // ظاهر في الموقع؟
  rating:      { type: Number, default: 0 },                 // التقييم
  reviews:     { type: Number, default: 0 },                 // عدد التقييمات
  order:       { type: Number, default: 0 }                  // الترتيب (الأصغر بيظهر الأول)
}, { timestamps: true });                                    // createdAt + updatedAt تلقائي

// عشان الفرونت إند يلاقي الحقل باسم id (زي ما كان مع Firebase)
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
