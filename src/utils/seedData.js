/* src/utils/seedData.js — البيانات الأولية (نفس بيانات زر "نقل البيانات الأولية" القديم)
   بتنادى من: زرار الأدمن POST /api/admin/seed — أو من الترمينال: npm run seed */

const Category = require('../models/Category');
const Product = require('../models/Product');
const Branch = require('../models/Branch');
const Offer = require('../models/Offer');

const CATEGORIES = [
  ['عروض وخصومات', [], false],
  ['المطعم', ['وجبات', 'سلطات', 'مشروبات'], false],
  ['حلويات شرقي', ['كنافة', 'بسبوسة', 'بقلاوة', 'أم علي', 'كحك وبسكويت'], true],
  ['حلويات غربي', ['تشيز كيك', 'كب كيك', 'دونات', 'تارت', 'تورتات'], true],
  ['ميكس سويت', ['علب هدايا', 'ملبن'], true],
  ['مخبوزات', ['خبز', 'كرواسون', 'بريوش'], true],
  ['شوكولاتة', ['بوكس', 'ألواح'], true],
  ['كحك العيد', ['كحك سادة', 'كحك بالعجوة', 'كحك محشي'], true],
  ['حلاوة المولد', ['علب المولد', 'عروسة المولد'], true],
  ['أيس كريم', ['لتر', 'كوب', 'عبوات عائلية'], true]
];

const kDesc = 'كنافة طازة بالقشطة الطبيعية والسمن البلدي، بتتحضر يوميًا وتوصلك سخنة لحد باب البيت.';
const PRODUCTS = [
  ['كنافة بالقشطة', 'Cream Kunafa', 'حلويات شرقي', 'كنافة', 180, 0, 'الكيلو', 'الأكثر رواجًا', 'جديد', [['500 جم', 95], ['1 كجم', 180], ['2 كجم', 350], ['علبة هدايا', 220]], kDesc, 'قشطة، سمن بلدي، سميد، فستق مطحون'],
  ['جاتوه الشوكولاتة', 'Chocolate Gateau', 'حلويات غربي', 'تورتات', 320, 0, 'قطعة كاملة', 'الأكثر رواجًا'],
  ['بقلاوة مشكلة', 'Assorted Baklava', 'حلويات شرقي', 'بقلاوة', 250, 280, 'الكيلو', 'الأكثر رواجًا'],
  ['صندوق هدايا ملكي', 'Royal Gift Box', 'ميكس سويت', 'علب هدايا', 450, 0, 'علبة', 'الأكثر رواجًا'],
  ['ميني بيتي فور', 'Mini Petit Four', 'حلويات شرقي', 'كحك وبسكويت', 140, 0, '500 جم', 'الأكثر رواجًا'],
  ['بسبوسة بالمكسرات', 'Nuts Basbousa', 'حلويات شرقي', 'بسبوسة', 160, 0, 'الكيلو', 'المنتجات الجديده'],
  ['أم علي بالمكسرات', 'Om Ali with Nuts', 'حلويات شرقي', 'أم علي', 65, 0, 'طبق فردي', 'المنتجات الجديده'],
  ['كحك بالعجوة', 'Dates Kahk', 'حلويات شرقي', 'كحك وبسكويت', 210, 0, 'الكيلو', 'المنتجات الجديده'],
  ['أيس كريم مانجو', 'Mango Ice Cream', 'أيس كريم', 'لتر', 95, 0, 'لتر', 'المنتجات الجديده'],
  ['بريوش بالشوكولاتة', 'Chocolate Brioche', 'مخبوزات', 'بريوش', 25, 0, 'قطعة', 'المنتجات الجديده']
];

/* بيزرع البيانات مرة واحدة بس — لو فيه أقسام أو منتجات بيرد برسالة ومش بيلمس حاجة */
const runSeed = async () => {
  if ((await Category.countDocuments()) || (await Product.countDocuments())) {
    return { seeded: false, message: 'القاعدة فيها بيانات بالفعل — مش هنكررها' };
  }
  await Category.insertMany(CATEGORIES.map(([name, subs, circle], i) => ({ name, en: '', subs, subsEn: [], img: '', circle, order: i })));
  await Product.insertMany(PRODUCTS.map((p, i) => ({
    name: p[0], en: p[1], cat: p[2], sub: p[3], price: p[4], oldPrice: p[5] || null, unit: p[6], section: p[7],
    badge: p[8] || '', sizes: (p[9] || []).map(s => ({ label: s[0], price: s[1] })),
    desc: p[10] || '', ingredients: p[11] || '', stock: null, img: '', active: true, rating: 0, reviews: 0, order: i
  })));
  await Branch.create({ name: 'الفرع الرئيسي', area: 'القاهرة', phone: '', fee: 35, order: 0, active: true });
  await Offer.create({ title: 'خصم 15% على أول طلب', code: 'MALEK15', type: 'percent', value: 15, minOrder: 0, endsAt: '', active: true });
  return { seeded: true, message: 'تم نقل البيانات ✓' };
};

module.exports = runSeed;
