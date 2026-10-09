/* src/models/Order.js — طلبات العملاء */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  uid:        { type: String, required: true, index: true }, // صاحب الطلب (id الحساب من التوكن)
  name:       { type: String, required: true },              // الاسم بالكامل
  phone:      { type: String, required: true },              // رقم الموبايل
  method:     { type: String, enum: ['delivery', 'pickup'], default: 'delivery' }, // توصيل أو استلام من الفرع
  branchId:   { type: String, default: '' },                 // الفرع المختار
  branchName: { type: String, default: '' },                 // اسم الفرع (نسخة وقت الطلب)
  gov:        { type: String, default: '' },                 // المحافظة (للتوصيل)
  area:       { type: String, default: '' },                 // المنطقة
  addr:       { type: String, default: '' },                 // العنوان بالتفصيل
  items: [{                                                  // بنود الطلب
    id:    String, // id المنتج
    size:  String, // الحجم المختار
    name:  String, // اسم المنتج (مع الحجم)
    cat:   String, // القسم
    price: Number, // سعر الوحدة
    qty:   Number  // الكمية
  }],
  subtotal:  { type: Number, default: 0 },  // المجموع قبل الخصم
  discount:  { type: Number, default: 0 },  // قيمة الخصم
  code:      { type: String, default: '' }, // كود الخصم المستخدم
  fee:       { type: Number, default: 0 },  // رسوم التوصيل
  total:     { type: Number, default: 0 },  // الإجمالي النهائي
  pay:       { type: String, default: 'cash' },
  status:    { type: String, default: 'جديدة' }, // جديدة / قيد التحضير / في الطريق / تم التسليم / ملغي
  orderNo:   { type: Number, index: true },       // رقم الطلب اللي بيتعرض للعميل
  stockDone: { type: Boolean, default: false }    // هل المخزون اتخصم من الطلب ده؟
}, { timestamps: true });                         // createdAt = وقت الطلب

orderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
