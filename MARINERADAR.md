# MyCarbons (MarineRadar) - Otomatik Gemicilik Bülten & Karbon Analiz Platformu

> [!IMPORTANT]
> 🤖 **Geliştirici Ajan Yönergesi (Mandatory AI Directive):**  
> Projede tamamlanan her yeni aşama, yeni özellik geliştirme, hata düzeltmesi veya mimari değişiklik sonrasında `MARINERADAR.md` dosyasındaki **"Tamamlanan Aşamalar"** yol haritası ve **"Tamamlanan Proje Dosyaları"** listesi **SÜREKLİ VE ZORUNLU OLARAK GÜNCELLENECEKTİR.**

## ⚓ Uygulamanın Vizyonu ve Temel Özellikleri

**MyCarbons (MarineRadar)**; Node.js, Express.js, REST API ve MongoDB teknolojilerini kullanarak küresel denizcilik ve karbonsuzlaştırma bültenlerinden **otomatik veri kazıma (Web Scraping / Data Harvesting)** yapan, elde edilen verileri anlamlandırıp kendi özel denizcilik ve karbon emisyonu bültenlerini oluşturan akıllı bir backend ve frontend platformudur.

### 🌟 Ana İşlevler ve Sistem Bileşenleri
1. **Otomatik Veri Kazıma (Web Scraping & RSS Service):**
   - Küresel denizcilik haber siteleri ve sektörel bültenlerden düzenli aralıklarla (Cron Jobs) haber, rapor ve emisyon verilerini toplar.
2. **Derin Makale Kazıma & Metin Analitiği (Deep Article Scraper & Analytics):**
   - Orijinal haber bağlantılarına giderek tam makale metinlerini kazır (`fullContent`), IMO numarası ve gemi isimleri üzerinden filo gemilerini eşleştirir (`matchedVessels`) ve regülasyon uyumluluk risk skorlarını hesaplar (`complianceRisk`).
3. **Kullanıcı Yetkilendirme & Kişisel Filo Yönetimi (User Auth & Fleet System):**
   - JWT token tabanlı giriş yapma, kullanıcılara özel gemi filosu atama (`assignedVessels`), filoya gemi ekleme/çıkarma (`POST/DELETE /api/users/:id/vessels`) ve kişiselleştirilmiş haber akışına erişim.
4. **Akıllı Bülten Derleyici (Automated Newsletter Generator):**
   - Karbon emisyonu, yeşil limanlar ve alternatif yakıtlar gibi kategorilere göre en yüksek etki puanına (`impactScore`) sahip haberleri seçerek günlük/haftalık **MyCarbons Özel Bülteni** oluşturur ve arşivler.
5. **Dinamik Web Dashboard & Akıllı Sayfalama (Pagination Engine):**
   - Nane yeşili eco-design temalı interaktif arayüz, 15 haber/sayfa sınırlaması ve yığılmayı önleyen akıllı kısaltmalı sayfalama çubuğu (`1 2 3 4 5 ... N`).
6. **MongoDB Veri Katmanı & REST API Test Mühendisliği:**
   - Esnek MongoDB (Mongoose) koleksiyonları, Swagger UI canlı dokümantasyonu ve 22 tam geçen Jest entegrasyon testi.

---

## 🟢 Tamamlanan Aşamalar (Completed Phases)

