# BIST Mobil — Kurulum

Bu klasör mevcut BIST Terminal sitenin yanına eklenen telefon sürümüdür.
Mevcut dosyalara (app.js, index.html, worker.js vb.) dokunulmaz.

## 1) GitHub'a yükle
1. Repo'nda (bist-terminal) **Add file → Upload files** de.
2. Bu zip'ten çıkan **mobil** klasörünü olduğu gibi sürükle (klasör repo kökünde, config.js ile aynı seviyede olmalı).
3. **Commit changes**.

Sonuç: `https://KULLANICIADIN.github.io/bist-terminal/mobil/`

## 2) Telefonda aç
1. Chrome'da yukarıdaki adresi aç.
2. Masaüstündeki aynı şifreyi gir (aynı Worker kullanılır, portföy ve takip listen aynen görünür).
3. Menü (⋮) → **Ana ekrana ekle**.

## Notlar
- Worker'da değişiklik gerekmez.
- Güncelleme sonrası eski görünüm kalırsa uygulamayı kapatıp aç.
- BIST 100 / BIST 30 listeleri app.js'tekiyle aynıdır. Endeks değişirse mobil.js içindeki BIST100 ve BIST30 listeleri de güncellenmeli.
- Sinyal (AL/TUT/SAT) masaüstündeki skordan türetilir: 60 ve üstü AL, 40-59 TUT, 40 altı SAT.
- Sinyaller yatırım tavsiyesi değildir.

## Sıralamayı elle değiştirme
Takip ve Portföy sekmesinde sağ üstteki **Düzenle**'ye bas. Satırların sağında tutamaç (☰) çıkar; tutup sürükle. Bırakınca sıra otomatik kaydolur, **Bitti** ile çık.
Sıra, takip listesi ve portföy kaydının sırasıdır; Worker'da aynı kayıt kullanıldığı için masaüstü sürümde de varsayılan sıralamada aynı görünmesi beklenir.

## Yeni: Canlı fiyat ve BIST 100 taraması

**Canlı fiyat (15 sn):** Takip, Portföy, BIST listesi ve hisse detayında fiyatlar masaüstündeki gibi 15 saniyede bir kendiliğinden yenilenir. Fiyat değişince kısa süre yeşil/kırmızı yanar. Şu durumlarda yenileme durur: uygulama arka plandayken, Düzenle modundayken, alım/satım penceresi açıkken. Uygulamaya dönünce hemen yenilenir. Veri gecikmeli (Yahoo) olduğu için saniyelik değildir.

**BIST 100 taraması:** Sinyaller sekmesinde "BIST 30 | BIST 100" seçimi vardır. BIST 100'ü seçince 100 hisse 5'erli gruplarla taranır (yaklaşık 1 dk). Sonuç telefonda 3 saat saklanır, tekrar açınca yeniden taranmaz. Yenile düğmesi taramayı zorla yeniler. Fiyat alınamayan hisseler listede belirtilir; analist verisi eksik olanlar `*` ile işaretlenir.

Sinyaller gündelik mumlara dayandığı için sinyal ekranında 15 sn canlı yenileme yoktur.

## Yeni: Gün içi grafik (5 dk)
Hisse detayında grafiğin üstündeki aralık düğmelerinin başında "Gün içi" vardır. Seçince son seansın 5 dakikalık mumları çizilir. Kesikli çizgi önceki kapanıştır. Grafiğe dokunup kaydırınca o mumun saati ve açılış/yüksek/düşük/kapanış değeri görünür. Bu görünümde 15 sn'de bir kendiliğinden güncellenir. Seans kapalıyken son işlem gününü gösterir. Veri gecikmeli olabilir.

## Yeni: Harita sekmesi (BIST 30 ısı haritası)
Alttaki menüye "Harita" eklendi. BIST 30 hisseleri kutu olarak gösterilir: kutu büyüklüğü işlem hacmine (TL), renk günlük değişime göre (yeşil yükselen, kırmızı düşen, gri ±0,25 içi). Büyük kutularda kod, fiyat ve yüzde; küçüklerde sadece kod görünür. Kutuya basınca hisse detayı açılır. 15 sn'de bir kendiliğinden yenilenir. Kutu büyüklüğünde hacmin karekökü kullanılır, böylece küçük hisseler görünmez olmaz.

**Değişiklik:** Sinyaller sekmesindeki "Listem" seçimi "BIST 30" oldu (varsayılan). BIST 30'un 30 hissesi için sinyal hesaplanır, AL/TUT/SAT sayıları ve "son ziyarete göre değişenler" gösterilir. Takip listendeki hisselerin sinyali Takip sekmesinde rozet olarak görünmeye devam eder.

## Yeni (v3): 6 ek özellik
1. **Portföy değer geçmişi:** Portföy sekmesinde toplam değer + maliyet çizgisi (Tümü / 3A / 1A / 1H). Veri masaüstüyle ortak `portfolio_history` kaydıdır. Portföy, tüm pozisyonların fiyatı alınmışken açılınca bugünün kaydı yazılır (önce okunur; okunamazsa yazılmaz, geçmiş ezilmez). Grafiğe dokununca o günün değeri ve K/Z görünür.
2. **Sinyal geçmişi (30 gün):** Hisse detayında son 30 günün AL/TUT/SAT değişimleri, günlük mumlardan yeniden hesaplanır (kayıt tutulmaz).
3. **Not + hedef fiyat:** Hisse detayında not ve hedef fiyat alanı. Takip listesi kaydına yazılır; Takip satırında hedefe uzaklık görünür. Worker değişikliği gerekmez.
4. **Sektör grupları:** Harita sekmesinde "Hisse | Sektör" seçimi; Sinyaller sekmesinde sektöre göre gruplama düğmesi. Sektörler genel sınıflamadır, mobil.js içindeki SECTOR_LISTS'ten düzenlenir.
5. **İki hisse karşılaştırma:** Hisse detayında "Başka hisseyle karşılaştır". Getiri grafiği (1A/3A/6A/1Y, başlangıç %0) ve gösterge tablosu.
6. **Önbellek düzeltmesi:** Service worker artık her açılışta sunucudan yeniden doğrular, css/js adreslerinde `?v=3` var. Sayfanın altında "Sürüm 2026-11-03 · v3" yazar; bunu görmüyorsan eski dosyalar yüklüdür. Yine eski görünürse tarayıcı site verisini temizle veya ana ekran kısayolunu silip yeniden ekle.

