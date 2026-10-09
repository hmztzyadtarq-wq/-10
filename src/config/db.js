/* src/config/db.js — الاتصال بقاعدة البيانات MongoDB باستخدام Mongoose للـ Serverless */

const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const opts = {
      serverSelectionTimeoutMS: 10000,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, opts);
    cachedConnection = conn;
    console.log(`✓ متصل بقاعدة البيانات MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('✗ فشل الاتصال بقاعدة البيانات:', error.message);
    throw error;
  }
};

module.exports = connectDB;
