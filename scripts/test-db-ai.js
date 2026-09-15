import 'dotenv/config';
import { connectDB } from '../src/config/db.js';
import { News } from '../src/models/News.js';
import { analyzeNewsWithGemini } from '../src/services/geminiService.js';

async function run() {
  await connectDB();
  
  const total = await News.countDocuments();
  const unanalyzed = await News.find({
    $or: [
      { aiCategorized: { $ne: true } },
      { aiNote: null },
      { aiNote: { $exists: false } }
    ]
  }).select('_id title sourceUrl category impactScore');

  console.log(`📌 Toplam Haber Sayısı: ${total}`);
  console.log(`📌 Henüz AI Analizi Yapılmamış Haber Sayısı: ${unanalyzed.length}`);

  if (unanalyzed.length === 0) {
    console.log('✅ Tüm haberlerin AI analizi zaten tamamlanmış durumda!');
    process.exit(0);
  }

  // 3-5 tanesini test edelim
  const batchToTest = unanalyzed.slice(0, 5);
  console.log(`\n🚀 Yeni Sistem İle ${batchToTest.length} Adet Haber Üzerinde Analiz Başlatılıyor...\n`);

  for (let i = 0; i < batchToTest.length; i++) {
    const item = batchToTest[i];
    console.log(`--- [${i + 1}/${batchToTest.length}] Analiz Ediliyor: "${item.title}" (ID: ${item._id}) ---`);
    const startTime = Date.now();
    try {
      const updated = await analyzeNewsWithGemini(item._id);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ [${elapsed}s] Başarılı!`);
      console.log(`   📂 Kategori: ${updated.category}`);
      console.log(`   ⭐ AI Etki Skoru: ${updated.aiImportanceScore}/10 (Önceki: ${item.impactScore})`);
      console.log(`   📝 AI Yorumu: "${updated.aiNote}"`);
      console.log(`   🚢 Tespit Edilen Gemiler: ${updated.aiVessels && updated.aiVessels.length > 0 ? updated.aiVessels.join(', ') : 'Bulunamadı'}`);
    } catch (err) {
      console.error(`❌ Hata Oluştu: ${err.message}`);
    }

    if (i < batchToTest.length - 1) {
      console.log('⏳ Kota güvenliği için 2.5 saniye bekleniyor...');
      await new Promise(r => setTimeout(r, 2500));
    }
  }

  const remaining = await News.countDocuments({
    $or: [
      { aiCategorized: { $ne: true } },
      { aiNote: null },
      { aiNote: { $exists: false } }
    ]
  });
  console.log(`\n📊 Kalan İşlenmemiş Haber Sayısı: ${remaining}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