## Yeni (v4): koyu tasarım uyarlaması
- **Portföy:** büyük toplam değer (kuruşlu) + "bugün" kutusu; 1H / 1A / 6A / 1Y / Tümü düğmelerinin altında dönem getirisi (alım/satımla gelen para çıkarılarak yaklaşık hesaplanır); alan dolgulu grafik ve tarih etiketleri; **Açık pozisyonlar** ve **Kapanan pozisyonlar** (satış yapılan hisseler, gerçekleşen K/Z) bölümleri; sağ üstteki göz simgesi tutarları bulanıklaştırır (ekran paylaşırken işe yarar, seçim telefonda hatırlanır).
- **Takip:** başlık "Takip"; BIST 100 kartında gün içi çizgi; hisse satırında kod yanında sinyal rozeti ve puan (örn. AL · 68), sağda renkli yüzde kutusu; portföydeki hisseler "Portföyümdekiler", diğerleri "Takip listesi" altında.
- **Düzeltme:** Portföy'deki Düzenle düğmesi bazı açılışlarda görünmüyordu, düzeltildi.
- **Yapılmadı:** dolar/euro/altın/Brent satırı. Worker her sembole .IS eklediği için Worker'da değişiklik gerekir.
- Harita ve Sinyaller ekranları zaten tasarımla aynı yapıda, değiştirilmedi.

## Yeni (v5): Yahoo 429 (veri gelmiyor) düzeltmesi
- Uygulama: fiyat isteği hata verirse 1,2 sn sonra bir kez daha dener; Yahoo boş liste döndürürse "Fiyat verisi alınamadı" yazar (ekran sessizce boş kalmaz).
- Worker (ayrı dosya `worker.js`, Cloudflare'e yapıştırılır): crumb KV'de saklanır (6 saat), Yahoo 401/429 verirse bir kez yenileyip tekrar dener, crumb hiç alınamazsa toplu fiyatı crumb gerektirmeyen chart verisinden üretir. Masaüstü sürüm de aynı Worker'ı kullandığı için ondan da yararlanır. Mevcut KV'ye "yahoo_auth" adlı bir kayıt eklenir, diğer verilere dokunmaz.

## v6
- Hisse detayında ve karşılaştırma tablosunda **Hacim (TL)** satırı: gün hacmi (adet) x son fiyat, yaklaşık değerdir (gün içi fiyat değiştikçe gerçek TL hacminden küçük sapar). Adet hacmi ayrı satırda durur.

## v7
- Hisse detayı grafiği: **1H** = 1 saatlik mumlar (son 5 gün), **1A** = 4 saatlik mumlar (son 1 ay; her gün 10:00-14:00 ve 14:00-18:00 olarak ikiye bölünür, Yahoo 4 saatlik veri vermediği için saatliklerden birleştirilir). Gün sınırları kesikli çizgiyle gösterilir. Saatlik veri gelmezse günlük mumlara düşer ve bunu yazar. 3A, 6A, 1Y günlük kalır.

## v8
- Hisse detayı: fiyat grafiğinin altında **Hacim (TL)** çubukları (her mumun hacmi x kapanış, yaklaşık). Günlük grafiklerde sarı kesikli çizgi son 30 işlem gününün ortalamasıdır. Grafiğe dokununca o mumun hacmi görünür. Göstergelere "Ort. hacim (30 gün, TL)" ve "Bugünkü / ortalama hacim" (%) eklendi; bugün seans sürerken yüzde düşük çıkması normaldir.

## v9 — Kur ve Kripto 50
- **Worker'ı güncelle (zorunlu):** `worker.js` içeriğini Cloudflare'de yapıştır, Deploy et. Yeni uçlar: `/api/fx`, `/api/crypto`, `/api/cryptochart`.
- Takip ekranının üstünde Dolar/TL ve Euro/TL kutuları (BIST sekmesinde de var).
- Alt menüdeki "BIST" → "Piyasalar". Üstteki BIST | Kripto 50 anahtarıyla kripto listesine geç (ilk 50, USD + TL, 24s değişim, arama, sıralama).
- Kripto detay: günlük grafik (1A–1Y), hacim (USD), AL/TUT/SAT skoru (analist verisi yok), 24s/7g/30g değişim.
- Kaynak CoinGecko ücretsiz API; çok sık yenilenirse yanıt gecikebilir, Worker son iyi veriyi gösterir ("eski olabilir" notu).
- v9b: CoinGecko yanıt vermezse kripto verisi otomatik CryptoCompare'den alınır (worker.js'i tekrar yapıştır).
- v9c: Kripto verisi artık önce Yahoo Finance'ten alınır (hisselerle aynı kaynak). CoinGecko 429, CryptoCompare 401 veriyordu; ikisi yedek olarak kaldı. worker.js'i tekrar yapıştır.
