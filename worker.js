/**
 * BIST Terminal - Cloudflare Worker
 * ---------------------------------
 * Bu worker iki iş yapar:
 *  1) Basit bir şifre kontrolü (env.AUTH_PASSWORD ile karşılaştırma)
 *  2) Yahoo Finance'in gayri resmi endpoint'lerine sunucu taraflı istek atıp
 *     CORS engelini aşarak veriyi tarayıcıya güvenli şekilde döndürme.
 *
 * DEPLOY SONRASI YAPILMASI GEREKEN:
 *  Cloudflare Dashboard > Workers > (bu worker) > Settings > Variables
 *  içine "AUTH_PASSWORD" adında bir "Secret" ekle ve kendi şifreni yaz.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Tarayıcı preflight isteği
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // --- Şifre kontrolü ---
    const pass = url.searchParams.get("pass") || "";
    if (!env.AUTH_PASSWORD) {
      return json({ error: "Sunucu yapılandırması eksik: AUTH_PASSWORD tanımlı değil." }, 500);
    }
    if (pass !== env.AUTH_PASSWORD) {
      return json({ error: "Yetkisiz erişim. Şifre hatalı." }, 401);
    }

    // --- Sembol doğrulama ---
    const rawSymbol = (url.searchParams.get("symbol") || "").toUpperCase().trim();
    const symbol = rawSymbol.replace(/[^A-Z0-9]/g, "");
    if (!symbol) {
      return json({ error: "Geçerli bir hisse kodu girin (örn: ALARK)." }, 400);
    }
    const yahooSymbol = `${symbol}.IS`;

    const yahooHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "application/json",
    };

    try {
      // --- Fiyat / hacim / grafik verisi (son 1 yıl, günlük) ---
      if (url.pathname === "/api/chart") {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=1y&interval=1d&includeAdjustedClose=true`,
          { headers: yahooHeaders }
        );
        if (!res.ok) return json({ error: "Yahoo Finance'ten grafik verisi alınamadı." }, 502);
        const data = await res.json();
        return json(data);
      }

      // --- Temel veriler (F/K, PD/DD, ROE, temettü, analist görüşü vb.) ---
      if (url.pathname === "/api/quote") {
        const modules = [
          "summaryDetail",
          "defaultKeyStatistics",
          "financialData",
          "recommendationTrend",
          "price",
          "earnings",
        ].join(",");
        const res = await fetch(
          `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=${modules}`,
          { headers: yahooHeaders }
        );
        if (!res.ok) return json({ error: "Yahoo Finance'ten temel veri alınamadı." }, 502);
        const data = await res.json();
        return json(data);
      }

      return json({ error: "Bilinmeyen uç nokta." }, 404);
    } catch (err) {
      return json({ error: "Sunucu hatası.", detail: String(err) }, 500);
    }
  },
};
