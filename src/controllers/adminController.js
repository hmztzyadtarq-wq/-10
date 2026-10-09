/* src/controllers/adminController.js — لمحة البيانات الكاملة للوحة التحكم + أدوات الأدمن */

const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const Branch = require('../models/Branch');
const Offer = require('../models/Offer');
const Message = require('../models/Message');
const Settings = require('../models/Settings');
const runSeed = require('../utils/seedData');
const asyncH = require('../middleware/async');

const readKey = async (key) => {
  const doc = await Settings.findOne({ key });
  return doc ? doc.data : {};
};

/* عدّاد meta محفوظ في جذر المستند (مش جوه data) */
const readMetaV = async () => {
  const doc = await Settings.findOne({ key: 'meta' });
  return doc ? (doc.v || 0) : 0;
};

/* GET /api/bootstrap — بيانات الموقع للزوار في طلب واحد (بدل 6 استعلامات Firestore القديمة)
   بييجي: الأقسام والمنتجات الظاهرة والفروع الشغالة والإعدادات — من غير أي بيانات عملاء أو طلبات */
exports.bootstrapPublic = asyncH(async (req, res) => {
  const [cats, prods, branches, home, promos, brand, metaV] = await Promise.all([
    Category.find().sort({ order: 1 }),
    Product.find({ active: { $ne: false } }).sort({ order: 1, createdAt: -1 }),
    Branch.find({ active: { $ne: false } }).sort({ order: 1 }),
    readKey('home'), readKey('promos'), readKey('brand'), readMetaV()
  ]);
  res.json({ cats, prods, branches, home, promos, brand, metaV });
});

/* GET /api/admin/bootstrap — كل بيانات اللوحة في طلب واحد (بديل الاستماع اللحظي: اللوحة بتعيد طلبه كل شوية) */
exports.bootstrap = asyncH(async (req, res) => {
  const [orders, products, cats, users, branches, offers, messages, home, promos, brand, metaV] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(2000),
    Product.find().sort({ order: 1 }),
    Category.find().sort({ order: 1 }),
    Customer.find().sort({ createdAt: -1 }).limit(2000),
    Branch.find().sort({ order: 1 }),
    Offer.find().sort({ createdAt: -1 }),
    Message.find().sort({ createdAt: -1 }).limit(1000),
    readKey('home'), readKey('promos'), readKey('brand'), readMetaV()
  ]);
  res.json({
    orders, products, cats, users, branches, offers, messages,
    settings: home, promos, brand,
    me: req.user.phone,
    metaV
  });
});

/* POST /api/admin/seed — زرار "نقل البيانات الأولية للقاعدة" */
exports.seed = asyncH(async (req, res) => {
  const r = await runSeed();
  res.json(r);
});
