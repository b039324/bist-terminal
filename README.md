# BIST Terminal

BIST hisseleri için Yahoo Finance verisiyle çalışan, kişisel ve ücretsiz bir arama/analiz ekranı.
Sadece arama yaptığında veri çeker; sayfa açılışında hiçbir istek atılmaz.

- **GitHub Pages** → statik site (ücretsiz)
- **Cloudflare Worker** → veri köprüsü + şifre kontrolü (ücretsiz, günde 100.000 istek)
- **Yahoo Finance** → fiyat, hacim, teknik ve temel veri kaynağı

---

## Dosyalar

| Dosya | Görevi |
|---|---|
| `index.html` | Sayfa iskeleti |
| `style.css` | Tasarım (koyu tema, kart yapısı) |
| `app.js` | Tüm mantık: veri çekme, göstergeler, grafik, AL/SAT skoru |
| `config.js` | Senin dolduracağın tek ayar: Worker adresi |
| `worker.js` | Cloudflare Worker kodu (Yahoo proxy + şifre kontrolü) |

---

## KURULUM — Adım Adım

### 1) Cloudflare Worker'ı deploy et

1. https://dash.cloudflare.com adresinden ücretsiz hesap aç (kredi kartı istemiyor).
2. Sol menüden **Workers & Pages** → **Create** → **Create Worker** seç.
3. Bir isim ver (örn. `bist-terminal-proxy`) → **Deploy** butonuna bas (ilk aşamada boş şablonla deploy edebilirsin).
4. Deploy sonrası **Edit code** butonuna tıkla, açılan editördeki tüm kodu sil ve bu projedeki **`worker.js`** dosyasının tam içeriğini yapıştır.
5. Sağ üstten **Deploy** ile kaydet.
6. Şimdi şifreni tanımla: Worker sayfasında **Settings** → **Variables and Secrets** → **Add** :
   - Adı: `AUTH_PASSWORD`
   - Değeri: kendi belirleyeceğin şifre (örn. `benimSifrem2026`)
   - Tip: **Secret** seç (böylece panelde bile düz metin görünmez)
   - **Save and deploy**
7. Worker'ının adresini not al, şuna benzer görünür:
   `https://bist-terminal-proxy.KULLANICIADIN.workers.dev`

### 2) config.js'i doldur

`config.js` dosyasını aç ve `WORKER_URL` değerini bir önceki adımda aldığın adresle değiştir:

```js
const WORKER_URL = "https://bist-terminal-proxy.KULLANICIADIN.workers.dev";
```

### 3) GitHub'a yükle

1. GitHub'da yeni bir **repository** oluştur (public ya da private fark etmez, Pages ikisinde de çalışır — private repo'da Pages özelliği GitHub'ın ücretsiz planında da mevcuttur).
2. Bu 5 dosyayı (`index.html`, `style.css`, `app.js`, `config.js`, `worker.js`) repo'ya yükle.
   - `worker.js` sitede kullanılmıyor (sadece Cloudflare'e yapıştırdığın kaynak kod olarak referans kalsın diye repo'da tutuyoruz), istersen `/cloudflare` gibi bir alt klasöre de koyabilirsin.
3. Repo **Settings** → **Pages** → **Build and deployment** → **Source: Deploy from a branch** → branch olarak `main`, klasör olarak `/ (root)` seç → **Save**.
4. Birkaç dakika içinde şu adres yayına girer:
   `https://KULLANICIADIN.github.io/REPO-ADI`

### 4) Kullanmaya başla

1. Yukarıdaki linke gir.
2. Karşına çıkan şifre ekranına Cloudflare'de tanımladığın `AUTH_PASSWORD` değerini yaz.
3. Ortadaki arama kutusuna hisse kodunu yaz (örn. `ALARK`) ve Enter'a bas.

---

## Notlar

- **Şifre nasıl çalışıyor?** Şifre tarayıcında `localStorage`'a kaydedilir ve her veri isteğinde Worker'a gönderilir. Worker, kendi ortam değişkenindeki (`AUTH_PASSWORD`) değerle karşılaştırır; eşleşmezse veri döndürmez, Yahoo'ya hiç istek gitmez. Bu, günlük kullanımda kotanı başkasının tüketmesini engellemek için yeterlidir; devlet sırrı saklar gibi bir güvenlik seviyesi değildir (bkz. az önceki konuşmamız).
- **Semboller:** BIST hisseleri Yahoo'da `.IS` uzantısıyla bulunur (örn. `ALARK.IS`). Worker bunu otomatik ekliyor, sen sadece `ALARK` yazman yeterli.
- **Veri gecikmesi:** Yahoo Finance verisi bazı hisselerde birkaç dakika gecikmeli olabilir.
- **Yahoo endpoint değişirse:** Yahoo'nun gayri resmi API'si zaman zaman format değiştirebilir. Böyle bir durumda sadece `worker.js` içindeki endpoint/parametreleri güncellemek yeterli olur.
- **AL/SAT skoru:** RSI, MA50/MA200 trendi, MACD, yıllık momentum ve Yahoo'nun analist ortalamasına dayalı kural tabanlı bir puanlamadır. Yatırım tavsiyesi değildir.
