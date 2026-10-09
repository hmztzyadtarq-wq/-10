/* src/routes/admin.js — نقاط نهاية لوحة التحكم (كلها محمية: توكن + صلاحية أدمن) */

const router = require('express').Router();
const asyncH = require('../middleware/async');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const adminCtrl = require('../controllers/adminController');
const productCtrl = require('../controllers/productController');
const categoryCtrl = require('../controllers/categoryController');
const branchCtrl = require('../controllers/branchController');
const offerCtrl = require('../controllers/offerController');
const orderCtrl = require('../controllers/orderController');
const settingsCtrl = require('../controllers/settingsController');
const messageCtrl = require('../controllers/messageController');
const authCtrl = require('../controllers/authController');

/* حماية كل مسارات الأدمن */
router.use(verifyToken, requireAdmin);

router.get('/bootstrap', asyncH(adminCtrl.bootstrap));
router.post('/seed', asyncH(adminCtrl.seed));

/* المنتجات (مهم: /all قبل /:id) */
router.post('/products', asyncH(productCtrl.adminCreate));
router.put('/products/:id', asyncH(productCtrl.adminUpdate));
router.delete('/products/all', asyncH(productCtrl.adminWipe));
router.delete('/products/:id', asyncH(productCtrl.adminDelete));

/* الأقسام */
router.post('/categories', asyncH(categoryCtrl.adminCreate));
router.put('/categories/:id', asyncH(categoryCtrl.adminUpdate));
router.delete('/categories/:id', asyncH(categoryCtrl.adminDelete));

/* الفروع */
router.post('/branches', asyncH(branchCtrl.adminCreate));
router.put('/branches/:id', asyncH(branchCtrl.adminUpdate));
router.delete('/branches/:id', asyncH(branchCtrl.adminDelete));

/* العروض */
router.post('/offers', asyncH(offerCtrl.adminCreate));
router.put('/offers/:id', asyncH(offerCtrl.adminUpdate));
router.delete('/offers/:id', asyncH(offerCtrl.adminDelete));

/* الطلبات (مهم: /all قبل /:id) */
router.put('/orders/:id/status', asyncH(orderCtrl.adminSetStatus));
router.delete('/orders/all', asyncH(orderCtrl.adminWipe));
router.delete('/orders/:id', asyncH(orderCtrl.adminDelete));

/* الرسائل */
router.put('/messages/:id/read', asyncH(messageCtrl.adminToggleRead));
router.delete('/messages/:id', asyncH(messageCtrl.adminDelete));

/* الإعدادات: home / promos / brand */
router.put('/settings/:key', asyncH(settingsCtrl.adminUpdate));

/* إضافة أدمن جديد */
router.post('/admins', asyncH(authCtrl.addAdmin));

module.exports = router;
