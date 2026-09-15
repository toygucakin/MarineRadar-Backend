import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { News } from '../models/News.js';

// Anahtar Maskeleme Yardımcısı
const maskKey = (key) => {
  if (!key || typeof key !== 'string') return 'UNKNOWN_KEY';
  if (key.length <= 10) return '***';
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
};

// Global Anahtar Havuzu (Pool) ve Cooldown Takipçisi
let activeKeyIndex = 0;
const keyCooldownMap = new Map(); // apiKey -> expiresAt (timestamp)

/**
 * Mevcut API anahtarlarını öncelik sırasına koyar:
 * 1. Cooldown süresi bitmiş veya hiç kısıtlanmamış anahtarlar (aktif indeksten itibaren)
 * 2. Eğer hepsi kısıtlanmışsa, cooldown'ı en erken bitecek olan anahtar
 */
const getOrderedKeys = (rawKeys) => {
  const now = Date.now();
  for (const [key, expiresAt] of keyCooldownMap.entries()) {
    if (expiresAt <= now) {
      keyCooldownMap.delete(key);
    }
  }

  const available = [];
  const inCooldown = [];

  for (let i = 0; i < rawKeys.length; i++) {
    const idx = (activeKeyIndex + i) % rawKeys.length;
    const k = rawKeys[idx];
    if (keyCooldownMap.has(k)) {
      inCooldown.push({ key: k, expiresAt: keyCooldownMap.get(k), index: idx });
    } else {
      available.push({ key: k, index: idx });
    }
  }

  inCooldown.sort((a, b) => a.expiresAt - b.expiresAt);
  return [...available.map(x => x.key), ...inCooldown.map(x => x.key)];
};

/**
 * Gemini AI İçin REST API / SDK Çağrı Yardımcısı
 */
const callGeminiApi = async (modelName, prompt, apiKey) => {
  // 1. Birincil Yöntem: Direct REST Call with x-goog-api-key (Yeni AQ.Ab8RN... ve AIzaSy... keyleri ile %100 uyumlu)
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      },
      {
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const candidate = response.data?.candidates?.[0];
    if (candidate?.content?.parts?.[0]?.text) {
      return candidate.content.parts[0].text;
    }
  } catch (restErr) {
    const status = restErr.response?.status;
    const errData = restErr.response?.data;
    const errMsg = errData?.error?.message || restErr.message;
    console.warn(`⚠️ [Gemini AI REST] ${modelName} HTTP ${status} uyarısı:`, errMsg);

    // 429 Kota Sınırı: Doğrudan hata fırlat ki anahtar rotasyonu hemen diğer anahtara atlasın
    if (status === 429 || errMsg.includes('Quota exceeded') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      const err = new Error(errMsg || 'Google Gemini API 429 Rate Limit / Quota exceeded');
      err.status = 429;
      err.isRateLimit = true;
      throw err;
    }

    // 503 Servis Yoğunluğu: Model rotasyonu için fırlat
    if (status === 503) {
      const err = new Error(errMsg || 'Google Gemini 503 Service Unavailable / High demand');
      err.status = 503;
      throw err;
    }

    // 404 Model Bulunamadı:
    if (status === 404) {
      const err = new Error(errMsg || `Model ${modelName} bulunamadı.`);
      err.status = 404;
      throw err;
    }

    // Yeni AQ.Ab8RN... anahtarlarında SDK çağrılmamalıdır (SDK ?key= gönderir ve 401 üretir)
    if (!apiKey.startsWith('AIzaSy')) {
      throw restErr;
    }
  }

  // 2. İkincil Yöntem: Sadece eski AIzaSy... keyleri için SDK Fallback
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Yardımcı Uyu Fonksiyonu
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Belirli bir haberi Google Gemini AI ile analiz eder ve Mongoose modelini günceller.
 */
