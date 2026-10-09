# حلو الملك — متجر حلويات (Node.js + Express + MongoDB)

باك إند مستقل بـ **Node.js + Express + MongoDB (Mongoose)** بديل Firebase بالكامل، والفرونت إند بنفس الشكل والتصميم بالظبط (اتشال منه Firebase واستُبدل بطلبات fetch نظيفة).

## هيكل المشروع

```
helw-elmalek/
├── backend/                  ← الباك إند
│   ├── server.js             ← نقطة التشغيل (CORS + Express + dotenv + الملفات الثابتة)
│   ├── package.json          ← الاعتمادات
│   ├── .env                  ← الإعدادات (بورت / رابط القاعدة / مفتاح التوكن / حساب الأدمن الأول)
│   ├── seed/
│   │   └── seed.js           ← زرع البيانات الأولية من الترمينال (npm run seed)
│   └── src/
│       ├── config/
│       │   └── db.js         ← الاتصال بـ MongoDB (Mongoose)
│       ├── models/           ← مخططات قاعدة البيانات
│       │   ├── Product.js    ← المنتجات
│       │   ├── Category.js   ← الأقسام
│       │   ├── Order.js      ← الطلبات
│       │   ├── Branch.js     ← الفروع
│       │   ├── Offer.js      ← أكواد الخصم
│       │   ├── Customer.js   ← حسابات العملاء
│       │   ├── Admin.js      ← حسابات الأدمن
│       │   ├── Settings.js   ← الإعدادات (بانرات / لوجو / براند / meta)
│       │   └── Message.js    ← رسائل العملاء
│       ├── controllers/      ← منطق العمل (عام + أدمن لكل نوع)
│       ├── routes/
│       │   ├── shop.js       ← APIs الموقع للزوار (/api)
│       │   └── admin.js      ← APIs لوحة التحكم (/api/admin — محمية بالتوكن + صلاحية أدمن)
│       ├── middleware/
│       │   ├── auth.js       ← التحقق من توكن JWT + صلاحية الأدمن
│       │   └── async.js      ← غلاف الدوال async
│       └── utils/            ← touchMeta (شريط التحديث) + seedData + bootstrap (أول أدمن)
└── public/                   ← الفرونت إند (نفس ملفاتك — بدون Firebase)
    ├── index.html            ← الموقع (نفس الهيكل، Firebase → /api/bootstrap)
    ├── style.css             ← نسخة طبق الأصل بدون أي تعديل
    ├── script.js             ← نفس الكود، طبقة البيانات بقت fetch بدل Firestore
    ├── admin.html            ← لوحة التحكم (نفس الهيكل)
    ├── admin.css             ← نسخة طبق الأصل بدون أي تعديل
    └── admin.js              ← نفس اللوحة، البيانات بتيجي من /api/admin/bootstrap
```

## خطوات التشغيل

1. **تسطيب الاعتمادات وتشغيل السيرفر:**
   ```
   cd backend
   npm install
   npm start          (أو npm run dev أثناء التطوير)
   ```
   السيرفر بيرفع ملفات الموقع نفسها: افتح `http://localhost:5000` → الموقع، و `http://localhost:5000/admin.html` → لوحة التحكم.

2. **قاعدة البيانات MongoDB:** حط الرابط في `backend/.env`:
   - محلي: `mongodb://127.0.0.1:27017/helw-elmalek`
   - أو MongoDB Atlas (مجاني): `mongodb+srv://USER:PASS@clusterxxx.mongodb.net/helw-elmalek`

3. **أول تشغيل:** بيتولّد حساب أدمن تلقائيًا من `.env` (الموبايل `01000000000` / كلمة `admin123`) — **غيّر كلمة المرور فورًا** من لوحة التحكم ← الإعدادات.

4. **البيانات الأولية:** من لوحة التحكم ← الإعدادات ← "نقل البيانات الأولية للقاعدة" (مرة واحدة)، أو من الترمينال: `npm run seed`.

## أهم الـ APIs

| الطريقة | الرابط | الوظيفة |
|---|---|---|
| GET | `/api/bootstrap` | كل بيانات الموقع في طلب واحد (أقسام، منتجات، فروع، إعدادات) |
| GET | `/api/products` · `/api/categories` · `/api/branches` | جلب منفصل لكل نوع |
| POST | `/api/auth/register` · `/api/auth/login` | حساب عميل / دخول (عميل أو أدمن — التوكن JWT) |
| GET | `/api/auth/me` | بيانات الحساب الحالي (بديل onAuthStateChanged) |
| POST | `/api/offers/validate` | التحقق من كود الخصم |
| POST | `/api/orders` | حفظ طلب جديد (السيرفر بيعيد حساب الأسعار والخصم) |
| GET | `/api/orders/mine` | طلبات العميل (تتبع الطلب) |
| POST | `/api/messages` | رسالة "اتصل بنا" |
| GET | `/api/settings/meta` | رقم إصدار الإعدادات (شريط "فيه تحديثات" للزوار) |
| GET | `/api/admin/bootstrap` | كل بيانات لوحة التحكم (طلبات، منتجات، عملاء...) |
| POST/PUT/DELETE | `/api/admin/products|categories|branches|offers` | إدارة كاملة |
| PUT | `/api/admin/orders/:id/status` | تغيير حالة الطلب + خصم/إرجاع المخزون تلقائيًا |
| PUT | `/api/admin/settings/home|promos|brand` | حفظ البانرات واللوجو وبيانات الموقع |

## ملاحظات الترحيل من Firebase

- **تسجيل الدخول:** بدل Firebase Auth بقي JWT محفوظ في `localStorage` (`hm_token`) — نفس تجربة رقم الموبايل + كلمة المرور، ولوج الأدمن بيروح للوحة تلقائيًا.
- **اللحظية (onSnapshot):** بقت polling خفيفة — الموقع بيبص على `/api/settings/meta` كل 30 ثانية (شريط التحديث)، واللوحة بتحدث بياناتها كل 15 ثانية مع تنبيه الطلبات الجديدة (صوت + إشعار).
- **الصور:** زي ما كانت — بتتصغّر في المتصفح وبتتخزن base64 جوه البيانات نفسها.
- **رقم الطلب:** بيتولد في السيرفر بنفس المعادلة القديمة، والسيرفر بيراجع الأسعار والخصم والرسوم بنفسه قبل الحفظ.
- لو رفعت الفرونت على دومين مختلف عن السيرفر: اكتب رابط السيرفر في `window.API_BASE` أول `index.html` و `admin.html`.
