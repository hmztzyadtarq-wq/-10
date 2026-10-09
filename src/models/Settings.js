/* src/models/Settings.js — إعدادات الموقع (بانرات، لوجو، بيانات البراند)
   نفس فكرة Firestore: مستند واحد لكل نوع بمفتاح key */

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true }, // home / promos / brand / meta
  data:  { type: Object, default: {} },                  // محتوى الإعدادات كامل
  v:     { type: Number, default: 0 }                    // عدّاد يتزوّد مع كل تعديل (شريط "فيه تحديثات")
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
