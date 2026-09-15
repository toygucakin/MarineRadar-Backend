import { News } from '../models/News.js';
import mongoose from 'mongoose';
import { scrapeRssFeeds } from '../services/rssService.js';
import { scrapeHtmlTargets } from '../services/htmlService.js';
import { scrapeNewsById, scrapeAllUnscrapedNews, sanitizeArticleText } from '../services/deepScraperService.js';
import { matchVesselsForNewsItem, matchVesselsForAllNews } from '../services/vesselMatcherService.js';
import { classifyRegulationsForNewsItem, classifyRegulationsForAllNews } from '../services/regulationService.js';
import { analyzeNewsWithGemini, analyzeAllUnprocessedNewsWithGemini } from '../services/geminiService.js';

/**
 * Controller (MongoDB / Mongoose İş Mantığı Katmanı)
 */

// GET /api/news -> Tüm haberleri veritabanından getirir
export const getAllNews = async (req, res, next) => {
  try {
    const newsList = await News.find().sort({ publishedAt: -1 });

    const sanitizedNews = newsList.map(item => {
      const doc = item.toObject({ virtuals: true });
      if (doc.fullContent) {
        doc.fullContent = sanitizeArticleText(doc.fullContent);
      }
      return doc;
    });

    res.status(200).json({
      success: true,
      count: sanitizedNews.length,
      data: sanitizedNews
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/news/:id -> Tek bir haberi getirir
export const getNewsById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Mongo ObjectId formatında geçerlilik kontrolü
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan haber bulunamadı.`
      });
    }

    const newsItem = await News.findById(id);

    if (!newsItem) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan haber bulunamadı.`
      });
    }

    const doc = newsItem.toObject({ virtuals: true });
    if (doc.fullContent) {
      doc.fullContent = sanitizeArticleText(doc.fullContent);
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.status(200).json({
      success: true,
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news -> Yeni gemicilik haberi ekler
export const createNews = async (req, res, next) => {
  try {
    const { title, summary, category, author, impactScore, sourceUrl } = req.body;

    const newNewsItem = await News.create({
      title,
      summary,
      category,
      author: author || 'Anonim Analist',
      impactScore,
      sourceUrl
    });

    res.status(201).json({
      success: true,
      message: 'Yeni gemicilik haberi başarıyla veritabanına eklendi.',
      data: newNewsItem
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news/scrape/rss -> RSS Akışlarından otomatik haber kazıma tetikler
export const scrapeRssNews = async (req, res, next) => {
  try {
    const { feeds } = req.body || {};
    const result = await scrapeRssFeeds(feeds);

    if (result.addedCount > 0) {
      try {
        await analyzeAllUnprocessedNewsWithGemini(result.addedCount);
      } catch (aiErr) {
        console.warn('⚠️ [scrapeRssNews] Otomatik AI analizi tamamlama uyarısı:', aiErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `RSS Kazıma İşlemi Tamamlandı: ${result.addedCount} yeni haber veritabanına eklendi ve AI analizinden geçirildi, ${result.skippedCount} mevcut haber atlandı.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news/scrape/html -> HTML Web Sayfalarından otomatik haber kazıma tetikler
export const scrapeHtmlNews = async (req, res, next) => {
  try {
    const { targets } = req.body || {};
    const result = await scrapeHtmlTargets(targets);

    if (result.addedCount > 0) {
      try {
        await analyzeAllUnprocessedNewsWithGemini(result.addedCount);
      } catch (aiErr) {
        console.warn('⚠️ [scrapeHtmlNews] Otomatik AI analizi tamamlama uyarısı:', aiErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `HTML Kazıma İşlemi Tamamlandı: ${result.addedCount} yeni haber veritabanına eklendi ve AI analizinden geçirildi, ${result.skippedCount} mevcut haber atlandı.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news/:id/scrape-deep -> Belirli bir haber için detaylı metin kazıması tetikler
export const scrapeDeepNewsById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan haber bulunamadı.`
      });
    }

    const result = await scrapeNewsById(id);

    res.status(200).json({
      success: true,
      message: 'Haber detaylı içeriği başarıyla kazındı ve veritabanı güncellendi.',
      data: result.news,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news/scrape/deep -> İçeriği bulunmayan tüm haberleri toplu olarak derin metin kazımasından geçirir
export const scrapeDeepAllNews = async (req, res, next) => {
  try {
    const body = req.body || {};
    const query = req.query || {};
    const limit = parseInt(query.limit || body.limit || '30', 10);
    const result = await scrapeAllUnscrapedNews(limit);

    res.status(200).json({
      success: true,
      message: `Toplu Derin Kazıma İşlemi Tamamlandı: ${result.scrapedCount} haber detaylandırıldı, ${result.failedCount} hata alındı.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news/:id/match-vessels -> Belirli bir haber için gemi varlık eşlemesi çalıştırır
export const matchVesselsSingleNews = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan haber bulunamadı.`
      });
    }

    const newsItem = await News.findById(id);

    if (!newsItem) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan haber bulunamadı.`
      });
    }

    const matched = await matchVesselsForNewsItem(newsItem);

    res.status(200).json({
      success: true,
      message: `Gemi Varlık Eşlemesi Tamamlandı: ${matched.length} gemi tespit edildi.`,
      matchedCount: matched.length,
      data: newsItem
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news/match-vessels -> Veritabanındaki haberler için toplu gemi varlık eşlemesi çalıştırır
export const matchVesselsAllNews = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || req.body?.limit || '100', 10);
    const result = await matchVesselsForAllNews(limit);

    res.status(200).json({
      success: true,
      message: `Toplu Gemi Eşlemesi Tamamlandı: ${result.updatedNewsCount} haberde toplam ${result.totalMatchesCount} gemi tespiti yapıldı.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/news/vessel/:vesselId -> Belirli bir gemiyle eşleşen haberleri getirir
export const getNewsByVesselId = async (req, res, next) => {
  try {
    const { vesselId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vesselId)) {
      return res.status(404).json({
        success: false,
        message: `Gemi ID değeri '${vesselId}' geçerli bir ObjectId değil.`
      });
    }

    const matchedNewsList = await News.find({
      'matchedVessels.vessel': vesselId
    }).sort({ publishedAt: -1 });

    res.status(200).json({
      success: true,
      count: matchedNewsList.length,
      data: matchedNewsList
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/news/my-vessels -> Giriş yapan kullanıcının kendi gemilerine özel kişiselleştirilmiş haber akışını getirir
export const getMyVesselsNews = async (req, res, next) => {
  try {
    const userVessels = req.user.assignedVessels || [];
    const vesselIds = userVessels.map(v => v._id || v);

    if (vesselIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Kullanıcınıza henüz atanmış bir gemi bulunmuyor.',
        count: 0,
        data: []
      });
    }

    const newsList = await News.find({
      'matchedVessels.vessel': { $in: vesselIds }
    }).sort({ publishedAt: -1, createdAt: -1 });

    const sanitizedNews = newsList.map(item => {
      const doc = item.toObject({ virtuals: true });
      if (doc.fullContent) {
        doc.fullContent = sanitizeArticleText(doc.fullContent);
      }
      return doc;
    });

    res.status(200).json({
      success: true,
      user: { name: req.user.name, email: req.user.email, vesselCount: vesselIds.length },
      count: sanitizedNews.length,
      data: sanitizedNews
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news/:id/classify-regulations -> Belirli bir haber için regülasyon analizi çalıştırır
export const classifyRegulationsSingleNews = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan haber bulunamadı.`
      });
    }

    const newsItem = await News.findById(id);

    if (!newsItem) {
      return res.status(404).json({
        success: false,
        message: `ID değeri '${id}' olan haber bulunamadı.`
      });
    }

    const result = await classifyRegulationsForNewsItem(newsItem);

    res.status(200).json({
      success: true,
      message: `Regülasyon Sınıflandırması Tamamlandı: ${result.regulations.length} regülasyon konusu etiketlendi.`,
      complianceRisk: result.complianceRisk,
      data: newsItem
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news/classify-regulations -> Veritabanındaki haberler için toplu regülasyon analizi çalıştırır
export const classifyRegulationsAllNews = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || req.body?.limit || '500', 10);
    const result = await classifyRegulationsForAllNews(limit);

    res.status(200).json({
      success: true,
      message: `Toplu Regülasyon Analizi Tamamlandı: ${result.classifiedNewsCount} haberde toplam ${result.totalRegulationsCount} regülasyon tespiti yapıldı.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/news/regulation/:code -> Belirli bir regülasyon koduyla (EU_ETS, IMO_DCS vb.) eşleşen haberleri getirir
export const getNewsByRegulationCode = async (req, res, next) => {
  try {
    const { code } = req.params;

    const matchedNewsList = await News.find({
      'regulations.code': code.toUpperCase()
    }).sort({ publishedAt: -1 });

    res.status(200).json({
      success: true,
      count: matchedNewsList.length,
      data: matchedNewsList
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news/scrape/pipeline -> 4 Aşamalı Tam Boru Hattını Manuel Tetikler
export const runScrapingPipelineController = async (req, res, next) => {
  try {
    const { runFullPipeline } = await import('../services/cronService.js');
    const result = await runFullPipeline('Manuel API İsteği');

    if (result.success) {
      res.status(200).json({
        success: true,
        message: '4 Aşamalı Veri Boru Hattı Başarıyla Tamamlandı!',
        data: result.report
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Boru hattı hatası: ${result.error}`,
        data: result.report
      });
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/news/:id/ai-analyze -> Tek bir haberi Google Gemini AI ile analiz eder
export const analyzeNewsWithGeminiController = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Geçersiz haber ID formatı: '${id}'`
      });
    }

    const newsItem = await analyzeNewsWithGemini(id);

    res.status(200).json({
      success: true,
      message: 'Haber Google Gemini AI ile başarıyla analiz edildi ve güncellendi.',
      data: newsItem
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/news/ai-analyze -> Veritabanındaki işlenmemiş haberlere toplu Gemini AI analizi uygular
export const analyzeBatchNewsWithGeminiController = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || req.body?.limit || '10', 10);
    const force = req.query.force === 'true' || req.body?.force === true;
    const result = await analyzeAllUnprocessedNewsWithGemini(limit, force);

    res.status(200).json({
      success: true,
      message: `Toplu Gemini AI Analizi Tamamlandı: ${result.analyzedCount}/${result.totalFound} haber başarıyla analiz edildi.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

