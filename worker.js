/**
 * BIST Terminal - Cloudflare Worker
 * ---------------------------------
 * Bu worker üç iş yapar:
 *  1) Basit bir şifre kontrolü (env.AUTH_PASSWORD ile karşılaştırma)
 *  2) Yahoo Finance'in "cookie + crumb" bot-koruması akışını tamamlama
 *     (Yahoo artık düz istekleri 401 ile reddediyor, önce bir cookie
 *      sonra ona bağlı bir "crumb" token'ı almak gerekiyor)
 *  3) Yahoo'nun gayri resmi endpoint'lerine sunucu taraflı istek atıp
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

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
  });
}

// Worker instance'ı canlı kaldığı sürece cookie/crumb'ı tekrar tekrar almamak için basit bellek-içi cache
let authCache = null; // { cookie, crumb, expires }

function extractCookie(res) {
  // Bazı runtime'larda birden fazla Set-Cookie başlığı olabilir
  if (typeof res.headers.getSetCookie === "function") {
    const all = res.headers.getSetCookie();
    if (all && all.length) return all.map((c) => c.split(";")[0]).join("; ");
  }
  const single = res.headers.get("set-cookie");
  return single ? single.split(";")[0] : "";
}

async function getAuth() {
  if (authCache && authCache.expires > Date.now()) return authCache;

  // 1) Cookie almak için Yahoo'nun cookie-veren ucuna istek at
  const cookieRes = await fetch("https://fc.yahoo.com/", {
    headers: BROWSER_HEADERS,
    redirect: "manual",
  });
  const cookie = extractCookie(cookieRes);

  // 2) O cookie ile crumb (kısa ömürlü kimlik jetonu) al
  const crumbRes = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
    headers: { ...BROWSER_HEADERS, Cookie: cookie },
  });
  const crumb = (await crumbRes.text()).trim();

  if (!crumb || crumb.includes("<html") || !crumbRes.ok) {
    throw new Error(`Crumb alınamadı (status ${crumbRes.status}).`);
  }

  authCache = { cookie, crumb, expires: Date.now() + 25 * 60 * 1000 }; // 25 dk cache
  return authCache;
}

async function yahooFetch(url) {
  const auth = await getAuth();
  const sep = url.includes("?") ? "&" : "?";
  const fullUrl = `${url}${sep}crumb=${encodeURIComponent(auth.crumb)}`;
  const res = await fetch(fullUrl, {
    headers: { ...BROWSER_HEADERS, Cookie: auth.cookie },
  });
  return res;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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

    try {
      // --- Fiyat / hacim / grafik verisi (son 1 yıl, günlük) ---
      if (url.pathname === "/api/chart") {
        const res = await yahooFetch(
          `https://query2.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=1y&interval=1d&includeAdjustedClose=true`
        );
        const text = await res.text();
        if (!res.ok) {
          return json(
            { error: "Yahoo Finance'ten grafik verisi alınamadı.", status: res.status, detail: text.slice(0, 300) },
            502
          );
        }
        return json(JSON.parse(text));
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
        const res = await yahooFetch(
          `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=${modules}`
        );
        const text = await res.text();
        if (!res.ok) {
          return json(
            { error: "Yahoo Finance'ten temel veri alınamadı.", status: res.status, detail: text.slice(0, 300) },
            502
          );
        }
        return json(JSON.parse(text));
      }

      return json({ error: "Bilinmeyen uç nokta." }, 404);
    } catch (err) {
      return json({ error: "Sunucu hatası.", detail: String(err && err.message ? err.message : err) }, 500);
    }
  },
};