export const analyzeNewsWithGemini = async (newsId) => {
  const news = await News.findById(newsId);
  if (!news) {
    throw new Error(`Haber bulunamadı (ID: ${newsId})`);
  }

  // Test ortamı için hızlı mock yanıtı
  if (process.env.NODE_ENV === 'test') {
    news.aiNote = 'Test ortamı simülasyonu: Google Gemini AI ile karbonsuzlaşma ve regülasyon analizi gerçekleştirildi.';
    news.aiImportanceScore = 8.5;
    news.impactScore = 8.5;
    news.category = news.category || 'Clean Energy';
    news.aiCategorized = true;
    news.aiAnalyzedAt = new Date();
    news.aiVessels = ['M/T Aegean Green'];
    await news.save();
    console.log(`🤖 [Gemini AI Test Mock] Haber Simüle Edildi: "${news.title}"`);
    return news;
  }

  const rawKeys = (process.env.GEMINI_API_KEY || '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);

  if (rawKeys.length === 0) {
    throw new Error('GEMINI_API_KEY ortam değişkeni tanımlanmamış.');
  }

  // Akıllı sıralanmış anahtar havuzu (Cooldown'da olmayan aktif anahtarlar en başta)
  const orderedKeys = getOrderedKeys(rawKeys);

  const articleTitle = news.title || 'Untitled Maritime Article';
  const articleSummary = news.summary || '';
  const articleFullContent = (news.fullContent && news.fullContent.length > 50) ? news.fullContent : '';

  const combinedContent = [
    `ARTICLE TITLE: ${articleTitle}`,
    articleSummary ? `EXECUTIVE SUMMARY: ${articleSummary}` : '',
    articleFullContent ? `FULL ARTICLE CONTENT:\n${articleFullContent}` : ''
  ].filter(Boolean).join('\n\n');

  const prompt = `
You are an expert AI Analyst specializing in global maritime shipping, vessel emissions (IMO DCS, EU ETS, FuelEU Maritime), and decarbonization technologies.

Carefully read and analyze the following specific maritime news article:

--- START OF ARTICLE ---
${combinedContent}
--- END OF ARTICLE ---

Task Requirements:
1. Category Selection: Select the single best matching category for THIS SPECIFIC ARTICLE from: 'Clean Energy', 'Regulations', 'Carbon Emissions', 'Green Ports', 'Maritime & Environment', 'Green Fleet', 'Alternative Fuels', 'Genel'.
2. Importance Score: Evaluate the article's importance and impact specifically within maritime decarbonization and assign an "aiImportanceScore" float value strictly between 5.0 and 10.0.
3. Commentary (aiNote): Write a concise, highly accurate 2-3 sentence commentary IN ENGLISH evaluating the specific developments described IN THIS ARTICLE and their direct impact on maritime emissions, decarbonization goals, regulation compliance, or fleet operations. Do NOT invent or mention unrelated topics not in the text.
4. Vessel Entity Detection (aiVessels): Extract all vessel names and IMO numbers mentioned in the article text. Return [] if none are mentioned.

Response JSON Format:
{
  "category": "Chosen category name",
  "aiImportanceScore": 8.5,
  "aiNote": "Specific commentary analyzing this exact article...",
  "aiVessels": ["Array of mentioned vessel names/IMOs"]
}
`;

  const candidateModels = Array.from(new Set([
    process.env.GEMINI_MODEL,
    'gemini-3.6-flash',
    'gemini-3.5-flash'
  ].filter(Boolean)));

  let lastError = null;
  let responseText = null;

  // Sıralanmış anahtarlar ve modeller üzerinden dolaş (429 anında otomatik diğer anahtara geçer)
  keyLoop:
  for (const currentApiKey of orderedKeys) {
    const masked = maskKey(currentApiKey);
    for (const modelName of candidateModels) {
      try {
        responseText = await callGeminiApi(modelName, prompt, currentApiKey);
        if (responseText) {
          // Başarılı olan anahtarın indeksini aktif indeks yap (sonraki istekler doğrudan buradan başlasın)
          const keyPos = rawKeys.indexOf(currentApiKey);
          if (keyPos !== -1) {
            activeKeyIndex = keyPos;
          }
          break keyLoop;
        }
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ [Gemini AI] Model ${modelName} & Key [${masked}] hata aldı: ${err.message}`);
        
        const isRateLimit = err.status === 429 || 
          err.isRateLimit === true || 
          err.message.includes('429') || 
          err.message.includes('Quota exceeded') ||
          err.message.includes('RESOURCE_EXHAUSTED');

        if (isRateLimit && rawKeys.length > 1) {
          keyCooldownMap.set(currentApiKey, Date.now() + 60000); // 60 saniye boyunca bu anahtarı dinlendir
          activeKeyIndex = (rawKeys.indexOf(currentApiKey) + 1) % rawKeys.length;
          console.log(`🔄 [Gemini AI Key Pool] Anahtar [${masked}] kotası doldu (429 Rate Limit). 60 saniye beklemeye alındı. Otomatik olarak bir sonraki API anahtarına (${activeKeyIndex + 1}/${rawKeys.length}) geçiliyor...`);
          continue keyLoop; // Hemen bir sonraki anahtara geç!
        }

        if (err.status === 503 || err.message.includes('503')) {
          await sleep(1500);
        }
      }
    }
  }

  if (!responseText) {
    let cleanMsg = lastError ? lastError.message : 'Yanıt alınamadı';
    if (cleanMsg.includes('429') || cleanMsg.includes('Quota exceeded')) {
      cleanMsg = 'Google Gemini API kota limitine ulaşıldı (429 Rate Limit). Google ücretsiz planında kısa süreli istek sınırına takılındı. Lütfen 15-20 saniye bekleyip tekrar deneyin.';
    }
    throw new Error(cleanMsg);
  }

  // JSON Temizleme ve Ayrıştırma
  let parsedData;
  try {
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    parsedData = JSON.parse(cleanedJson);
  } catch (parseError) {
    console.error('❌ [Gemini AI] JSON Ayrıştırma Hatası:', responseText);
    throw new Error('Gemini AI yanıtı geçerli bir JSON formatında değildi.');
  }

  // Haber Dokümanını Güncelle
  news.aiNote = parsedData.aiNote || 'Yapay zeka analizi başarıyla tamamlandı.';
  if (parsedData.category) {
    news.category = parsedData.category;
  }
  if (typeof parsedData.aiImportanceScore === 'number') {
    const clampedScore = Math.min(10.0, Math.max(5.0, parsedData.aiImportanceScore));
    news.aiImportanceScore = Number(clampedScore.toFixed(1));
    news.impactScore = news.aiImportanceScore; // Primary impactScore updated to AI score!
  } else if (!news.aiImportanceScore) {
    news.aiImportanceScore = 6.5;
    news.impactScore = 6.5;
  }
  if (Array.isArray(parsedData.aiVessels)) {
    news.aiVessels = parsedData.aiVessels.map(v => String(v).trim()).filter(Boolean);
  }

  news.aiCategorized = true;
  news.aiAnalyzedAt = new Date();

  await news.save();

  console.log(`🤖 [Gemini AI] Haber Başarıyla Analiz Edildi: "${news.title}" (Etki Skoru: ${news.aiImportanceScore})`);
  return news;
};

/**
 * Veritabanındaki henüz Gemini AI analizi yapılmamış (veya zorla istenmiş) tüm haberleri toplu olarak analiz eder.
 * @param {number} limit - Maksimum analiz edilecek haber sayısı
 * @param {boolean} force - True ise tüm haberleri yeniden analiz eder
 * @returns {Promise<Object>} Toplu analiz raporu
 */
export const analyzeAllUnprocessedNewsWithGemini = async (limit = 10, force = false) => {
  const query = force ? {} : {
    $or: [
      { aiCategorized: { $ne: true } },
      { aiNote: null },
      { aiNote: { $exists: false } }
    ]
  };
  const unprocessedNews = await News.find(query).limit(limit);

  const report = {
    totalFound: unprocessedNews.length,
    analyzedCount: 0,
    failedCount: 0,
    analyzedNews: []
  };

  if (unprocessedNews.length === 0) {
    return report;
  }

  for (const news of unprocessedNews) {
    try {
      const updatedNews = await analyzeNewsWithGemini(news.id);
      report.analyzedCount++;
      report.analyzedNews.push({
        id: updatedNews.id,
        title: updatedNews.title,
        aiImportanceScore: updatedNews.aiImportanceScore,
        category: updatedNews.category
      });
      await sleep(1200);
    } catch (err) {
      console.error(`⚠️ [Gemini Batch] "${news.title}" analiz edilemedi:`, err.message);
      report.failedCount++;
      await sleep(1500);
    }
  }

  console.log(`📊 [Gemini AI Batch] Toplu Analiz Tamamlandı: ${report.analyzedCount}/${report.totalFound} Başarılı.`);
  return report;
};
