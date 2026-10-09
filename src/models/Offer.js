/* src/models/Offer.js — أكواد الخصم والعروض */

const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },                          // عنوان العرض
  code:     { type: String, required: true, uppercase: true, trim: true, index: true }, // كود الخصم
  type:     { type: String, enum: ['percent', 'fixed'], default: 'percent' },      // نسبة % أو مبلغ ثابت
  value:    { type: Number, default: 0 },                                           // قيمة الخصم
  minOrder: { type: Number, default: 0 },                                           // أقل قيمة للطلب (0 = مفيش)
  endsAt:   { type: String, default: '' },                                          // تاريخ الانتهاء (yyyy-mm-dd أو فاضي)
  active:   { type: Boolean, default: true }                                        // العرض شغال؟
}, { timestamps: true });

offerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Offer', offerSchema);
