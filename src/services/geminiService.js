import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { News } from '../models/News.js';

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
    console.warn(`⚠️ [Gemini AI REST] ${modelName} HTTP ${status} uyarısı:`, errData?.error?.message || restErr.message);

    // Eger REST 404 (model bulunamadı) veya 429 dışı bir hata ise SDK ile dene
    if (status === 404) {
      throw new Error(errData?.error?.message || `Model ${modelName} bulunamadı.`);
    }
  }

  // 2. İkincil Yöntem: Standard SDK Fallback
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

  // Tüm tanımlı API Key'leri ve Modelleri dolaş (429 anında otomatik diğer anahtara geçer)
  keyLoop:
  for (const currentApiKey of rawKeys) {
    for (const modelName of candidateModels) {
      try {
        responseText = await callGeminiApi(modelName, prompt, currentApiKey);
        if (responseText) break keyLoop;
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ [Gemini AI] Model ${modelName} hata aldı: ${err.message}`);
        const isRateLimit = err.status === 429 || err.message.includes('429') || err.message.includes('Quota exceeded');
        if (isRateLimit && rawKeys.length > 1) {
          console.log(`🔄 [Gemini AI] Kota limitine ulaşıldı, diğer API Anahtarına geçiliyor...`);
          continue keyLoop; // Bir sonraki API key'e geç
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
