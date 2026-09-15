import fs from 'fs';
import mongoose from 'mongoose';

/**
 * MongoDB Veritabanı Bağlantı Yöneticisi
 */
export const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/marineradar';
    // Docker konteynırı içinde çalışıyorsa ve URI 127.0.0.1 ise otomatik mongodb servis adını kullan
    if (fs.existsSync('/.dockerenv') && uri.includes('127.0.0.1')) {
      uri = uri.replace('127.0.0.1', 'mongodb');
    }
    const conn = await mongoose.connect(uri);
    console.log(`🍃 MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Bağlantı Hatası: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};
