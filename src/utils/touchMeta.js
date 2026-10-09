/* src/utils/touchMeta.js — بيزوّد عدّاد settings/meta مع كل تعديل من الأدمن
   الموقع بيراقب الرقم ده (polling) وفيظهر لزوار شريط "فيه تحديثات" */

const Settings = require('../models/Settings');

const touchMeta = async () => {
  try {
    await Settings.findOneAndUpdate({ key: 'meta' }, { $inc: { v: 1 } }, { upsert: true });
  } catch (e) { console.warn('⚠ تعذّر تحديث meta:', e.message); }
};

module.exports = touchMeta;
