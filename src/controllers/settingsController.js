/* src/controllers/settingsController.js — الإعدادات (بديل مستندات settings في Firestore):
   - home: بانرات السلايدر — promos: البانرات الإعلانية — brand: اللوجو والخط الساخن والسوشيال
   - meta: عدّاد يتزوّد مع كل تعديل عشان زوار الموقع يعرفوا إن فيه تحديثات */

const Settings = require('../models/Settings');
const touchMeta = require('../utils/touchMeta');
const asyncH = require('../middleware/async');

const KEYS = ['home', 'promos', 'brand'];

const readKey = async (key) => {
  const doc = await Settings.findOne({ key });
  return doc ? doc.data : {};
};

/* عدّاد meta محفوظ في جذر المستند (مش جوه data) */
const readMetaV = async () => {
  const doc = await Settings.findOne({ key: 'meta' });
  return doc ? (doc.v || 0) : 0;
};

/* ---------- عام (الموقع) ---------- */

// GET /api/settings — الإعدادات كلها في طلب واحد
exports.getAll = asyncH(async (req, res) => {
  const [home, promos, brand, metaV] = await Promise.all([...KEYS.map(readKey), readMetaV]);
  res.json({ home, promos, brand, metaV });
});

// GET /api/settings/meta — رقم الإصدار بس (الموقع بيبوّظه كل شوية)
exports.getMeta = asyncH(async (req, res) => {
  res.json({ v: await readMetaV() });
});

/* ---------- أدمن (لوحة التحكم) ---------- */

// PUT /api/admin/settings/:key — حفظ إعدادات (دمج مع القديم مش استبدال)
// حالة خاصة: brand + logo = '' معناها شيل اللوجو ورجّع الافتراضي
exports.adminUpdate = asyncH(async (req, res) => {
  const key = req.params.key;
  if (!KEYS.includes(key)) return res.status(400).json({ code: 'BAD_KEY', message: 'نوع إعدادات غير معروف' });
  const doc = (await Settings.findOne({ key })) || new Settings({ key, data: {} });
  const body = { ...(req.body || {}) };
  if (key === 'brand' && 'logo' in body && (body.logo === '' || body.logo == null)) delete body.logo; // حذف = رجوع للافتراضي
  doc.data = { ...doc.data, ...body };
  doc.v = (doc.v || 0) + 1;
  await doc.save();
  await touchMeta();
  res.json(doc.data);
});
