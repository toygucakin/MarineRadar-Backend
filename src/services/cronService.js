import cron from 'node-cron';
import { scrapeRssFeeds } from './rssService.js';
import { scrapeHtmlTargets } from './htmlService.js';
import { scrapeAllUnscrapedNews } from './deepScraperService.js';
import { matchVesselsForAllNews } from './vesselMatcherService.js';
import { classifyRegulationsForAllNews } from './regulationService.js';
import { analyzeAllUnprocessedNewsWithGemini } from './geminiService.js';

/**
 * 5 Aşamalı Tam Akıllı Veri Boru Hattı (5-Stage AI Scraping Pipeline Engine)
 * Stage 1: RSS & HTML Web Ingestion
 * Stage 2: Deep Article Scraper (Full Content Extraction)
 * Stage 3: Multi-Vessel Entity Matcher (IMO & Vessel Names)
 * Stage 4: Maritime Regulation Classifier & Compliance Risk Assessor
 * Stage 5: Google Gemini AI Commentary, Vessel Extraction, Importance Score & Categorization Engine
 */
export const runFullPipeline = async (reason = 'Zamanlanmış Pipeline') => {
  console.log(`⚡ [Pipeline Engine] 5 Aşamalı Akıllı Veri Boru Hattı Başlatıldı (${reason})...`);
  const startTime = Date.now();

  const report = {
    rssAdded: 0,
    htmlAdded: 0,
    deepScrapedCount: 0,
    matchedVesselsCount: 0,
    classifiedRegulationsCount: 0,
    aiAnalyzedCount: 0,
    durationMs: 0
  };

  try {
    // Stage 1: RSS & HTML Ingestion
    console.log('📌 [Stage 1/5] RSS & HTML Akış Kazıma...');
    const rssRes = await scrapeRssFeeds();
    const htmlRes = await scrapeHtmlTargets();
    report.rssAdded = rssRes.addedCount || 0;
    report.htmlAdded = htmlRes.addedCount || 0;

    // Stage 2: Deep Article Scraping
    console.log('📌 [Stage 2/5] Derin Makale Metni Kazıma (Deep Scraper)...');
    const deepRes = await scrapeAllUnscrapedNews(50);
    report.deepScrapedCount = deepRes.scrapedCount || 0;

    // Stage 3: Multi-Vessel Entity Matching
    console.log('📌 [Stage 3/5] Gemi Varlık Eşleme (Vessel Entity Matcher)...');
    const vesselRes = await matchVesselsForAllNews(500);
    report.matchedVesselsCount = vesselRes.totalMatchesCount || 0;

    // Stage 4: Regulation Classification & Compliance Risk Assessment
    console.log('📌 [Stage 4/5] Regülasyon ve Uyumluluk Analizi (Regulation Classifier)...');
    const regRes = await classifyRegulationsForAllNews(500);
    report.classifiedRegulationsCount = regRes.totalRegulationsCount || 0;

    // Stage 5: Google Gemini AI Engine
    console.log('📌 [Stage 5/5] Google Gemini AI Analiz Motoru (Gemini AI Engine)...');
    const aiLimit = process.env.NODE_ENV === 'test' ? 1 : 100;
    const aiRes = await analyzeAllUnprocessedNewsWithGemini(aiLimit);
    report.aiAnalyzedCount = aiRes.analyzedCount || 0;

    report.durationMs = Date.now() - startTime;
    console.log(`✅ [Pipeline Engine] 5 Aşamalı Akıllı Boru Hattı Başarıyla Tamamlandı! (${report.durationMs} ms)`);
    console.log(`📊 Pipeline Özeti: RSS: +${report.rssAdded}, HTML: +${report.htmlAdded}, Derin Kazınan: ${report.deepScrapedCount}, Eşleşen Gemi: ${report.matchedVesselsCount}, Regülasyon: ${report.classifiedRegulationsCount}, Gemini AI: ${report.aiAnalyzedCount}`);

    return { success: true, report };
  } catch (error) {
    console.error('❌ [Pipeline Engine] Boru hattı yürütülürken hata oluştu:', error.message);
    return { success: false, error: error.message, report };
  }
};

/**
 * Otomatik Zamanlanmış Görevler (Cron Jobs) Servisi
 */
export const initCronJobs = () => {
  // 1. Sunucu açılır açılmaz (2 saniye sonra) 1 defa tam 5 aşamalı boru hattını çalıştır
  setTimeout(() => {
    runFullPipeline('Sunucu Açılış Taraması');
  }, 2000);

  // 2. Her 5 dakikada bir ("*/5 * * * *") henüz AI analizi yapılmamış 25 haberi arka planda yavaş yavaş analiz et
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🔄 [Background AI Queue] Henüz AI analizi yapılmamış haberler taranıyor...');
      const res = await analyzeAllUnprocessedNewsWithGemini(25);
      if (res.analyzedCount > 0) {
        console.log(`✅ [Background AI Queue] ${res.analyzedCount} adet haber başarıyla Gemini AI ile analiz edildi.`);
      }
    } catch (err) {
      console.warn('⚠️ [Background AI Queue] Arka plan AI taramasında hata:', err.message);
    }
  });

  // 3. Her 6 saatte bir ("0 */6 * * *") arka planda tam boru hattını çalıştır
  cron.schedule('0 */6 * * *', () => {
    runFullPipeline('6 Saatlik Periyodik Tarama');
  });

  console.log('⚡ Zamanlanmış Veri Boru Hattı Aktif: 5 dakikalık periyotlarla arka plan AI analizi ve 6 saatte bir tam boru hattı otomatik çalışacak.');
};
