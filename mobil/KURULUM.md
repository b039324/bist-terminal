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
