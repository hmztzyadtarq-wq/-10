/* src/models/Message.js — رسائل "اتصل بنا" من العملاء */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name:      { type: String, default: '' },
  phone:     { type: String, default: '' },
  msg:       { type: String, default: '' },
  read:      { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true } });

module.exports = mongoose.model('Message', messageSchema);
