/**
 * BIST Terminal - Cloudflare Worker (KV Destekli)
 * -------------------------------------------------
 * Bu worker şu işleri yapar:
 *  1) Şifre kontrolü (env.AUTH_PASSWORD)
 *  2) Yahoo Finance cookie+crumb bot-koruması akışı
 *  3) Yahoo'nun chart ve quote endpoint'lerine proxy
 *  4) Portföy ve Takip Listesi verilerini KV'de saklama (cihazlar arası senkron)
 *
 * KURULUM:
 *  1) Bu kodu Worker'a yapıştır.
 *  2) Cloudflare Dashboard > Workers & Pages > [Worker Adın] > Settings > Variables
 *     - KV Namespace Bindings → "PORTFOLIO_KV" adında bir KV bağla
 *     - Secret Text → "AUTH_PASSWORD" (şifren)
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

// Bellek-içi cookie/crumb cache (25 dakika)
let authCache = null;

function extractCookie(res) {
  if (typeof res.headers.getSetCookie === "function") {
    const all = res.headers.getSetCookie();
    if (all && all.length) return all.map((c) => c.split(";")[0]).join("; ");
  }
  const single = res.headers.get("set-cookie");
  return single ? single.split(";")[0] : "";
}

async function getAuth() {
  if (authCache && authCache.expires > Date.now()) return authCache;

  const cookieRes = await fetch("https://fc.yahoo.com/", {
    headers: BROWSER_HEADERS,
    redirect: "manual",
  });
  const cookie = extractCookie(cookieRes);

  const crumbRes = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
    headers: { ...BROWSER_HEADERS, Cookie: cookie },
  });
  const crumb = (await crumbRes.text()).trim();

  if (!crumb || crumb.includes("<html") || !crumbRes.ok) {
    throw new Error(`Crumb alınamadı (status ${crumbRes.status}).`);
  }

  authCache = { cookie, crumb, expires: Date.now() + 25 * 60 * 1000 };
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

    // --- Şifre kontrolü (GET ve POST/PUT/DELETE için) ---
    let pass = url.searchParams.get("pass") || "";
    if (!pass && (request.method === "POST" || request.method === "PUT" || request.method === "DELETE")) {
      try {
        const body = await request.clone().json();
        pass = body.pass || "";
      } catch (e) {
        // body JSON değilse boş bırak
      }
    }

    if (!env.AUTH_PASSWORD) {
      return json({ error: "Sunucu yapılandırması eksik: AUTH_PASSWORD tanımlı değil." }, 500);
    }
    if (pass !== env.AUTH_PASSWORD) {
      return json({ error: "Yetkisiz erişim. Şifre hatalı." }, 401);
    }

    // =====================================================================
    // PORTFÖY API'leri (KV tabanlı, cihazlar arası senkron)
    // =====================================================================
    if (url.pathname === "/api/portfolio") {
      if (!env.PORTFOLIO_KV) {
        return json({ error: "Portföy KV veritabanı Worker'a bağlanmamış." }, 500);
      }

      // GET → Portföyü oku
      if (request.method === "GET") {
        try {
          const raw = await env.PORTFOLIO_KV.get("portfolio");
          return json(raw ? JSON.parse(raw) : []);
        } catch (e) {
          return json({ error: "Portföy okunamadı.", detail: String(e) }, 500);
        }
      }

      // POST → Portföyü kaydet (tam liste olarak)
      if (request.method === "POST") {
        try {
          const body = await request.json();
          const positions = body.positions || [];
          await env.PORTFOLIO_KV.put("portfolio", JSON.stringify(positions));
          return json({ ok: true });
        } catch (e) {
          return json({ error: "Portföy kaydedilemedi.", detail: String(e) }, 500);
        }
      }

      return json({ error: "Desteklenmeyen metod." }, 405);
    }

    // =====================================================================
    // TAKİP LİSTESİ API'leri (KV tabanlı)
    // =====================================================================
    if (url.pathname === "/api/watchlist") {
      if (!env.PORTFOLIO_KV) {
        return json({ error: "KV veritabanı Worker'a bağlanmamış." }, 500);
      }

      // GET → Takip listesini oku
      if (request.method === "GET") {
        try {
          const raw = await env.PORTFOLIO_KV.get("watchlist");
          return json(raw ? JSON.parse(raw) : []);
        } catch (e) {
          return json({ error: "Takip listesi okunamadı.", detail: String(e) }, 500);
        }
      }

      // POST → Takip listesini kaydet (tam liste olarak)
      if (request.method === "POST") {
        try {
          const body = await request.json();
          const items = body.items || [];
          await env.PORTFOLIO_KV.put("watchlist", JSON.stringify(items));
          return json({ ok: true });
        } catch (e) {
          return json({ error: "Takip listesi kaydedilemedi.", detail: String(e) }, 500);
        }
      }

      return json({ error: "Desteklenmeyen metod." }, 405);
    }

    // =====================================================================
    // REALİZE EDİLMİŞ K/Z GEÇMİŞİ (satış işlemleri, KV tabanlı)
    // =====================================================================
    if (url.pathname === "/api/realized") {
      if (!env.PORTFOLIO_KV) {
        return json({ error: "KV veritabanı Worker'a bağlanmamış." }, 500);
      }

      if (request.method === "GET") {
        try {
          const raw = await env.PORTFOLIO_KV.get("realized");
          return json(raw ? JSON.parse(raw) : []);
        } catch (e) {
          return json({ error: "Realize geçmişi okunamadı.", detail: String(e) }, 500);
        }
      }

      if (request.method === "POST") {
        try {
          const body = await request.json();
          const items = body.items || [];
          await env.PORTFOLIO_KV.put("realized", JSON.stringify(items));
          return json({ ok: true });
        } catch (e) {
          return json({ error: "Realize geçmişi kaydedilemedi.", detail: String(e) }, 500);
        }
      }

      return json({ error: "Desteklenmeyen metod." }, 405);
    }

    // =====================================================================
    // YAHOO FINANCE API'leri
    // =====================================================================

    // --- Toplu (çoklu hisse) anlık veri: Trendler taramasında kullanılır.
    // Yahoo'nun kendi resmi %değişimini (regularMarketChangePercent) doğrudan döner,
    // bu yüzden grafik verisinden manuel hesaplamaya göre daha güvenilirdir ve
    // 100 ayrı istek yerine tek/birkaç istekte tüm hisseleri döndürür.
    if (url.pathname === "/api/quotebatch") {
      const symbolsParam = (url.searchParams.get("symbols") || "").toUpperCase().trim();
      const symbolsList = symbolsParam
        .split(",")
        .map((s) => s.trim().replace(/[^A-Z0-9]/g, ""))
        .filter(Boolean);
      if (symbolsList.length === 0) {
        return json({ error: "Geçerli hisse kodları girin." }, 400);
      }
      const yahooSymbols = symbolsList.map((s) => `${s}.IS`).join(",");
      try {
        const res = await yahooFetch(
          `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbols}`
        );
        const text = await res.text();
        if (!res.ok) {
          return json(
            { error: "Yahoo Finance'ten toplu veri alınamadı.", status: res.status, detail: text.slice(0, 300) },
            502
          );
        }
        return json(JSON.parse(text));
      } catch (e) {
        return json({ error: "Sunucu hatası.", detail: String(e && e.message ? e.message : e) }, 500);
      }
    }

    const rawSymbol = (url.searchParams.get("symbol") || "").toUpperCase().trim();
    const symbol = rawSymbol.replace(/[^A-Z0-9]/g, "");
    if (!symbol) {
      return json({ error: "Geçerli bir hisse kodu girin (örn: ALARK)." }, 400);
    }
    const yahooSymbol = `${symbol}.IS`;

    try {
      // --- Fiyat / hacim / grafik verisi ---
      if (url.pathname === "/api/chart") {
        const range = url.searchParams.get("range") || "1y";
        const interval = url.searchParams.get("interval") || "1d";
        const res = await yahooFetch(
          `https://query2.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${range}&interval=${interval}&includeAdjustedClose=true`
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

      // --- Temel veriler ---
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
          `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=${modules}&formatted=false&corsDomain=finance.yahoo.com`
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
