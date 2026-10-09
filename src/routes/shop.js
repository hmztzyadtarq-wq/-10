/* src/routes/shop.js — نقاط النهاية العامة (الموقع): بيانات المتجر، الطلبات، العروض، الحسابات */

const router = require('express').Router();
const asyncH = require('../middleware/async');
const { verifyToken } = require('../middleware/auth');

const adminCtrl = require('../controllers/adminController');   // bootstrap عالمي مش محتاج صلاحية أدمن
const productCtrl = require('../controllers/productController');
const categoryCtrl = require('../controllers/categoryController');
const branchCtrl = require('../controllers/branchController');
const offerCtrl = require('../controllers/offerController');
const orderCtrl = require('../controllers/orderController');
const settingsCtrl = require('../controllers/settingsController');
const messageCtrl = require('../controllers/messageController');
const authCtrl = require('../controllers/authController');

/* بيانات المتجر */
router.get('/bootstrap', asyncH(adminCtrl.bootstrapPublic));    // كل بيانات الموقع في طلب واحد
router.get('/categories', asyncH(categoryCtrl.list));
router.get('/products', asyncH(productCtrl.list));
router.get('/branches', asyncH(branchCtrl.list));
router.get('/settings', asyncH(settingsCtrl.getAll));
router.get('/settings/meta', asyncH(settingsCtrl.getMeta));

/* العروض وأكواد الخصم */
router.get('/offers/active', asyncH(offerCtrl.active));
router.post('/offers/validate', asyncH(offerCtrl.validate));

/* الطلبات (بتحتاج تسجيل دخول) */
router.post('/orders', verifyToken, asyncH(orderCtrl.create));
router.get('/orders/mine', verifyToken, asyncH(orderCtrl.mine));

/* رسائل العملاء */
router.post('/messages', asyncH(messageCtrl.create));

/* الحسابات */
router.post('/auth/register', asyncH(authCtrl.register));
router.post('/auth/login', asyncH(authCtrl.login));
router.get('/auth/me', verifyToken, asyncH(authCtrl.me));
router.post('/auth/password', verifyToken, asyncH(authCtrl.changePassword));

module.exports = router;
