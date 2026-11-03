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
