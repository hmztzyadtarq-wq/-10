/* src/middleware/async.js — غلاف صغير بيسمح لأخطاء الدوال async توصل لمعالج أخطاء Express */

const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncH;