- **Aşama 1 (TAMAMLANDI ✅):** Node.js & Express.js İlk API İskeleti ve Jest/Supertest Test Altyapısı.
- **Aşama 2 (TAMAMLANDI ✅):** Katmanlı Mimari (MVC), Dinamik Rotalar (`/api/news`, `/api/news/:id`) & Merkezi 404 Fallback.
- **Aşama 3 (TAMAMLANDI ✅):** `Nodemon` Canlı Yeniden Başlatma, `validateNews` Middleware, `POST /api/news` Endpoint'i, Merkezi Hata Yönetimi & GitHub Yayınlaması ([MarineRadar Repo](https://github.com/toygucakin/MarineRadar)).
- **Aşama 4 (TAMAMLANDI ✅):** Ortam Değişkenleri (`.env`), Mongoose & MongoDB Bağlantı Altyapısı (`src/config/db.js`), Docker & Docker Compose (`Dockerfile`, `docker-compose.yml`) Konteynırlaştırma Altyapısı.
- **Aşama 5 (TAMAMLANDI ✅):** Mongoose ODM & `News` Veri Şeması (`src/models/News.js`) Oluşturulması ve Tip/Doğrulama Kurallarının Tanımlanması.
- **Aşama 6 (TAMAMLANDI ✅):** Controller Katmanının Mongoose `async / await` Sorguları (`News.find()`, `News.findById()`, `News.create()`) ile Gerçek MongoDB CRUD Operasyonlarına Taşınması.
- **Aşama 7 (TAMAMLANDI ✅):** `rss-parser` ile İlk Otomatik Veri Kazıma Servisi (`src/services/rssService.js`), Otomatik Kategori & Etki Puanı Analizi, Çift Kayıt Engelleme (Deduplication) ve `POST /api/news/scrape/rss` Endpoint'i.
- **Aşama 8 (TAMAMLANDI ✅):** `axios` ve `cheerio` ile Advanced HTML Web Scraping Servisi (`src/services/htmlService.js`), DOM/CSS Seçicileri ile Haber Süzme ve `POST /api/news/scrape/html` Endpoint'i.
- **Aşama 9 (TAMAMLANDI ✅):** Akıllı Bülten Derleyici Modülü (`src/models/Newsletter.js`, `src/controllers/newsletterController.js`), Mongoose `.populate()` İlişkisel Haber Bağlantıları ve `POST /api/newsletters/generate` Endpoint'i.
- **Aşama 10 (TAMAMLANDI ✅):** `node-cron` ile Zamanlanmış Arka Plan Görevleri (`src/services/cronService.js`), Swagger UI Canlı İnteraktif API Dokümantasyonu (`src/config/swagger.js` & `/api-docs`).
- **Aşama 11 (TAMAMLANDI ✅):** Statik Arayüz İskeleti ve MyCarbons Light Eco Tasarım Sistemi (`public/index.html`, `public/styles.css`), Şirket web sitesi ilhamlı nane yeşili gradiyentli zemin, saf beyaz yüzen kartlar, `IMO-DCS & EU-MRV COMPLIANT` rozetleri, `MyCarbons Marine Radar` logosu, Hero İstatistik Paneli ve Express Statik Sunum.
- **Aşama 12 (TAMAMLANDI ✅):** İstemci JavaScript Mantığı & Canlı API Entegrasyonu (`public/app.js`), `/api/news` endpoint'inden canlı MongoDB verilerinin çekilmesi, dinamik DOM haber kartı oluşturma, etki puanına göre yeşil/altın rozetler ve canlı Hero istatistik hesaplamaları.
- **Aşama 13 (TAMAMLANDI ✅):** Anlık Canlı Arama, Kategori Filtreleme, Scrape API Tetikleyicileri & Toast Bildirim Sistemi (`public/app.js`, `public/styles.css`), eylem butonlarının canlı backend scraping servislerine bağlanması ve yüzen nane yeşili toast bildirim kutuları.
- **Aşama 14 (TAMAMLANDI ✅):** Akıllı Bülten Arayüzü & Bülten Arşivi Modalı (`public/index.html`, `public/styles.css`, `public/app.js`), derlenen bülten kapağını şık bir dergi kapağı formatında modal pencerede açma ve arşiv listesi.
- **Aşama 15 (TAMAMLANDI ✅):** Express Statik Sunum (`express.static`), Kapsamlı Jest Entegrasyon Testleri (`index.test.js` - 22/22 Test PASS), Docker Compose Altyapısı & GitHub Yayınlaması.
- **Aşama 16 (TAMAMLANDI ✅):** Haber Detay Modalı HTML İskeleti ve CSS Tasarımı (`public/index.html`, `public/styles.css`).
- **Aşama 17 (TAMAMLANDI ✅):** Frontend Haber Kartı Tıklama ve Detay Gösterim Mantığı (`public/app.js`).
- **Aşama 19 (TAMAMLANDI ✅):** HTML Scrape API Yanıt & Toast Bildirim Entegrasyonu (`public/app.js`).
- **Aşama 20 (TAMAMLANDI ✅):** Bülten Derleyici Backend Şema ve İlişkisel Sorgu Onarımı (`src/models/Newsletter.js`, `src/controllers/newsletterController.js`).
- **Aşama 21 (TAMAMLANDI ✅):** Bülten Derleme Frontend & Dergi Kapağı Modal Render Düzeltmesi (`public/app.js`).
- **Aşama 24 (TAMAMLANDI ✅):** Global İngilizce Dil Desteği & Uluslararası Arayüz Uyumlaştırması (`public/index.html`, `public/app.js`, `src/controllers/newsletterController.js`).
- **Aşama 25 (TAMAMLANDI ✅):** Kazıma Sonrası Toast Bildirim & Akış Senkronizasyonu Düzeltmesi (`public/app.js`).
- **Aşama 26 (TAMAMLANDI ✅):** Fleet Status Kurumsal Gemi Logosu Güncellemesi (`public/index.html`).
- **Aşama 27 (TAMAMLANDI ✅):** Derin Metin Web Scraping Servisi (Deep Article Scraper Service) geliştirildi (`src/services/deepScraperService.js`). Orijinal haber bağlantılarından tam makale metinleri (`fullContent`) kazındı.
- **Aşama 28 (TAMAMLANDI ✅):** Gemi (`Vessel`) ve Kullanıcı (`User / Fleet`) Veri Modelleri & Filo Atama Mimarisi geliştirildi (`src/models/Vessel.js`, `src/models/User.js`, `src/data/seedFleet.js`).
- **Aşama 29 (TAMAMLANDI ✅):** Akıllı Metin Analizör & Çoklu Gemi Varlık Eşleme Motoru (`src/services/vesselMatcherService.js`). Haber metinlerinden geçen filoya ait gemilerin tespiti (`matchedVessels`).
- **Aşama 30 (TAMAMLANDI ✅):** Regülasyon ve Emisyon Metin Analitiği (`src/services/regulationService.js`). EU ETS, EU-MRV, IMO DCS, FuelEU Maritime etiketlemesi ve Uyumluluk Risk Skoru (Compliance Risk) hesabı.
- **Aşama 31 (TAMAMLANDI ✅):** Kullanıcı Yetkilendirme (Auth) & Kişisel Gemi Akışı REST API'leri (`src/middlewares/authMiddleware.js`, `src/controllers/authController.js`, `src/routes/authRoutes.js`). JWT kimlik doğrulama ve `/api/news/my-vessels` korumalı akış.
- **Aşama 32 (TAMAMLANDI ✅):** Frontend Kullanıcı Filosu & Gemi Odaklı Haber Dashboard Arayüzü (`public/index.html`, `public/app.js`).
- **Aşama 33 (TAMAMLANDI ✅):** Zamanlanmış 4 Aşamalı Tam Veri Boru Hattı (`src/services/cronService.js`). 1. Scrape ➔ 2. Deep Scrape ➔ 3. Vessel Matcher ➔ 4. Regulation Tagging uçtan uca boru hattı.
- **Aşama 34 (TAMAMLANDI ✅):** Üst Menü "Login / My Fleet" Modalı & Gemi Ekle/Çıkar Yönetimi (`src/controllers/userController.js`, `src/routes/userRoutes.js`). E-posta ve şifre ile oturum açma, filoya yeni gemi ekleme (`POST /api/users/:id/vessels`) ve filodan gemi çıkarma (`DELETE /api/users/:id/vessels/:vesselId`).
- **Aşama 35 (TAMAMLANDI ✅):** Akıllı Sayfa Kısaltma Motoru (Smart Truncated Pagination Engine) geliştirildi (`public/app.js`, `public/styles.css`). Haber akışı 15 haber/sayfa limitine bölündü. Sayfa sayısı kaç olursa olsun ekranı kaplamayan `1 2 3 4 5 ... N` formatında üç nokta kısaltmalı kompakt sayfalama çubuğu entegre edildi.
- **Aşama 36 (TAMAMLANDI ✅):** Üst Menü Kullanıcı Rozeti & Modal İçi Modernized Gemi Silme Butonları (`public/styles.css`, `public/app.js`). Üst menü butonları yeşil zümrüt degrade temaya dönüştürüldü, modal içi pembe silme butonları yerine ikonlu modern `.btn-remove-vessel` butonları tasarlandı.
- **Aşama 37 (TAMAMLANDI ✅):** Kullanıcıya Özel Gemi Seçici Dropdown & Varsayılan Kişisel Bülten Yükleyici (`public/app.js`, `public/index.html`). Oturum açıldığında arama çubuğunun yanındaki dropdown otomatik olarak kullanıcının kendi gemilerini (`⚓ My Assigned Vessels`) gösterir ve varsayılan haber akışı kullanıcının kendi gemilerine ayarlanır. Ayrıca dropdown içerisine `🌐 All Public News (Genel Haberler)` geçiş opsiyonu eklendi.
- **Aşama 38 (TAMAMLANDI ✅):** Yapay Zeka Entegrasyon Altyapısı & API Anahtarı Konfigürasyonu (`.env`, `.env.example`, `package.json`, `scripts/init-env.js`). `@google/generative-ai` SDK paketi projeye dahil edildi, kullanıcının Gemini API anahtarı `.env` dosyasına güvenli şekilde gömüldü ve `GEMINI_MODEL=gemini-flash-latest` model konfigürasyonu tamamlandı.
- **Aşama 39 (TAMAMLANDI ✅):** Mongoose Haber Veri Modeli (`src/models/News.js`) Yapay Zeka Alanları Revizyonu. Mongoose `newsSchema` nesnesine `aiNote`, `aiVessels`, `aiImportanceScore`, `aiCategorized` ve `aiAnalyzedAt` alanları eklendi.
- **Aşama 40 (TAMAMLANDI ✅):** Google Gemini AI Analiz Servisi (`src/services/geminiService.js`). Prompt mühendisliği ile yapılandırılmış JSON çıktısı istenerek denizcilik emisyonu ve karbonsuzlaşma odaklı Türkçe analiz yorumu (`aiNote`), otomatik kategori seçimi (`category`), hassas etki skoru (`aiImportanceScore`) ve gemi varlık tespiti (`aiVessels`) gerçekleştiren `analyzeNewsWithGemini` ve `analyzeAllUnprocessedNewsWithGemini` servisleri geliştirildi.
- **Aşama 41 (TAMAMLANDI ✅):** REST API Controller & Rota Katmanı Entegrasyonu (`src/controllers/newsController.js`, `src/routes/newsRoutes.js`, `src/config/swagger.js`). `POST /api/news/:id/ai-analyze` ve `POST /api/news/ai-analyze` endpoint'leri eklendi, Swagger UI canlı dokümantasyonuna entegre edildi.
- **Aşama 42 (TAMAMLANDI ✅):** Otomatik Zamanlanmış Boru Hattının 5 Aşamaya Yükseltilmesi (`src/services/cronService.js`). `runFullPipeline` boru hattı 5 Aşamalı Tam Akıllı Boru Hattı'na (`5-Stage AI Scraping Pipeline`) dönüştürüldü: 1. RSS/HTML Ingestion ➔ 2. Deep Scraper ➔ 3. Vessel Matcher ➔ 4. Regulation Tagging ➔ 5. Google Gemini AI Engine.
- **Aşama 43 (TAMAMLANDI ✅):** Frontend Haber Detay Modalı & Yapay Zeka Analiz Kartı Tasarımı (`public/index.html`, `public/styles.css`, `public/app.js`). Detay modalına zümrüt/mor degrade kaplamalı `🤖 Google Gemini AI Decarbonization Analysis` kartı, İngilizce AI analiz notu (`aiNote`), etki puanı göstergesi (`aiImportanceScore`), AI gemi tespiti (`aiVessels`) ve anlık `Analyze with AI Now` tetikleme butonu eklendi. Ayrıca haber akış kartlarına `🤖 AI Analyzed` rozeti entegre edildi.
- **Aşama 44 (TAMAMLANDI ✅):** Frontend Akış Kartları & Kategori Filtreleme Revizyonu (`public/app.js`, `public/styles.css`). Gemini AI tarafından kategorize edilen etiketlerin (`Alternative Fuels`, `Regulations`, `Clean Energy`, `Green Ports`, `Green Fleet`, `Maritime & Environment`) dinamik renkli stil tanımları, kart üzeri rozetleri ve üst kategori filtre sekmelerinin canlı süzme senkronizasyonu tamamlandı.
- **Aşama 45 (TAMAMLANDI ✅):** Otomatik Entegrasyon Testleri ve Sistem Doğrulaması (`index.test.js`). 24/24 Jest & Supertest entegrasyon testi ile 5-Stage AI boru hattı, Gemini REST rotaları ve tüm sistem uçtan uca doğrulandı.
- **Aşama 46 (TAMAMLANDI ✅):** Otomatik Geçmiş Haber Backfill & Anlık Google Gemini AI Analiz Boru Hattı (`src/services/rssService.js`, `src/services/htmlService.js`, `src/controllers/newsController.js`, `src/services/cronService.js`). Bilgisayar/sunucu kapalıyken kaçırılan tüm haberlerin açılışta (`Sunucu Açılış Taraması`) otomatik toplanması ve çekilen her yeni haberin anında 5 aşamalı akıllı boru hattı üzerinden Google Gemini AI ile analiz edilmesi sağlandı.
- **Aşama 47 (TAMAMLANDI ✅):** Gemini AI Prompt İçerik Gömmesi & Anlam Kayması Onarımı (`src/services/geminiService.js`, `src/controllers/newsController.js`). Gemini AI istemcisine haber başlığı, özeti ve kazınmış metninin eksiksiz iletilmesi sağlandı. Metin ile AI yorumu arasındaki uyumsuzluk (anlam kayması) giderildi ve yeniden analiz etme (`force=true`) yeteneği eklendi.
- **Aşama 48 (TAMAMLANDI ✅):** Derin Web Metin Temizleyici & Disclaimer/Gürültü Filtresi (`src/services/deepScraperService.js`, `src/controllers/newsController.js`). Haber metinlerinden yasal sorumluluk reddi beyanları (`Disclaimer: ...`), yazar bilgileri, reklamlar, telif uyarıları ve tekrarlayan paragraflar otomatik temizlendi (`sanitizeArticleText`). Tüm veritabanı ve API çıktıları sterilize edildi.
- **Aşama 49 (TAMAMLANDI ✅):** Monorepo Bağımlılık Analizi ve Repozituvar Ayrıştırma Planı (`MARINERADAR.md`, `implementation_plan.md`). Frontend (`public/`) ile Backend (`src/`, `index.js`) bileşenleri haritalandı, `MarineRadar-Backend` ve `MarineRadar-Frontend` çift repozituvar mimarisi, 17 REST API endpoint analizi, CORS stratejisi ve geçiş planı tamamlandı.
- **Aşama 50 (TAMAMLANDI ✅):** Backend Repozituvar Ayrıştırması (`index.js`, `package.json`, `.env`, `.env.example`, `docker-compose.yml`, `scripts/init-env.js`). Express REST API servisine `cors` middleware paketi entegre edildi, dinamik `CORS_ORIGIN` değişkeni tanımlandı, `SERVE_STATIC` konfigüre edilebilir kılındı ve API katmanı bağımsız `MarineRadar-Backend` deposuna sterilize edildi. 24/24 Jest entegrasyon testi ile doğrulandı.
- **Aşama 51 (TAMAMLANDI ✅):** Frontend Repozituvar Ayrıştırması & Modern Yapılandırma (`public/app.js`, `public/index.html`, `MarineRadar-Frontend/`). İstemci kodlarındaki tüm 17 REST API endpoint çağrısı dinamik `API_BASE_URL` (`window.ENV.API_BASE_URL` / `VITE_API_BASE_URL`) ile soyutlandı. Bağımsız `MarineRadar-Frontend` repozituvar klasörü (Vite dev server, `.env.example`, `README.md`, `package.json`) oluşturuldu.
- **Aşama 52 (TAMAMLANDI ✅):** Çapraz Alan Kimlik Doğrulama & Güvenlik Uyumlaştırması (`public/app.js`, `MarineRadar-Frontend/app.js`). LocalStorage kalıcı JWT token saklama/yenileme altyapısı (`saveAuthSession`, `restoreAuthSession`, `clearAuthSession`) kuruldu. Cross-Origin isteklerinde 401 Unauthorized / 403 Forbidden yanıtlarında otomatik oturum sonlandırma ve toast uyarı yönlendirmesi entegre edildi.
- **Aşama 53 (TAMAMLANDI ✅):** Bağımsız Docker Konteynırlaştırma ve CI/CD Boru Hatları (`MarineRadar-Frontend/Dockerfile`, `MarineRadar-Frontend/nginx.conf`, `.github/workflows/backend-ci.yml`, `.github/workflows/frontend-ci.yml`). Frontend için Nginx Alpine tabanlı prodüksiyon konteynırı kurgulandı, Backend & Frontend için otomatik GitHub Actions CI/CD boru hatları tanımlandı.
- **Aşama 54 (TAMAMLANDI ✅):** Uçtan Uca (E2E) Doğrulama, Dokümantasyon ve GitHub Yayınlaması ([MarineRadar-Backend](https://github.com/toygucakin/MarineRadar-Backend), [MarineRadar-Frontend](https://github.com/toygucakin/MarineRadar-Frontend)). Proje iki bağımsız GitHub repozituvarına başarıyla ayrıştırıldı, `README.md` dokümantasyonları güncellendi, 24/24 Jest entegrasyon testi ile doğrulandı ve kodlar canlı GitHub repolarında yayınlandı.
- **Aşama 55 (TAMAMLANDI ✅):** Frontend Port Yeniden Yapılandırması (`4000`). Frontend Dashboard servisinin varsayılan çalıştırma ve Docker portu `5173'ten `4000`'e güncellendi. Backend CORS izinleri (`CORS_ORIGIN`), Vite geliştirme betiği (`vite --port 4000`), Docker Compose port eşlemeleri (`4000:80`) ve README dokümantasyonları uyumlaştırıldı.
- **Aşama 56 (TAMAMLANDI ✅):** Full Stack Docker Compose Orkestrasyonu ve Konteynırların Ayağa Kaldırılması (`docker-compose.yml`, `Dockerfile`, `MarineRadar-Frontend/Dockerfile`). `docker-compose.yml` yapılandırmasına `marineradar-frontend` servisi entegre edilerek MongoDB (`27017`), Backend API (`3000`) ve Frontend Nginx Web Dashboard (`4000`) servislerinin tek bir `docker compose up -d` komutuyla sorunsuz konteynırlaştırılması ve canlıya alınması sağlandı.
- **Aşama 57 (TAMAMLANDI ✅):** Frontend Nginx Reverse Proxy & Client Script Syntax Fix (`MarineRadar-Frontend/nginx.conf`, `MarineRadar-Frontend/app.js`, `public/app.js`). Frontend Nginx konfigürasyonuna `location /api/` ve `location /api-docs` ters vekil (reverse proxy) kuralları eklendi. `app.js` içerisindeki `import.meta` syntax hatası giderildi, istemcinin port 4000 üzerinden backend MongoDB haber akışını (445+ haber) canlı olarak yüklemesi sağlandı.
- **Aşama 58 (TAMAMLANDI ✅):** Gemini AI Model Konfigürasyonu Düzeltmesi & Nginx Pipeline Zaman Aşımı Optimize Etme (`.env`, `src/services/geminiService.js`, `MarineRadar-Frontend/nginx.conf`). `.env` ve `geminiService.js` içerisindeki geçersiz `gemini-3.5-flash` model ismi `gemini-1.5-flash` olarak güncellendi. Nginx `proxy_read_timeout 300s` kuralı eklenerek 5 Aşamalı Tam Veri Boru Hattının (`Run Full Pipeline`) uzun taramalarda 504 Gateway Timeout vermesi engellendi.
- **Aşama 59 (TAMAMLANDI ✅):** Otomatik Gemini AI Rate Limit Koruması & Null Not Backfill İyileştirmesi (`src/services/rssService.js`, `src/services/htmlService.js`, `src/services/geminiService.js`). Toplu haber kazımada 429 Rate Limit hatasını önlemek için 1.5 sn gecikme koruması eklendi. Analizi aksamış haberlerin (`aiNote: null`) arka plan boru hattında otomatik taranması sağlandı.
- **Aşama 60 (TAMAMLANDI ✅):** Geçersiz/Eski Gemini AI Modellerinin Temizlenmesi (`src/services/geminiService.js`). API hatalarına ve 401 kısıtlamalarına neden olan eski/geçersiz `gemini-1.5-flash`, `gemini-2.0-flash` ve `gemini-2.5-flash` modelleri kaldırıldı. Model havuzu güncel ve geçerli Google Gemini modelleri (`gemini-flash-latest`, `gemini-3.5-flash`, `gemini-3.6-flash`) ile yapılandırıldı.
- **Aşama 61 (TAMAMLANDI ✅):** Gemini AI REST API Model Uyumlaştırması & OAuth 401 Hata Onarımı (`src/services/geminiService.js`, `.env`, `.env.example`). Google AI Studio REST API (`generativelanguage.googleapis.com`) endpoint'inde `gemini-3.6-flash` gibi özel modeller çağrıldığında dönen `401 Unauthorized (ACCESS_TOKEN_TYPE_UNSUPPORTED)` hatası giderildi. Model havuzu kamuya açık resmi Google AI Studio modelleri (`gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`) ile güncellendi.
- **Aşama 62 (TAMAMLANDI ✅):** Gemini 3.5 Flash Modeline Geçiş & Eski Modellerin Temizlenmesi (`src/services/geminiService.js`, `.env`, `.env.example`, `scripts/init-env.js`). Gemini 2.0 Flash, 1.5 Flash ve 1.5 Pro gibi eski/pasif modeller kod tabanından ve konfigürasyonlardan tamamen kaldırıldı. Birincil ve tek model olarak `gemini-3.5-flash` yapılandırıldı.
- **Aşama 63 (TAMAMLANDI ✅):** Gemini 2.0 Flash Modeline Geçiş & Canlı API Buton Testi (`src/services/geminiService.js`, `.env`, `.env.example`, `scripts/init-env.js`). Proje varsayılan yapay zeka modeli resmi ve kamuya açık Google AI Studio destekli `gemini-2.0-flash` (yedek: `gemini-1.5-flash`) olarak yapılandırıldı. Canlı API endpoint'i (`POST /api/news/:id/ai-analyze?force=true`) üzerinden yeniden analiz butonu simüle edilerek test edildi.
- **Aşama 64 (TAMAMLANDI ✅):** Yeni Nesil Gemini `AQ.Ab8RN...` API Key & `x-goog-api-key` Header Desteği (`src/services/geminiService.js`, `.env`). Google Cloud Developer Console yeni nesil `AQ.Ab8RN...` API anahtarları için `x-goog-api-key` HTTP header mimarisi entegre edildi. `gemini-3.6-flash`, `gemini-3.5-flash` ve `gemini-2.5-flash` modelleri canlı veritabanı haberi üzerinde %100 başarıyla çalıştırıldı ve doğrulandı.
- **Aşama 65 (TAMAMLANDI ✅):** Yapay Zeka Analizi Sonrası Modal Kalıcılığı & Önbellek Önleme (Cache Busting) Senkronizasyonu (`public/app.js`, `MarineRadar-Frontend/app.js`, `src/controllers/newsController.js`). Tekil haber analizi yapıldıktan sonra modal kapatılıp tekrar açıldığında analizin kaybolması/butonun sıfırlanması sorunu giderildi; `appState.allNews` anlık bellek senkronizasyonu, `renderNewsGrid()` anında kart tazelemesi ve HTTP `cache: no-store` önbellek engelleme başlıkları eklendi.
- **Aşama 66 (TAMAMLANDI ✅):** Çoklu API Anahtarı Otomatik Rotasyonu & 429 Kota Koruması (`src/services/geminiService.js`, `.env`). Google Gemini API kota sınırlarına (429 Rate Limit) karşı virgülle ayrılmış çoklu API anahtarı havuzu (`GEMINI_API_KEY=KEY1,KEY2,KEY3`) entegre edildi. Bir anahtar kota aşıldı uyarısı aldığında sistem anında diğer yedek anahtara geçerek kesintisiz yapay zeka analitiği sunar.

---

## 🔮 Gelecek Aşamalar (Planned Roadmap / Future Phases)

- **Aşama 67 (PLANLANAN 📋 - Derin Metin Kesme Çapası & Reklam/İlişkili Haber Filtresi):**
  - **Problem:** Orijinal haber sayfalarında (örn. gCaptain) asıl makale bittikten sonra gelen `Tags:`, bülten abonelik metinleri (`Subscribe for Daily Maritime Insights...`, `Essential maritime and offshore news...`) ve alt kısımdaki `Related Articles` (İlişkili Haberler) blokları makale gövdesiyle birlikte kazınmaktadır.
  - **1. Sınır Çapası (Hard Truncation / Stop Tokens):** `sanitizeArticleText` ve `scrapeArticleContent` içerisine sonlanma işaretçileri (`Tags:`, `Essential maritime and offshore news`, `Related Articles:`, `Subscribe to/for`) eklenerek, bu ifadelere rastlandığı anda metin toplama işleminin `break` edilip kesilmesi.
  - **2. Agresif DOM Temizliği (Cheerio Pruning):** `[class*="related"]`, `[class*="subscribe"]`, `[class*="newsletter"]`, `.tags`, `.yarpp-related` seçicilerinin DOM'dan peşinen kaldırılması.
  - **3. Doğrudan Çocuk Paragraf Seçicisi (Direct Child Scope):** İç içe geçmiş yan bileşenleri elemek için `.entry-content > p` doğrudan seçicisinin kullanılması.
  - **4. Geriye Dönük Sterilizasyon (Backfill Sanitization):** Veritabanında mevcut `fullContent` kayıtlarının taranarak kuyruk gürültülerinin temizlenmesi.

---

## 🏗️ Geliştirme Revizyonları ve Mimarisi (Technical Revisions & Architecture)

### 1. Yapay Zeka Model ve Entegrasyon Stratejisi
- **Kullanılan Model:** `gemini-1.5-flash` / `gemini-flash-latest` (Google Generative AI).
- **Kimlik Doğrulama:** Ortam değişkeni üzerinden `GEMINI_API_KEY` ile API çağrıları yapılır.
- **Performans & Gecikme:** Flash modelinin yüksek hızı sayesinde haber başına ortalama ~1.2 saniye yanıt süresi elde edilmesi hedeflenmektedir.

### 2. Prompt Mühendisliği ve Yapılandırılmış Yanıt (Structured Output)
Gemini AI'ya iletilecek sistem prompt'u denizcilik, IMO regülasyonları ve karbonsuzlaştırma terminolojisine göre özelleştirilmiştir. Çıktı formatı strict JSON olarak zorlanacaktır:
```json
{
  "aiNote": "Gemini AI tarafından haber içeriğinin denizcilik emisyonları, karbon yakalama ve ticari filolara etkisi üzerine yazılmış Türkçe detay yorumu...",
  "category": "Alternative Fuels",
  "importanceScore": 8.8,
  "mentionedVessels": ["M/T Aegean Green", "IMO 9876543", "Ever Given"]
}
```

### 3. Veritabanı Şema Geliştirme Revizyonu (`News.js`)
Mongoose `newsSchema` nesnesine aşağıdaki 5 yeni alan eklenecektir:
```javascript
aiNote: { type: String, trim: true, default: null },
aiVessels: [{ type: String, trim: true }],
aiImportanceScore: { type: Number, min: 0, max: 10, default: null },
aiCategorized: { type: Boolean, default: false },
aiAnalyzedAt: { type: Date, default: null }
```

### 4. 5 Aşamalı Veri Boru Hattı (5-Stage Scraping Pipeline Architecture)
```
[1. RSS/HTML Ingestion] ➔ [2. Deep Scraper] ➔ [3. Vessel Matcher] ➔ [4. Regulation Tagging] ➔ [5. Gemini AI Engine]
```
Her aşama bağımsız çalışabildiği gibi `runFullPipeline` fonksiyonu ile sırayla otomatik olarak da yürütülür.

### 5. UI/UX Tasarım ve Etkileşim Revizyonu
- **Renk Paleti:** Zümrüt yeşili (`#059669`) ile yapay zeka temasını temsil eden parlak mor/violet (`#7C3AED`) degradesi harmanlanacaktır.
- **Haber Detay Modalı:** Kullanıcı bir habere tıkladığında, makalenin orijinal özeti ve ham metninin hemen altında **"🤖 Yapay Zeka Değerlendirme Notu"** özel bir vurgu kutusunda gösterilecektir.

---

## 🛠️ Tamamlanan Proje Dosyaları

- [package.json](file:///c:/MyApps/MarineRadar/package.json): Paketler (`express`, `dotenv`, `mongoose`, `rss-parser`, `axios`, `cheerio`, `node-cron`, `jsonwebtoken`, `swagger-ui-express`, `swagger-jsdoc`, `@google/generative-ai`) ve betikler.
- [index.js](file:///c:/MyApps/MarineRadar/index.js): Express uygulaması, dotenv, DB bağlantısı, cron servisleri, Swagger UI ve rota montajları.
- [.env](file:///c:/MyApps/MarineRadar/.env): Yerel ortam değişkenleri.
- [.env.example](file:///c:/MyApps/MarineRadar/.env.example): Ortam değişkenleri şablonu.
- [.gitignore](file:///c:/MyApps/MarineRadar/.gitignore): Git ortam değişkenleri, loglar ve hassas dosya koruma kuralları.
- [src/config/db.js](file:///c:/MyApps/MarineRadar/src/config/db.js): Mongoose veritabanı bağlantı modülü.
- [src/config/swagger.js](file:///c:/MyApps/MarineRadar/src/config/swagger.js): Swagger OpenAPI 3.0 dokümantasyon konfigürasyonu (BearerAuth dahil).
- [src/models/News.js](file:///c:/MyApps/MarineRadar/src/models/News.js): Mongoose `News` şema ve model tanımı (`fullContent`, `matchedVessels`, `regulations`, `complianceRisk`).
- [src/models/Newsletter.js](file:///c:/MyApps/MarineRadar/src/models/Newsletter.js): Mongoose `Newsletter` şema ve ilişkisel model tanımı.
- [src/models/Vessel.js](file:///c:/MyApps/MarineRadar/src/models/Vessel.js): Mongoose `Vessel` (Gemi Filosu) şema ve model tanımı.
- [src/models/User.js](file:///c:/MyApps/MarineRadar/src/models/User.js): Mongoose `User` (Kullanıcı & Filo Atamaları) şema ve model tanımı.
- [src/data/seedFleet.js](file:///c:/MyApps/MarineRadar/src/data/seedFleet.js): A Kullanıcısı (5 Gemi) ve B Kullanıcısı (3 Gemi) filolarını otomatik yükleyen seeder servisi.
- [src/services/rssService.js](file:///c:/MyApps/MarineRadar/src/services/rssService.js): Otomatik RSS akışı kazıma ve analiz servisi.
- [src/services/htmlService.js](file:///c:/MyApps/MarineRadar/src/services/htmlService.js): Axios & Cheerio tabanlı HTML web kazıma servisi.
- [src/services/deepScraperService.js](file:///c:/MyApps/MarineRadar/src/services/deepScraperService.js): Orijinal haber bağlantılarından tam makale metinlerini kazıyan derin web scraping servisi.
- [src/services/vesselMatcherService.js](file:///c:/MyApps/MarineRadar/src/services/vesselMatcherService.js): Haber metinlerinden geçen filoya ait gemileri tespit eden akıllı varlık eşleme motoru.
- [src/services/regulationService.js](file:///c:/MyApps/MarineRadar/src/services/regulationService.js): Derin haber metinlerini denizcilik emisyon regülasyonlarına göre etiketleyen ve uyumluluk risk skoru (Compliance Risk) üreten servis.
- [src/services/geminiService.js](file:///c:/MyApps/MarineRadar/src/services/geminiService.js): Google Gemini AI tabanlı yapılandırılmış haber analitiği, Türkçe emisyon değerlendirme notu (`aiNote`), otomatik kategori seçimi ve gemi tespit servisi.
- [src/services/cronService.js](file:///c:/MyApps/MarineRadar/src/services/cronService.js): Node-cron periyodik arka plan görevleri ve 4 Aşamalı Tam Boru Hattı (`runFullPipeline`) servisi.
- [Dockerfile](file:///c:/MyApps/MarineRadar/Dockerfile): Express REST API Docker imaj tanımı.
- [.dockerignore](file:///c:/MyApps/MarineRadar/.dockerignore): Docker build hariç tutma kuralları.
- [docker-compose.yml](file:///c:/MyApps/MarineRadar/docker-compose.yml): MongoDB ve Hot-Reload destekli API servis orkestrasyonu.
- [src/controllers/newsController.js](file:///c:/MyApps/MarineRadar/src/controllers/newsController.js): MongoDB haber, boru hattı ve kişisel filo akışı iş mantığı katmanı.
- [src/controllers/newsletterController.js](file:///c:/MyApps/MarineRadar/src/controllers/newsletterController.js): Akıllı bülten derleyici katmanı.
- [src/controllers/vesselController.js](file:///c:/MyApps/MarineRadar/src/controllers/vesselController.js): Gemi filosu CRUD iş mantığı katmanı.
- [src/controllers/userController.js](file:///c:/MyApps/MarineRadar/src/controllers/userController.js): Kullanıcı hesabı ve filoya gemi ekleme/çıkarma iş mantığı katmanı.
- [src/controllers/authController.js](file:///c:/MyApps/MarineRadar/src/controllers/authController.js): JWT kullanıcı oturum açma ve kişisel filo kontrol katmanı.
- [src/routes/newsRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/newsRoutes.js): REST haber ve 4 aşamalı boru hattı rotaları.
- [src/routes/newsletterRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/newsletterRoutes.js): REST bülten rotaları.
- [src/routes/vesselRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/vesselRoutes.js): REST gemi rotaları.
- [src/routes/userRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/userRoutes.js): REST kullanıcı filosu ve gemi ekleme/çıkarma rotaları (`/:id/vessels`).
- [src/routes/authRoutes.js](file:///c:/MyApps/MarineRadar/src/routes/authRoutes.js): REST JWT kimlik doğrulama rotaları.
- [src/middlewares/authMiddleware.js](file:///c:/MyApps/MarineRadar/src/middlewares/authMiddleware.js): JWT token doğrulama ve kullanıcı filo yetki katmanı.
- [src/middlewares/validateNews.js](file:///c:/MyApps/MarineRadar/src/middlewares/validateNews.js): Doğrulama katmanı.
- [src/middlewares/errorHandler.js](file:///c:/MyApps/MarineRadar/src/middlewares/errorHandler.js): Hata katmanı.
- [public/index.html](file:///c:/MyApps/MarineRadar/public/index.html): MyCarbons kurumsal kimliğine uygun web dashboard semantik HTML5 iskeleti, üst menü kullanıcı modalı ve akıllı sayfalama çubuğu.
- [public/styles.css](file:///c:/MyApps/MarineRadar/public/styles.css): Yaprak yeşili eco-design tasarım sistemi, zümrüt degrade üst menü butonları, modern gemi silme butonları ve sayfalama CSS kuralları.
- [public/app.js](file:///c:/MyApps/MarineRadar/public/app.js): Asenkron REST API istemci mantığı, akıllı sayfa kısaltma motoru (`1 2 3 ... N`), oturum doğrulaması ve canlı haber süzme.
- [index.test.js](file:///c:/MyApps/MarineRadar/index.test.js): 22/22 geçen MongoDB, RSS, HTML, Newsletter, Vessel, User, Auth, Scrape Pipeline, Swagger UI & Dashboard entegrasyon testleri.
- [implementation_plan.md](file:///C:/Users/Toygu%20%C3%87ak%C4%B1n/.gemini/antigravity-ide/brain/6344a5b4-aed2-41f8-ba78-e863d2449b60/implementation_plan.md): Aşama 49 monorepo bağımlılık analizi ve `MarineRadar-Backend` / `MarineRadar-Frontend` çift repozituvar ayrıştırma mimari planı.
- [MarineRadar-Frontend/](file:///c:/MyApps/MarineRadar/MarineRadar-Frontend): Bağımsız frontend repozituvar klasörü (`package.json`, `index.html`, `styles.css`, `app.js`, `.env.example`, `README.md`).


